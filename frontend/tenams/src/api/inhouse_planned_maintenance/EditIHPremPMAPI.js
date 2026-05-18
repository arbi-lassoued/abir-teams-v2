import api from "../axiosInstance";

const EditIHPremPMAPI = async (id, payload) => {
    try {
        const response = await api.put(`/ih_prem_pm/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error('Error editing planned activity in ih db:', error);
        throw error;
    }
};

export default EditIHPremPMAPI;  