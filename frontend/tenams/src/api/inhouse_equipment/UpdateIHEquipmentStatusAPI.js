import api from "../axiosInstance";


const UpdateIHEquipmentStatusAPI = async (eqId, breakdown, asset_status) => {
    const response = await api.patch(`/equipments/${eqId}/asset_status`, {
        breakdown: breakdown,
        asset_status: asset_status
        
    },
        //    { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
};

export default UpdateIHEquipmentStatusAPI;        