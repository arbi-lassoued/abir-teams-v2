import api from "../axiosInstance";
const getProjectSparesAPI = async (projectId) => {
    try {
        const response = await api.get(`/projects_spares/${projectId}/spares`);
        return response.data;
    } catch (error) {
        console.error('Error fetching project spares:', error.response?.data || error.message); 
        throw error;
    }
};
export default getProjectSparesAPI;