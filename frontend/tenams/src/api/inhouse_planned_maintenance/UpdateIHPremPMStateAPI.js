import api from "../axiosInstance";
import { IconsManifest } from 'react-icons/lib';


const UpdateIHPremPMStateAPI = async (ih_prem_pm_id, maint_state) => {
    const response = await api.patch(`/ih_prem_pm/${ih_prem_pm_id}/state?maint_state=${maint_state}`);

    return response.data;
};

export default UpdateIHPremPMStateAPI    