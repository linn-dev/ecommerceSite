import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder, cancelOrder, updateOrderStatus } from "../../api/orderApi";

export function useCreateOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        }
    });
}

export function useCancelOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cancelOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        }
    });
}

// Admin
export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateOrderStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        }
    });
}