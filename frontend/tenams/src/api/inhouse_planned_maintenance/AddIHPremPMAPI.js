import api from "../axiosInstance";

const AddIHPremPMAPI = async (payload) => {
    try {
        const response = await api.post('/ih_prem_pm/', payload) 
        return response.data;
    } catch (error) {
        console.error('Error adding planned activity to to the inh db:', error);
        throw error; // Important de propager l'erreur
    }
};
export default AddIHPremPMAPI;  