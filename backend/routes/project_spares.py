from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy import and_ 
from typing import List
import models
from typing import Dict, Any
from db import get_db
from models.project import projects, project_spares, project_equipment
from models.ih_spare_parts import ih_spares 
from utils.csv_utils import detect_delimiter, to_float, to_int, clean_fieldnames, get_case_insensitive_value
from io import StringIO
import csv
from schemas.project_spares import (
      SparesResponse, 
     
)
# ====================================================================================================================
project_spares_router = APIRouter()
# ====================================================================================================================
# Get Equipment for Specific Project
@project_spares_router.get("/{project_id}/spares", response_model=List[SparesResponse])
async def get_project_spares(project_id: int,db_session = Depends(get_db)
):
    print("🔍 [1] generate_spares endpoint called!")   
    print(f"🔍 [3] Project ID: {project_id}") 
    try:
        project = db_session.execute(
            projects.select().where(projects.c.project_id == project_id)
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        spares_result = db_session.execute(
            project_spares.select().where(
                project_spares.c.project_id == project_id
            ).order_by(project_spares.c.id)
        ).fetchall()
        
        return spares_result 
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch spares: {str(e)}")
# ====================================================================================================================

# Generate Spare Parts
@project_spares_router.post("/generate_spares")
async def generate_spares(project_data: dict, db_session = Depends(get_db)):
    try:
        project_id = project_data.get("project_id")
        
        # Check if project exists
        check_project = db_session.execute(
            projects.select().where(projects.c.project_id == project_id)
        ).first()        
        if not check_project:
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
        equipment_without_spares = []
        
        # Process each equipment item
        for equipment in equipment_records:
            sub_equipment_class_code = equipment.sub_equipment_class_code
            
            if not sub_equipment_class_code:
                equipment_without_spares.append(equipment.asset_tag or f"Equipment_{equipment.id}")
                continue
            
            # Find matching spare parts in in-house database
            matching_spares = db_session.execute(
                ih_spares.select().where(
                    ih_spares.c.sub_equipment_class_code == sub_equipment_class_code
                )
            ).fetchall()
            
            if not matching_spares:
                equipment_without_spares.append(equipment.asset_tag or f"Equipment_{equipment.id}")
                continue
            
            # Create spare part records for each matching spare
            for spare in matching_spares:
                # Map fields from equipment and spare parts
                spare_data = {
                    "project_id": project_id,
                    "asset_tag": equipment.asset_tag or "",
                    "asset_description": equipment.asset_description or "",
                    "equipment_class_category": spare.equipment_class_category or "",
                    "sub_equipment_class_code": spare.sub_equipment_class_code or "",
                    "sub_equipment_class_desc": spare.sub_equipment_class_desc or "",
                    "sp_description": spare.sp_description or "",
                    "sp_state": spare.sp_state or "",
                    "min_quantity": spare.min_quantity,
                    "max_quantity": spare.max_quantity,
                    "meas_unit": spare.meas_unit or "",
                    "comm_sp": spare.comm_sp or "",
                    "op_sp": spare.op_sp or "",
                    "overh_sp": spare.overh_sp or "",
                    "capital_sp": spare.capital_sp or "",
                    "consumable": spare.consumable or "",
                    "storage_condition": spare.storage_condition or "",
                    "size": spare.med_size,  # Using med_size as requested
                    # "tech_specification": equipment.tech_specification or "",
                    # "drawing_reference": equipment.drawing_reference or ""
                }
                
                # Insert into project_spares_table
                insert_stmt = project_spares.insert().values(**spare_data)
                db_session.execute(insert_stmt)
                generated_count += 1
        
        db_session.commit()
        
        response_data = {
            "success": True,
            "generated_count": generated_count,
            "total_equipment": len(equipment_records),
            "equipment_without_spares": equipment_without_spares,
            "message": f"Generated {generated_count} spare parts from {len(equipment_records)} equipment items. {len(equipment_without_spares)} equipment items had no matching spare parts."
        }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        db_session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to generate spare parts: {str(e)}")