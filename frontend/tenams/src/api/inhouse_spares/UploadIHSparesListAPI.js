import api from "../axiosInstance";

const UploadIHSparesListAPI = async (formData) => {
    try {
        const response = await api.post('ih_spares/upload-spares-csv/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export default UploadIHSparesListAPI; 