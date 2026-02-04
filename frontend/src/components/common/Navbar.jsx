import { Link } from 'react-router-dom';

export default function Navbar() {
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

                    {/* Auth Links (right side) */}
                    <div className="flex gap-4">
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
                    </div>
                </div>
            </div>
        </nav>
    );
}