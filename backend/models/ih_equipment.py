from sqlalchemy import  Table, Column, Integer, String, Text, DateTime, Float, ForeignKey
from db import meta, engine 
from sqlalchemy.orm import relationship, Session
from datetime import datetime

 # Create the list of planned workorders 
equipments = Table(
    'in_house_equipment_table', meta,           
    Column('ih_eq_id',Integer, unique=True, primary_key=True,autoincrement=True), 
    Column('equipment_description',String(100), nullable=True, default=""),     
    Column('equipment_class_category',String(100), nullable=True, default=""), 
    Column('sub_equipment_class_code',String(100), nullable=True, default=""),
    Column('sub_equipment_class_desc',String(100), nullable=True, default=""), 
    Column('equipment_life_cycle',Integer, nullable=True), 
    Column('gosp',Integer, nullable=True),  
 
    Column('maint_type',String(50), nullable=True, default=""), 
    Column('maint_prog_code',String(50), nullable=True, default=""),
    Column('mtbf',Float, nullable=True,default=0.0), 
    Column('mttf',Float, nullable=True,default=0.0),  
    Column('mttr',Float, nullable=True,default=0.0), 
    Column('nbre_maint_task',Integer, nullable=True),

    
    Column('cost_sm_eq',Float, nullable=True, default=0.0),
    Column('cost_med_eq',Float, nullable=True, default=0.0),
    Column('cost_lg_eq',Float, nullable=True, default=0.0),  
  
    Column('remarks',String(255), nullable=True, default="Na") 
    )
meta.create_all(engine)  
