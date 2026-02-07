import { useQuery } from "@tanstack/react-query"
import { getProducts } from "../../api/productApi";

export const useProducts = (params) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: () => getProducts(params),
        placeholderData: (previousData) => previousData,
    });
}
