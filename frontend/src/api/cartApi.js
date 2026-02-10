import axiosInstance from "./axiosInstance.js";

export const getCart = async () => {
    const res = await axiosInstance.get("/cart");
    return res.data;
}

export const addToCart = async ({ productId, variantId, quantity}) => {
    const res = await axiosInstance.post("/cart/items", {
        productId,
        variantId,
        quantity
    });
    return res.data;
}

export const updateCartItem = async ({ itemId, quantity }) => {
    const res = await axiosInstance.put(`/cart/items/${itemId}`, {
        quantity
    });
    return res.data;
}

export const removeCartItem = async ( itemId ) => {
    const res = await axiosInstance.delete(`/cart/items/${itemId}`);
    return res.data;
}

export const clearCart = async () => {
    const res = await axiosInstance.delete("/cart");
    return res.data;
}