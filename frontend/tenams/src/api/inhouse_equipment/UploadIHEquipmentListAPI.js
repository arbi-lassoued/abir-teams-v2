import api from "../axiosInstance";

const UploadIHEquipmentListAPI = async (formData) => {
    try {
        const response = await api.post('/ih_equipment/upload-equipment-csv/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export default UploadIHEquipmentListAPI; 