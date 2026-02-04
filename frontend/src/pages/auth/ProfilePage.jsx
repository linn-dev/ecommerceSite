import { useAuth } from '../context/AuthContext';

function ProfilePage() {
    const { user, logout } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold mb-6">My Profile</h1>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Name</label>
                        <p className="text-lg">{user.firstName} {user.lastName}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Email</label>
                        <p className="text-lg">{user.email}</p>
                    </div>

                    {user.phone && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Phone</label>
                            <p className="text-lg">{user.phone}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Role</label>
                        <p className="text-lg capitalize">{user.role.toLowerCase()}</p>
                    </div>

                    <button
                        onClick={logout}
                        className="mt-6 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;