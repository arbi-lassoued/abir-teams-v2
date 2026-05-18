# models/project_models.py
from sqlalchemy import Table, Column, Integer, String, Text, DateTime, Float, ForeignKey, DECIMAL, Date
from db import meta, engine


# Projects Table
projects = Table(
    'projects_table', meta,
    Column('project_id', Integer, primary_key=True, autoincrement=True),
    Column('project_name', String(255), nullable=False, unique=True),
    Column('project_status', String(50), nullable=True, default="active"),
    Column('created_at', DateTime, nullable=True, default=None),
    Column('updated_at', DateTime, nullable=True, default=None),
)

# Project Equipment Table
project_equipment = Table(
    'project_equipment_table', meta,
    Column('id', Integer, primary_key=True, autoincrement=True),
    Column('project_id', Integer, nullable=False),
    
    # CSV Import Columns (Required)
    Column('asset_tag', String(50), nullable=True, default=""),
    Column('asset_description', String(255), nullable=True, default=""),
    Column('equipment_class_category',String(100), nullable=True, default=""), 
    Column('sub_equipment_class_desc', String(100), nullable=True, default=""),
    Column('sub_equipment_class_code',String(100), nullable=True, default=""),


    Column('tech_specification', Text, nullable=True, default=""),
    Column('drawing_reference', String(100), nullable=True, default=""),
    
    # Empty Columns for Future Use
    Column('mtbf', Float, nullable=True),
    Column('mttf', Float, nullable=True),
    Column('mttr', Float, nullable=True),
    Column('nbre_maint_task', Integer, nullable=True),
    Column('cost', DECIMAL(12, 2), nullable=True),
    Column('life_cycle', Integer, nullable=True),
    Column('end_life_cycle_date', Date, nullable=True),
    Column('location_key', String(100), nullable=True, default=""),
    Column('parent_location_key', String(100), nullable=True, default=""),
    Column('system', String(100), nullable=True, default=""),
    Column('sub_system', String(100), nullable=True, default=""),
    Column('asset_status', String(50), nullable=True, default=""),
    
    Column('downtime', Float, nullable=True),
    Column('breakdown', Integer, nullable=True),
    Column('wbs_key', String(100), nullable=True, default=""),
    Column('weekly_operating_hour', Float, nullable=True),
    Column('metter_reading', Float, nullable=True),
    Column('control_unit', String(100), nullable=True, default=""),
    Column('priority_rpn', Integer, nullable=True),
    Column('nameplate', Text, nullable=True, default=""),
    Column('manufacturer', String(100), nullable=True, default=""),
    Column('model', String(100), nullable=True, default=""),
    Column('serial_number', String(100), nullable=True, default=""),
    Column('external_document', String(100), nullable=True, default=""),
    Column('bare_code', String(100), nullable=True, default=""),
    Column('warranty_information', Text, nullable=True, default=""),
    
    Column('created_at', DateTime, nullable=True, default=None),
    Column('updated_at', DateTime, nullable=True, default=None),
)

project_spares = Table(
    'project_spares_table', meta,     
    Column('id',Integer,primary_key=True, autoincrement=True), 
    Column('project_id', Integer, nullable=False),
    Column('asset_tag', String(50), nullable=True, default=""), 
    Column('asset_description', String(255), nullable=True, default=""),
    Column('equipment_class_category',String(100), nullable=True, default=""), 
    Column('sub_equipment_class_code',String(100), nullable=True, default=""),
    Column('sub_equipment_class_desc',String(100), nullable=True, default=""), 
    Column('sp_description',String(120), nullable=True, default=""),
    Column('sp_state',String(100), nullable=True, default=""),
    Column('min_quantity',Float, nullable=True),
    Column('max_quantity',Float, nullable=True),
    Column('meas_unit',String(10), nullable=True, default=""),
    Column('comm_sp',String(10), nullable=True, default=""),
    Column('op_sp',String(10), nullable=True, default=""),
    Column('overh_sp',String(10), nullable=True, default=""),
    Column('capital_sp',String(10), nullable=True, default=""),
    Column('consumable',String(10), nullable=True, default=""),
    Column('storage_condition',String(30), nullable=True, default=""),
    Column('size',Float, nullable=True),   
)
project_maintenance_plan = Table(
    'project_maintenance_plan_table', 
    meta,
    Column('id', Integer, primary_key=True, autoincrement=True),
    Column('project_id', Integer, nullable=False),
    
    # From project_equipment_table
    Column('asset_tag', String(50)),
    Column('asset_description', String(255)),

    Column('equipment_class_category', String(100)),
    Column('sub_equipment_class_code', String(100)),
    Column('sub_equipment_class_desc', String(100)),
    Column('maint_description', String(255)),
    # From in_house_preliminary_maintenance_plan_table
    Column('maint_prog_code', String(50)),
    Column('detection', String(50)),
    Column('maint_type', String(50)),
    Column('maint_state', String(50)),
    
    Column('size_impact', String(10)),
    Column('frequency', Integer),
    Column('scope', String(20)),
    Column('eq_status', String(10)),
    Column('plant_status', String(20)),
    Column('active_time', Float),
    Column('manpower', Float),
    Column('workload_per_task', Float),
    Column('task_occurrence_per_year', Float),
    Column('annual_workload', Float),
    Column('sce', String(50)),
    Column('robots_compatibility', String(10)),
    Column('manip_required', String(10)),
    Column('cost', Float),      
)

project_maintenance_statistics = Table(
    'project_maintenance_statistics_table', 
    meta,
    Column('id', Integer, primary_key=True, autoincrement=True),
    Column('project_id', Integer, nullable=False),
    
    # Statistics data
    Column('scope', String(50)),
    Column('sub_equipment_code_count', Integer),
    Column('equipment_type_count', Integer),
    Column('enabled_maintenance_count', Integer),
    Column('total_annual_workload', Float),
    Column('total_activities', Integer),
    
    # Store lists as JSON strings
    Column('unique_sub_equipment_codes', Text),  # JSON string
    Column('unique_equipment_types', Text),      # JSON string
    
    # Timestamps
    # Column('created_at', DateTime, default=datetime.now),
    # Column('updated_at', DateTime, default=datetime.now, onupdate=datetime.now)
)
# Create tables
meta.create_all(engine)