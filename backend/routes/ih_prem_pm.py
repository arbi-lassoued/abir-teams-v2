 # routes/ih_prem_pm.py
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.exc import SQLAlchemyError
from db import db_session, get_db
from schemas.ih_prem_pm import IHPremPM, IHPremPMCreate, IHPremPMUpdate
from models.ih_prem_pm import ih_preliminary_maintenance_plan
import csv
from io import StringIO
from datetime import datetime
import traceback
# =====================================================================================================
# Initialize APIRouter
ih_prem_pm_router = APIRouter()
# =====================================================================================================
@ih_prem_pm_router.get('/')
def fetch_prem_pms(db_session=Depends(get_db)):
    try:    
        result = db_session.execute(ih_preliminary_maintenance_plan.select()) 
        prem_pms_list = [dict(row._mapping) for row in result.fetchall()]
        return {"prem_pms": prem_pms_list}  
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))
# =====================================================================================================
@ih_prem_pm_router.post('/')
def post_prem_pm(prem_pm: IHPremPMCreate): 
    try:           
        insert_query = ih_preliminary_maintenance_plan.insert().values(
            
            sub_equipment_class_code=prem_pm.sub_equipment_class_code,
            equipment_class_category=prem_pm.equipment_class_category,
            sub_equipment_class_desc=prem_pm.sub_equipment_class_desc,
            eq_type=prem_pm.eq_type,
            maint_prog_code=prem_pm.maint_prog_code,
            detection=prem_pm.detection,
            maint_type=prem_pm.maint_type,
            maint_description=prem_pm.maint_description,

            size_impact=prem_pm.size_impact,

            frequency=prem_pm.frequency,
            scope=prem_pm.scope,
            eq_status=prem_pm.eq_status,
            plant_status=prem_pm.plant_status,
            # int_active_time=prem_pm.int_active_time,

            active_time_sm_eq=prem_pm.active_time_sm_eq,
            active_time_med_eq=prem_pm.active_time_med_eq,
            active_time_lg_eq=prem_pm.active_time_lg_eq,

            manpower_sm_eq=prem_pm.manpower_sm_eq,
            manpower_med_eq=prem_pm.manpower_med_eq,
            manpower_lg_eq=prem_pm.manpower_lg_eq,

            workload_per_sm_eq_task=prem_pm.workload_per_sm_eq_task,
            workload_per__med_eqtask=prem_pm.workload_per_med_eq_task,
            workload_per_lg_eq_task=prem_pm.workload_per_lg_eq_task,

            task_occurrence_per_year=prem_pm.task_occurrence_per_year,

            annual_workload_sm_eq=prem_pm.annual_workload_sm_eq,
            annual_workload_med_eq=prem_pm.annual_workload_med_eq,
            annual_workload_lg_eq=prem_pm.annual_workload_lg_eq,


            sce=prem_pm.sce,
            robots_compatibility=prem_pm.robots_compatibility,            
            manip_required=prem_pm.manip_required,

            cost_per_sm_eq=prem_pm.cost_per_sm_eq,
            cost_per_med_eq=prem_pm.cost_per_med_eq,
            cost_per_lg_eq=prem_pm.cost_per_lg_eq,

            remarks=prem_pm.remarks,
        )                                            

        result = db_session.execute(insert_query)
        db_session.commit()
        
        return {
            "ih_prem_pm_id": result.lastrowid,
            # "eq_num": prem_pm.eq_num,
            # "eq_category": prem_pm.eq_category,
            # "eq_class": prem_pm.eq_class,
            # "eq_type": prem_pm.eq_type,
            # "maint_prog_code": prem_pm.maint_prog_code,
            # "detection": prem_pm.detection,
            # "maint_task_type": prem_pm.maint_task_type,
            # "maint_description": prem_pm.maint_description,
            # "task_duration": prem_pm.task_duration,
            # "scope": prem_pm.scope,
            # "eq_status": prem_pm.eq_status,
            # "int_active_time": prem_pm.int_active_time,
            # "active_time": prem_pm.active_time,
            # "manpower": prem_pm.manpower,
            # "workload_per_task": prem_pm.workload_per_task,
            # "task_occurrence_per_year": prem_pm.task_occurrence_per_year,
            # "annual_workload": prem_pm.annual_workload,
            # "sce": prem_pm.sce,
            # "robots_compatibility": prem_pm.robots_compatibility,
            # "remarks": prem_pm.remarks,
            # "manip_required": prem_pm.manip_required
        }
    except SQLAlchemyError as e:
        db_session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
