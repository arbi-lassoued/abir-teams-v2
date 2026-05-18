 # models/ih_prem_pm.py
from sqlalchemy import Column, Integer, String, Float, Text, Table
from db import meta, engine

# Define the table using your MetaData instance
ih_preliminary_maintenance_plan = Table(
    'in_house_preliminary_maintenance_plan_table', 
    meta,
    Column('ih_prem_pm_id', Integer, primary_key=True, autoincrement=True),
      
    Column('maint_state', String(50)),

    Column('equipment_class_category', String(50)),
    Column('sub_equipment_class_desc', String(100)),
    Column('sub_equipment_class_code', String(50)),

    Column('eq_type', String(100)),
    Column('maint_prog_code', String(50)),
    Column('detection', String(50)),
    Column('maint_type', String(50)),
    Column('maint_description', String(255)),

    Column('size_impact', String(10)),

    Column('frequency', Integer),
    Column('scope', String(20)),
    Column('eq_status', String(10)), 
    Column('plant_status', String(20)), 

    Column('active_time_sm_eq', Float),
    Column('active_time_med_eq', Float),
    Column('active_time_lg_eq', Float),

    Column('manpower_sm_eq', Float),
    Column('manpower_med_eq', Float),
    Column('manpower_lg_eq', Float),

    Column('workload_per_sm_eq_task', Float),
    Column('workload_per_med_eq_task', Float),
    Column('workload_per_lg_eq_task', Float),


    Column('task_occurrence_per_year', Float),

    Column('annual_workload_sm_eq', Float),
    Column('annual_workload_med_eq', Float),
    Column('annual_workload_lg_eq', Float),


    Column('sce', String(50)),
    Column('robots_compatibility', String(10)),
      
    Column('manip_required', String(10)),

    Column('cost_per_sm_eq', Float),
    Column('cost_per_med_eq', Float),
    Column('cost_per_lg_eq', Float),


    Column('remarks', String(255))
)

# Create the table if it doesn't exist
meta.create_all(engine)