import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom";
import { getCategories, createProduct, deleteProduct, updateProduct } from "../../api/productApi.js";

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: createProduct,
        onSuccess: data => {
            queryClient.invalidateQueries({ queryKey: ['product'] });
            navigate("/products");
        },

        onError: (error) => {
            console.error('Failed to create product:', error.response?.data?.message || error.message);
            alert(error.response?.data?.message || "Failed to create product");
        },
    })
}

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: ({ id, data }) => updateProduct(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', data.slug] });
            navigate("/admin/dashboard");
        },
        onError: (error) => {
            console.error('Failed to update product:', error);
            alert(error.response?.data?.message || "Failed to update product");
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteProduct,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
            console.error('Failed to delete product:', error);
            alert(error.response?.data?.message || "Failed to delete product");
        }
    });
}

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
        staleTime: 10 * 60 * 1000, // 10 min cache
    });
};