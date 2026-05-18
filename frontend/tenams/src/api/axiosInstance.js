import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8001", 
});

// ✅ Attach token to every request

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // console.log("Request:", config);
  return config;
});


// ✅ Handle expired token and refresh it
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post("http://localhost:8001/users/refresh", {
          refresh_token: refreshToken,
        });

        const newAccessToken = res.data.access_token;
        localStorage.setItem("access_token", newAccessToken);

        // ✅ Attach the new token to the failed request and retry
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh also failed → logout
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// To be implemented later

// try {
//   const res = await axios.post("/api/users/refresh", {
//     refresh_token: refreshToken,
//   });

//   const newAccessToken = res.data.access_token;
//   const newRefreshToken = res.data.refresh_token;

//   localStorage.setItem("access_token", newAccessToken);
//   localStorage.setItem("refresh_token", newRefreshToken);

//   originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//   return api(originalRequest); // Retry original request
// } catch (refreshError) {
//   localStorage.removeItem("access_token");
//   localStorage.removeItem("refresh_token");
//   window.location.href = "/login";
//   return Promise.reject(refreshError);
// }


export default api;