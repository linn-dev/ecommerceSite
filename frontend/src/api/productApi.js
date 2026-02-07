import axiosInstance from "./axiosInstance";

export const createProduct = async (formData) => {
    const response = await axiosInstance.post('/products', formData, {
        headers: {
            'Content-Type': undefined,
        },
    });
    return response.data;
}

export const getProducts = async (params) => {
    const response = await axiosInstance.get(`/products`, { params });
    return response.data;
}

export const getCategories =async () => {
    const response = await axiosInstance.get('/categories');
    return response.data;
}

export const updateProduct = async (id, data) => {
    const response = await axiosInstance.put(`/products/${id}`, data);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
}