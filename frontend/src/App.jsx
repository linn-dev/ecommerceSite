import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from './context/cartContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProductsPage from './pages/products/ProductsPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
import ProductFormPage from './pages/admin/ProductFormPage.jsx';

import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import CartPage from './pages/cart/CartPage';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
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
                                path="/admin/dashboard"
                                element={
                                    <AdminRoute>
                                        <AdminDashboard />
                                    </AdminRoute>
                                }
                            />

                            <Route
                                path="/admin/products/create"
                                element={
                                    <AdminRoute>
                                        <ProductFormPage />
                                    </AdminRoute>
                                }
                            />

                            <Route
                                path="/admin/products/edit/:slug"
                                element={
                                    <AdminRoute>
                                        <ProductFormPage />
                                    </AdminRoute>
                                }
                            />

                            <Route
                                path="/cart"
                                element={
                                    <ProtectedRoute>
                                        <CartPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route path="*" element={<div>Page Not Found</div>} />
                        </Routes>
                    </div>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}