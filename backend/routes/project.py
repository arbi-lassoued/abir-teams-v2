# routes/project_routes.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy import and_
from sqlalchemy.orm import Session
import pandas as pd
import os
from typing import List
from datetime import datetime
import traceback
from schemas.equipment_class import EquipmentClass
import models
from typing import Dict, Any

from db import get_db
from models.project import projects, project_equipment
from utils.csv_utils import detect_delimiter, to_float, to_int, clean_fieldnames, get_case_insensitive_value
from io import StringIO
import csv
from schemas.project import (
    ProjectCreate, ProjectResponse, EquipmentResponse, 
    CSVUploadResponse, ProjectWithEquipmentCount
)
# ====================================================================================================================
project_router = APIRouter()
# ====================================================================================================================
# Create New Project
@project_router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, db_session= Depends(get_db)):
    try:
        # Check if project name already exists
        existing_query = db_session.execute(
            projects.select().where(projects.c.project_name == project.project_name)
        ).first()
        if existing_query:
            raise HTTPException(
                status_code=400, 
                detail=f"Project with name '{project.project_name}' already exists"
            )
        
        # Create new project
        current_time = datetime.now()
        insert_stmt = projects.insert().values(
            project_name=project.project_name,
            project_status="Project Created",
            created_at=current_time,
            updated_at=current_time
        )
        result = db_session.execute(insert_stmt)
        db_session.commit()
        
        # Get the created project
        project_id = result.lastrowid
        created_project = db_session.execute(
            projects.select().where(projects.c.project_id == project_id)
        ).first()        
        
        return created_project
        
    except Exception as e:
        db_session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create project: {str(e)}")
# ====================================================================================================================
# Get All Projects
@project_router.get("/", response_model=List[ProjectWithEquipmentCount])
async def get_projects(db_session = Depends(get_db)):
    try:
        # Get all projects
        projects_result = db_session.execute(
            projects.select().order_by(projects.c.created_at.desc())
        ).fetchall()
        
        result = []
        for project in projects_result:
            # Get equipment count for each project
            equipment_count = db_session.execute(
                project_equipment.select().where(
                    project_equipment.c.project_id == project.project_id
                )
            ).rowcount
            
            project_data = ProjectWithEquipmentCount(
                project_id=project.project_id,
                project_name=project.project_name,
                project_status=project.project_status,
                created_at=project.created_at,
                updated_at=project.updated_at,
                equipment_count=equipment_count
            )
            result.append(project_data)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch projects: {str(e)}")
