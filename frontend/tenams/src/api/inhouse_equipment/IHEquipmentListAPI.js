import api from "../axiosInstance";

const IHEquipmentListAPI = async () => {
    const response = await api.get('/ih_equipment')
    return response.data.equipments; // 👈 ici on retourne le tableau directement
};
export default IHEquipmentListAPI; 