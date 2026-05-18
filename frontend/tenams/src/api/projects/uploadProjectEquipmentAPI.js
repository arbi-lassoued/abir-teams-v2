import api from "../axiosInstance";
const uploadProjectEquipmentAPI = async (formData) => {
    try {
        const response = await api.post("/projects/upload-equipment", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading equipment CSV:', error.response?.data || error.message);
        throw error;
    }
};
export default uploadProjectEquipmentAPI;  