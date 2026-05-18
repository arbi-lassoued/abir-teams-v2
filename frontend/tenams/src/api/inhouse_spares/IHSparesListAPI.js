import api from "../axiosInstance";

const IHPremPMListAPI = async () => {
    const response = await api.get('/ih_spares/')
    return response.data.ih_spares;
};
export default IHPremPMListAPI;   