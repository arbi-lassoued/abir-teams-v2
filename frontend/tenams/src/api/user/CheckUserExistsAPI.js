import api from "../axiosInstance";

const CheckUserExistsAPI = async(username) => {
      try {
        const response = await api.get(`/users/user/${username}`);  
        return response.data;
     } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 404) {
                // KKS not found - return false instead of throwing
                console.log('KKS not found - available for use');
                return false;
            }
            // For other error statuses (500, etc.), you might want to handle differently
            console.error('Server responded with error:', error.response.status);  
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request
            console.error('Request setup error:', error.message);
        }
        // Return false for all error cases if you want silent failure 
        return false;
    }
};


export default CheckUserExistsAPI;