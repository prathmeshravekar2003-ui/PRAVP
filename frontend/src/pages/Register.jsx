import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Loader2, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register(formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 gradient-mesh selection:bg-indigo-100">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex items-center justify-center mb-8 group">
                    <div className="w-16 h-16 rounded-[2rem] bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform p-2 overflow-hidden border border-white">
                        <img src="/thinkle.png" alt="Thinkle" className="w-full h-full object-contain" />
                    </div>
                </Link>
                <h2 className="text-center text-4xl font-black text-slate-900 tracking-tight mb-2">Create Account</h2>
                <p className="text-center text-slate-500 font-medium mb-8">Join our elite institutional testing community</p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
                <div className="bg-white/80 backdrop-blur-xl py-10 px-8 shadow-premium border border-white rounded-[2.5rem]">
                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                            {error}
                        </div>
                    )}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-1.5 ml-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-900 shadow-inner"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-1.5 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-900 shadow-inner"
                                    placeholder="john@college.edu"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-1.5 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-900 shadow-inner"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-1.5 ml-1">Identify As</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <GraduationCap size={20} />
                                </div>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-900 shadow-inner appearance-none cursor-pointer"
                                >
                                    <option value="STUDENT">Student</option>
                                    {/* <option value="INSTRUCTOR">Instructor/Faculty</option> */}
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent rounded-2xl shadow-xl text-lg font-black text-white gradient-indigo hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 group"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        Sign Up
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm font-bold text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-black">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
