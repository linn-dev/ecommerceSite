import { useQuery } from "@tanstack/react-query"
import { getMyOrders, getOrder, getAllOrders } from "../../api/orderApi.js"

export function useMyOrders(page = 1) {
    return useQuery({
        queryKey: ["orders", "my", page],
        queryFn: getMyOrders({ page})
    })
}

export function useOrder(id) {
    return useQuery({
        queryKey: ["orders", id],
        queryFn: () => getOrder(id),
        enabled: !!id
    })
}

// Admin
export function useAllOrders({ page = 1, status, paymentStatus } = {}) {
    return useQuery({
        queryKey: ["orders", "all", page, status, paymentStatus],
        queryFn: () => getAllOrders({ page, status, paymentStatus })
    });
}