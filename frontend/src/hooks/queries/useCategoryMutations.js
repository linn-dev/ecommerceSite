import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCategory, deleteCategory, updateCategory } from '../../api/categoryApi'

export const useCreateCategory = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (formData) => createCategory(formData),
        onSuccess: () => qc.invalidateQueries(['categories'])
    })
}

export const useDeleteCategory = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id) => deleteCategory(id),
        onSuccess: () => qc.invalidateQueries(['categories'])
    })
}

export const useUpdateCategory = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, formData }) => updateCategory(id, formData),
        onSuccess: () => qc.invalidateQueries(['categories'])
    })
}
