import { useQuery } from "@tanstack/react-query"
import { getProducts, getProduct } from "../../api/productApi";

export const useProducts = (params) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: () => getProducts(params),
        placeholderData: (previousData) => previousData,
    });
}

export const useProduct = (slug) => {
    return useQuery({
        queryKey: ['product', slug],
        queryFn: () => getProduct(slug),
        enabled: !!slug,
    })
}