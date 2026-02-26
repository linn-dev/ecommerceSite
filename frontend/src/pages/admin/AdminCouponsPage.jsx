import { useState } from 'react';
import { useAllCoupons } from '../../hooks/queries/useCouponQueries';
import { useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '../../hooks/queries/useCouponMutation';
import GlassCard from '../../components/glasses/GlassCard';
import GlassButton from '../../components/glasses/GlassButton';

const EMPTY_FORM = {
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    isActive: true
};

function getCouponStatus(coupon) {
    if (!coupon.isActive) return { label: 'Inactive', color: 'bg-gray-500/20 text-gray-400' };
    const now = new Date();
    if (now > new Date(coupon.validUntil)) return { label: 'Expired', color: 'bg-red-500/20 text-red-400' };
    if (now < new Date(coupon.validFrom)) return { label: 'Scheduled', color: 'bg-yellow-500/20 text-yellow-400' };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { label: 'Used Up', color: 'bg-orange-500/20 text-orange-400' };
    return { label: 'Active', color: 'bg-green-500/20 text-green-400' };
}

function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().slice(0, 16);
}

export default function AdminCouponsPage() {
    const { data, isLoading, isError } = useAllCoupons();
    const { mutate: createCoupon, isPending: isCreating } = useCreateCoupon();
    const { mutate: updateCoupon, isPending: isUpdating } = useUpdateCoupon();
    const { mutate: deleteCoupon } = useDeleteCoupon();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');

    const coupons = data?.data || [];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCreate = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setFormError('');
        setShowForm(true);
    };

    const handleEdit = (coupon) => {
        setEditingId(coupon.id);
        setForm({
            code: coupon.code,
            description: coupon.description || '',
            discountType: coupon.discountType,
            discountValue: parseFloat(coupon.discountValue),
            minPurchase: coupon.minPurchase ? parseFloat(coupon.minPurchase) : '',
            maxDiscount: coupon.maxDiscount ? parseFloat(coupon.maxDiscount) : '',
            validFrom: formatDateForInput(coupon.validFrom),
            validUntil: formatDateForInput(coupon.validUntil),
            usageLimit: coupon.usageLimit || '',
            isActive: coupon.isActive
        });
        setFormError('');
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        setFormError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!form.code || !form.discountValue || !form.validFrom || !form.validUntil) {
            setFormError('Code, discount value, valid from, and valid until are required');
            return;
        }

        const payload = {
            code: form.code,
            description: form.description || null,
            discountType: form.discountType,
            discountValue: parseFloat(form.discountValue),
            minPurchase: form.minPurchase ? parseFloat(form.minPurchase) : null,
            maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
            validFrom: new Date(form.validFrom).toISOString(),
            validUntil: new Date(form.validUntil).toISOString(),
            usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
            ...(editingId && { isActive: form.isActive })
        };

        const options = {
            onSuccess: () => handleCancel(),
            onError: (error) => {
                setFormError(error.response?.data?.message || 'Something went wrong');
            }
        };

        if (editingId) {
            updateCoupon({ id: editingId, ...payload }, options);
        } else {
            createCoupon(payload, options);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            deleteCoupon(id);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-white text-center">Loading coupons...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-red-400 text-center">Failed to load coupons</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Coupon Management</h1>
                {!showForm && (
                    <GlassButton onClick={handleCreate} className="px-4 py-2">
                        + Create Coupon
                    </GlassButton>
                )}
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <GlassCard className="mb-6">
                    <h2 className="text-lg font-bold mb-4">
                        {editingId ? 'Edit Coupon' : 'Create New Coupon'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Code *</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={form.code}
                                    onChange={handleInputChange}
                                    placeholder="e.g. SAVE20"
                                    className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-slate-200 uppercase"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Discount Type *</label>
                                <div className="flex gap-4 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="discountType"
                                            value="PERCENTAGE"
                                            checked={form.discountType === 'PERCENTAGE'}
                                            onChange={handleInputChange}
                                        />
                                        <span>Percentage (%)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="discountType"
                                            value="FIXED"
                                            checked={form.discountType === 'FIXED'}
                                            onChange={handleInputChange}
                                        />
                                        <span>Fixed (MMK)</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">
                                    Discount Value * {form.discountType === 'PERCENTAGE' ? '(%)' : '(MMK)'}
                                </label>
                                <input
                                    type="number"
                                    name="discountValue"
                                    value={form.discountValue}
                                    onChange={handleInputChange}
                                    placeholder={form.discountType === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 5000'}
                                    min="0"
                                    max={form.discountType === 'PERCENTAGE' ? '100' : undefined}
                                    step="any"
                                    className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-slate-200"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm text-gray-400 mb-1">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={form.description}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Save 20% on your next order"
                                    className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-slate-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Min Purchase (MMK)</label>
                                <input
                                    type="number"
                                    name="minPurchase"
                                    value={form.minPurchase}
                                    onChange={handleInputChange}
                                    placeholder="Optional"
                                    min="0"
                                    step="any"
                                    className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-slate-200"
                                />
                            </div>
                            {form.discountType === 'PERCENTAGE' && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Max Discount (MMK)</label>
                                    <input
                                        type="number"
                                        name="maxDiscount"
                                        value={form.maxDiscount}
                                        onChange={handleInputChange}
                                        placeholder="Optional"
                                        min="0"
                                        step="any"
                                        className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-slate-200"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Usage Limit</label>
                                <input
                                    type="number"
                                    name="usageLimit"
                                    value={form.usageLimit}
                                    onChange={handleInputChange}
                                    placeholder="Unlimited"
                                    min="1"
                                    className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-slate-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Valid From *</label>
                                <input
                                    type="datetime-local"
                                    name="validFrom"
                                    value={form.validFrom}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-slate-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Valid Until *</label>
                                <input
                                    type="datetime-local"
                                    name="validUntil"
                                    value={form.validUntil}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-slate-200"
                                    required
                                />
                            </div>
                            {editingId && (
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={form.isActive}
                                            onChange={handleInputChange}
                                            className="w-4 h-4"
                                        />
                                        <span>Active</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        {formError && (
                            <p className="text-red-400 text-sm mt-3">
                                <i className="fa-solid fa-circle-exclamation me-1"></i>
                                {formError}
                            </p>
                        )}

                        <div className="flex gap-3 mt-4">
                            <GlassButton
                                type="submit"
                                disabled={isCreating || isUpdating}
                                className="px-4 py-2"
                            >
                                {isCreating || isUpdating
                                    ? 'Saving...'
                                    : editingId ? 'Update Coupon' : 'Create Coupon'
                                }
                            </GlassButton>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </GlassCard>
            )}

            {/* Coupons Table */}
            {coupons.length === 0 ? (
                <GlassCard>
                    <div className="text-center py-8 text-gray-400">
                        No coupons yet. Create your first coupon above.
                    </div>
                </GlassCard>
            ) : (
                <GlassCard className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-600">
                                <th className="text-left p-3">Code</th>
                                <th className="text-left p-3">Discount</th>
                                <th className="text-left p-3">Min Purchase</th>
                                <th className="text-left p-3">Valid Until</th>
                                <th className="text-left p-3">Usage</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon) => {
                                const status = getCouponStatus(coupon);
                                const isPercentage = coupon.discountType === 'PERCENTAGE';

                                return (
                                    <tr key={coupon.id} className="border-b border-gray-700 hover:bg-white/5">
                                        <td className="p-3">
                                            <code className="font-mono font-bold text-blue-400">{coupon.code}</code>
                                            {coupon.description && (
                                                <p className="text-xs text-gray-400 mt-1">{coupon.description}</p>
                                            )}
                                        </td>
                                        <td className="p-3 font-semibold">
                                            {isPercentage
                                                ? `${parseFloat(coupon.discountValue)}%`
                                                : `${parseFloat(coupon.discountValue).toLocaleString()} MMK`
                                            }
                                            {isPercentage && coupon.maxDiscount && (
                                                <p className="text-xs text-gray-400">
                                                    max {parseFloat(coupon.maxDiscount).toLocaleString()} MMK
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-3 text-gray-400">
                                            {coupon.minPurchase
                                                ? `${parseFloat(coupon.minPurchase).toLocaleString()} MMK`
                                                : '-'
                                            }
                                        </td>
                                        <td className="p-3 text-gray-400">
                                            {new Date(coupon.validUntil).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="p-3">
                                            {coupon.usedCount} / {coupon.usageLimit || '\u221E'}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(coupon)}
                                                    className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon.id)}
                                                    className="px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-500 hover:bg-red-500/30"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </GlassCard>
            )}
        </div>
    );
}
