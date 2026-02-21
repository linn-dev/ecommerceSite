import { useState } from 'react'
import GlassCard from '../../components/glasses/GlassCard'
import GlassButton from '../../components/glasses/GlassButton'
import Modal from '../../components/common/Modal'
import { useCategories } from '../../hooks/queries/useCategoryQueries'
import { useCreateCategory, useDeleteCategory, useUpdateCategory } from '../../hooks/queries/useCategoryMutations'

export default function AdminCategoriesPage() {
    const { data, isLoading, isError } = useCategories()
    const { mutate: createCategory, isLoading: creating } = useCreateCategory()
    const { mutate: deleteCategory } = useDeleteCategory()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [image, setImage] = useState(null)
    const [editingId, setEditingId] = useState(null)

    const { mutate: updateCategory, isLoading: updating } = useUpdateCategory()

    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        const form = new FormData()
        form.append('name', name)
        form.append('description', description)
        if (image) form.append('image', image)

        if (editingId) {
            updateCategory({ id: editingId, formData: form })
        } else {
            createCategory(form)
        }

        // reset form and exit edit mode
        setName('')
        setDescription('')
        setImage(null)
        setEditingId(null)
        setIsModalOpen(false)
    }

    const handleEdit = (cat) => {
        setEditingId(cat.id)
        setName(cat.name || '')
        setDescription(cat.description || '')
        setImage(null)
        setIsModalOpen(true)
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setName('')
        setDescription('')
        setImage(null)
    }

    const handleDelete = (id) => {
        if (window.confirm('Delete this category?')) deleteCategory(id)
    }

    if (isLoading) return <div className="p-8 text-center">Loading categories...</div>
    if (isError) return <div className="p-8 text-red-500">Error loading categories</div>

    return (
        <div className="container mx-auto px-4 py-8 text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Categories</h1>
                <GlassButton onClick={() => { setEditingId(null); setName(''); setDescription(''); setImage(null); setIsModalOpen(true) }} className="px-4 py-2">+ Create Category</GlassButton>
            </div>

            <Modal open={isModalOpen} title={editingId ? 'Edit Category' : 'Create Category'} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                    <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="w-full p-2 rounded bg-slate-800" />
                    <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="w-full p-2 rounded bg-slate-800" />
                    <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => { handleCancelEdit(); setIsModalOpen(false) }} className="px-4 py-2 rounded bg-gray-700">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-blue-600">{editingId ? (updating ? 'Updating...' : 'Update') : (creating ? 'Creating...' : 'Create')}</button>
                    </div>
                </form>
            </Modal>

            <GlassCard>
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left">Name</th>
                            <th className="px-6 py-3 text-left">Slug</th>
                            <th className="px-6 py-3 text-left">Products</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    {data?.data?.map((cat) => (
                        <tr key={cat.id} className="border-b border-gray-700 hover:bg-white/5">
                            <td className="px-6 py-4">{cat.name}</td>
                            <td className="px-6 py-4">{cat.slug}</td>
                            <td className="px-6 py-4">{cat._count?.products || 0}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleEdit(cat)} className="px-3 py-1 mr-3 rounded bg-blue-600/20 text-blue-400">Edit</button>
                                    <button onClick={() => handleDelete(cat.id)} className="px-3 py-1 rounded bg-red-600/20 text-red-400">Delete</button>
                                </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    )
}
