import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BookOpen, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalExams: 0,
        completedExams: 0,
        averageScore: 0,
        recentActivity: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const exams = await api.get('/exams');
                const results = await api.get(`/results/student/${user.email}`);

                // exams -> ApiResponse { data: Page { content: [...] } }
                // results -> ApiResponse { data: [...] }
                const examList = exams?.data?.content || exams?.data || [];
                const resultList = results?.data || [];

                setStats({
                    totalExams: examList.length,
                    completedExams: resultList.length,
                    averageScore: resultList.length > 0
                        ? resultList.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / resultList.length
                        : 0,
                    recentActivity: resultList.slice(0, 5)
                });
            } catch (err) {
                console.error('Failed to fetch dashboard stats', err);
            }
        };
        fetchStats();
    }, [user]);

    const cards = [
        { label: 'Total Exams', value: stats.totalExams, icon: <BookOpen className="text-blue-600" />, color: 'bg-blue-50' },
        { label: 'Completed', value: stats.completedExams, icon: <CheckCircle className="text-green-600" />, color: 'bg-green-50' },
        { label: 'Avg. Score', value: `${(stats.averageScore || 0).toFixed(1)}%`, icon: <Clock className="text-purple-600" />, color: 'bg-purple-50' },
        { label: 'Recent Alerts', value: 0, icon: <AlertTriangle className="text-yellow-600" />, color: 'bg-yellow-50' },
    ];

    const chartData = stats.recentActivity.map(act => ({
        name: (act.examId || '').substring(0, 8),
        score: act.score || 0
    }));

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Welcome, {user.name}!</h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Here's what's happening with your exams.</p>
                </div>
                <div className="hidden md:block px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Global Rank</p>
                    <p className="text-sm font-bold text-indigo-700">Top 12%</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {cards.map((card, i) => (
                    <div key={i} className={`${card.color} p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1`}>
                        <div className="flex items-center justify-between mb-2 md:mb-4">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                {React.cloneElement(card.icon, { size: 18, className: card.icon.props.className + " md:w-5 md:h-5" })}
                            </div>
                        </div>
                        <div className="text-xl md:text-3xl font-black text-gray-900">{card.value}</div>
                        <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">{card.label}</div>
                    </div>
                ))}
            </div>

            {chartData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base md:text-lg font-bold text-gray-900">Performance Trend</h3>
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Live Updates</span>
                        </div>
                        <div style={{ width: '100%', height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={4} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base md:text-lg font-bold text-gray-900">Score Distribution</h3>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Analytics</span>
                        </div>
                        <div style={{ width: '100%', height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-12 md:p-20 rounded-[2.5rem] shadow-sm border border-dashed border-gray-200 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="text-gray-300" size={32} />
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No Data Available Yet</p>
                    <p className="text-gray-500 mt-2">Complete an exam to see your performance charts.</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
