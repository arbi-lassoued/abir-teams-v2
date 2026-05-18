from fastapi import APIRouter, HTTPException, Request , UploadFile, File,Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
# from fastapi.exception_handlers import RequestValidationError
from passlib.context import CryptContext
from sqlalchemy.exc import SQLAlchemyError, ProgrammingError, IntegrityError, DataError
from db import db_session, get_db
from schemas.ih_equipment import Equipment
# from schemas.ih_equipment import EquipmentStatus
# from schemas.equipment import EquipmentFirstStart
from models.ih_equipment import equipments
import logging  
import csv
from io import StringIO
from datetime import datetime
from dateutil.relativedelta import relativedelta
import traceback
#=====================================================================================================================================================================================================================
# Initialize APIRouter 

# # Set up logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

#=====================================================================================================================================================================================================================
# Initialize APIRouter
ih_equipment_router = APIRouter()  
#=====================================================================================================================================================================================================================

#=====================================================================================================================================================================================================================
# Get Equipment by ID
@ih_equipment_router.get("/id/{eqID}")
def get_equipment_by_id(eqID: int, db_session= Depends(get_db)):
    try:
        print(eqID)
        query = equipments.select().where(equipments.c.eq_id == eqID)
        result = db_session.execute(query).fetchone()
        if result:
            return dict(result._mapping)
        else:
            raise HTTPException(status_code=404, detail="Equipment not found")
    except SQLAlchemyError as e: 
        raise HTTPException(status_code=500, detail=str(e))
#=====================================================================================================================================================================================================================
# Get Equipment by KKS
@ih_equipment_router.get("/kks/{kks}")
def get_equipment_by_kks(kks: str):
    try:
        query = equipments.select().where(equipments.c.kks == kks)
        result = db_session.execute(query).fetchone()
        if result:
            return dict(result._mapping)
        else:
            raise HTTPException(status_code=404, detail="Equipment not found")  
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))     
#=====================================================================================================================================================================================================================
# Get all Equipments
@ih_equipment_router.get('/')
def fetch_equipments(db_session=Depends(get_db)):
    try:    
        result = db_session.execute(equipments.select())
        equipments_list = [dict(row._mapping) for row in result.fetchall()]  # Convert each row to a dictionary 
        return {"equipments": equipments_list}  
    except SQLAlchemyError as e:
        # Handle SQLAlchemy errors
        raise HTTPException(status_code=500, detail=str(e))   
#===================================================================================================================================================================================================================== 
# Post new Equipment:
@ih_equipment_router.post('/') 
async def post_equipments(equipment: Equipment, request: Request):  
    # print("Incoming data:", equipment.dict())    
    try:           
        print(equipment.kks),    
        current_date= datetime.now()
        life_cycle = equipment.life_cycle
        end_life_cycle_date = current_date + relativedelta(years=life_cycle)
        insert_query = equipments.insert().values(kks=equipment.kks,site =equipment.site,
                                                  life_cycle=life_cycle,                                                
                                                  end_life_cycle_date =end_life_cycle_date,                                                  
                                                  location_key=equipment.location_key,parent_location_key=equipment.parent_location_key,
                                                  system=equipment.system,sub_system=equipment.sub_system,
                                                  asset_description=equipment.asset_description,asset_status=equipment.asset_status,downtime=equipment.downtime,
                                                  breakdown=equipment.breakdown,
                                                  wbs_key=equipment.wbs_key,weekly_operating_hour=equipment.weekly_operating_hour,

                                                  equipment_class_category=equipment.equipment_class_category,                                                  
                                                  sub_equipment_class_code=equipment.sub_equipment_class_code,
                                                  sub_equipment_class_desc=equipment.sub_equipment_class_desc,
                                                  
                                                  metter_reading=equipment.metter_reading,control_unit=equipment.control_unit,priority_rpn=equipment.priority_rpn,
                                                  mtbf=equipment.mtbf,
                                                  mttf=equipment.mttf,
                                                  reliability=equipment.reliability,
                                                  availability=equipment.availability,
                                                  drawing_reference =equipment.drawing_reference,tech_specification =equipment.tech_specification,nameplate =equipment.nameplate,manufacturer =equipment.manufacturer,
                                                  model =equipment.model,serial_number=equipment.serial_number,external_document =equipment.external_document,
                                                  cost =equipment.cost,bare_code =equipment.bare_code,warranty_information =equipment.warranty_information)                                            

        result = db_session.execute(insert_query)
        db_session.commit()  # Explicitly commit the transaction
       
        return {
            "eq_id": result.lastrowid,
            **equipment.dict()
        }

                  
    # except SQLAlchemyError as e:
    #     db_session.rollback()  # Roll back if there is an error
    #     raise HTTPException(status_code=500, detail=str(e)) 
    except RequestValidationError as e:
        # print("Validation errors:", e.errors())
        return JSONResponse(
            status_code=422,
            content={
                "message": "Validation error",
                "details": e.errors(),
                "body": e.body
            }
        )
 
    except Exception as e:
        db_session.rollback() 
        import traceback
        traceback.print_exc()  # Log full traceback
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Unexpected error occurred", 
                "error": str(e),
                "error_type": type(e).__name__,
                "traceback": traceback.format_exc()
            }
        )
#=====================================================================================================================================================================================================================
# Upload CSV file to create or update Equipment  
# def detect_delimiter(sample):
#     for delimiter in [',', ';', '\t']:
#         try:
#             reader = csv.DictReader(StringIO(sample.decode('utf-8')), delimiter=delimiter)
#             if 'kks' in [f.strip().lstrip('\ufeff') for f in reader.fieldnames]:
#                 return delimiter
#         except Exception:
#             continue
#     return None


# @ih_equipment_router.post("/upload-csv/")
# async def upload_equipment_csv(file: UploadFile = File(...)):
#     try:       
#         contents = await file.read()
#        # Detect delimiter
#         sample = contents.decode('utf-8')
#         delimiter = detect_delimiter(contents) or ','  # default to comma
#         csv_string = StringIO(sample)
#         csv_reader = csv.DictReader(csv_string, delimiter=';')

#         # print("Detected delimiter:", repr(delimiter))
#         # print("CSV Header Fields:", csv_reader.fieldnames)

#         csv_reader.fieldnames = [field.strip().lstrip('\ufeff') for field in csv_reader.fieldnames]

        
#         # Process each row
#         for row in csv_reader:
#             try:
#                 # Convert empty strings to None and clean data 
#                 for key in row:
#                     if row[key] == '':
#                         row[key] = None
#                     elif isinstance(row[key], str):
#                         row[key] = row[key].strip() 
                
#                 # Convert specific fields to proper types   
#                 row['downtime'] = float(row['downtime']) if row.get('downtime') else None             
#                 row['priority_rpn'] = int(row['priority_rpn']) if row.get('priority_rpn') else None
#                 row['weekly_operating_hour'] = float(row['weekly_operating_hour']) if row.get('weekly_operating_hour') else None
#                 row['metter_reading'] = float(row['metter_reading']) if row.get('metter_reading') else None
#                 row['mttf'] = float(row['mttf']) if row.get('mttf') else None
#                 row['mtbf'] = float(row['mtbf']) if row.get('mtbf') else None
#                 row['availability'] = float(row['availability']) if row.get('availability') else None
#                 row['reliability'] = float(row['reliability']) if row.get('reliability') else None
#                 row['cost'] = float(row['cost']) if row.get('cost') else None
                
#                 # Check if equipment already exists
#                 existing = db_session.execute(
#                     equipments.select().where(equipments.c.kks == row['kks'])
#                 ).fetchone()
                
