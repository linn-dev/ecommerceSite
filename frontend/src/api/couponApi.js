import axiosInstance from "./axiosInstance.js"

// Public
export const getAvailableCoupons = async () => {
    const res = await axiosInstance.get("/coupons/available")
    return res.data;
}

// Auth
export const validateCoupon = async ({ code, subtotal }) => {
    const res = await axiosInstance.post("/coupons/validate", { code, subtotal })
    return res.data;
}

// Admin
export const getAllCoupons = async () => {
    const res = await axiosInstance.get("/coupons")
    return res.data;
}

export const getCoupon = async (id) => {
    const res = await axiosInstance.get(`/coupons/${id}`)
    return res.data;
}

export const createCoupon = async (couponData) => {
    const res = await axiosInstance.post("/coupons", couponData)
    return res.data;
}

export const updateCoupon = async ({ id, ...couponData }) => {
    const res = await axiosInstance.put(`/coupons/${id}`, couponData)
    return res.data;
}

export const deleteCoupon = async (id) => {
    const res = await axiosInstance.delete(`/coupons/${id}`)
    return res.data;
}
