import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/queries/useProductQueries';
import { useDeleteProduct } from '../../hooks/queries/useProductMutations';

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
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Add New Product
                </Link>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {data?.data?.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-300">
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
                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                        <div className="text-sm text-gray-500">ID: {product.id}</div>
                                    </div>
                                </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.category?.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                {product.hasVariants && product.priceRange.min !== product.priceRange.max ? (
                                    <span>
                                        {product.priceRange.min.toLocaleString()} - {product.priceRange.max.toLocaleString()} MMK
                                    </span>
                                ) : (
                                    <span>{product.priceRange.min?.toLocaleString()} MMK</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.totalStock}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link
                                    to={`/admin/products/edit/${product.slug}`}
                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}