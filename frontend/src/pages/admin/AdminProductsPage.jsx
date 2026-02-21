import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/queries/useProductQueries';
import { useDeleteProduct } from '../../hooks/queries/useProductMutations';
import GlassButton from "../../components/glasses/GlassButton.jsx";
import GlassCard from "../../components/glasses/GlassCard.jsx";

export default function AdminProductsPage() {
    // Fetch all products (pagination disabled for simplicity, or handle it)
    const { data, isLoading, isError } = useProducts({ limit: 1000 });
    const { mutate: deleteProduct } = useDeleteProduct();

    const navigate = useNavigate();

    if (isLoading) return <div className="p-8 text-center">Loading products...</div>;
    if (isError) return <div className="p-8 text-red-500">Error loading products</div>;

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteProduct(id);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <Link
                    to="/admin/products/create"
                >
                    <GlassButton className="px-4 py-2">
                        + Add New Product
                    </GlassButton>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row items-center mb-6 gap-4">
                <GlassCard className="flex-1 w-full">
                    <Link to="/admin/orders" className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-chart-diagram text-xl text-blue-400"></i>
                            <div>
                                <h2 className="text-lg font-bold">Order Management</h2>
                                <p className="text-sm text-gray-400">View admin order management</p>
                            </div>
                        </div>
                        <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-white transition-colors"></i>
                    </Link>
                </GlassCard>
                <GlassCard className="flex-1 w-full">
                    <Link to="/admin/categories" className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-list text-xl text-blue-400"></i>
                            <div>
                                <h2 className="text-lg font-bold">Categories Management</h2>
                                <p className="text-sm text-gray-400">View admin categories management</p>
                            </div>
                        </div>
                        <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-white transition-colors"></i>
                    </Link>
                </GlassCard>
            </div>

            <GlassCard className="mt-4 p-0! overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data?.data?.map((product) => (
                        <tr key={product.id} className="border-b border-gray-700 hover:bg-white/5 cursor-pointer">
                            <td className="px-6 py-4 max-w-130 whitespace-nowrap overflow-hidden cursor-pointer" onClick={() => navigate(`/products/${product.slug}`)}>
                                <div className="flex items-center">
                                    <div className="h-10 w-10 shrink-0">
                                        {product.images?.[0]?.imageUrl ? (
                                            <img className="h-10 w-10 rounded-full object-cover" src={product.images[0].imageUrl} alt={product.name} />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs">No Img</div>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium">{product.name}</div>
                                        <div className="text-sm text-gray-400">ID: {product.id}</div>
                                    </div>
                                </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400">
                                    {product.category?.name}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {product.hasVariants && product.priceRange.min !== product.priceRange.max ? (
                                    <span>
                                        {product.priceRange.min.toLocaleString()} - {product.priceRange.max.toLocaleString()} MMK
                                    </span>
                                ) : (
                                    <span>{product.priceRange.min?.toLocaleString()} MMK</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {product.totalStock}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link
                                    to={`/admin/products/edit/${product.slug}`}
                                    className="px-4 py-1 mr-4 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="px-2 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-500"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    );
}