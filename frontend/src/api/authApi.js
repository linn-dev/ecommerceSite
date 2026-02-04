import axiosInstance from './axiosInstance.js'

export const loginUser = async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
}

export const registerUser = async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
}

export const getCurrentUser = async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
}

export const logoutUser = async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
}