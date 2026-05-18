from sqlalchemy import  Table, Column, Integer, String, Text, DateTime, Float, ForeignKey
from db import meta, engine 
from sqlalchemy.orm import relationship

 
ih_spares = Table(
    'in_house_spare_parts_table', meta,    
    Column('ih_sp_id',Integer,primary_key=True, autoincrement=True),   
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
    Column('sm_size',Float, nullable=True),
    Column('med_size',Float, nullable=True),
    Column('lg_size',Float, nullable=True), 
    )
meta.create_all(engine) 