import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../hooks/queries/useProductQueries';
import { useCategories } from '../../hooks/queries/useProductMutations';
import ProductCard from '../../components/products/ProductCard';
import GlassCard from "../../components/glasses/GlassCard.jsx";

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // State for filters
    const [page, setPage] = useState(1);
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('createdAt'); // or 'price'
    const [order, setOrder] = useState('desc'); // or 'asc'
    // Fetch products
    const { data, isLoading, isError } = useProducts({
        page,
        limit: 12,
        category,
        search,
        minPrice,
        maxPrice,
        sortBy,
        order
    });

    // Fetch categories for filter
    const { data: categoriesData } = useCategories();
    // Handlers
    const handleCategoryChange = (slug) => {
        setSearchParams(prev => {
            if (slug) prev.set('category', slug);
            else prev.delete('category');
            return prev;
        });
        setPage(1); // Reset to page 1
    };
    const handleSortChange = (e) => {
        const value = e.target.value;
        const [field, dir] = value.split('-');
        setSortBy(field);
        setOrder(dir);
    };
    return (
        <div className="container mx-auto px-4 py-8 text-white">
            <h1 className="text-3xl font-bold mb-8">All Products</h1>
            <div className="flex flex-col md:flex-row gap-8">
                {/* SIDEBAR FILTERS */}
                <aside className="w-full md:w-64 space-y-6">
                    {/* Search */}
                    <div>
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full border p-2 rounded text-white"
                            value={search}
                            onChange={(e) => {
                                setSearchParams(prev => {
                                    if (e.target.value) prev.set('search', e.target.value);
                                    else prev.delete('search');
                                    return prev;
                                });
                            }}
                        />
                    </div>
                    {/* Categories */}
                    <div>
                        <h3 className="font-semibold mb-2">Categories</h3>
                        <div className="space-y-1">
                            <GlassCard className={`p-0! transition transform hover:scale-110 duration-300 ${!category ? 'bg-blue-400!' : ''}`}>
                                <button
                                    onClick={() => handleCategoryChange('')}
                                    className={`block w-full text-left px-2 py-1 rounded`}
                                >
                                    All Categories
                                </button>
                            </GlassCard>
                            {categoriesData?.data?.map(cat => (
                                <GlassCard key={cat.id} className={`p-0! transition transform duration-300 ${category === cat.slug ? 'scale-110 bg-blue-400!' : 'hover:scale-110'}`}>
                                    <button
                                        onClick={() => handleCategoryChange(cat.slug)}
                                        className={`block w-full text-left px-2 py-1 rounded`}
                                    >
                                        {cat.name}
                                    </button>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                    {/* Price Range */}
                    <div>
                        <h3 className="font-semibold mb-2">Price Range</h3>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                className="w-full border p-2 rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                className="w-full border p-2 rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>
                </aside>
                {/* MAIN CONTENT */}
                <main className="flex-1">
                    {/* Sort Header */}
                    <div className="flex justify-between items-center mb-6">
                        <p className="">
                            Showing {data?.data?.length || 0} results
                        </p>
                        <select
                            onChange={handleSortChange}
                            className="bg-transparent border p-2 rounded outline-0"
                        >
                            <option value="createdAt-desc" className="bg-[#1a1a1a] text-white">Newest First</option>
                            <option value="price-asc" className="bg-[#1a1a1a] text-white">Price: Low to High</option>
                            <option value="price-desc" className="bg-[#1a1a1a] text-white">Price: High to Low</option>
                        </select>
                    </div>
                    {/* Product Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-lg"></div>
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="text-red-500 text-center py-8">Failed to load products.</div>
                    ) : data?.data?.length === 0 ? (
                        <GlassCard className="text-center py-12">
                            No products found.
                        </GlassCard>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {data.data.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                    {/* Pagination */}
                    {data?.pagination && data.pagination.pages > 1 && (
                        <div className="flex justify-center mt-8 gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 border rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {page} of {data.pagination.pages}
                            </span>
                            <button
                                disabled={page === data.pagination.pages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}