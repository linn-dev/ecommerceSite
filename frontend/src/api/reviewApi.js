import axiosInstance from "./axiosInstance.js"

export const getMyReviews = async () => {
    const res = await axiosInstance.get("/reviews/my")
    return res.data;
}

export const getAllReviews = async () => {
    const res = await axiosInstance.get("/reviews/all")
    return res.data;
}

export const createReview = async (reviewData) => {
    const res = await axiosInstance.post("/reviews", reviewData)
    return res.data
}

export const updateReview = async ({ id, ...reviewData }) => {
    const res = await axiosInstance.put(`/reviews/${id}`, reviewData)
    return res.data
}

export const deleteReview = async (id) => {
    const res = await axiosInstance.delete(`/reviews/${id}`)
    return res.data
}
