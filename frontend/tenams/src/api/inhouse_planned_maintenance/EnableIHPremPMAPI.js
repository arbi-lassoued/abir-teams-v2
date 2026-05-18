import api from "../axiosInstance";
import { IconsManifest } from 'react-icons/lib';


const EnableIHPremPMAPI = async (payloadPMStatus) => {
    const response = await api.patch(`/ih_prem_pm/state`, payloadPMStatus) 
   
    return response.data;
};

export default EnableIHPremPMAPI