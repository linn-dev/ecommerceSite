import { createContext, useContext } from 'react';
import { useCurrentUser, useLogout } from '../hooks/queries/useAuthQueries';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { data, isLoading, error, refetch } = useCurrentUser();
    const logoutMutation = useLogout();

    const value = {
        user: data?.user || null,
        isLoading,
        isAuthenticated: !!data?.user,
        refetchUser: refetch,
        logout: () => {
            if (data?.user) {
                logoutMutation.mutate();
            }
        },
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};