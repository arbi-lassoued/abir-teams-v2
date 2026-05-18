import api from "../axiosInstance";

const FetchEquipmentAPI = async (id) => {  
    try {
        const response = await api.get(`/equipments/id/${id}`);  
        return response.data;
    } catch (error) {
        console.error('Error uploading equipment:', error);   
        throw error;
    }
};

export default FetchEquipmentAPI; 