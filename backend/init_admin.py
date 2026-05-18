#!/usr/bin/env python3
"""
Script to initialize admin user with password: admin123
"""
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from db import db_session
from models.user import User, Role, UserRole

# Password hashing context
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def init_admin():
    session = db_session
    try:
        # Get or create Administrator role
        admin_role = session.query(Role).filter(Role.role_name == "Administrator").first()
        if not admin_role:
            admin_role = Role(role_name="Administrator")
            session.add(admin_role)
            session.commit()
            print("✅ Administrator role created")
        
        # Check if admin user exists
        admin_user = session.query(User).filter(User.username == "admin").first()
        
        if admin_user:
            # Delete the existing admin user and recreate it with correct roles
            session.query(UserRole).filter(UserRole.user_id == admin_user.user_id).delete()
            session.delete(admin_user)
            session.commit()
            print("🔄 Old admin user deleted, recreating with correct roles...")
            
            # Create new admin user
            new_admin = User(
                username="admin",
                password=hash_password("admin123"),
                email="admin@technip.com",
                department="Administration",
                position="Administrator",
                shift="All",
                user_roles_summary=["Administrator"]
            )
            session.add(new_admin)
            session.commit()
            print(f"✅ Admin user recreated with password: admin123")
            
            # Assign Administrator role
            user_role = UserRole(user_id=new_admin.user_id, role_id=admin_role.role_id)
            session.add(user_role)
            session.commit()
        else:
            # Create new admin user
            new_admin = User(
                username="admin",
                password=hash_password("admin123"),
                email="admin@technip.com",
                department="Administration",
                position="Administrator",
                shift="All",
                user_roles_summary=["Administrator"]
            )
            session.add(new_admin)
            session.commit()
            print(f"✅ Admin user created with password: admin123")
            
            # Assign Administrator role
            user_role = UserRole(user_id=new_admin.user_id, role_id=admin_role.role_id)
            session.add(user_role)
            session.commit()
        
        print("=" * 50)
        print("Admin Account Ready!")
        print("=" * 50)
        print(f"Username: admin")
        print(f"Password: admin123")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Error initializing admin: {str(e)}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    init_admin()