#                 if existing:
#                     # Update existing equipment
#                     update_query = equipments.update().where(equipments.c.kks == row['kks']).values(
#                         site=row.get('site'),
#                         life_cycle=row.get('life_cycle'),
#                         location_key=row.get('location_key'),
#                         parent_location_key=row.get('parent_location_key'),
#                         system=row.get('system'),
#                         sub_system=row.get('sub_system'),
#                         asset_description=row.get('asset_description'),
#                         asset_status=row.get('asset_status'),
#                         downtime=row.get('downtime'),
#                         breakdown=row.get('breakdown'),
#                         priority_rpn=row.get('priority_rpn'),
#                         mtbf=row.get('mtbf'),
#                         mttf=row.get('mttf'),
#                         reliability=row.get('reliability'),
#                         availability=row.get('availability'),
#                         wbs_key=row.get('wbs_key'),
#                         weekly_operating_hour=row.get('weekly_operating_hour'),                        
#                         equipment_class_category=row.get('equipment_class_category'),
#                         sub_equipment_class_code=row.get('sub_equipment_class_code'),
#                         sub_equipment_class_desc=row.get('sub_equipment_class_desc'),
#                         metter_reading=row.get('metter_reading'),
#                         control_unit=row.get('control_unit'),
#                         drawing_reference=row.get('drawing_reference'),
#                         tech_specification=row.get('tech_specification'),
#                         nameplate=row.get('nameplate'),
#                         manufacturer=row.get('manufacturer'),
#                         model=row.get('model'),
#                         serial_number=row.get('serial_number'),
#                         external_document=row.get('external_document'),
#                         cost=row.get('cost'),
#                         bare_code=row.get('bare_code'),
#                         warranty_information=row.get('warranty_information')
#                     )
#                     db_session.execute(update_query)
#                 else:
#                     # Insert new equipment
#                     insert_query = equipments.insert().values(
#                         kks=row['kks'],
#                         site=row.get('site'),
#                         life_cycle=row.get('life_cycle'),
#                         end_life_cycle_date = row.get('end_life_cycle_date'),
#                         location_key=row.get('location_key'),
#                         parent_location_key=row.get('parent_location_key'),
#                         system=row.get('system'),
#                         sub_system=row.get('sub_system'),
#                         asset_description=row.get('asset_description'),
#                         asset_status=row.get('asset_status'),
#                         downtime=row.get('downtime'),
#                         breakdown=row.get('breakdown'),
#                         priority_rpn=row.get('priority_rpn'),
#                         mtbf=row.get('mtbf'),
#                         mttf=row.get('mttf'),
#                         reliability=row.get('reliability'),
#                         availability=row.get('availability'),
#                         wbs_key=row.get('wbs_key'),
#                         weekly_operating_hour=row.get('weekly_operating_hour'),
#                         equipment_class_category=row.get('equipment_class_category'),
#                         sub_equipment_class_code=row.get('sub_equipment_class_code'),
#                         sub_equipment_class_desc=row.get('sub_equipment_class_desc'),

#                         # equipment_class=row.get('equipment_class'),
#                         # sub_equipment_class=row.get('sub_equipment_class'),

#                         metter_reading=row.get('metter_reading'),
#                         control_unit=row.get('control_unit'),
#                         drawing_reference=row.get('drawing_reference'),
#                         tech_specification=row.get('tech_specification'), 
#                         nameplate=row.get('nameplate'),
#                         manufacturer=row.get('manufacturer'),
#                         model=row.get('model'),
#                         serial_number=row.get('serial_number'),
#                         external_document=row.get('external_document'),
#                         cost=row.get('cost'),
#                         bare_code=row.get('bare_code'),
#                         warranty_information=row.get('warranty_information')
#                     )
#                     db_session.execute(insert_query)
                
#             except Exception as e:
#                 db_session.rollback()
#                 raise HTTPException(
#                     status_code=400,
#                     detail=f"Error processing row {csv_reader.line_num}: {str(e)}"
#                 )
        
#         db_session.commit()
#         return {"message": "CSV processed successfully", "records_processed": csv_reader.line_num - 1} 
        
#     except Exception as e:
#         import traceback
#         db_session.rollback()
#         # print("ERROR processing row", csv_reader.line_num)
#         # print("Row data:", row)
#         # print("Full traceback:\n", traceback.format_exc())

#         raise HTTPException(
#         status_code=400,
#         detail=f"Error on row {csv_reader.line_num}: {str(e)}"
#         )
    

#===================================================================================================================================================================================================================== 
# Post new Equipment:
# @equipment.post('/') 
# async def post_equipments(equipment: Equipment, request: Request):  
#     print("Incoming data:", equipment.dict())
    
#     try:           
#         print(equipment.kks),             
#         insert_query = equipments.insert().values(kks=equipment.kks,site =equipment.site,location_key=equipment.location_key,parent_location_key=equipment.parent_location_key,
#                                                   asset_description=equipment.asset_description,asset_status=equipment.asset_status,downtime=equipment.downtime,
#                                                   wbs_key=equipment.wbs_key,weekly_operating_hour=equipment.weekly_operating_hour,equipment_class=equipment.equipment_class,                                                  
#                                                   sub_equipment_class=equipment.sub_equipment_class,metter_reading=equipment.metter_reading,control_unit=equipment.control_unit,priority_rpn=equipment.priority_rpn,
#                                                   drawing_reference =equipment.drawing_reference,tech_specification =equipment.tech_specification,nameplate =equipment.nameplate,manufacturer =equipment.manufacturer,
#                                                   model =equipment.model,serial_number=equipment.serial_number,external_document =equipment.external_document,
#                                                   cost =equipment.cost,bare_code =equipment.bare_code,warranty_information =equipment.warranty_information)                                            

