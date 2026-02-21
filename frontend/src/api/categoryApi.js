import axiosInstance from './axiosInstance'

export const getCategories = async () => {
    const res = await axiosInstance.get('/categories')
    return res.data
}

export const createCategory = async (formData) => {
    const res = await axiosInstance.post('/categories', formData, {
        headers: { 'Content-Type': undefined }
    })
    return res.data
}

export const updateCategory = async (id, formData) => {
    const res = await axiosInstance.put(`/categories/${id}`, formData, {
        headers: { 'Content-Type': undefined }
    })
    return res.data
}

export const deleteCategory = async (id) => {
    const res = await axiosInstance.delete(`/categories/${id}`)
    return res.data
}
