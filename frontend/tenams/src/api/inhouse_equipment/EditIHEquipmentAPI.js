import api from "../axiosInstance";

const EditIHEquipmentAPI = async (id, payload) => {
    try {
        const response = await api.put(`/equipments/${id}`, payload);  // Use template literal to include ID and send formData
        return response.data;
    } catch (error) {
        console.error('Error editing equipment:', error);  // Fixed error message
        throw error;
    }
};

export default EditIHEquipmentAPI; 