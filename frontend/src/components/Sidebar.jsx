import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    FileText,
    MonitorCheck,
    Settings,
    Users,
    ClipboardList,
    Users2,
    Shield,
    Activity,
    X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    const studentLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/exams', icon: <FileText size={20} />, label: 'Available Exams' },
        { to: '/results', icon: <ClipboardList size={20} />, label: 'My Results' },
    ];

    const instructorLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/create-exam', icon: <FileText size={20} />, label: 'Create Exam' },
        { to: '/manage-exams', icon: <Settings size={20} />, label: 'Manage Exams' },
        // { to: '/monitoring', icon: <MonitorCheck size={20} />, label: 'Monitoring' },
    ];

    const adminLinks = [
        // { to: '/monitoring', icon: <MonitorCheck size={20} />, label: 'System Monitoring' },
        { to: '/users', icon: <Users size={20} />, label: 'User Management' },
        { to: '/manage-batches', icon: <Users2 size={20} />, label: 'Manage Batches' },
    ];

    const links = user?.role === 'STUDENT' ? studentLinks : user?.role === 'INSTRUCTOR' ? instructorLinks : [...instructorLinks, ...adminLinks];

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside className={`fixed top-0 left-0 z-40 w-64 h-full pt-20 transition-transform duration-300 ease-in-out bg-white border-r border-slate-100 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="h-full px-4 py-6 overflow-y-auto bg-white flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-6 px-3 lg:hidden">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Navigation</p>
                            <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mb-6 px-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.to}>
                                        <NavLink
                                            to={link.to}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-200 group ${isActive
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                                                }`
                                            }
                                        >
                                            <span className="transition-transform group-hover:scale-110 duration-200">
                                                {link.icon}
                                            </span>
                                            <span>{link.label}</span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="px-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Account</p>
                            <NavLink
                                to="/profile"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-200 group ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                                    }`
                                }
                            >
                                <Settings size={20} className="group-hover:rotate-45 transition-transform" />
                                <span>Settings</span>
                            </NavLink>
                        </div>
                    </div>

                    <div className="mt-auto px-3">
                        <div className="p-4 rounded-[1.5rem] bg-indigo-50 border border-indigo-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm animate-pulse">
                                <Activity size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Proctor Status</p>
                                <p className="text-xs font-bold text-indigo-700">Active & Secure</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
