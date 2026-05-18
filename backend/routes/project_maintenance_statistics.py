from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy import and_ 
from typing import List
import models
from typing import Dict, Any
from db import get_db
import json
from models.project import projects,project_maintenance_plan, project_maintenance_statistics
# from utils.csv_utils import detect_delimiter, to_float, to_int, clean_fieldnames, get_case_insensitive_value
# from io import StringIO
# import csv
from schemas.project_planned_maintenance import (
      MaintenancePlanBase, MaintenancePlanResponse
     
)
# ====================================================================================================================
project_maintenance_statistics_router = APIRouter()
# ====================================================================================================================
# Get Maintenance Statistics for Specific Project
@project_maintenance_statistics_router.get("/{project_id}/maintenance_statistics")
async def get_project_maintenance_statistics(project_id: int, db_session = Depends(get_db)):
    try:
        project = db_session.execute(
            projects.select().where(projects.c.project_id == project_id)
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get all maintenance activities for this project
        maintenance_activities = db_session.execute(
            project_maintenance_plan.select().where(
                project_maintenance_plan.c.project_id == project_id
            )
        ).fetchall()
        
        if not maintenance_activities:
            return {
                "statistics": [],
                "summary": {
                    "total_scopes": 0,
                    "total_annual_workload": 0,
                    "total_activities": 0,
                    "total_enabled_maintenance": 0
                }
            }
        
        # Group by scope and calculate statistics (same logic as before)
        statistics_by_scope = {}
        
        for activity in maintenance_activities:
            scope = activity.scope or "Uncategorized"
            
            if scope not in statistics_by_scope:
                statistics_by_scope[scope] = {
                    "scope": scope,
                    "unique_sub_equipment_codes": set(),
                    "unique_eq_types": set(),
                    "enabled_maintenance_count": 0,
                    "total_annual_workload": 0.0,
                    "total_activities": 0
                }
            
            stats = statistics_by_scope[scope]
            
            if activity.sub_equipment_class_code:
                stats["unique_sub_equipment_codes"].add(activity.sub_equipment_class_code)
            
            if activity.equipment_class_category:
                stats["unique_eq_types"].add(activity.equipment_class_category)
            
            # Count all activities as enabled for now
            stats["enabled_maintenance_count"] += 1
            
            if activity.annual_workload:
                stats["total_annual_workload"] += activity.annual_workload
            
            stats["total_activities"] += 1
        
        # Convert sets to counts
        statistics_result = []
        for scope, stats in statistics_by_scope.items():
            statistics_result.append({
                "scope": scope,
                "sub_equipment_code_count": len(stats["unique_sub_equipment_codes"]),
                "equipment_type_count": len(stats["unique_eq_types"]),
                "enabled_maintenance_count": stats["enabled_maintenance_count"],
                "total_annual_workload": round(stats["total_annual_workload"], 2),
                "total_activities": stats["total_activities"],
                "unique_sub_equipment_codes": list(stats["unique_sub_equipment_codes"]),
                "unique_equipment_types": list(stats["unique_eq_types"])
            })
        
        # Sort by total annual workload (descending)
        statistics_result.sort(key=lambda x: x["total_annual_workload"], reverse=True)
        
        # Calculate overall totals
        total_annual_workload = sum(item["total_annual_workload"] for item in statistics_result)
        total_activities = sum(item["total_activities"] for item in statistics_result)
        total_enabled = sum(item["enabled_maintenance_count"] for item in statistics_result)
        
        return {
            "statistics": statistics_result,
            "summary": {
                "total_scopes": len(statistics_result),
                "total_annual_workload": round(total_annual_workload, 2),
                "total_activities": total_activities,
                "total_enabled_maintenance": total_enabled
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch maintenance statistics: {str(e)}")

# ====================================================================================================================
# Generate Maintenance Statistics
# @project_maintenance_statistics_router.post("/generate_maintenance_statistics")
# async def generate_maintenance_statistics(project_data: dict, db_session = Depends(get_db)):
#     try:
#         project_id = project_data.get("project_id")
        
#         # Check if project exists
#         project = db_session.execute(
#             projects.select().where(projects.c.project_id == project_id)
#         ).first()
        
#         if not project:
#             raise HTTPException(status_code=404, detail="Project not found")
        
#         # Get all maintenance activities for this project
#         maintenance_activities = db_session.execute(
#             project_maintenance_plan.select().where(
#                 project_maintenance_plan.c.project_id == project_id
#             )
#         ).fetchall()
        
#         if not maintenance_activities:
#             raise HTTPException(status_code=404, detail="No maintenance activities found for this project. Please generate maintenance plan first.")
        
#         # Debug: Check what columns are available in the first record
#         if maintenance_activities:
#             first_activity = maintenance_activities[0]
#             print("🔍 Available columns:", first_activity._fields)
#             print("🔍 First activity sample:", dict(first_activity._mapping))
        
#         # Group by scope and calculate statistics
#         statistics_by_scope = {}
        
#         for activity in maintenance_activities:
#             # Convert to dict for safer access
#             activity_dict = dict(activity._mapping)
            
#             scope = activity_dict.get('scope') or "Uncategorized"
            
#             if scope not in statistics_by_scope:
#                 statistics_by_scope[scope] = {
#                     "scope": scope,
#                     "unique_sub_equipment_codes": set(),
#                     "unique_eq_types": set(),
#                     "enabled_maintenance_count": 0,
#                     "total_annual_workload": 0.0,
#                     "total_activities": 0
#                 }
            
#             # Add to statistics
#             stats = statistics_by_scope[scope]
            
#             # Count unique sub_equipment_class_code
#             if activity_dict.get('sub_equipment_class_code'):
#                 stats["unique_sub_equipment_codes"].add(activity_dict['sub_equipment_class_code'])
            
#             # Count unique equipment types
#             if activity_dict.get('equipment_class_category'):
#                 stats["unique_eq_types"].add(activity_dict['equipment_class_category'])
            
#             # Count enabled maintenance activities
#             # For now, count all activities as enabled
#             stats["enabled_maintenance_count"] += 1
            
#             # Sum annual workload - SAFE ACCESS with fallbacks
#             workload = 0.0
#             if 'annual_workload_med_eq' in activity_dict and activity_dict['annual_workload']:
#                 workload = activity_dict['annual_workload']
#             elif 'annual_workload' in activity_dict and activity_dict['annual_workload']:
#                 workload = activity_dict['annual_workload']
#             elif 'workload_per_med_eq_task' in activity_dict and activity_dict['workload_per_task']:
#                 workload = activity_dict['workload_per_task']
            
#             stats["total_annual_workload"] += workload
#             stats["total_activities"] += 1
        
#         # Convert sets to counts and prepare response
#         statistics_result = []
#         for scope, stats in statistics_by_scope.items():
#             statistics_result.append({
#                 "scope": scope,
#                 "sub_equipment_code_count": len(stats["unique_sub_equipment_codes"]),
#                 "equipment_type_count": len(stats["unique_eq_types"]),
#                 "enabled_maintenance_count": stats["enabled_maintenance_count"],
#                 "total_annual_workload": round(stats["total_annual_workload"], 2),
#                 "total_activities": stats["total_activities"],
#                 "unique_sub_equipment_codes": list(stats["unique_sub_equipment_codes"]),
#                 "unique_equipment_types": list(stats["unique_eq_types"])
#             })
        
#         # Sort by total annual workload (descending)
#         statistics_result.sort(key=lambda x: x["total_annual_workload"], reverse=True)
        
#         # Calculate overall totals
#         total_annual_workload = sum(item["total_annual_workload"] for item in statistics_result)
#         total_activities = sum(item["total_activities"] for item in statistics_result)
#         total_enabled = sum(item["enabled_maintenance_count"] for item in statistics_result)
        
#         response_data = {
#             "success": True,
#             "project_id": project_id,
#             "statistics": statistics_result,
#             "summary": {
#                 "total_scopes": len(statistics_result),
#                 "total_annual_workload": round(total_annual_workload, 2),
#                 "total_activities": total_activities,
#                 "total_enabled_maintenance": total_enabled
#             },
#             "message": f"Generated maintenance statistics for {len(statistics_result)} scopes with {total_activities} total activities."
#         }
        
#         return response_data
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         import traceback
#         print("❌ Full error traceback:")
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=f"Failed to generate maintenance statistics: {str(e)}")

import json  # Add this import

@project_maintenance_statistics_router.post("/generate_maintenance_statistics")
async def generate_maintenance_statistics(project_data: dict, db_session = Depends(get_db)):
    try:
        project_id = project_data.get("project_id")
        
        # Check if project exists
        project = db_session.execute(
            projects.select().where(projects.c.project_id == project_id)
        ).first()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get all maintenance activities for this project
        maintenance_activities = db_session.execute(
            project_maintenance_plan.select().where(
                project_maintenance_plan.c.project_id == project_id
            )
        ).fetchall()
        
        if not maintenance_activities:
            raise HTTPException(status_code=404, detail="No maintenance activities found for this project. Please generate maintenance plan first.")
        
        # DELETE existing statistics for this project (to avoid duplicates)
        db_session.execute(
            project_maintenance_statistics.delete().where(
                project_maintenance_statistics.c.project_id == project_id
            )
        )
        
        # Group by scope and calculate statistics (same as before)
        statistics_by_scope = {}
        
        for activity in maintenance_activities:
            scope = activity.scope or "Uncategorized"
            
            if scope not in statistics_by_scope:
                statistics_by_scope[scope] = {
                    "scope": scope,
                    "unique_sub_equipment_codes": set(),
                    "unique_eq_types": set(),
                    "enabled_maintenance_count": 0,
                    "total_annual_workload": 0.0,
                    "total_activities": 0
                }
            
            stats = statistics_by_scope[scope]
            
            if activity.sub_equipment_class_code:
                stats["unique_sub_equipment_codes"].add(activity.sub_equipment_class_code)
            
            if activity.equipment_class_category:
                stats["unique_eq_types"].add(activity.equipment_class_category)
            
            stats["enabled_maintenance_count"] += 1
            
            if activity.annual_workload:
                stats["total_annual_workload"] += activity.annual_workload
            
            stats["total_activities"] += 1
        
        # Convert sets to counts and STORE in database
        statistics_result = []
        for scope, stats in statistics_by_scope.items():
            # Prepare data for database
            statistics_data = {
                "project_id": project_id,
                "scope": scope,
                "sub_equipment_code_count": len(stats["unique_sub_equipment_codes"]),
                "equipment_type_count": len(stats["unique_eq_types"]),
                "enabled_maintenance_count": stats["enabled_maintenance_count"],
                "total_annual_workload": round(stats["total_annual_workload"], 2),
                "total_activities": stats["total_activities"],
                "unique_sub_equipment_codes": json.dumps(list(stats["unique_sub_equipment_codes"])),
                "unique_equipment_types": json.dumps(list(stats["unique_eq_types"])),
                # "created_at": datetime.now(),
                # "updated_at": datetime.now()
            }
            
            # Insert into statistics table
            insert_stmt = project_maintenance_statistics.insert().values(**statistics_data)
            result = db_session.execute(insert_stmt)
            statistics_id = result.lastrowid
            
            # Also prepare for response
            statistics_result.append({
                "id": statistics_id,
                "project_id": project_id,
                "scope": scope,
                "sub_equipment_code_count": len(stats["unique_sub_equipment_codes"]),
                "equipment_type_count": len(stats["unique_eq_types"]),
                "enabled_maintenance_count": stats["enabled_maintenance_count"],
                "total_annual_workload": round(stats["total_annual_workload"], 2),
                "total_activities": stats["total_activities"],
                "unique_sub_equipment_codes": list(stats["unique_sub_equipment_codes"]),
                "unique_equipment_types": list(stats["unique_eq_types"]),

            })

            db_session.commit()
        
        # Calculate overall totals
        total_annual_workload = sum(item["total_annual_workload"] for item in statistics_result)
        total_activities = sum(item["total_activities"] for item in statistics_result)
        total_enabled = sum(item["enabled_maintenance_count"] for item in statistics_result)
        
        response_data = {
            "success": True,
            "project_id": project_id,
            "statistics": statistics_result,
            "summary": {
                "total_scopes": len(statistics_result),
                "total_annual_workload": round(total_annual_workload, 2),
                "total_activities": total_activities,
                "total_enabled_maintenance": total_enabled
            },
            "message": f"Generated maintenance statistics for {len(statistics_result)} scopes with {total_activities} total activities."
        }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        db_session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to generate maintenance statistics: {str(e)}")
                