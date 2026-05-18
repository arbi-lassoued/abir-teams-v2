// api/projects/generateMaintenanceStatisticsAPI.js
import api from "../axiosInstance";

const generateMaintenanceStatisticsAPI = async (projectId) => {
    try {
        const response = await api.post(`/projects_maintenance_statistics/generate_maintenance_statistics`, { 
            project_id: projectId 
        });
        return response.data;
    } catch (error) {
        console.error('Error generating maintenance statistics:', error.response?.data || error.message);
        throw error;
    }
};

export default generateMaintenanceStatisticsAPI;