#         result = db_session.execute(insert_query)
#         db_session.commit()  # Explicitly commit the transaction
#         return {"eq_id": result.lastrowid, 'kks': equipment.kks,'site' : equipment.site,'location_key': equipment.location_key,'parent_location_key': equipment.parent_location_key,
#                                                   'asset_description': equipment.asset_description,'asset_status': equipment.asset_status,'downtime': equipment.downtime,
#                                                   'wbs_key': equipment.wbs_key,'weekly_operating_hour': equipment.weekly_operating_hour,'equipment_class': equipment.equipment_class,                                                  
#                                                   'sub_equipment_class' : equipment.sub_equipment_class, 'metter_reading': equipment.metter_reading,'control_unit': equipment.control_unit,'priority_rpn': equipment.priority_rpn,
#                                                   'drawing_reference' : equipment.drawing_reference,'tech_specification' : equipment.tech_specification,'nameplate' : equipment.nameplate,'manufacturer': equipment.manufacturer,
#                                                   'model' : equipment.model,'serial_number' : equipment.serial_number,'external_document' : equipment.external_document,
#                                                   'cost' : equipment.cost,'bare_code' : equipment.bare_code, 'warranty_information' : equipment.warranty_information
#                   }
#     except SQLAlchemyError as e:
#         db_session.rollback()  # Roll back if there is an error
#         raise HTTPException(status_code=500, detail=str(e)) 
#=====================================================================================================================================================================================================================
# Delete Equipment by ID
@ih_equipment_router.delete('/{eqID}')
def delete_equipments(eqID: int): 
    try:
        delete_query = equipments.delete().where(equipments.c.eq_id == eqID)
        result = db_session.execute(delete_query)
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Equipment not found")
        db_session.commit()  # Explicitly commit the transaction
        return {"message": "Equipment deleted successfully"}
    except SQLAlchemyError as e:
        db_session.rollback()
        raise HTTPException(status_code=500, detail=str(e))   
#=============================================================
# Update Equipment by ID
@ih_equipment_router.put('/{eqID}')
def update_equipments(eqID: int, equipment: Equipment):
    # print("Incoming data:", equipment.dict())
    try:
        update_query = equipments.update().values(kks=equipment.kks,site =equipment.site,
                                                     life_cycle=equipment.life_cycle,
                                                  location_key=equipment.location_key,parent_location_key=equipment.parent_location_key,
                                                    system=equipment.system,sub_system=equipment.sub_system,
                                                  asset_description=equipment.asset_description,asset_status=equipment.asset_status,downtime=equipment.downtime,
                                                  breakdown=equipment.breakdown,
                                                  wbs_key=equipment.wbs_key,weekly_operating_hour=equipment.weekly_operating_hour,
                                                    equipment_class_category=equipment.equipment_class_category,
                                                    sub_equipment_class_code=equipment.sub_equipment_class_code,
                                                    sub_equipment_class_desc=equipment.sub_equipment_class_desc,
                                                #   equipment_class=equipment.equipment_class,                                                  
                                                #   sub_equipment_class=equipment.sub_equipment_class,
                                                    metter_reading=equipment.metter_reading,control_unit=equipment.control_unit,priority_rpn=equipment.priority_rpn,                                             mtbf=equipment.mtbf,
                                                  mttf=equipment.mttf,
                                                  reliability=equipment.reliability,
                                                  availability=equipment.availability,
                                                  drawing_reference =equipment.drawing_reference,tech_specification =equipment.tech_specification,nameplate =equipment.nameplate,manufacturer =equipment.manufacturer,
                                                  model =equipment.model,serial_number=equipment.serial_number,external_document =equipment.external_document,
                                                  cost =equipment.cost,bare_code =equipment.bare_code,warranty_information =equipment.warranty_information).where(equipments.c.eq_id ==eqID)
        result = db_session.execute(update_query)
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Equipment not found")
        db_session.commit()  # Explicitly commit the transaction
        return {"equipmentid": eqID, 'kks': equipment.kks,'site' : equipment.site,'location_key': equipment.location_key,'parent_location_key': equipment.parent_location_key,
                                                  'asset_description': equipment.asset_description,'asset_status': equipment.asset_status,'downtime': equipment.downtime,
                                                  'breakdown': equipment.breakdown,
                                                  'wbs_key': equipment.wbs_key,'weekly_operating_hour': equipment.weekly_operating_hour,
                                                    'equipment_class_category': equipment.equipment_class_category,
                                                    'sub_equipment_class_code': equipment.sub_equipment_class_code,
                                                    'sub_equipment_class_desc': equipment.sub_equipment_class_desc,
                                                #   'equipment_class': equipment.equipment_class,                                                  
                                                  'metter_reading': equipment.metter_reading,'control_unit': equipment.control_unit,'priority_rpn': equipment.priority_rpn,
                                                  'mtbf':equipment.mtbf,
                                                  'mttf':equipment.mttf,
                                                  'reliability':equipment.reliability,
                                                  'availability':equipment.availability,
                                                #   'sub_equipment_class' : equipment.sub_equipment_class,
                                                  'drawing_reference' : equipment.drawing_reference,'tech_specification' : equipment.tech_specification,'nameplate' : equipment.nameplate,'manufacturer': equipment.manufacturer,
                                                  'model' : equipment.model,'serial_number' : equipment.serial_number,'external_document' : equipment.external_document,
                                                  'cost' : equipment.cost,'bare_code' : equipment.bare_code,'warranty_information' : equipment.warranty_information}
    # except SQLAlchemyError as e:
    #     db_session.rollback() 
    #     raise HTTPException(status_code=500, detail=str(e))
    except RequestValidationError as e:
        print("Validation errors:", e.errors())
        return JSONResponse(
            status_code=422,
            content={
                "message": "Validation error",
                "details": e.errors(),
                "body": e.body
            }
        )
 
    except Exception as e:
        db_session.rollback()
        import traceback
        traceback.print_exc()  # Log full traceback
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Unexpected error occurred",
                "error": str(e),
                "error_type": type(e).__name__,
                "traceback": traceback.format_exc()
            }
        )
