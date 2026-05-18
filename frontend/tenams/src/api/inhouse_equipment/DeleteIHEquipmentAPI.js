import api from "../axiosInstance";

const DeleteIHEquipmentAPI = async (id) => {  // Accept the equipment ID as parameter
    try {
        const response = await api.delete(`/equipments/${id}`);  // Use template literal to include ID
        return response.data;
    } catch (error) {
        console.error('Error deleting equipment:', error.response?.data || error.message);
        throw error;
    }
}; 

export default DeleteIHEquipmentAPI;