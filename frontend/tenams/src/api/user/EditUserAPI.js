import api from "../axiosInstance";

const EditUserAPI = async (username, payload) => {
    try {
        const response = await api.put(`/users/${username}`, payload);
        return response.data;
    } catch (error) {
        console.error('Error editing user:', error);
        throw error;
    }
};

export default EditUserAPI; 