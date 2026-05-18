from fastapi import APIRouter, HTTPException, Depends, UploadFile, File,Depends, Request
from passlib.context import CryptContext
from sqlalchemy.exc import SQLAlchemyError
from db import db_session, get_db
from schemas.ih_spare_parts import Spare
from models.ih_spare_parts import ih_spares
import logging, traceback, csv
from io import StringIO
# ====================================================================================================================================================================================
# Initialize APIRouter
ih_spare_router = APIRouter()
# ====================================================================================================================================================================================

@ih_spare_router.get('/')
def fetch_spares(db_session= Depends(get_db)):
    try:    
        result = db_session.execute(ih_spares.select())
        ih_spares_list = [dict(row._mapping) for row in result.fetchall()]  # Convert each row to a dictionary
        return {"ih_spares": ih_spares_list}  
    except SQLAlchemyError as e:
        # Handle SQLAlchemy errors
        raise HTTPException(status_code=500, detail=str(e))  
# ====================================================================================================================================================================================

@ih_spare_router.post('/')
def post_spares(spare: Spare): 
    try:           
        print(spare.kks),             
        insert_query = ih_spares.insert().values(spare_parts_description=spare.spare_parts_description,parent_id =spare.parent_id,parent_kks=spare.parent_kks,
                                              price=spare.price,storage_location=spare.storage_location,current_quantity=spare.current_quantity,minimum_quantity=spare.minimum_quantity,
                                                  category=spare.category,reception_date=spare.reception_date,bare_code=spare.bare_code,supplier_details=spare.supplier_details                                                  
                                                  )                                            

        result = db_session.execute(insert_query)
        db_session.commit()  # Explicitly commit the transaction
        return {"sp_id": result.lastrowid, 'spare_parts_description': spare.spare_parts_description,'parent_id' : spare.parent_id,'parent_kks': spare.parent_kks,
                                              'price': spare.price,'storage_location': spare.storage_location,'current_quantity': spare.current_quantity,'minimum_quantity': spare.minimum_quantity,
                                                  'category': spare.category,'reception_date': spare.reception_date,'bare_code': spare.bare_code,'supplier_details': spare.supplier_details
                  }
    except SQLAlchemyError as e:
        db_session.rollback()  # Roll back if there is an error
        raise HTTPException(status_code=500, detail=str(e))   
# ====================================================================================================================================================================================
# 
@ih_spare_router.put('/{spareid}')
def update_spares(sp_id: int, spare: Spare):
    try:
        update_query = ih_spares.update().values(spare_parts_description=spare.spare_parts_description,parent_id =spare.parent_id,parent_kks=spare.parent_kks,
                                              price=spare.price,storage_location=spare.storage_location,current_quantity=spare.current_quantity,minimum_quantity=spare.minimum_quantity,
                                                  category=spare.category,reception_date=spare.reception_date,bare_code=spare.bare_code,supplier_details=spare.supplier_details).where(ih_spares.c.sp_id ==sp_id)
        result = db_session.execute(update_query)
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="spare not found")
        db_session.commit()  # Explicitly commit the transaction
        return {"spareid": sp_id, 'spare_parts_description': spare.spare_parts_description,'parent_id' : spare.parent_id,'parent_kks': spare.parent_kks,
                                              'price': spare.price,'storage_location': spare.storage_location,'current_quantity': spare.current_quantity,'minimum_quantity': spare.minimum_quantity,
                                                  'category': spare.category,'reception_date': spare.reception_date,'bare_code': spare.bare_code,'supplier_details': spare.supplier_details}
    except SQLAlchemyError as e:
        db_session.rollback() 
        raise HTTPException(status_code=500, detail=str(e))
# ====================================================================================================================================================================================    
@ih_spare_router.delete('/{spareid}')
def delete_spares(sp_id: int): 
    try:
        delete_query = ih_spares.delete().where(ih_spares.c.sp_id == sp_id)
        result = db_session.execute(delete_query)
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="spare not found")
        db_session.commit()  # Explicitly commit the transaction
        return {"message": "spare deleted successfully"}
    except SQLAlchemyError as e:
        db_session.rollback()
        raise HTTPException(status_code=500, detail=str(e))  
    
# ==================================================================================================================================================================================== 
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
@ih_spare_router.post("/upload-spares-csv/")
async def upload_spares_csv(file: UploadFile = File(...)):
    try:    
        contents = await file.read()      
        delimiter = detect_delimiter(contents)
        if delimiter is None:
            raise HTTPException(status_code=400, detail="Could not detect CSV delimiter")
        
        try:
            csv_string = StringIO(contents.decode('utf-8'))
        except UnicodeDecodeError:
            csv_string = StringIO(contents.decode('latin1'))
            
        csv_reader = csv.DictReader(csv_string, delimiter=';')  
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

                        
                # Convert float fields
                row['min_quantity'] = to_float(row.get('min_quantity'))
                row['max_quantity'] = to_float(row.get('max_quantity'))
                row['sm_size'] = to_float(row.get('sm_size'))
                row['med_size'] = to_float(row.get('med_size'))
                row['lg_size'] = to_float(row.get('lg_size'))
             
               

                # Insert into database (replace with your actual table and columns)
                insert_query = ih_spares.insert().values(                   
                    equipment_class_category=row.get('equipment_class_category'),
                    sub_equipment_class_code=row.get('sub_equipment_class_code'),
                    sub_equipment_class_desc=row.get('sub_equipment_class_desc'),
                    sp_description=row.get('sp_description'),
                    sp_state=row.get('sp_state'),
                    min_quantity=row.get('min_quantity'),
                    max_quantity=row.get('max_quantity'),                 
                    meas_unit=row.get('meas_unit'),
                    comm_sp=row.get('comm_sp'),
                    op_sp=row.get('op_sp'),
                    overh_sp=row.get('overh_sp'),
                    capital_sp=row.get('capital_sp'),
                    consumable=row.get('consumable'),
                    storage_condition=row.get('storage_condition'),
                    sm_size=row.get('sm_size'),                  
                    med_size=row.get('med_size'),
                    lg_size=row.get('lg_size'),                   
                    
                 
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
            "message": "Spares CSV processed successfully", 
            "records_processed": records_processed
        }
        
    except Exception as e:
        db_session.rollback()
        print("=== Spares CSV Upload Error Traceback ===")
        traceback.print_exc()
        print("============================================")
        raise HTTPException(status_code=500, detail=str(e))
    
#==========================================================================================================================================================================
# Update activity State from planned maintenance list
@ih_spare_router.patch('/{ih_sp_id}/state')
async def update_spare_status(ih_sp_id: int, sp_state: str):
    print("You are updating PM status from PM List")
    print(ih_sp_id, sp_state)
    try:         
        update_query = (
            ih_spares.update()
            .where(ih_spares.c.ih_sp_id == ih_sp_id)
            .values(sp_state=sp_state)  
        )
        
        result = db_session.execute(update_query)
        
        if result.rowcount == 0:
            db_session.rollback()
            raise HTTPException(status_code=404, detail="spare part not found")
        
        db_session.commit()
        
        return {
            "ih_sp_id": ih_sp_id,      
            "new_status": sp_state
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