#==========================================================================================================================================================================
# # Update Equipment Status
# @ih_equipment_router.patch('/{eqID}/asset_status')
# async def update_equipment_status(eqID: int, equipment: EquipmentStatus):
#     try:
#         current_date = datetime.now()

#         # Récupérer life_cycle depuis la base de données
#         query = select(equipments.c.life_cycle).where(equipments.c.eq_id == eqID)
#         result = db_session.execute(query).fetchone()

#         if not result:
#             raise HTTPException(status_code=404, detail="Equipement not found")

#         life_cycle = result[0] 
       
#         update_values = {
#             "asset_status": equipment.asset_status,
#             "breakdown": equipment.breakdown
#         }
      
#         if equipment.asset_status == "First_Start":
#             end_life_cycle_date = current_date + relativedelta(years=life_cycle)
#             update_values["end_life_cycle_date"] = end_life_cycle_date

#         update_query = (
#             equipments.update()
#             .where(equipments.c.eq_id == eqID)
#             .values(**update_values)
#         )

#         result = db_session.execute(update_query)

#         if result.rowcount == 0:
#             db_session.rollback()
#             raise HTTPException(status_code=404, detail="Equipement not found")

#         db_session.commit()

#         return {
#             "equipment_id": eqID,
#             "status": "updated",
#             "new_asset_status": equipment.asset_status
#         }

#     except SQLAlchemyError as e:
#         db_session.rollback()
#         raise HTTPException(
#             status_code=500,
#             detail=f"Database Error : {str(e)}"
#         )
#     except Exception as e:
#         db_session.rollback()
#         raise HTTPException(
#             status_code=500,
#             detail=f"Unexpected Error : {str(e)}"
#         )

#==========================================================================================================================================================================
def detect_delimiter(sample):
    """
    Detect the delimiter used in the CSV file
    """
    for delimiter in [',', ';', '\t']:
        try:
            reader = csv.DictReader(StringIO(sample.decode('utf-8')), delimiter=delimiter)
            if reader.fieldnames and any('equipment' in field.lower() for field in reader.fieldnames):
                return delimiter
        except Exception:
            continue
    return None

def to_float(val):
    """
    Convert string to float, handling European comma decimals and empty values
    """
    if val is None or val == '':
        return None
    if isinstance(val, str):
        val = val.strip().replace(",", ".")  # handle European comma decimals
        try:
            return float(val)
        except ValueError:
            return None
    return float(val)

