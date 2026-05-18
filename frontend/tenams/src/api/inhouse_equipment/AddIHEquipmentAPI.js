import api from "../axiosInstance";

const AddIHEquipmentAPI = async (payload) => {
    try {
        const response = await api.post('/equipments/', payload)
        return response.data;
    } catch (error) {
        console.error('Error adding equipment:', error);
        throw error; // Important de propager l'erreur
    }
};
export default AddIHEquipmentAPI;
