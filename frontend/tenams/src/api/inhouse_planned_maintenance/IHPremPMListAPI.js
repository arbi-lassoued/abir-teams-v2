import api from "../axiosInstance";

const IHPremPMListAPI = async () => {
    const response = await api.get('/ih_prem_pm/')
    return response.data.prem_pms;
};
export default IHPremPMListAPI;      