def to_int(val):
    """
    Convert string to integer, handling empty values
    """
    if val is None or val == '':
        return None
    if isinstance(val, str):
        val = val.strip()
        try:
            return int(float(val))  # Handle cases like "15.0"
        except ValueError:
            return None
    return int(val)
#==========================================================================================================================================================================
@ih_equipment_router.post("/upload-equipment-csv/")
async def upload_equipment_csv(file: UploadFile = File(...)):
    try:    
        contents = await file.read()      
        delimiter = detect_delimiter(contents)
        if delimiter is None:
            raise HTTPException(status_code=400, detail="Could not detect CSV delimiter")
        
        try:
            csv_string = StringIO(contents.decode('utf-8'))
        except UnicodeDecodeError:
            csv_string = StringIO(contents.decode('latin1'))
            
        csv_reader = csv.DictReader(csv_string, delimiter=delimiter)  
        print("CSV Header Fields:", csv_reader.fieldnames) 
        
        # Clean fieldnames (remove BOM and whitespace)
        csv_reader.fieldnames = [field.strip().lstrip('\ufeff') for field in csv_reader.fieldnames]
        
        # Process each row
        records_processed = 0
        for row in csv_reader:
            try:
                # Convert empty strings to None and clean data
                for key in row:
                    if row[key] == '':
                        row[key] = None
                    elif isinstance(row[key], str):
                        row[key] = row[key].strip()

                # Convert numeric fields
                row['equipment_life_cycle'] = to_int(row.get('equipment_life_cycle'))
                row['gosp'] = to_int(row.get('gosp'))
                row['nbre_maint_task'] = to_int(row.get('nbre_maint_task'))
                
                # Convert float fields
                row['mtbf'] = to_float(row.get('mtbf'))
                row['mttf'] = to_float(row.get('mttf'))
                row['mttr'] = to_float(row.get('mttr'))
                row['cost_sm_eq'] = to_float(row.get('cost_sm_eq'))
                row['cost_med_eq'] = to_float(row.get('cost_med_eq'))
                row['cost_lg_eq'] = to_float(row.get('cost_lg_eq'))
               

                # Insert into database (replace with your actual table and columns)
                insert_query = equipments.insert().values(
                    equipment_description=row.get('equipment_description'),
                    asset_description=row.get('equipment_description'),  # Use same as equipment_description
                    equipment_class_category=row.get('equipment_class_category'),
                    sub_equipment_class_code=row.get('sub_equipment_class_code'),
                    sub_equipment_class_desc=row.get('sub_equipment_class_desc'),
                    equipment_life_cycle=row.get('equipment_life_cycle'),
                    gosp=row.get('gosp'),
                    maint_type=row.get('maint_type'),
                    maint_prog_code=row.get('maint_prog_code'),
                    mtbf=row.get('mtbf'),
                    mttf=row.get('mttf'),
                    mttr=row.get('mttr'),
                    nbre_maint_task=row.get('nbre_maint_task'),
                    cost_sm_eq=row.get('cost_sm_eq'),
                    cost_med_eq=row.get('cost_med_eq'),
                    cost_lg_eq=row.get('cost_lg_eq'),
                    
                    remarks=row.get('remarks')
                )
                db_session.execute(insert_query)
                records_processed += 1
                
            except Exception as e:
                db_session.rollback()
                raise HTTPException(
                    status_code=400,
                    detail=f"Error processing row {csv_reader.line_num}: {str(e)}"
                )
        
        db_session.commit()
        return {
            "message": "Equipment CSV processed successfully", 
            "records_processed": records_processed
        }
        
    except Exception as e:
        db_session.rollback()
        print("=== Equipment CSV Upload Error Traceback ===")
        traceback.print_exc()
        print("============================================")
        raise HTTPException(status_code=500, detail=str(e))
# ==============================================================================================================================================
# Update equipment state

@ih_equipment_router.patch('/{equipment_id}/state')
async def update_equipment_state(equipment_id: int, equipment_status: str):
    print("You are updating equipment status")
    try:         
        update_query = (
            equipments.update()
            .where(equipments.c.equipment_id == equipment_id)
            .values(equipment_status=equipment_status)  
        )
        
        result = db_session.execute(update_query)
        
        if result.rowcount == 0:
            db_session.rollback()
            raise HTTPException(status_code=404, detail="Equipment not found")
        
        db_session.commit()
        
        return {
            "equipment_id": equipment_id,      
            "new_status": equipment_status
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

 
    