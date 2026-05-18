# schemas/project_schemas.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

# Project Schemas
class ProjectBase(BaseModel):
    project_name: str

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    project_id: int
    project_status: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Equipment Schemas
class EquipmentBase(BaseModel):
    asset_description: Optional[str] = ""
    sub_equipment_class_code: Optional[str] = ""
    tech_specification: Optional[str] = ""
    drawing_reference: Optional[str] = ""

class EquipmentCreate(EquipmentBase):
    project_id: int

class EquipmentResponse(EquipmentBase):
    id: int
    project_id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    asset_tag: Optional[str] = "" 
    equipment_class_category: Optional[str] = ""  
    sub_equipment_class_desc: Optional[str] = ""  
    
    class Config:
        from_attributes = True

# CSV Upload Schema
class CSVUploadResponse(BaseModel):
    project_status: str
    success: bool
    imported: int
    message: str

# Project List with Equipment Count
class ProjectWithEquipmentCount(ProjectResponse):
    equipment_count: int = 0