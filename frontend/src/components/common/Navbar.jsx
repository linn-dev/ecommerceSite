import { Link } from 'react-router-dom';
import {useAuth} from "../../context/AuthContext"

export default function Navbar() {
    const { user, isAuthenticated, logout, isLoading } = useAuth();

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-blue-600">
                        E-Commerce
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex gap-6">
                        <Link to="/" className="hover:text-blue-600">
                            Home
                        </Link>
                        <Link to="/products" className="hover:text-blue-600">
                            Products
                        </Link>
                    </div>

                    {/* Auth Section */}
                    <div className="flex gap-4 items-center">
                        {isLoading ? (
                            <span className="text-gray-500">Loading...</span>
                        ) : isAuthenticated ? (
                            <>
                                <Link to="/profile" className="hover:text-blue-600">
                                    {user.firstName} {user.lastName}
                                </Link>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 text-red-600 hover:text-red-700"
                                >
                                    Logout
                                </button>
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
    );
}