import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Search, Trash2, Shield, UserCheck, Loader2, AlertCircle } from 'lucide-react';

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    const fetchUsers = async (pageToFetch = 0, isLoadingMore = false) => {
        if (!isLoadingMore) setLoading(true);
        else setLoadingMore(true);

        try {
            const response = await api.get('/users', {
                params: { 
                    name: searchTerm,
                    page: pageToFetch,
                    size: pageSize
                }
            });
            
            const data = response.data;
            if (pageToFetch === 0) {
                setUsers(data.content);
            } else {
                setUsers(prev => [...prev, ...data.content]);
            }
            
            setTotalElements(data.totalElements);
            setHasMore(!data.last);
            setPage(pageToFetch);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchUsers(0);
    }, [searchTerm]);

    const handleLoadMore = () => {
        if (hasMore && !loadingMore) {
            fetchUsers(page + 1, true);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        setUpdating(userId);
        try {
            await api.patch(`/users/${userId}/role`, { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert('Failed to update role');
        } finally {
            setUpdating(null);
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage platform access, roles, and user accounts.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                        Showing {users.length} of {totalElements} users
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                <th className="px-6 py-4">User Details</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Registered On</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {users.map((u) => (
                                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{u.name}</p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-medium">
                                        {currentUser?.role === 'ADMIN' ? (
                                            <select
                                                value={u.role}
                                                disabled={updating === u.id || u.id === currentUser?.id}
                                                onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
                                                className="p-1.5 border border-gray-200 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                                            >
                                                <option value="STUDENT">Student</option>
                                                <option value="INSTRUCTOR">Instructor</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        ) : (
                                            <span className="bg-gray-100 px-2.5 py-1 rounded text-xs font-bold">{u.role}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {u.enabled ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {currentUser?.role === 'ADMIN' && u.id !== currentUser?.id && (
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {hasMore && (
                    <div className="p-6 border-t border-gray-100 flex justify-center">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            {loadingMore ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Loading...
                                </>
                            ) : (
                                'View More Users'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
