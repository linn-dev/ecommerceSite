import { useCallback, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { useParams } from 'react-router-dom';
import { useCreateProduct, useUpdateProduct, useCategories } from '../../hooks/queries/useProductMutations';
import { useProduct } from '../../hooks/queries/useProductQueries';
import GlassCard from "../../components/glasses/GlassCard.jsx";
import GlassButton from "../../components/glasses/GlassButton.jsx";

export default function ProductFormPage() {
    const { slug } = useParams();
    const isEditMode = !!slug;

    const { data: productData, isLoading: isProductLoading } = useProduct(slug);
    const product = productData?.data;

    const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
    const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
    const isPending = isCreating || isUpdating;

    const { data: categoriesData } = useCategories();

    const { register, control, handleSubmit, watch, setValue, setError, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            description: '',
            categoryId: '',
            hasVariants: false,
            price: '',
            stock: '',
            images: [],
            variants: [{ sku: '', size: '', color: '', price: '', stock: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "variants"
    });

    const hasVariants = watch("hasVariants");
    const currentImages = watch("images");

    // Populate form when editing
    useEffect(() => {
        if (isEditMode && product) {
            reset({
                name: product.name,
                description: product.description,
                categoryId: product.categoryId,
                hasVariants: product.hasVariants,
                price: product.price || '',
                stock: product.stock || '',
                images: [],
                variants: product.variants?.length ? product.variants : [{ sku: '', size: '', color: '', price: '', stock: '' }]
            });
        }
    }, [isEditMode, product, reset]);

    // Dropzone Handling
    const onDrop = useCallback((acceptedFiles) => {
        const filesWithPreview = acceptedFiles.map(file =>
            Object.assign(file, { preview: URL.createObjectURL(file) })
        );
        setValue("images", [...currentImages, ...filesWithPreview].slice(0, 5));
    }, [currentImages, setValue]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        maxFiles: 5
    });

    const onSubmit = (data) => {
        if (isEditMode) {
            const updateData = {
                name: data.name,
                description: data.description,
                categoryId: data.categoryId,
                price: data.price,
                stock: data.stock,
            };
            updateProduct({ id: product.id, data: updateData });
        } else {
            if (data.images.length === 0) {
                alert("Please upload at least one image");
                return;
            }
            
            const submitData = new FormData();
            Object.keys(data).forEach(key => {
                if (key === 'images') {
                    data.images.forEach(img => submitData.append('images', img));
                } else if (key === 'variants') {
                    if (data.hasVariants) submitData.append('variants', JSON.stringify(data.variants));
                } else {
                    submitData.append(key, data[key]);
                }
            });

            createProduct(submitData, {
                onError: (error) => {
                    const message = error.response?.data?.message || "Failed to create product";
                    if (message.toLowerCase().includes("name") || message.toLowerCase().includes("exists")) {
                        setError("name", {
                            type: "manual",
                            message: "Product with this name already exists"
                        });
                    }
                }
            });
        }
    };

    if (isEditMode && isProductLoading) return <div className="min-h-screen flex items-center justify-center">Loading product data...</div>;

    return (
        <GlassCard className="max-w-4xl mx-auto mt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6 text-white">
                <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Product' : 'Create Product'}</h1>

                {/* Product Name */}
                <div>
                    <label className="block text-sm font-medium mb-2">Product Name</label>
                    <input
                        {...register("name", { required: "Product name is required" })}
                        className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name.message}</p>}
                </div>

                {/* Categories */}
                <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                        {...register("categoryId", { required: "Please select a category" })}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="">Select Category</option>
                        {categoriesData?.data?.map(cat => (
                            <option key={cat.id} value={cat.id} className="bg-blue-900">{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                        {...register("description", { required: "Description is required" })}
                        className={`w-full p-2 border rounded ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                        rows={4}
                        placeholder="Enter product description..."
                    />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                </div>

                {/* Image Dropzone */}
                {!isEditMode && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Product Images</label>
                        <div {...getRootProps()} className="border-2 border-dashed p-6 text-center cursor-pointer rounded-lg">
                            <input {...getInputProps()} />
                            <p className="text-white">{isDragActive ? "Drop here..." : "Drag & drop images here, or click to select"}</p>
                        </div>
                        {currentImages.length > 0 && (
                            <div className="flex flex-wrap gap-4 mt-4">
                                {currentImages.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={image.preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newImages = [...currentImages];
                                                URL.revokeObjectURL(newImages[index].preview);
                                                newImages.splice(index, 1);
                                                setValue("images", newImages);
                                            }}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ✕
                                        </button>
                                        {index === 0 && (
                                            <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[10px] text-center py-0.5 rounded-b-lg opacity-90">
                                            Primary
                                        </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Dynamic Variants Section */}
                <div className="flex items-center gap-2">
                    <input type="checkbox" {...register("hasVariants")} id="hasVariants" className="h-4 w-4 text-blue-600 rounded" />
                    <label htmlFor="hasVariants" className="font-medium">This product has variants</label>
                </div>

                {hasVariants ? (
                    <GlassCard className="">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex flex-wrap gap-2 items-end mb-4 pb-4 border-b-2 border-gray-200/40 border-dashed">
                                <div className="flex-1 min-w-30">
                                    <label className="text-xs font-semibold uppercase">Product code (or) SKU</label>
                                    <input {...register(`variants.${index}.sku`, { required: true })} placeholder="Product code (or) SKU" className="border p-2 w-full rounded outline-none focus:border-gray-300" />
                                </div>
                                <div className="w-18">
                                    <label className="text-xs font-semibold uppercase">Size</label>
                                    <input {...register(`variants.${index}.size`)} placeholder="Size" className="border p-2 w-full rounded outline-none focus:border-gray-300 " />
                                </div>
                                <div className="w-24">
                                    <label className="text-xs font-semibold uppercase">Color</label>
                                    <input {...register(`variants.${index}.color`)} placeholder="Color" className="border p-2 w-full rounded outline-none focus:border-gray-300 " />
                                </div>
                                <div className="w-28">
                                    <label className="text-xs font-semibold uppercase">Price</label>
                                    <input {...register(`variants.${index}.price`, { required: true })} type="number" placeholder="MMK" className="border p-2 w-full rounded outline-none focus:border-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                </div>
                                <div className="w-24">
                                    <label className="text-xs font-semibold uppercase">Stock</label>
                                    <input {...register(`variants.${index}.stock`, { required: true })} type="number" placeholder="0" className="border p-2 w-full rounded outline-none focus:border-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                </div>
                                <GlassButton type="button" onClick={() => remove(index)} className="text-red-700! p-2">✕</GlassButton>
                            </div>
                        ))}
                        <GlassButton
                            type="button"
                            onClick={() => append({ sku: '', size: '', color: '', price: '', stock: '' })}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 py-2 px-4"
                        >
                            <span>+</span> Add Variant
                        </GlassButton>
                    </GlassCard>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Price</label>
                            <input {...register("price", { required: !hasVariants })} type="number" placeholder="MMK" className="border p-2 w-full rounded outline-none focus:border-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            {errors.price && <p className="text-red-500 text-sm mt-2">{errors.price.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Stock</label>
                            <input {...register("stock", { required: !hasVariants })} type="number" placeholder="0" className="border p-2 w-full rounded outline-none focus:border-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
                >
                    {isPending ? "Saving..." : (isEditMode ? "Update Product" : "Create Product")}
                </button>
            </form>
        </GlassCard>
    );
}