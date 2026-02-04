import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API,
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