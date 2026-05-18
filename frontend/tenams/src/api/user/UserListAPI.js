import api from "../axiosInstance";

const UserListAPI = async () => {
    const response = await api.get('/users/')
    return response.data.users;
};
export default UserListAPI;   