import { BrowserRouter, Routes, Route } from "react-router-dom"

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProductsPage from './pages/products/ProductsPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';

import Navbar from './components/common/Navbar';

export default function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:slug" element={<ProductDetailPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}