# =====================================================================================================
@ih_prem_pm_router.put('/{ih_prem_pm_id}')
def update_prem_pm(ih_prem_pm_id: int, prem_pm: IHPremPMUpdate):
    try:
        update_query = ih_preliminary_maintenance_plan.update().values(
            
            sub_equipment_class_code=prem_pm.sub_equipment_class_code,
            equipment_class_category=prem_pm.equipment_class_category,
            sub_equipment_class_desc=prem_pm.sub_equipment_class_desc,
            eq_type=prem_pm.eq_type,
            maint_prog_code=prem_pm.maint_prog_code,
            detection=prem_pm.detection,
            maint__type=prem_pm.maint_type,
            maint_description=prem_pm.maint_description,
            size_impact=prem_pm.size_impact,
            frequency=prem_pm.frequency,
            scope=prem_pm.scope,
            eq_status=prem_pm.eq_status,
            plant_status=prem_pm.plant_status,
            # int_active_time=prem_pm.int_active_time,

            active_time_sm_eq=prem_pm.active_time_sm_eq,
            active_time_med_eq=prem_pm.active_time_med_eq,
            active_time_lg_eq=prem_pm.active_time_lg_eq,

            manpower_sm_eq=prem_pm.manpower_sm_eq,
            manpower_med_eq=prem_pm.manpower_med_eq,
            manpower_lg_eq=prem_pm.manpower_lg_eq,

            workload_per_sm_eq_task=prem_pm.workload_per_sm_eq_task,
            workload_per__med_eqtask=prem_pm.workload_per_med_eq_task,
            workload_per_lg_eq_task=prem_pm.workload_per_lg_eq_task,

           

            task_occurrence_per_year=prem_pm.task_occurrence_per_year,

            annual_workload_sm_eq=prem_pm.annual_workload_sm_eq,
            annual_workload_med_eq=prem_pm.annual_workload_med_eq,
            annual_workload_lg_eq=prem_pm.annual_workload_lg_eq,

             

            sce=prem_pm.sce,

            robots_compatibility=prem_pm.robots_compatibility,
            remarks=prem_pm.remarks,
            cost_per_sm_eq=prem_pm.cost_per_sm_eq,
            cost_per_med_eq=prem_pm.cost_per_med_eq,
            cost_per_lg_eq=prem_pm.cost_per_lg_eq,
            manip_required=prem_pm.manip_required
        ).where(ih_preliminary_maintenance_plan.c.ih_prem_pm_id == ih_prem_pm_id)
        
        result = db_session.execute(update_query)
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Maintenance plan not found")
        db_session.commit()
        
        return {
            "ih_prem_pm_id": ih_prem_pm_id,
            # "eq_num": prem_pm.eq_num,
            # "eq_category": prem_pm.eq_category,
            # "eq_class": prem_pm.eq_class,
            # "eq_type": prem_pm.eq_type,
            # "maint_prog_code": prem_pm.maint_prog_code,
            # "detection": prem_pm.detection,
            # "maint_task_type": prem_pm.maint_task_type,
            # "maint_description": prem_pm.maint_description,
            # "task_duration": prem_pm.task_duration,
            # "scope": prem_pm.scope,
            # "eq_status": prem_pm.eq_status,
            # "int_active_time": prem_pm.int_active_time,
            # "active_time": prem_pm.active_time,
            # "manpower": prem_pm.manpower,
            # "workload_per_task": prem_pm.workload_per_task,
            # "task_occurrence_per_year": prem_pm.task_occurrence_per_year,
            # "annual_workload": prem_pm.annual_workload,
            # "sce": prem_pm.sce,
            # "robots_compatibility": prem_pm.robots_compatibility,
            # "remarks": prem_pm.remarks,
            # "manip_required": prem_pm.manip_required
        }
    except SQLAlchemyError as e:
        db_session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
