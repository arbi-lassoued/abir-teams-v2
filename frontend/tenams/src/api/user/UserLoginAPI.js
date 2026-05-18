import api from "../axiosInstance";

const loginUserAPI = async (username, password) => {
    try {
        const response = await api.post("/users/login", { username, password });

        // Save token + username to localStorage
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("roles", JSON.stringify(response.data.roles || []));


        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.detail || "Login failed");
        } else {
            throw new Error("Request error");
        }
    }
};

export default loginUserAPI;
