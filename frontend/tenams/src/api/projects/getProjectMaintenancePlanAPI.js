import api from "../axiosInstance";
const getProjectEquipmentAPI = async (projectId) => {
    try {
        const response = await api.get(`/projects_planned_maintenance/${projectId}/planned_maintenance`);
        return response.data;
    } catch (error) {
        console.error('Error fetching project maintenance plan:', error.response?.data || error.message);
        throw error;
    }
};
export default getProjectEquipmentAPI;