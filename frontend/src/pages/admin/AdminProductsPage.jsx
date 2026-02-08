import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/queries/useProductQueries';
import { useDeleteProduct } from '../../hooks/queries/useProductMutations';

export default function AdminProductsPage() {
    // Fetch all products
    const { data, isLoading, isError } = useProducts({ limit: 1000 }); 
    const { mutate: deleteProduct } = useDeleteProduct();

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading products...</div>;
    if (isError) return <div className="min-h-screen flex items-center justify-center text-red-500">Error loading products</div>;

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteProduct(id);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <Link 
                    to="/admin/products/create" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + Add New Product
                </Link>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
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
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                {product.images?.[0]?.imageUrl ? (
                                                    <img className="h-10 w-10 rounded-full object-cover border" src={product.images[0].imageUrl} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 border">No Img</div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500">SKU: {product.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.category?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {product.hasVariants ? (
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Variants</span>
                                        ) : (
                                            `$${product.price}`
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.totalStock}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link 
                                            to={`/admin/products/edit/${product.slug}`} 
                                            className="text-blue-600 hover:text-blue-900 mr-4 font-semibold"
                                        >
                                            Edit
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-600 hover:text-red-900 font-semibold"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {data?.data?.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No products found. Start by adding one!
                    </div>
                )}
            </div>
        </div>
    );
}