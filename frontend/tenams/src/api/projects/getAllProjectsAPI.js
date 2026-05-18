
import api from "../axiosInstance";

const getAllProjectsAPI = async () => {
    try {
        const response = await api.get("/projects/");
        return response.data;
    } catch (error) {
        console.error('Error fetching projects:', error.response?.data || error.message);
        throw error;
    }
};
export default getAllProjectsAPI;