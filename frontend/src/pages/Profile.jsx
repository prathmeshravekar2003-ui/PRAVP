import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
    User, 
    Mail, 
    Shield, 
    Calendar, 
    Save, 
    Loader2, 
    CheckCircle2, 
    AlertCircle,
    UserCircle
} from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await api.put('/users/profile', { name });
            setUser({ ...user, name: response.data.data.name });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-10 text-center md:text-left px-4">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">My Profile</h1>
                <p className="text-slate-500 font-medium">Manage your personal information and account security</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 p-8 text-center sticky top-24">
                        <div className="relative inline-block mb-6">
                            <div className="w-32 h-32 rounded-full gradient-indigo flex items-center justify-center border-4 border-white shadow-xl">
                                <span className="text-4xl font-black text-white uppercase">
                                    {user?.name?.charAt(0)}
                                </span>
                            </div>
                            <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-lg">
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{user?.name}</h2>
                        <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-6">{user?.role}</p>
                        
                        <div className="space-y-4 pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                                <Mail size={18} className="text-slate-400" />
                                <span className="truncate">{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                                <Shield size={18} className="text-slate-400" />
                                <span>Level: {user?.role === 'STUDENT' ? 'Authorized' : 'Elevated'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                                <Calendar size={18} className="text-slate-400" />
                                <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-premium border border-white p-10">
                        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <UserCircle size={24} className="text-indigo-600" />
                            Personal Information
                        </h3>

                        {message.text && (
                            <div className={`p-4 mb-8 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                <span className="font-bold text-sm">{message.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-black text-slate-700 mb-2 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <User size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-900 shadow-inner"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-widest text-[10px]">Email Address (Static)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                            <Mail size={20} />
                                        </div>
                                        <input
                                            type="email"
                                            disabled
                                            value={user?.email || ''}
                                            className="block w-full pl-12 pr-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 cursor-not-allowed font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-widest text-[10px]">User ID (Static)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                            <Shield size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            disabled
                                            value={user?.id || ''}
                                            className="block w-full pl-12 pr-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 cursor-not-allowed font-mono text-xs overflow-hidden"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || name === user?.name}
                                    className="flex items-center justify-center gap-3 px-8 py-4 gradient-indigo text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group w-full md:w-auto"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            Save Changes
                                            <Save size={20} className="group-hover:rotate-12 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="mt-8 p-6 rounded-[1.5rem] bg-indigo-50/50 border border-indigo-100/50 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                            <Shield size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-indigo-900 mb-1">Account Security</p>
                            <p className="text-xs font-medium text-indigo-700/80 leading-relaxed">
                                Your account is secured with institution-grade encryption. If you need to change your email or role, please contact the system administrator.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
