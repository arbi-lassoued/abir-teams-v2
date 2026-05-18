from pydantic import BaseModel, Json
from datetime import datetime
from typing import Optional, List

# Define Pydantic model
class UserSchema(BaseModel): 
    username: Optional[str]
    email: Optional[str]
    password: Optional[str]
    department: Optional[str]   
    sub_department: Optional[str] 
    position : Optional[str]
    shift : Optional[str]
    user_roles_summary: list[str]
    service_start_date: Optional[datetime] = None

class UserLoginSchema(BaseModel): 
    username: str
    password: str 
    

class UserUpdateSchema(BaseModel):
    # username: str
    email: Optional[str]
    password: Optional[str]
    department: Optional[str]  
    sub_department:Optional[str] 
    position : Optional[str]
    shift : Optional[str]
    user_roles_summary: list[str] 

 

class Config:
    orm_mode = True
