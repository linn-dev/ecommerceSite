import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview, updateReview, deleteReview } from "../../api/reviewApi";

export function useCreateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product'] });
        }
    });
}

export function useUpdateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product'] });
        }
    });
}

export function useDeleteReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product'] });
        }
    });
}
