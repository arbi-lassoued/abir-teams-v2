import api from "../axiosInstance";
const createProjectAPI = async (projectData) => {
    try {
        const response = await api.post("/projects/", projectData);
        return response.data;
    } catch (error) {
        console.error('Error creating project:', error.response?.data || error.message);
        throw error;
    }
};
export default createProjectAPI; 