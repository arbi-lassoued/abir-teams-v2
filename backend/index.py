import logging
import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from routes.user import user_router
from init_admin import init_admin
from db import reset_database
from routes.ih_spare_parts import ih_spare_router
from routes.ih_prem_pm import ih_prem_pm_router
from routes.ih_equipment import ih_equipment_router
from routes.project import project_router
from routes.project_spares import project_spares_router
from routes.project_planned_maintenance import project_planned_maintenance_router
from routes.project_maintenance_statistics import project_maintenance_statistics_router
from fastapi.middleware.cors import CORSMiddleware 

# Initialize FastAPI app 
app = FastAPI()

# Reset database if RESET_DB environment variable is set
if os.getenv("RESET_DB", "false").lower() == "true":
    reset_database()

# Initialize admin account on startup
try:
    init_admin()
except Exception as e:
    print(f"Warning: Could not initialize admin account: {e}") 

# logging.basicConfig(level=logging.INFO) 
# logger = logging.getLogger(__name__)

# @app.exception_handler(Exception)
# def handle_exception(request, exc):
#     logger.error(f"An error occurred: {exc}")
#     return JSONResponse(status_code=500, content={"message": "Internal Server Error"})

# Add CORS middleware
app.add_middleware(
    CORSMiddleware, 
    # allow_origins=["*"],  # Allows all origins
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers  
)
    
# Include the router in the FastAPI app
app.include_router(user_router, prefix="/users")  
app.include_router(ih_spare_router, prefix="/ih_spares")
app.include_router(ih_prem_pm_router, prefix="/ih_prem_pm")  
app.include_router(ih_equipment_router, prefix="/ih_equipment")  
app.include_router(project_router, prefix="/projects")  
app.include_router(project_spares_router, prefix="/projects_spares")
app.include_router(project_planned_maintenance_router, prefix="/projects_planned_maintenance")
app.include_router(project_maintenance_statistics_router, prefix="/projects_maintenance_statistics")

# Run the app
if __name__ == "__main__":
    import uvicorn 
    uvicorn.run(app, host="127.0.0.1", port=8001)           
