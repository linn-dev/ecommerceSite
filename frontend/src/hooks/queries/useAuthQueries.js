import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loginUser, registerUser, getCurrentUser, logoutUser } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';

export const useCurrentUser = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: getCurrentUser,
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        onError: (error) => {
            // Only log errors that aren't 401s (expected when not logged in)
            if (error.response?.status !== 401) {
                console.error('Error fetching current user:', error);
            }
        }
    });
}

export const useLogin = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            queryClient.setQueryData(['user'], data);
            navigate('/');
        }
    })
}

export const useRegister = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: registerUser,
        onSuccess: (data) => {
            queryClient.setQueryData(['user'], data);
            navigate('/');
        }
    })
}

export const useLogout = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            queryClient.setQueryData(['user'], null);
            queryClient.clear();
            navigate('/login');
        }
    });
}