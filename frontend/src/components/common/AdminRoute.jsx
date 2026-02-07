import { Navigate } from 'react-router-dom';
import {useAuth} from "../../context/AuthContext.jsx";

export default function AdminRoute({ children }) {
    const { user, isLoading, isAuthenticated } = useAuth();

    if(isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if(!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if(user?.role !== "ADMIN") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
                    <p className="text-xl text-gray-600 mb-4">Access Denied</p>
                    <p className="text-gray-500 mb-6">You don't have permission to access this page.</p>
                    <a href="/" className="text-blue-600 hover:underline">Go to Home</a>
                </div>
            </div>
        )
    }

    return children;
}