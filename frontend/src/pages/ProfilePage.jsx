import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    useAddresses,
    useCreateAddress,
    useUpdateAddress,
    useDeleteAddress,
    useSetDefaultAddress
} from '../hooks/queries/useAddressMutation';
import GlassCard from '../components/glasses/GlassCard';
import GlassButton from '../components/glasses/GlassButton';

const emptyAddress = {
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Myanmar'
};

function AddressForm({ form, onChange, onSubmit, onCancel, isPending, submitLabel }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        const { fullName, phone, addressLine, city, state, country } = form;
        if (!fullName || !phone || !addressLine || !city || !state || !country) {
            alert('Please fill in all required fields');
            return;
        }
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
                    <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={onChange}
                        className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Phone *</label>
                    <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={onChange}
                        className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Address *</label>
                    <input
                        type="text"
                        name="addressLine"
                        value={form.addressLine}
                        onChange={onChange}
                        className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">City *</label>
                    <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={onChange}
                        className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">State / Region *</label>
                    <input
                        type="text"
                        name="state"
                        value={form.state}
                        onChange={onChange}
                        className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Zip Code</label>
                    <input
                        type="text"
                        name="zipCode"
                        value={form.zipCode}
                        onChange={onChange}
                        className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Country *</label>
                    <input
                        type="text"
                        name="country"
                        value={form.country}
                        onChange={onChange}
                        className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
            </div>
            <div className="flex gap-3 pt-2">
                <GlassButton type="submit" disabled={isPending} className="px-6 py-2">
                    {isPending ? 'Saving...' : submitLabel}
                </GlassButton>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-400 hover:text-white px-4 py-2"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const { data: addressData, isLoading } = useAddresses();
    const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
    const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();
    const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();
    const { mutate: setDefault, isPending: isSettingDefault } = useSetDefaultAddress();

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(emptyAddress);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newForm, setNewForm] = useState({ ...emptyAddress });

    const addresses = addressData?.data || [];

    // ─── Edit handlers ───
    const startEditing = (addr) => {
        setEditingId(addr.id);
        setEditForm({
            fullName: addr.fullName,
            phone: addr.phone,
            addressLine: addr.addressLine,
            city: addr.city,
            state: addr.state,
            zipCode: addr.zipCode || '',
            country: addr.country
        });
        setShowAddForm(false);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm(emptyAddress);
    };

    const handleEditChange = (e) => {
        setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEditSubmit = () => {
        updateAddress(
            { id: editingId, ...editForm },
            {
                onSuccess: () => cancelEditing(),
                onError: (err) => alert(err.response?.data?.message || 'Failed to update address')
            }
        );
    };

    // ─── Add handlers ───
    const handleNewChange = (e) => {
        setNewForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNewSubmit = () => {
        createAddress(newForm, {
            onSuccess: () => {
                setShowAddForm(false);
                setNewForm({ ...emptyAddress });
            },
            onError: (err) => alert(err.response?.data?.message || 'Failed to create address')
        });
    };

    // ─── Delete handler ───
    const handleDelete = (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        deleteAddress(id, {
            onError: (err) => alert(err.response?.data?.message || 'Failed to delete address')
        });
    };

    // ─── Set default handler ───
    const handleSetDefault = (id) => {
        setDefault(id, {
            onError: (err) => alert(err.response?.data?.message || 'Failed to set default address')
        });
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <h1 className="text-2xl font-bold text-white">My Profile</h1>

            {/* User Info */}
            {user && (
                <GlassCard>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-2xl font-bold text-blue-400">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
                            <p className="text-gray-400">{user.email}</p>
                            {user.phone && <p className="text-gray-400 text-sm">{user.phone}</p>}
                        </div>
                    </div>
                </GlassCard>
            )}

            {user?.role === "ADMIN" && (
                <GlassCard>
                    <Link to="/admin/dashboard" className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-chart-diagram text-xl text-blue-400"></i>
                            <div>
                            <h2 className="text-lg font-bold">Admin Dashboard</h2>
                                <p className="text-sm text-gray-400">View your product details</p>
                            </div>
                        </div>
                        <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-white transition-colors"></i>
                    </Link>
                </GlassCard>
            )}

            {/* My Orders Link */}
            <GlassCard>
                <Link to="/orders" className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <i className="fa-solid fa-box text-xl text-blue-400"></i>
                        <div>
                            <h2 className="text-lg font-bold">My Orders</h2>
                            <p className="text-sm text-gray-400">View your order history</p>
                        </div>
                    </div>
                    <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-white transition-colors"></i>
                </Link>
            </GlassCard>

            {/* Addresses Section */}
            <GlassCard>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <i className="fa-solid fa-location-dot text-xl text-blue-400"></i>
                        <h2 className="text-lg font-bold">My Addresses</h2>
                    </div>
                    {!showAddForm && (
                        <GlassButton
                            onClick={() => { setShowAddForm(true); cancelEditing(); }}
                            className="px-4 py-2 text-sm"
                        >
                            <i className="fa-solid fa-plus me-1"></i> Add Address
                        </GlassButton>
                    )}
                </div>

                {isLoading ? (
                    <p className="text-gray-400 text-center py-4">Loading addresses...</p>
                ) : addresses.length === 0 && !showAddForm ? (
                    <div className="text-center py-8">
                        <i className="fa-solid fa-map-location-dot text-5xl text-gray-500 mb-4"></i>
                        <p className="text-gray-400 mb-4">No saved addresses yet</p>
                        <GlassButton onClick={() => setShowAddForm(true)} className="px-6 py-2 mx-auto">
                            <i className="fa-solid fa-plus me-1"></i> Add Your First Address
                        </GlassButton>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.map((addr) => (
                            <div
                                key={addr.id}
                                className={`p-4 border rounded-lg ${
                                    editingId === addr.id
                                        ? 'border-blue-500 bg-blue-500/5'
                                        : 'border-gray-600'
                                } ${
                                    addr.isDefault && 'border-blue-400!'
                                }`}
                            >
                                {editingId === addr.id ? (
                                    /* ─── Inline Edit Mode ─── */
                                    <div>
                                        <h3 className="text-sm font-semibold text-blue-400 mb-3">Editing Address</h3>
                                        <AddressForm
                                            form={editForm}
                                            onChange={handleEditChange}
                                            onSubmit={handleEditSubmit}
                                            onCancel={cancelEditing}
                                            isPending={isUpdating}
                                            submitLabel="Save Changes"
                                        />
                                    </div>
                                ) : (
                                    /* ─── View Mode ─── */
                                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold">{addr.fullName}</span>
                                                {addr.isDefault && (
                                                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400">{addr.phone}</p>
                                            <p className="text-sm text-gray-300 mt-1">
                                                {addr.addressLine}, {addr.city}, {addr.state}
                                                {addr.zipCode && `, ${addr.zipCode}`}, {addr.country}
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2 shrink-0">
                                            {!addr.isDefault && (
                                                <button
                                                    onClick={() => handleSetDefault(addr.id)}
                                                    disabled={isSettingDefault}
                                                    className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 border border-blue-500/30 rounded"
                                                >
                                                    Set Default
                                                </button>
                                            )}
                                            <button
                                                onClick={() => startEditing(addr)}
                                                className="text-xs text-yellow-400 hover:text-yellow-300 px-2 py-1 border border-yellow-500/30 rounded"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(addr.id)}
                                                disabled={isDeleting}
                                                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 border border-red-500/30 rounded"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Add New Address Form */}
                {showAddForm && (
                    <div className="mt-4 p-4 border border-green-500/30 rounded-lg bg-green-500/5">
                        <h3 className="text-sm font-semibold text-green-400 mb-3">New Address</h3>
                        <AddressForm
                            form={newForm}
                            onChange={handleNewChange}
                            onSubmit={handleNewSubmit}
                            onCancel={() => { setShowAddForm(false); setNewForm({ ...emptyAddress }); }}
                            isPending={isCreating}
                            submitLabel="Save Address"
                        />
                    </div>
                )}
            </GlassCard>

            <GlassButton
                onClick={logout}
                className="px-8 py-2 text-red-400! float-right"
            >
                Logout
            </GlassButton>
        </div>
    );
}