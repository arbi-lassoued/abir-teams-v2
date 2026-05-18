from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from db import get_db
from models.user import User
from auth.jwt_handler import verify_token, oauth2_scheme

def get_current_user(token: dict = Depends(verify_token)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") 
    return {
        "username": token.get("sub"),
        "user_id": token.get("user_id"),
        "roles": token.get("roles", [])
    }

# Role-based dependencies
def require_admin(current_user: User = Depends(get_current_user)):
    if "admin" not in current_user["roles"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def require_roles(required_roles: list):
    def role_checker(current_user: dict = Depends(get_current_user)):
        user_roles = current_user["roles"]
        if not any(role in user_roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker