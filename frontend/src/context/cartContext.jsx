import { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCart } from "../api/cartApi.js"
import { useAuth } from "./AuthContext.jsx"

const CartContext = createContext(null);

export default function CartProvider({ children }) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["cart"],
        queryFn: getCart,
        enabled: !!user,
        staleTime: 5 * 60 * 1000,
    });

    const cart = data?.data || { items: [], itemCount: 0, subtotal: 0 };

    const invalidateCart = () => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
    }

    const value = {
        cart,
        cartItems: cart.items || [],
        cartCount: cart.itemCount || 0,
        cartTotal: cart.subtotal || 0,
        isLoading,
        isError,
        refetchCart: refetch,
        invalidateCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
