import { Link } from 'react-router-dom';
import GlassButton from '../glasses/GlassButton';

export default function Footer() {
    return (
        <footer className="mt-12 bg-black/20 backdrop-blur-xl border-t border-white/10 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link to="/" className="text-2xl font-bold text-white tracking-wider">
                            Zay Wal
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your premium destination for the latest gadgets, fashion, and lifestyle essentials in Myanmar. 
                            Quality products, unbeatable prices.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-500/20 hover:text-blue-400 transition-colors">
                                <i className="fa-brands fa-facebook-f"></i>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-500/20 hover:text-pink-400 transition-colors">
                                <i className="fa-brands fa-instagram"></i>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-400/20 hover:text-blue-300 transition-colors">
                                <i className="fa-brands fa-twitter"></i>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link to="/products" className="hover:text-blue-400 transition-colors">Shop All Products</Link>
                            </li>
                            <li>
                                <Link to="/products?category=electronics" className="hover:text-blue-400 transition-colors">Electronics</Link>
                            </li>
                            <li>
                                <Link to="/products?category=shirts" className="hover:text-blue-400 transition-colors">Clothing & Apparel</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Customer Service</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <Link to="/" className="hover:text-blue-400 transition-colors">Help Center & FAQ</Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:text-blue-400 transition-colors">Track Your Order</Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:text-blue-400 transition-colors">Shipping & Delivery</Link>
                            </li>
                            <li>
                                <Link to="/" className="hover:text-blue-400 transition-colors">Returns & Refunds</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Newsletter</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
                        </p>
                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                required
                            />
                            <GlassButton type="submit" className="w-full py-2 text-sm font-semibold">
                                Subscribe
                            </GlassButton>
                        </form>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} Zay Wal. All rights reserved.
                    </p>
                    <div className="flex gap-4 text-xl text-gray-400">
                        <i className="fa-brands fa-cc-visa hover:text-white transition-colors cursor-pointer"></i>
                        <i className="fa-brands fa-cc-mastercard hover:text-white transition-colors cursor-pointer"></i>
                        <i className="fa-solid fa-money-bill-wave hover:text-green-400 transition-colors cursor-pointer" title="Cash on Delivery"></i>
                        <i className="fa-solid fa-mobile-screen hover:text-blue-400 transition-colors cursor-pointer" title="Mobile Banking"></i>
                    </div>
                </div>
            </div>
        </footer>
    );
}
