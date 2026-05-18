
import logging
from fastapi import APIRouter, Body, HTTPException, Depends, Request
from jose import JWTError
import jwt
from passlib.context import CryptContext
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from db import db_session
from schemas.user import UserSchema, UserLoginSchema, UserUpdateSchema
from models.user import User, UserRole, Role 
from db import get_db 
from auth.jwt_handler import ALGORITHM, REFRESH_SECRET_KEY, create_access_token
from auth.dependencies import get_current_user, require_admin, require_roles
# from auth.dependencies import get_current_user
# from auth.dependencies import verify_token

# Initialize APIRouter
user_router = APIRouter()
 
# Password hashing context
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto") 

# Helper function for hashing passwords
def hash_password(password: str) -> str:    
    return pwd_context.hash(password) 

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
#==========================================================================================================================
@user_router.get('/')

def fetch_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles(["Administrator", "admin"]))  # Role-based protection    
):
    print(f"Request by user: {current_user['username']}")    
    try:
        # Execute the query to fetch all users
        users_list = db.query(User).all()
        users_dict_list = [user.__dict__ for user in users_list]
        for user_dict in users_dict_list:
            user_dict.pop('_sa_instance_state', None)  # Remove SQLAlchemy internal state
            # Remove password from response
            user_dict.pop('password', None)
        return {"users": users_dict_list}  # Return the list of users
    except SQLAlchemyError as e:
        # Handle SQLAlchemy errors
        raise HTTPException(status_code=500, detail=str(e)) 
#==========================================================================================================================
@user_router.get("/user/{username}")
def get_users(username: str, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.username == username).first()
        if user:
            user_dict = user.__dict__.copy()
            user_dict.pop("_sa_instance_state", None)
            # Remove password fields so they are never exposed
            user_dict.pop("password", None)   
            if isinstance(user.user_roles_summary, str):
                user_dict["user_roles_summary"] = [
                    role.strip() for role in user.user_roles_summary.split(",") if role.strip()
                ]        
            return user_dict
        else:
            raise HTTPException(status_code=404, detail="user not found")  
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))

#==========================================================================================================================

# # Post User with Commit
@user_router.post('/')
def post_users(user: UserSchema, db: Session = Depends(get_db)):
    try:
        session = db_session
        hashed_password = hash_password(user.password)
        new_user = User(
            username=user.username,
            email=user.email,
            password=hashed_password,
            department=user.department,  
            sub_department=user.sub_department,          
            position=user.position,
            shift=user.shift,
            service_start_date=user.service_start_date,
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        roles_summary = []  # To track roles for user_roles_summary

        for role_name in user.user_roles_summary:
            role = session.query(Role).filter(Role.role_name == role_name).first()
            if not role:
                role = Role(role_name=role_name)
                session.add(role)
                session.commit()
                session.refresh(role)
            new_user.roles.append(role)
            roles_summary.append(role.role_name)

        # Store roles as array instead of string
        new_user.user_roles_summary = roles_summary
        session.commit()       

        return new_user
    except SQLAlchemyError as e:
        session.rollback()
        logging.error(f"SQLAlchemyError: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred") 
    finally:
        session.close()
    
#==========================================================================================================================
@user_router.put('/{username}')
def update_user(username: str , user_update: UserUpdateSchema, db: Session = Depends(get_db)):
    try:
        print("Received user update:", user_update)
        # Fetch the existing user
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update user details
        # user.username = user_update.username
        user.email = user_update.email
        user.user_roles_summary = ','.join(user_update.user_roles_summary)  # Convert list to comma-separated string
        user.department = user_update.department 
        user.sub_department = user_update.sub_department       
        user.position=user_update.position
        user.shift=user_update.shift
        if user_update.password:
            user.password = hash_password(user_update.password)  # Ensure you have a hash_password function
        

        # Update user roles
        user.roles.clear()
        for role_name in user_update.user_roles_summary:
            role = db.query(Role).filter(Role.role_name == role_name).first()
            if not role:
                role = Role(role_name=role_name)
                db.add(role)
                db.commit()
                db.refresh(role)
            user.roles.append(role)

        db.commit()
        db.refresh(user)
        print("Updated user:", user)
        return user
    except Exception as e:
        db.rollback()
        print("Error updating user:", e)
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    finally:
        db.close() 
#==========================================================================================================================
@user_router.delete('/{user_id}')
def delete_user(user_id: int, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(User).filter(User.user_id == user_id).first()
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        db.delete(existing_user)
        db.commit()
        return {"message": "User deleted successfully"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

#==========================================================================================================================     
# @user_router.get("/me")
# def get_my_profile(current_user: dict = Depends(get_current_user)):
#     return {"user": current_user}  
#==========================================================================================================================    
@user_router.post('/login')
def login(user_login: UserLoginSchema= Body(...)): 
    try:
        session = db_session
        existing_user = session.query(User).filter(User.username == user_login.username).first()
        session.close()
        
        if not existing_user or not verify_password(user_login.password, existing_user.password):
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        print("=" * 50)
        print("🚀 LOGIN SUCCESSFUL")
        print(f"👤 Username: {existing_user.username}")
        print(f"🎯 User ID: {existing_user.user_id}")
        print(f"🏢 Department: {existing_user.department}")
        print(f"📋 Position: {existing_user.position}")
        print(f"🔄 Shift: {existing_user.shift}")
        print(f"🔑 Roles: {existing_user.user_roles_summary}")
        print("=" * 50)

        payload = {
            "sub": existing_user.username,
            "roles": existing_user.user_roles_summary
        }
        
        token = create_access_token({
            "sub": existing_user.username,
            "user_id": existing_user.user_id,
            "roles": existing_user.user_roles_summary
        })

        return {
            "access_token": token,
            "token_type": "bearer",
            "username": existing_user.username,
            "department": existing_user.department,
            "position": existing_user.position,
            "shift": existing_user.shift,
            "roles": payload["roles"],
        }
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))
        
#========================================================================================================================== 

@user_router.post("/users/refresh")
async def refresh_token(request: Request):
    body = await request.json()
    refresh_token = body.get("refresh_token")

    try:
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("username")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")

        # 🔑 Recreate new access token with all user claims if needed
        new_access_token = create_access_token({"username": username})
        return {"access_token": new_access_token}

    except JWTError:
        raise HTTPException(status_code=401, detail="Refresh token expired or invalid")
    
# To be implemented later:

# @user_router.post("/users/refresh")
# async def refresh_token(request: Request):
#     body = await request.json()
#     refresh_token = body.get("refresh_token")

#     try:
#         payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
#         username = payload.get("username")
#         if not username:
#             raise HTTPException(status_code=401, detail="Invalid token")

#         # Issue both a new access token AND a new refresh token
#         new_access_token = create_access_token({"username": username})
#         new_refresh_token = create_refresh_token({"username": username})

#         return {
#             "access_token": new_access_token,
#             "refresh_token": new_refresh_token
#         }

#     except JWTError:
#         raise HTTPException(status_code=401, detail="Refresh token expired or invalid")
