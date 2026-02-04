import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loginUser, registerUser, getCurrentUser, logoutUser } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';

export const useCurrentUser = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: getCurrentUser,
        retry: false,
        refetchOnWindowFocus: false,
    });
}

export const useLogin = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            queryClient.setQueriesData(['user'], data);
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
            queryClient.setQueriesData(['user'], data);
            navigate('/');
        }
    })
}

export const useLogout = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: logoutUser,
        onSuccess: (data) => {
            queryClient.setQueriesData(['user'], data);
            navigate('/login');
        }
    });
}