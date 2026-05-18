import api from "../axiosInstance";

const DeleteIHPremPMAPI = async (id) => {
    try {
        const response = await api.delete(`/ih_prem_pm/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting activity:', error.response?.data || error.message);
        throw error;
    }
};

export default DeleteIHPremPMAPI;