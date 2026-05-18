import api from "../axiosInstance";
import { IconsManifest } from 'react-icons/lib';


const UpdateIHPremPMStateAPI = async (ih_sp_id, sp_state) => {
    const response = await api.patch(`/ih_spares/${ih_sp_id}/state?sp_state=${sp_state}`);

    return response.data;
};

export default UpdateIHPremPMStateAPI    