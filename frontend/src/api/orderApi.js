import axiosInstance from "./axiosInstance.js"

export const createOrder = async({ shippingAddressId, paymentMethod }) => {
    const response = await axiosInstance.post("/orders", {
        shippingAddressId,
        paymentMethod
    });
    return response.data;
}

export const getMyOrders = async({ page = 1, limit = 10 } = {}) => {
    const response = await axiosInstance.get("/orders/my", {
        params: { page, limit}
    });

    return response.data;
}

export const getOrder = async (id) => {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data;
}

export const cancelOrder = async (id) => {
    const response = await axiosInstance.put(`/orders/${id}/cancel`);
    return response.data;
}

// Admin
export const getAllOrders = async ({ page = 1, limit = 20, status, paymentStatus } = {}) => {
    const response = await axiosInstance.get("/orders", {
        params: { page, limit, status, paymentStatus }
    });
    return response.data;
};

export const updateOrderStatus = async ({ id, status, paymentStatus }) => {
    const response = await axiosInstance.put(`/orders/${id}/status`, {
        status,
        paymentStatus
    });
    return response.data;
}