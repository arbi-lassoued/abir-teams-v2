import api from "../axiosInstance";

const DeleteIHSpareAPI = async (id) => {
    try {
        const response = await api.delete(`/ih_spares/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting activity:', error.response?.data || error.message);
        throw error;
    }
};

export default DeleteIHSpareAPI; 