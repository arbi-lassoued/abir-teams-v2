import api from "../axiosInstance";

const generateSparesAPI = async (projectId) => {
    try {
        const response = await api.post(`/projects_spares/generate_spares`, { project_id: projectId });
        return response.data;
    } catch (error) {
        console.error('Error generating spares:', error.response?.data || error.message);
        throw error;
    }
};

export default generateSparesAPI;