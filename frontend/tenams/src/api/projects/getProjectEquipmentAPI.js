import api from "../axiosInstance";
const getProjectEquipmentAPI = async (projectId) => {
    try {
        const response = await api.get(`/projects/${projectId}/equipment`);
        return response.data;
    } catch (error) {
        console.error('Error fetching project equipment:', error.response?.data || error.message); 
        throw error;
    }
};
export default getProjectEquipmentAPI;