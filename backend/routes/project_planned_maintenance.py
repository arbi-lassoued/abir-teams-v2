from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy import and_ 
from typing import List
import models
from typing import Dict, Any
from db import get_db
from models.project import projects, project_equipment,project_maintenance_plan
from models.ih_prem_pm import ih_preliminary_maintenance_plan
from utils.csv_utils import detect_delimiter, to_float, to_int, clean_fieldnames, get_case_insensitive_value
from io import StringIO
import csv
from schemas.project_planned_maintenance import (
      MaintenancePlanBase, MaintenancePlanResponse
     
)
# ====================================================================================================================
project_planned_maintenance_router = APIRouter()
# ====================================================================================================================
# Get planned maintenance for Specific Project
@project_planned_maintenance_router.get("/{project_id}/planned_maintenance", response_model=List[MaintenancePlanResponse])
async def get_project_planned_maintenance(project_id: int,db_session = Depends(get_db)
):
    print("🔍 [1] generate_pm endpoint called!")   
    print(f"🔍 [3] Project ID: {project_id}") 
    try:
        project = db_session.execute(
            projects.select().where(projects.c.project_id == project_id)
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        planned_maintenance_result = db_session.execute(
            project_maintenance_plan.select().where(
                project_maintenance_plan.c.project_id == project_id
            ).order_by(project_maintenance_plan.c.id)
        ).fetchall()
        
        return planned_maintenance_result 
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch planned maintenance: {str(e)}")

# ====================================================================================================================
# Generate Maintenance Plan
@project_planned_maintenance_router.post("/generate_maintenance_plan")
async def generate_maintenance_plan(project_data: dict, db_session = Depends(get_db)):
    try:
        project_id = project_data.get("project_id")
        
        # Check if project exists
        project = db_session.execute(
            projects.select().where(projects.c.project_id == project_id)
        ).first()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get all equipment for this project
        equipment_records = db_session.execute(
            project_equipment.select().where(
                project_equipment.c.project_id == project_id
            )
        ).fetchall()
        
        if not equipment_records:
            raise HTTPException(status_code=404, detail="No equipment found for this project")
        
        generated_count = 0
        equipment_without_plan = []
        
        # Process each equipment item
        for equipment in equipment_records:
            sub_equipment_class_code = equipment.sub_equipment_class_code
            
            if not sub_equipment_class_code:
                equipment_without_plan.append(equipment.asset_tag or f"Equipment_{equipment.id}")
                continue
            
            # Find matching maintenance activities in in-house database
            matching_activities = db_session.execute(
                ih_preliminary_maintenance_plan.select().where(
                    ih_preliminary_maintenance_plan.c.sub_equipment_class_code == sub_equipment_class_code
                )
            ).fetchall()
            
            if not matching_activities:
                equipment_without_plan.append(equipment.asset_tag or f"Equipment_{equipment.id}")
                continue
            
            # Create maintenance plan records for each matching activity
            for activity in matching_activities:
                # Map fields from equipment and maintenance activities
                maintenance_data = {
                    "project_id": project_id,
                    "asset_tag": equipment.asset_tag or "",
                    "asset_description": equipment.asset_description or "",
                    "equipment_class_category": equipment.equipment_class_category or "",
                    "sub_equipment_class_code": equipment.sub_equipment_class_code or "",
                    "sub_equipment_class_desc": equipment.sub_equipment_class_desc or "",
                    "maint_prog_code": activity.maint_prog_code or "",
                    "detection": activity.detection or "",
                    "maint_type": activity.maint_type or "",
                    "maint_state": activity.maint_state or "",
                    "maint_description": activity.maint_description or "",
                    "size_impact": activity.size_impact or "",
                    "frequency": activity.frequency,
                    "scope": activity.scope or "",
                    "eq_status": activity.eq_status or "",
                    "plant_status": activity.plant_status or "",
                    "active_time": activity.active_time_med_eq,
                    "manpower": activity.manpower_med_eq,
                    "workload_per_task": activity.workload_per_med_eq_task,
                    "task_occurrence_per_year": activity.task_occurrence_per_year,
                    "annual_workload": activity.annual_workload_med_eq,
                    "sce": activity.sce or "",
                    "robots_compatibility": activity.robots_compatibility or "",
                    "manip_required": activity.manip_required or "",
                    "cost": activity.cost_per_med_eq,
                    # "created_at": datetime.now(),
                    # "updated_at": datetime.now()
                }
                
                # Insert into project_maintenance_plan_table
                insert_stmt = project_maintenance_plan.insert().values(**maintenance_data)
                db_session.execute(insert_stmt)
                generated_count += 1
        
        db_session.commit()
        
        response_data = {
            "success": True,
            "generated_count": generated_count,
            "total_equipment": len(equipment_records),
            "equipment_without_plan": equipment_without_plan,
            "message": f"Generated {generated_count} maintenance activities from {len(equipment_records)} equipment items. {len(equipment_without_plan)} equipment items had no matching maintenance plan."
        }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        db_session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to generate maintenance plan: {str(e)}")