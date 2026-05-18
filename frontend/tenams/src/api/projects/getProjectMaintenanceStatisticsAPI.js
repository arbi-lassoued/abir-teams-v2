// api/projects/getProjectMaintenanceStatisticsAPI.js
import api from "../axiosInstance";

const getProjectMaintenanceStatisticsAPI = async (projectId) => {
    try {
        const response = await api.get(`/projects_maintenance_statistics/${projectId}/maintenance_statistics`);
        return response.data;
    } catch (error) {
        console.error('Error fetching maintenance statistics:', error.response?.data || error.message);
        throw error;
    }
};

export default getProjectMaintenanceStatisticsAPI;