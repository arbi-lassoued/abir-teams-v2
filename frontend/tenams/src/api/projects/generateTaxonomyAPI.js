// api/projects/activateTaxonomyAPI.js
import api from "../axiosInstance";

const generateTaxonomyAPI = async (projectId) => {
    try {
        const response = await api.post(`/projects/generate_taxonomy`, { project_id: projectId });
        return response.data;
    } catch (error) {
        console.error('Error activating taxonomy:', error.response?.data || error.message);
        throw error;
    }
};

export default generateTaxonomyAPI;