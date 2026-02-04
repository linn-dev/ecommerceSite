import axios from "axios";

const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(
    (response) => response, // If success just return
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            // Clear user from AuthContext (we'll do this later)
            // Redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;