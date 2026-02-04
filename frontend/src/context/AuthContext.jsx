import { createContext, useContext } from 'react';
import { useCurrentUser, useLogout} from "../hooks/queries/useAuthQueries.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { data, isLoading, refetch } = useCurrentUser();
    const logoutMutation = useLogout();

    const value = {
        user: data?.user || null,
        isLoading,
        isAuthenticated: !!data?.user,
        refetchUser: refetch,
        logout: () => logoutMutation.mutate(),
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};