from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MaintenancePlanBase(BaseModel):
    asset_tag: Optional[str] = ""
    asset_description: Optional[str] = ""
    equipment_class_category: Optional[str] = ""
    sub_equipment_class_code: Optional[str] = ""
    sub_equipment_class_desc: Optional[str] = ""
    maint_prog_code: Optional[str] = ""
    detection: Optional[str] = ""
    maint_type: Optional[str] = ""
    maint_state: Optional[str] = ""
    maint_description: Optional[str] = ""
    size_impact: Optional[str] = ""
    frequency: Optional[int] = None
    scope: Optional[str] = ""
    eq_status: Optional[str] = ""
    plant_status: Optional[str] = ""
    active_time: Optional[float] = None
    manpower: Optional[float] = None
    workload_per_task: Optional[float] = None
    task_occurrence_per_year: Optional[float] = None
    annual_workload: Optional[float] = None
    sce: Optional[str] = ""
    robots_compatibility: Optional[str] = ""
    manip_required: Optional[str] = ""
    cost: Optional[float] = None

class MaintenancePlanResponse(MaintenancePlanBase):
    id: int
    project_id: int
    # created_at: Optional[datetime]
    # updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True