# ====================================================================================================================
# Upload Equipment CSV
@project_router.post("/upload-equipment", response_model=CSVUploadResponse)
async def upload_equipment_csv(
    file: UploadFile = File(...),
    project_id: int = Form(...),
     db_session = Depends(get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    # Verify project exists
    project = db_session.execute(
        projects.select().where(projects.c.project_id == project_id)
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        # Read file contents
        contents = await file.read()
        
        # Detect delimiter
        delimiter = detect_delimiter(contents)
        if delimiter is None:
            raise HTTPException(status_code=400, detail="Could not detect CSV delimiter. Please use comma, semicolon, or tab as separator.")
        
        # Decode content
        try:
            csv_string = StringIO(contents.decode('utf-8'))
        except UnicodeDecodeError:
            csv_string = StringIO(contents.decode('latin1'))
        
        # Read CSV with detected delimiter
        csv_reader = csv.DictReader(csv_string, delimiter=';')
        print("🔍 CSV Header Fields:", csv_reader.fieldnames)
        
        # Clean fieldnames
        csv_reader.fieldnames = clean_fieldnames(csv_reader.fieldnames)
        
        # Required columns
        required_columns = [
            'asset_tag',           
            'asset_description',
            'sub_equipment_class_code', 
            'tech_specification',
            'drawing_reference'
        ]
        
        # Check for required columns with case-insensitive matching
        available_columns = [col.lower() for col in csv_reader.fieldnames]
        missing_columns = []
        
        for required in required_columns:
            if required.lower() not in available_columns:
                missing_columns.append(required)
        
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {', '.join(missing_columns)}. Found columns: {', '.join(csv_reader.fieldnames)}"
            )
        
        # Process and insert data
        inserted_count = 0
        current_time = datetime.now()
        
        for row in csv_reader:
            try:
                # Convert empty strings to None and clean data
                for key in row:
                    if row[key] == '':
                        row[key] = None
                    elif isinstance(row[key], str):
                        row[key] = row[key].strip()

                # Get values with case-insensitive field matching
                asset_tag=get_case_insensitive_value(row,'asset_tag')
                asset_description = get_case_insensitive_value(row, 'asset_description')
                sub_equipment_class_code = get_case_insensitive_value(row, 'sub_equipment_class_code')
                tech_specification = get_case_insensitive_value(row, 'tech_specification')
                drawing_reference = get_case_insensitive_value(row, 'drawing_reference')
                
                # Convert numeric fields if they exist in the CSV
                mtbf = to_float(get_case_insensitive_value(row, 'mtbf'))
                mttf = to_float(get_case_insensitive_value(row, 'mttf'))
                mttr = to_float(get_case_insensitive_value(row, 'mttr'))
                nbre_maint_task = to_int(get_case_insensitive_value(row, 'nbre_maint_task'))
                cost = to_float(get_case_insensitive_value(row, 'cost'))
                life_cycle = to_int(get_case_insensitive_value(row, 'life_cycle'))
                
                # Insert into project_equipment table
                insert_stmt = project_equipment.insert().values(
                    project_id=project_id,
                    asset_tag=asset_tag or '',
                    asset_description=asset_description or '',
                    sub_equipment_class_code=sub_equipment_class_code or '',
                    tech_specification=tech_specification or '',
                    drawing_reference=drawing_reference or '',
                    
                    # Optional numeric fields
                    mtbf=mtbf,
                    mttf=mttf,
                    mttr=mttr,
                    nbre_maint_task=nbre_maint_task,
                    cost=cost,
                    life_cycle=life_cycle,
                    
                    created_at=current_time,
                    updated_at=current_time
                )
                
                db_session.execute(insert_stmt)
                inserted_count += 1
                
                print(f"✅ Processed: {asset_description} | {sub_equipment_class_code}")
                
            except Exception as e:
                db_session.rollback()
                raise HTTPException(
                    status_code=400,
                    detail=f"Error processing row {csv_reader.line_num}: {str(e)}"
                )
        
        db_session.commit()
        
        return CSVUploadResponse(
            project_status="Equipment List Uploaded",
            success=True,
            imported=inserted_count,
            message=f"Successfully imported {inserted_count} equipment items to project '{project.project_name}'"
        )
        
    except HTTPException:
        db_session.rollback()
        raise
    except Exception as e:
        db_session.rollback()
        print("=== Equipment CSV Upload Error Traceback ===")
        traceback.print_exc()
        print("============================================")
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")

# ====================================================================================================================
# Get Equipment for Specific Project
@project_router.get("/{project_id}/equipment", response_model=List[EquipmentResponse])
async def get_project_equipment(project_id: int,db_session = Depends(get_db)
):
    try:
        project = db_session.execute(
            projects.select().where(projects.c.project_id == project_id)
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        equipment_result = db_session.execute(
            project_equipment.select().where(
                project_equipment.c.project_id == project_id
            ).order_by(project_equipment.c.id)
        ).fetchall()
        
        return equipment_result 
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch equipment: {str(e)}")
# ====================================================================================================================
# Delete Project and All Associated Data
@project_router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    db_session = Depends(get_db)
):
    try:
        # Check if project exists
        project = db_session.execute(
            projects.select().where(projects.c.project_id == project_id)
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project_name = project.project_name
        
        # Delete all equipment associated with this project
        db_session.execute(
            project_equipment.delete().where(
                project_equipment.c.project_id == project_id
            )
        )
        
        # Delete the project itself
        db_session.execute(
            projects.delete().where(
                projects.c.project_id == project_id
            )
        )
        
        db_session.commit()
        
        return {
            "success": True,
            "message": f"Project '{project_name}' and all associated equipment have been deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db_session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete project: {str(e)}")
# ====================================================================================================================
# Get Single Project
@project_router.get("/{project_id}", response_model=ProjectWithEquipmentCount)
async def get_project(
    project_id: int,
    db_session = Depends(get_db)
):
    try:
        project = db_session.execute(
            projects.select().where(projects.c.project_id == project_id)
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        equipment_count = db_session.execute(
            project_equipment.select().where(
                project_equipment.c.project_id == project_id
            )
        ).rowcount
        
        return ProjectWithEquipmentCount(
            project_id=project.project_id,
            project_name=project.project_name,
            project_status=project.project_status,
            created_at=project.created_at,
            updated_at=project.updated_at,
            equipment_count=equipment_count
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch project: {str(e)}")
# ====================================================================================================================
# Activate Taxonomy
@project_router.post("/generate_taxonomy")
async def activate_taxonomy(project_data: dict, db_session = Depends(get_db)):
    try:
        project_id = project_data.get("project_id")
        
        # Check if project exists - use the imported tables directly
        project = db_session.execute(
            projects.select().where(projects.c.project_id == project_id)
        ).first()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Check if equipment exists for this project
        equipment_count = db_session.execute(
            project_equipment.select().where(
                project_equipment.c.project_id == project_id
            )
        ).fetchall()
        
        if not equipment_count:
            raise HTTPException(status_code=404, detail="No equipment found for this project")
        
        # Build mapping dictionary for quick lookup
        code_to_category_map = {}
        code_to_description_map = {}
        
        for category, equipment_list in EquipmentClass.items():
            for item in equipment_list:
                code_to_category_map[item["code"]] = category
                code_to_description_map[item["code"]] = item["description"]
        
        # Update equipment records
        updated_count = 0
        unmatched_codes = []
        
        equipment_records = db_session.execute(
            project_equipment.select().where(
                project_equipment.c.project_id == project_id
            )
        ).fetchall()
        
        for record in equipment_records:
            sub_equipment_class_code = record.sub_equipment_class_code
            
            if sub_equipment_class_code and sub_equipment_class_code in code_to_category_map:
                # Update the record
                update_data = {
                    "equipment_class_category": code_to_category_map[sub_equipment_class_code],
                    "sub_equipment_class_desc": code_to_description_map[sub_equipment_class_code]
                }
                
                db_session.execute(
                    project_equipment.update()
                    .where(project_equipment.c.id == record.id)
                    .values(update_data)
                )
                updated_count += 1
            elif sub_equipment_class_code:
                unmatched_codes.append(sub_equipment_class_code)
        
        db_session.commit()
        
        response_data = {
            "success": True,
            "updated_count": updated_count,
            "total_equipment": len(equipment_records),
            "unmatched_codes": list(set(unmatched_codes)),  # Remove duplicates
            "message": f"Taxonomy updated successfully. Updated {updated_count} out of {len(equipment_records)} equipment items."
        }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        db_session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to activate taxonomy: {str(e)}") 