# =====================================================================================================
@ih_prem_pm_router.delete('/{ih_prem_pm_id}')
def delete_prem_pm(ih_prem_pm_id: int): 
    try:
        delete_query = ih_preliminary_maintenance_plan.delete().where(
            ih_preliminary_maintenance_plan.c.ih_prem_pm_id == ih_prem_pm_id
        )
        result = db_session.execute(delete_query)
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Maintenance plan not found")
        db_session.commit()
        return {"message": "Maintenance plan deleted successfully"}
    except SQLAlchemyError as e:
        db_session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
# =====================================================================================================
@ih_prem_pm_router.get('/{ih_prem_pm_id}')
def get_prem_pm_by_id(ih_prem_pm_id: int, db_session=Depends(get_db)):
    try:    
        result = db_session.execute(
            ih_preliminary_maintenance_plan.select().where(
                ih_preliminary_maintenance_plan.c.ih_prem_pm_id == ih_prem_pm_id
            )
        )
        prem_pm = result.fetchone()
        
        if not prem_pm:
            raise HTTPException(status_code=404, detail="Maintenance plan not found")
            
        return {"prem_pm": dict(prem_pm._mapping)}  
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))
# =====================================================================================================
def detect_delimiter(sample):
    for delimiter in [',', ';', '\t']:
        try:
            reader = csv.DictReader(StringIO(sample.decode('utf-8')), delimiter=delimiter)
            if 'eq_num' in next(reader):
                return delimiter
        except Exception:
            continue
    return None

