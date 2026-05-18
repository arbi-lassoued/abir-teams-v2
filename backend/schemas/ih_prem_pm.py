# schemas/ih_prem_pm.py
from pydantic import BaseModel
from typing import Optional

class IHPremPMBase(BaseModel):
    
    sub_equipment_class_code:Optional[str] = None
    maint_state:Optional[str] = None
    equipment_class_category: Optional[str] = None
    sub_equipment_class_desc: Optional[str] = None
    eq_type: Optional[str] = None
    maint_prog_code: Optional[str] = None
    detection: Optional[str] = None
    maint_type: Optional[str] = None
    maint_description: Optional[str] = None

    size_impact: Optional[str] = None

    frequency: Optional[int] = None
    scope: Optional[str] = None
    eq_status: Optional[str] = None   
    plant_status:Optional[str] = None 

    active_time_sm_eq: Optional[float] = None
    active_time_med_eq: Optional[float] = None
    active_time_lg_eq: Optional[float] = None

    manpower_sm_eq: Optional[float] = None
    manpower_med_eq: Optional[float] = None
    manpower_lg_eq: Optional[float] = None

    workload_per_sm_eq_task: Optional[float] = None
    workload_per_med_eq_task: Optional[float] = None
    workload_per_lg_eq_task: Optional[float] = None

    task_occurrence_per_year: Optional[float] = None

    annual_workload_sm_eq: Optional[float] = None
    annual_workload_med_eq: Optional[float] = None
    annual_workload_lg_eq: Optional[float] = None

    sce: Optional[str] = None
    robots_compatibility: Optional[str] = None
    
    manip_required: Optional[str] = None

    cost_per_sm_eq: Optional[float] = None
    cost_per_med_eq: Optional[float] = None
    cost_per_lg_eq: Optional[float] = None




    remarks: Optional[str] = None
class IHPremPMCreate(IHPremPMBase):
    pass

class IHPremPMUpdate(IHPremPMBase):   
 pass


# class IHPremPMStatusChange(IHPremPMBase):   
#     ih_prem_pm_id :Optional[int]=None
#     maint_state:Optional[str] = None

class IHPremPM(IHPremPMBase):
    prem_pm_id: int
    
    class Config:
        from_attributes = True