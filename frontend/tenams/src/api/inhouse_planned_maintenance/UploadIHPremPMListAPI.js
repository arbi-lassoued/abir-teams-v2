import api from "../axiosInstance";

const UploadIHPremPMListAPI = async (formData) => {
    try {
        const response = await api.post('ih_prem_pm/upload-csv/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export default UploadIHPremPMListAPI; 