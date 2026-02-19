import { Link } from 'react-router-dom';
import {useAuth} from "../../context/AuthContext"
import { useCart } from '../../context/cartContext.jsx';
import GlassCard from "../glasses/GlassCard.jsx";


export default function Navbar() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { cartCount } = useCart();

    return (
        <GlassCard className="p-0! rounded-none">
            <nav className="shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="text-2xl font-bold text-white">
                            Zay Wal
                        </Link>

                        {/* Navigation Links */}
                        <div className="flex gap-6">
                            <Link to="/" className="hover:text-blue-600">
                                Home
                            </Link>
                            <Link to="/products" className="hover:text-blue-600">
                                Products
                            </Link>
                            <Link to="/" className="hover:text-blue-600">
                                Help & Support
                            </Link>
                            {user && (
                                <Link to="/cart" className="relative">
                                    <i className="fa-solid fa-cart-shopping text-xl"></i>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {cartCount > 99 ? '99+' : cartCount}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </div>

                        {/* Auth Section */}
                        <div className="flex gap-4 items-center">
                            {isLoading ? (
                                <span className="text-gray-500">Loading...</span>
                            ) : isAuthenticated ? (
                                <>
                                    <Link to="/profile" className="hover:text-blue-400">
                                        <i className="fa-light fa-user mr-2 text-xl"></i>
                                        {user.firstName} {user.lastName}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-blue-600 hover:text-blue-700"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </GlassCard>
    );
}