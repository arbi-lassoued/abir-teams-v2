import api from "../axiosInstance";

const FetchIHPremPMAPI = async (id) => {  
    try {
        const response = await api.get(`/ih_prem_pm/id/${id}`);  
        return response.data;
    } catch (error) {
        console.error('Error getting planned activity from ih db:', error);  
        throw error;
    }
};

export default FetchIHPremPMAPI; 