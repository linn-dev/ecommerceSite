import { useMutation, useQueryClient } from "@tanstack/react-query";
import { validateCoupon, createCoupon, updateCoupon, deleteCoupon } from "../../api/couponApi";

export function useValidateCoupon() {
    return useMutation({
        mutationFn: validateCoupon
    });
}

export function useCreateCoupon() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
        }
    });
}

export function useUpdateCoupon() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
        }
    });
}

export function useDeleteCoupon() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
        }
    });
}