@ih_prem_pm_router.post("/upload-csv/")
async def upload_prem_pm_csv(file: UploadFile = File(...)):
    try:    
        contents = await file.read()
        # csv_string = StringIO(contents.decode('utf-8'))
        try:
            csv_string = StringIO(contents.decode('utf-8'))
        except UnicodeDecodeError:
            csv_string = StringIO(contents.decode('latin1'))
        csv_reader = csv.DictReader(csv_string, delimiter=';')  
        print("CSV Header Fields:", csv_reader.fieldnames) 
        csv_reader.fieldnames = [field.strip().lstrip('\ufeff') for field in csv_reader.fieldnames]
        
        # Process each row
        for row in csv_reader:
            try:
                # Convert empty strings to None and clean data
                for key in row:
                    if row[key] == '':
                        row[key] = None
                    elif isinstance(row[key], str):
                        row[key] = row[key].strip()

                    # if ',' in row[key] and key in [
                    #         'task_duration', 'int_active_time', 'active_time',
                    #         'workload_per_task', 'task_occurrence_per_year', 'annual_workload'
                    #     ]:
                    #     row[key] = row[key].replace(',', '.')
                    
                def to_float(val):
                    if val is None:
                        return None
                    val = val.strip().replace(",", ".")  # handle European comma decimals
                    try:
                        return float(val)
                    except ValueError:
                        return None               

                # Convert numeric fields
                # row['eq_num'] = int(row['eq_num']) if row.get('eq_num') else None
                row['frequency'] = int(row.get('frequency'))

                row['manpower_sm_eq'] = to_float(row['manpower_sm_eq']) if row.get('manpower_sm_eq') else None
                row['manpower_med_eq'] = to_float(row['manpower_med_eq']) if row.get('manpower_med_eq') else None
                row['manpower_lg_eq'] = to_float(row['manpower_lg_eq']) if row.get('manpower_lg_eq') else None
                # row['int_active_time'] = to_float(row.get('int_active_time'))

                row['active_time_sm_eq'] = to_float(row.get('active_time_sm_eq'))
                row['active_time_med_eq'] = to_float(row.get('active_time_med_eq'))
                row['active_time_lg_eq'] = to_float(row.get('active_time_lg_eq'))

                row['workload_per_sm_eq_task'] = to_float(row.get('workload_per_sm_eq_task'))
                row['workload_per_med_eq_task'] = to_float(row.get('workload_per_med_eq_task'))
                row['workload_per_lg_eq_task'] = to_float(row.get('workload_per_lg_eq_task'))

                row['task_occurrence_per_year'] = to_float(row.get('task_occurrence_per_year'))
               

                row['annual_workload_sm_eq'] = to_float(row.get('annual_workload_sm_eq'))
                row['annual_workload_med_eq'] = to_float(row.get('annual_workload_med_eq'))
                row['annual_workload_lg_eq'] = to_float(row.get('annual_workload_lg_eq'))

                
                row['cost_per_sm_eq'] = to_float(row.get('cost_per_sm_eq'))
                row['cost_per_med_eq'] = to_float(row.get('cost_per_med_eq'))
                row['cost_per_lg_eq'] = to_float(row.get('cost_per_lg_eq'))






                insert_query = ih_preliminary_maintenance_plan.insert().values(
                    # eq_num=row.get('eq_num'),                                     
                    maint_state=row.get('maint_state'),

                    equipment_class_category=row.get('equipment_class_category'),
                    sub_equipment_class_desc=row.get('sub_equipment_class_desc'),
                    sub_equipment_class_code=row.get('sub_equipment_class_code'),  

                    eq_type=row.get('eq_type'),
                    maint_prog_code=row.get('maint_prog_code'),
                    detection=row.get('detection'),
                    maint_type=row.get('maint_type'),
                    maint_description=row.get('maint_description'),

                    size_impact=row.get('size_impact'),

                    frequency=row.get('frequency'),
                    scope=row.get('scope'),
                    eq_status=row.get('eq_status'),
                    plant_status =row.get('plant_status'),
                    # int_active_time=row.get('int_active_time'),

                    active_time_sm_eq=row.get('active_time_sm_eq'),
                    active_time_med_eq=row.get('active_time_med_eq'),
                    active_time_lg_eq=row.get('active_time_lg_eq'),

                    manpower_sm_eq=row.get('manpower_sm_eq'),
                    manpower_med_eq=row.get('manpower_med_eq'),
                    manpower_lg_eq=row.get('manpower_lg_eq'),

                    workload_per_sm_eq_task=row.get('workload_per_sm_eq_task'),
                    workload_per_med_eq_task=row.get('workload_per_med_eq_task'),
                    workload_per_lg_eq_task=row.get('workload_per_lg_eq_task'),

                    task_occurrence_per_year=row.get('task_occurrence_per_year'),

                    annual_workload_sm_eq=row.get('annual_workload_sm_eq'),
                    annual_workload_med_eq=row.get('annual_workload_med_eq'),
                    annual_workload_lg_eq=row.get('annual_workload_lg_eq'),

                    sce=row.get('sce'),
                    robots_compatibility=row.get('robots_compatibility'),
                    
                    manip_required=row.get('manip_required'),

                    cost_per_sm_eq=row.get('cost_per_sm_eq'),
                    cost_per_med_eq=row.get('cost_per_med_eq'),
                    cost_per_lg_eq=row.get('cost_per_lg_eq'),

                    remarks=row.get('remarks'),
                )
                db_session.execute(insert_query)
                
            except Exception as e:
                db_session.rollback()
                raise HTTPException(
                    status_code=400,
                    detail=f"Error processing row {csv_reader.line_num}: {str(e)}"
                )
        
        db_session.commit()
        return {"message": "CSV processed successfully", "records_processed": csv_reader.line_num - 1}
        
    except Exception as e:
        db_session.rollback()
        print("=== CSV Upload Error Traceback ===")
        traceback.print_exc()
        print("===================================")
        raise HTTPException(status_code=500, detail=str(e))
#==========================================================================================================================================================================
# Update activity State from planned maintenance list
@ih_prem_pm_router.patch('/{ih_prem_pm_id}/state')
async def update_prem_pm_status(ih_prem_pm_id: int, maint_state: str):
    print("You are updating PM status from PM List")
    try:         
        update_query = (
            ih_preliminary_maintenance_plan.update()
            .where(ih_preliminary_maintenance_plan.c.ih_prem_pm_id == ih_prem_pm_id)
            .values(maint_state=maint_state)  
        )
        
        result = db_session.execute(update_query)
        
        if result.rowcount == 0:
            db_session.rollback()
            raise HTTPException(status_code=404, detail="planned activity not found")
        
        db_session.commit()
        
        return {
            "ih_prem_pm_id": ih_prem_pm_id,      
            "new_status": maint_state
        }
        
    except SQLAlchemyError as e:
        db_session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        db_session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )