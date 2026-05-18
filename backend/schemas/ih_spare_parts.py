from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class Spare(BaseModel): 
    equipment_class:Optional[str] = None
    sub_equipment_class_code :Optional[str] = None
    sub_equipment_class_desc :Optional[str] = None       
    sp_description :Optional[str] = None
    sp_state:Optional[str] = None
    min_quantity:Optional[float] = None
    max_quantity:Optional[float] = None
    meas_unit: Optional[str] = None
    comm_sp:Optional[str] = None
    op_sp:Optional[str] = None
    overh_sp:Optional[str] = None
    capital_sp:Optional[str] = None
    consumable:Optional[str] = None
    storage_condition:Optional[str] = None
    sm_size:Optional[float] = None
    med_size:Optional[float] = None
    lg_size:Optional[float] = None








 
   