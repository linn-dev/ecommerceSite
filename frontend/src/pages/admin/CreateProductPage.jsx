import { useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { useCreateProduct, useCategories } from '../../hooks/queries/useProductMutations';

export default function CreateProductPage() {
    const { mutate, isPending } = useCreateProduct();
    const { data: categoriesData } = useCategories();

    const { register, control, handleSubmit, watch, setValue, setError, formState: { errors } } = useForm({
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

        mutate(submitData, {
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
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-8 space-y-6">
            <h1 className="text-2xl font-bold">Create Product</h1>

            {/* Product Name */}
            <div>
                <label className="block text-sm font-medium">Product Name *</label>
                <input
                    {...register("name", { required: "Product name is required" })}
                    className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            {/* Categories */}
            <div>
                <label className="block text-sm font-medium">Category *</label>
                <select
                    {...register("categoryId", { required: "Please select a category" })}
                    className="w-full p-2 border border-gray-300 rounded"
                >
                    <option value="">Select Category</option>
                    {categoriesData?.data?.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium">Description *</label>
                <textarea
                    {...register("description", { required: "Description is required" })}
                    className={`w-full p-2 border rounded ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                    rows={4}
                    placeholder="Enter product description..."
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>

            {/* Image Dropzone with Controller */}
            <div {...getRootProps()} className="border-2 border-dashed p-6 text-center cursor-pointer">
                <input {...getInputProps()} />
                <p>{isDragActive ? "Drop here..." : "Drag & drop images here"}</p>
            </div>

            {currentImages.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4">
                    {currentImages.map((image, index) => (
                        <div key={index} className="relative">
                            <img
                                src={image.preview}
                                alt={`Preview ${index + 1}`}
                                className="w-24 h-24 object-cover rounded-lg border"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const newImages = [...currentImages];
                                    URL.revokeObjectURL(newImages[index].preview);
                                    newImages.splice(index, 1);
                                    setValue("images", newImages);
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
                            >
                                ✕
                            </button>
                            {index === 0 && (
                                <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs text-center py-0.5 rounded-b-lg">
                        Primary
                    </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Dynamic Variants Section */}
            <div className="flex items-center gap-2">
                <input type="checkbox" {...register("hasVariants")} id="hasVariants" />
                <label htmlFor="hasVariants">This product has variants</label>
            </div>

            {hasVariants ? (
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex flex-wrap gap-2 bg-gray-50 p-3 rounded items-end">
                            <div className="flex-1 min-w-[120px]">
                                <label className="text-xs text-gray-500">SKU</label>
                                <input {...register(`variants.${index}.sku`, { required: true })} placeholder="SKU" className="border p-1 w-full rounded" />
                            </div>
                            <div className="w-24">
                                <label className="text-xs text-gray-500">Size</label>
                                <input {...register(`variants.${index}.size`)} placeholder="Size" className="border p-1 w-full rounded" />
                            </div>
                            <div className="w-24">
                                <label className="text-xs text-gray-500">Color</label>
                                <input {...register(`variants.${index}.color`)} placeholder="Color" className="border p-1 w-full rounded" />
                            </div>
                            <div className="w-24">
                                <label className="text-xs text-gray-500">Price</label>
                                <input {...register(`variants.${index}.price`, { required: true })} type="number" step="0.01" placeholder="Price" className="border p-1 w-full rounded" />
                            </div>
                            <div className="w-20">
                                <label className="text-xs text-gray-500">Stock</label>
                                <input {...register(`variants.${index}.stock`, { required: true })} type="number" placeholder="Stock" className="border p-1 w-full rounded" />
                            </div>
                            <button type="button" onClick={() => remove(index)} className="text-red-500 pb-2 hover:text-red-700">✕</button>
                        </div>
                    ))}
                    <button 
                        type="button" 
                        onClick={() => append({ sku: '', size: '', color: '', price: '', stock: '' })} 
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                        + Add Variant
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Price *</label>
                        <input {...register("price", { required: !hasVariants })} type="number" step="0.01" placeholder="0.00" className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Stock *</label>
                        <input {...register("stock", { required: !hasVariants })} type="number" placeholder="0" className="w-full border p-2 rounded" />
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 text-white p-3 rounded font-bold disabled:bg-gray-400"
            >
                {isPending ? "Creating..." : "Create Product"}
            </button>
        </form>
    );
}