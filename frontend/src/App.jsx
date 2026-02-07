import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext";

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProductsPage from './pages/products/ProductsPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
import CreateProductPage from './pages/admin/CreateProductPage';

import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900">
                    <Navbar />

                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/:slug" element={<ProductDetailPage />} />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/products/create"
                            element={
                                <AdminRoute>
                                    <CreateProductPage />
                                </AdminRoute>
                            }
                        />
                        <Route path="*" element={<div>Page Not Found</div>} />
                    </Routes>
                </div>
            </AuthProvider>
        </BrowserRouter>
    )
}