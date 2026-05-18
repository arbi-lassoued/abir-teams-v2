from sqlalchemy import Table, Column, Integer, String, ForeignKey, JSON,DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from db import meta, engine, db_session 
from datetime import datetime

Base = declarative_base() 

#=========================================================================================================================================
class UserRole(Base):    
    __tablename__ = 'users_roles_table'
    user_id = Column(Integer, ForeignKey("users_table.user_id"), primary_key=True)  
    role_id = Column(Integer, ForeignKey("roles_table.role_id"), primary_key=True) 

#=========================================================================================================================================
# Define SQLAlchemy table
class User(Base):
    __tablename__ = 'users_table'
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), nullable=True) 
    email = Column(String(100), nullable=True)
    password = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)    
    sub_department = Column(String(100), nullable=True)   
    position = Column(String(100), nullable=True)
    shift = Column(String(100), nullable=True)
    user_roles_summary = Column(JSON, nullable=True)  
    service_start_date=Column(DateTime, default=datetime.utcnow, nullable=True) 

    # Relationship to roles  
    roles = relationship("Role", secondary="users_roles_table", back_populates="users")


# Define SQLAlchemy table
class Role(Base):
    __tablename__ = 'roles_table'
    role_id = Column(Integer, primary_key=True, autoincrement=True)
    role_name = Column(String(255), unique=True)  # Ensure role_name is unique

    # Relationship to users
    users = relationship("User", secondary="users_roles_table", back_populates="roles")

# Create the table
Base.metadata.create_all(engine)

def insert_roles(session):
    roles_to_insert = [
        'admin',
        'Administrator',
        'User',
        # 'view_activity',
        # 'create_activity', 
        # 'update_activity',
        # 'view_equipment',
        # 'create_equipment',
        # 'update_equipment',
        # 'create_sr',
        # 'view_sr',
        # 'approuve_sr',
        # 'create_wo',
        # 'plan_wo',
        # 'schedul_wo',
        # 'execute_wo',
        # 'finish_wo',
        # 'view_history_wo',
        # 'view_sp',
        # 'create_sp',
        # 'approve_po',
        # 'view_perfo',
        # 'view_purchase',
        # 'create_po',
        # 'predict_ai',
        # 'generate_ai',
    ]

    try:
        for role_name in roles_to_insert:
            # Check if the role already exists
            existing_role = session.query(Role).filter_by(role_name=role_name).first()
            if not existing_role:
                new_role = Role(role_name=role_name)
                session.add(new_role)
                # print(f"Added role: {role_name}")
            else:
                print(f"Role already exists: {role_name}")
        session.commit()
        print("Roles inserted successfully.")
    except Exception as e:
        session.rollback()  # Rollback in case of error
        print(f"An error occurred: {e}")

# Use the existing db_session
session = db_session

# Call the function to insert roles
insert_roles(session) 

# Verify roles in the table
roles_in_db = session.query(Role).all() 
# print(f"Roles in database: {[role.role_name for role in roles_in_db]}")

# Insert default admin user
def insert_default_admin(session):
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
    
    try:
        existing_admin = session.query(User).filter_by(username="admin").first()
        if not existing_admin:
            admin_user = User(
                username="admin",
                email="admin@tenams.com",
                password=pwd_context.hash("admin123"),
                department="IT",
                position="Administrator",
                shift="All"
            )
            session.add(admin_user)
            session.commit()
            
            # Assign admin role to the user
            admin_role = session.query(Role).filter_by(role_name="admin").first()
            if admin_role:
                user_role = UserRole(user_id=admin_user.user_id, role_id=admin_role.role_id)
                session.add(user_role)
                session.commit()
            print("✓ Default admin user created: admin / admin123")
        else:
            print("✓ Admin user already exists")
    except Exception as e:
        session.rollback()
        print(f"Error creating default admin: {e}")

insert_default_admin(session)

