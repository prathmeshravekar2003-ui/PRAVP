import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LogOut,
    User,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    Menu,
    X,
    Info,
    Home as HomeIcon,
    Phone,
    Zap
} from 'lucide-react';

const Navbar = ({ onMenuClick, isDashboard }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Close dropdowns on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
    }, [location]);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled || user
            ? 'glass py-3 shadow-lg'
            : 'bg-transparent py-5'
            }`}>
            <div className="container mx-auto px-6">
                <div className="flex items-center">
                    {/* Left: Logo Section */}
                    <div className="flex-1 flex justify-start items-center gap-4">
                        {isDashboard && (
                            <button
                                onClick={onMenuClick}
                                className="lg:hidden p-3 rounded-2xl bg-white/50 backdrop-blur-md border border-slate-200/50 text-slate-600 shadow-sm active:scale-90 transition-all"
                            >
                                <Menu size={24} />
                            </button>
                        )}
                        <Link to="/" className="flex items-center group">
                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-xl group-hover:scale-105 transition-all duration-500 p-2 overflow-hidden border border-white/50 animate-logo-pulse">
                                <img src="/thinkle.png" alt="Thinkle" className="w-full h-full object-contain" />
                            </div>
                        </Link>
                    </div>

                    {/* Center: Desktop Navigation */}
                    <div className="hidden md:flex flex-1 justify-center">
                        <div className="flex items-center gap-10 bg-slate-50/50 backdrop-blur-md px-8 py-3 ">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'About', path: '/about' },
                                { name: 'Features', path: '/features' },
                                { name: 'Contact', path: '/contact' }
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path.startsWith('/#') ? '/' : item.path}
                                    className={`nav-link-hover text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive(item.path)
                                        ? 'text-indigo-600'
                                        : 'text-slate-500 hover:text-indigo-600'
                                        }`}
                                    onClick={() => item.path.startsWith('/#') && window.scrollTo(0, 0)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right: User Actions / Auth Section */}
                    <div className="flex-1 flex justify-end items-center gap-6">
                        <div className="hidden md:flex items-center gap-6">
                            {user ? (
                                <div
                                    className="relative group/profile"
                                    onMouseEnter={() => setIsProfileOpen(true)}
                                    onMouseLeave={() => setIsProfileOpen(false)}
                                >
                                    <button className="flex items-center gap-3 p-1 pr-4 rounded-full bg-slate-50/50 border border-slate-200/50 hover:bg-white transition-all shadow-sm">
                                        <div className="w-9 h-9 rounded-full gradient-indigo flex items-center justify-center text-white font-black text-xs border-2 border-white shadow-md">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{user.name?.split(' ')[0]}</span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className={`absolute right-0 mt-4 w-72 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-premium border border-white/50 py-6 px-3 transition-all duration-300 origin-top-right animate-slide-down ${isProfileOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'
                                        }`}>
                                        <div className="px-6 py-4 mb-4 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Authenticated as</p>
                                            <p className="text-sm font-black text-slate-900 truncate">{user.email}</p>
                                        </div>

                                        <div className="space-y-1">
                                            {[
                                                { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
                                                { icon: User, label: 'My Profile', path: '/profile' },
                                                { icon: Settings, label: 'Account Settings', path: '/settings' }
                                            ].map((item) => (
                                                <Link
                                                    key={item.label}
                                                    to={item.path}
                                                    className="flex items-center gap-4 px-6 py-3.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all rounded-2xl font-bold text-sm group/item"
                                                >
                                                    <item.icon size={18} className="group-hover/item:scale-110 transition-transform" />
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-4 px-6 py-4 text-rose-600 hover:bg-rose-50/50 transition-all rounded-2xl font-black text-sm group/logout"
                                            >
                                                <LogOut size={18} className="group-hover/logout:-translate-x-1 transition-transform" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="text-[11px] font-black text-slate-900 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em] nav-link-hover">Login</Link>
                                    <Link to="/register" className="px-8 py-3.5 gradient-indigo rounded-2xl font-black text-[11px] shadow-xl shadow-indigo-200/50 hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em]">Register</Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button Section */}
                        <div className="md:hidden flex items-center">
                            {!isDashboard && (
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="p-3 rounded-2xl bg-white/50 backdrop-blur-md border border-slate-200/50 text-slate-600 shadow-sm active:scale-90 transition-all"
                                >
                                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Overhaul */}
            <div className={`md:hidden absolute top-full left-0 w-full bg-white/98 backdrop-blur-2xl border-b border-slate-100 overflow-hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-[80vh] py-8 px-6 opacity-100 shadow-2xl' : 'max-h-0 py-0 px-6 opacity-0'
                }`}>
                <div className="flex flex-col gap-2">
                    {[
                        { icon: HomeIcon, label: 'Home', path: '/' },
                        { icon: Info, label: 'About', path: '/about' },
                        { icon: Zap, label: 'Features', path: '/features' },
                        { icon: Phone, label: 'Contact', path: '/contact' }
                    ].map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className="flex items-center gap-5 text-slate-600 font-black py-4 px-6 hover:bg-slate-50 rounded-2xl transition-all"
                        >
                            <item.icon size={20} className="text-indigo-500" />
                            <span className="uppercase tracking-widest text-xs">{item.label}</span>
                        </Link>
                    ))}

                    {user ? (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-5 px-6 mb-8">
                                <div className="w-14 h-14 rounded-2xl gradient-indigo flex items-center justify-center text-white font-black text-xl shadow-lg">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-lg leading-tight">{user.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Link to="/dashboard" className="flex flex-col items-center gap-3 py-6 bg-slate-50 rounded-[2rem] text-slate-600 font-bold border border-slate-100">
                                    <LayoutDashboard size={24} className="text-indigo-500" />
                                    <span className="text-[10px] uppercase tracking-widest">Dashboard</span>
                                </Link>
                                <Link to="/profile" className="flex flex-col items-center gap-3 py-6 bg-slate-50 rounded-[2rem] text-slate-600 font-bold border border-slate-100">
                                    <User size={24} className="text-indigo-500" />
                                    <span className="text-[10px] uppercase tracking-widest">Profile</span>
                                </Link>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="mt-6 w-full flex items-center justify-center gap-4 py-5 bg-rose-50 text-rose-600 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 border border-rose-100"
                            >
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 mt-6">
                            <Link to="/login" className="w-full py-5 bg-slate-100 text-slate-900 rounded-[2rem] font-black text-center text-xs uppercase tracking-[0.2em] border border-slate-200">Login</Link>
                            <Link to="/register" className="w-full py-5 gradient-indigo rounded-[2rem] font-black text-center text-xs shadow-xl shadow-indigo-200 uppercase tracking-[0.2em]">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
