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
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}!</h1>
                <p className="text-gray-500">Here's what's happening with your exams.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className={`${card.color} p-6 rounded-2xl border border-white shadow-sm transition-transform hover:scale-105`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                {card.icon}
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                        <div className="text-sm font-medium text-gray-500">{card.label}</div>
                    </div>
                ))}
            </div>

            {chartData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-6">Performance Trend</h3>
                        <div style={{ width: '100%', height: 256 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-6">Score Distribution</h3>
                        <div style={{ width: '100%', height: 256 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-dashed border-gray-200 text-center">
                    <p className="text-gray-400 font-medium">Complete an exam to see your performance charts.</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
