import api from "../axiosInstance";

const DeleteUserAPI = async (id) => {   
    try {
        const response = await api.delete(`/users/${id}`);   
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error.response?.data || error.message);
        throw error;
    }
}; 

export default DeleteUserAPI;