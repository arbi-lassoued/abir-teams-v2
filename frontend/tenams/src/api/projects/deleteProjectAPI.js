 import api from "../axiosInstance";
 const deleteProjectAPI = async (projectId) => {
    try {
        const response = await api.delete(`/projects/${projectId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting project:', error.response?.data || error.message);
        throw error;
    }
};
export default deleteProjectAPI;