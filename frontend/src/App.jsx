import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from './context/cartContext';

import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import ProductsPage from './pages/products/ProductsPage';
import ProductFormPage from './pages/admin/ProductFormPage.jsx';
import ProductDetailPage from './pages/products/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/auth/RegisterPage';

import AdminRoute from './components/common/AdminRoute';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
                        <Navbar />

                        <main className="flex-1">
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
                                path="/admin/categories"
                                element={
                                    <AdminRoute>
                                        <AdminCategoriesPage />
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

                            <Route
                                path="/checkout"
                                element={
                                    <ProtectedRoute>
                                        <CheckoutPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/orders"
                                element={
                                    <ProtectedRoute>
                                        <OrdersPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/orders/:id"
                                element={
                                    <ProtectedRoute>
                                        <OrderDetailPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/admin/orders"
                                element={
                                    <AdminRoute>
                                        <AdminOrdersPage />
                                    </AdminRoute>
                                }
                            />

                            <Route path="*" element={<div>Page Not Found</div>} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}