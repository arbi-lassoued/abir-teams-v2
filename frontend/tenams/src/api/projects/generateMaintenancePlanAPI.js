// api/projects/generateMaintenancePlanAPI.js
import api from "../axiosInstance";

const generateMaintenancePlanAPI = async (projectId) => {
    try {
        const response = await api.post(`/projects_planned_maintenance/generate_maintenance_plan`, { 
            project_id: projectId 
        });
        return response.data;
    } catch (error) {
        console.error('Error generating maintenance plan:', error.response?.data || error.message);
        throw error;
    }
};

export default generateMaintenancePlanAPI;