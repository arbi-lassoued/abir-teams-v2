from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal


class Equipment(BaseModel):        
    equipment_description :Optional[str] = None 
    equipment_class_category:Optional[str] = None
    sub_equipment_class_code :Optional[str] = None
    sub_equipment_class_desc :Optional[str] = None
    equipment_life_cycle : Optional[int]= None
    gosp : Optional[int]= None
    maint_type: Optional[str]= None
    maint_prog_code: Optional[str]= None 
    mtbf :Optional[float] = None
    mttf :Optional[float] = None
    mttr :Optional[float] = None
    nbre_maint_task :Optional[int] = None   
    cost_sm_eq :Optional[float] = None
    cost_med_eq :Optional[float] = None
    cost_lg_eq :Optional[float] = None
    
    remarks :Optional[str] = None


# class EquipmentStatus(BaseModel):
#     asset_status: Optional[str]
#     breakdown: Optional[str]
#     life_cycle: Optional[int]= None
#     end_life_cycle_date : Optional[datetime] = None

