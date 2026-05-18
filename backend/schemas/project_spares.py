from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

# Spares Schemas
class SparesBase(BaseModel):
    asset_description: Optional[str] = ""
    sub_equipment_class_code: Optional[str] = ""
    tech_specification: Optional[str] = ""
    drawing_reference: Optional[str] = ""
    sp_description: Optional[str] = ""
    sp_state: Optional[str] = ""
    min_quantity: Optional[float] = None
    max_quantity: Optional[float] = None
    meas_unit: Optional[str] = ""
    comm_sp: Optional[str] = ""
    op_sp: Optional[str] = ""
    overh_sp: Optional[str] = ""
    capital_sp: Optional[str] = ""
    consumable: Optional[str] = ""
    storage_condition: Optional[str] = ""
    size: Optional[float] = None

class SparesResponse(SparesBase):
    id: int
    project_id: int
    asset_tag: Optional[str] = "" 
    equipment_class_category: Optional[str] = ""  
    sub_equipment_class_desc: Optional[str] = ""  
    
    class Config:
        from_attributes = True