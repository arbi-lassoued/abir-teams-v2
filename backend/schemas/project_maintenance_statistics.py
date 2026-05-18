from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class MaintenanceStatisticsBase(BaseModel):
    scope: str
    sub_equipment_code_count: int
    equipment_type_count: int
    enabled_maintenance_count: int
    total_annual_workload: float
    total_activities: int
    unique_sub_equipment_codes: Optional[List[str]] = []
    unique_equipment_types: Optional[List[str]] = []

class MaintenanceStatisticsResponse(MaintenanceStatisticsBase):
    id: int
    project_id: int
    # created_at: Optional[datetime]
    # updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class MaintenanceStatisticsSummary(BaseModel):
    total_scopes: int
    total_annual_workload: float
    total_activities: int
    total_enabled_maintenance: int

class MaintenanceStatisticsFullResponse(BaseModel):
    success: bool
    project_id: int
    statistics: List[MaintenanceStatisticsResponse]
    summary: MaintenanceStatisticsSummary
    message: str