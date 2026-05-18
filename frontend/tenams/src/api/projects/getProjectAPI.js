import api from "../axiosInstance";
 const getProjectAPI = async (projectId) => {
    try {
        const response = await api.get(`/projects/${projectId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching project:', error.response?.data || error.message);
        throw error;
    }
};
export default getProjectAPI;