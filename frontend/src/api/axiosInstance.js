import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            // Token expired or invalid - redirect to login only if not already on login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;