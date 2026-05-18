import api from "../axiosInstance";

const AddUserAPI = async (payload) => {
    try {
        const response = await api.post('/users/', payload)
        return response.data;
    } catch (error) {
        console.error('Error adding planned activity:', error);
        throw error;
    }
};
export default AddUserAPI;  