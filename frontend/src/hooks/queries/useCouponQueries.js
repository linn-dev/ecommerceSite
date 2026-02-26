import { useQuery } from "@tanstack/react-query"
import { getAvailableCoupons, getAllCoupons } from "../../api/couponApi.js"

export function useAvailableCoupons() {
    return useQuery({
        queryKey: ["coupons", "available"],
        queryFn: getAvailableCoupons
    })
}

// Admin
export function useAllCoupons() {
    return useQuery({
        queryKey: ["coupons", "all"],
        queryFn: getAllCoupons
    })
}
