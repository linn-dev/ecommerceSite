import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/queries/useProductQueries';
import { useCategories } from '../hooks/queries/useProductMutations';
import ProductCard from '../components/products/ProductCard';
import GlassCard from '../components/glasses/GlassCard';
import GlassButton from '../components/glasses/GlassButton';

// ─── Hero Carousel Data ───
const HERO_SLIDES = [
    {
        gradient: 'from-blue-600 via-blue-800 to-purple-900',
        title: 'Premium Quality Products',
        subtitle: 'Discover the best deals at Zay Wal',
        cta: 'Shop Now',
        link: '/products'
    },
    {
        gradient: 'from-teal-600 via-cyan-800 to-blue-900',
        title: 'Latest Electronics',
        subtitle: 'Top-tier gadgets and accessories at unbeatable prices',
        cta: 'Browse Electronics',
        link: '/products?category=electronics'
    },
    {
        gradient: 'from-purple-600 via-pink-700 to-rose-900',
        title: 'New Arrivals Daily',
        subtitle: 'Fresh styles added every day — never miss a drop',
        cta: 'Explore Collection',
        link: '/products'
    }
];

// ─── Category Icon Mapping ───
const CATEGORY_ICONS = {
    electronics: 'fa-microchip',
    shirts: 'fa-shirt',
    clothing: 'fa-shirt',
    shoes: 'fa-shoe-prints',
    accessories: 'fa-gem',
    bags: 'fa-bag-shopping',
    sports: 'fa-basketball',
    home: 'fa-house',
    beauty: 'fa-spray-can-sparkles',
    books: 'fa-book',
    toys: 'fa-gamepad',
    food: 'fa-utensils',
    laptop: 'fa-laptop',
};

const getCategoryIcon = (slug) => {
    return CATEGORY_ICONS[slug] || 'fa-tag';
};

// ─── Features Data ───
const FEATURES = [
    {
        icon: 'fa-truck-fast',
        title: 'Free Shipping',
        description: 'On orders over 50,000 MMK'
    },
    {
        icon: 'fa-shield-halved',
        title: 'Secure Payment',
        description: '100% safe checkout'
    },
    {
        icon: 'fa-money-bill-wave',
        title: 'Cash on Delivery',
        description: 'Pay when you receive'
    },
    {
        icon: 'fa-headset',
        title: '24/7 Support',
        description: "We're here to help"
    }
];

//  Hero Carousel Component
function HeroCarousel() {
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate();

    const nextSlide = useCallback(() => {
        setCurrent(prev => (prev + 1) % HERO_SLIDES.length);
    }, []);

    const prevSlide = () => {
        setCurrent(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    };

    // Auto-play every 5 seconds
    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    return (
        <div className="relative overflow-hidden rounded-xl">
            {/* Slides Container */}
            <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {HERO_SLIDES.map((slide, index) => (
                    <div
                        key={index}
                        className={`min-w-full h-[300px] md:h-[400px] bg-gradient-to-r ${slide.gradient} flex items-center justify-center`}
                    >
                        {/* Decorative Elements */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                        </div>

                        <div className="text-center px-8 relative z-10">
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                                {slide.title}
                            </h1>
                            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                                {slide.subtitle}
                            </p>
                            <GlassButton
                                onClick={() => navigate(slide.link)}
                                className="px-8 py-3 mx-auto text-lg font-semibold"
                            >
                                {slide.cta} <i className="fa-solid fa-arrow-right ml-2"></i>
                            </GlassButton>
                        </div>
                    </div>
                ))}
            </div>

            {/* Left Arrow */}
            <GlassButton
                onClick={prevSlide}
                className="absolute! left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
            >
                <i className="fa-solid fa-chevron-left"></i>
            </GlassButton>

            {/* Right Arrow */}
            <GlassButton
                onClick={nextSlide}
                className="absolute! right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
            >
                <i className="fa-solid fa-chevron-right"></i>
            </GlassButton>

            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {HERO_SLIDES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            current === index
                                ? 'bg-white w-8'
                                : 'bg-white/40 hover:bg-white/60'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}

//  Categories Section Component
function CategoriesSection() {
    const { data: categoriesData, isLoading } = useCategories();
    const categories = categoriesData?.data || [];

    if (isLoading) {
        return (
            <section>
                <h2 className="text-2xl font-bold text-white mb-6">Shop by Category</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-white/5 animate-pulse rounded-lg"></div>
                    ))}
                </div>
            </section>
        );
    }

    if (categories.length === 0) return null;

    return (
        <section className="pb-20 overflow-x-hidden">
            <h2 className="text-2xl font-bold text-white mb-6">Shop by Category</h2>
            <div className="animate-scroll flex gap-x-4">

                {categories.map((cat, index) => (
                    <Link key={`orig-${index}`} to={`/products?category=${cat.slug}`}>
                        <GlassCard className="flex flex-col items-center justify-center h-24 w-40 md:h-32 md:w-64 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer">
                            <i className={`fa-solid ${getCategoryIcon(cat.slug)} text-3xl text-blue-400 mb-3`}></i>
                            <span className="font-semibold text-white whitespace-nowrap">{cat.name}</span>
                        </GlassCard>
                    </Link>
                ))}

                {/* for infinite scrolling*/}
                {categories.map((cat, index) => (
                    <Link key={`dup-${index}`} to={`/products?category=${cat.slug}`}>
                        <GlassCard className="flex flex-col items-center justify-center h-24 w-40 md:h-32 md:w-64 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer">
                            <i className={`fa-solid ${getCategoryIcon(cat.slug)} text-3xl text-blue-400 mb-3`}></i>
                            <span className="font-semibold text-white whitespace-nowrap">{cat.name}</span>
                        </GlassCard>
                    </Link>
                ))}
            </div>
        </section>
    );
}

//  New Arrivals Section Component
function NewArrivalsSection() {
    const { data, isLoading, isError } = useProducts({
        limit: 8,
        sortBy: 'createdAt',
        order: 'desc'
    });

    const products = data?.data || [];

    return (
        <section className="-mt-20">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">New Arrivals</h2>
                <Link
                    to="/products"
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                    View All <i className="fa-solid fa-arrow-right ml-1"></i>
                </Link>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-72 bg-white/5 animate-pulse rounded-lg"></div>
                    ))}
                </div>
            ) : isError ? (
                <GlassCard className="text-center py-8">
                    <p className="text-gray-400">Failed to load products</p>
                </GlassCard>
            ) : products.length === 0 ? (
                <GlassCard className="text-center py-8">
                    <p className="text-gray-400">No products yet</p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
}

//  Why Choose Us Section Component
function FeaturesSection() {
    return (
        <section>
            <h2 className="text-2xl font-bold text-white mb-6">Why Choose Zay Wal</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {FEATURES.map((feature, index) => (
                    <GlassCard key={index} className="text-center">
                        <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className={`fa-solid ${feature.icon} text-2xl text-blue-400`}></i>
                        </div>
                        <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-400">{feature.description}</p>
                    </GlassCard>
                ))}
            </div>
        </section>
    );
}

//  Main HomePage
export default function HomePage() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-12">
            <HeroCarousel />
            <CategoriesSection />
            <NewArrivalsSection />
            <FeaturesSection />
        </div>
    );
}
