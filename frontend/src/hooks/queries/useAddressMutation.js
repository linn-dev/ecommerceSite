import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from "../../api/addressApi.js"

export function useAddresses() {
    return useQuery({
        queryKey: ["addresses"],
        queryFn: getAddresses,
    });
}

export function useCreateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAddress,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
        }
    });
}

export function useUpdateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateAddress,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
        }
    });
}

export function useDeleteAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAddress,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"]});
        }
    });
}

export function useSetDefaultAddress() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: setDefaultAddress,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
        }
    });
}