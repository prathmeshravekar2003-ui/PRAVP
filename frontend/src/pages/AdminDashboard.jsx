import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
    Users, AlertCircle, Activity, CheckCircle,
    Search, ShieldAlert, Monitor, ArrowUpRight, Trash2, RotateCcw
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { isAdmin } = useAuth();
    const [activeExams, setActiveExams] = useState([]);
    const [cheatingLogs, setCheatingLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedExamId, setSelectedExamId] = useState('ALL');
    const [examTitles, setExamTitles] = useState({});
    const [monitorStats, setMonitorStats] = useState({
        totalUsers: 0,
        activeSessions: 0,
        totalSuspiciousAlerts: 0,
        suspiciousRate: 0
    });

    const fetchData = async () => {
        try {
            // Fetch stats
            const statsRes = await api.get('/monitor/stats');
            setMonitorStats(statsRes.data);

            // Fetch active sessions
            const sessionsRes = await api.get('/monitor/exams');
            
            // Fetch all exams to get titles for lookup
            const allExamsRes = await api.get('/exams?size=100');
            const titlesMap = {};
            allExamsRes.data.content.forEach(ex => {
                titlesMap[ex.id] = ex.title;
            });
            setExamTitles(titlesMap);

            // Fetch cheating counts for active sessions
            const sessionsWithCounts = await Promise.all(sessionsRes.data.map(async (exam) => {
                try {
                    const countRes = await api.get(`/monitor/exam/${exam.examId}/student/${exam.studentId}/cheating-count`);
                    return { ...exam, cheatingCount: countRes.data };
                } catch (err) {
                    return { ...exam, cheatingCount: 0 };
                }
            }));
            setActiveExams(sessionsWithCounts);

            // Fetch logs
            let logsRes;
            if (selectedExamId === 'ALL') {
                logsRes = await api.get('/monitor/cheating/recent');
            } else {
                logsRes = await api.get(`/monitor/exam/${selectedExamId}/cheating`);
            }
            setCheatingLogs(logsRes.data);

        } catch (err) {
            console.error('Core monitoring fetch failed', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000); // More frequent updates for live monitoring
        return () => clearInterval(interval);
    }, [selectedExamId]);

    const handleReconduct = async (studentExamId) => {
        if (!window.confirm('Are you sure you want to Reconduct this exam? This will delete existing results and allow a fresh start.')) {
            return;
        }

        try {
            await api.post(`/instructor/attempts/${studentExamId}/reconduct`);
            alert('Exam reconduct initiated successfully');
            fetchData();
        } catch (err) {
            console.error('Reconduct failed', err);
            alert('Failed to initiate reconduct');
        }
    };

    const handleExport = () => {
        const headers = ["Time", "Event", "Student", "Exam", "Severity", "Details"];
        const csvData = cheatingLogs.map(log => [
            new Date(log.eventTime).toLocaleString(),
            log.eventType,
            log.studentId,
            examTitles[log.examId] || log.examId,
            log.severity,
            (log.details || '').replace(/,/g, ';')
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + csvData.map(e => e.join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `security_audit_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const statsCards = [
        { label: 'System Users', value: monitorStats.totalUsers, icon: <Users size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Sessions', value: monitorStats.activeSessions, icon: <Activity size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Security Alerts', value: monitorStats.totalSuspiciousAlerts, icon: <ShieldAlert size={20} />, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Risk Factor', value: `${(monitorStats.suspiciousRate * 100).toFixed(1)}%`, icon: <Activity size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    const getSeverityStyle = (severity) => {
        switch (severity) {
            case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
            case 'MEDIUM': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        {isAdmin ? 'Security Command Center' : 'Instructor Monitoring'}
                    </h1>
                    <p className="text-gray-500 font-medium">Real-time anti-cheat surveillance and system metrics.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleExport}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                        <ArrowUpRight size={16} />
                        Export Audit
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Filter sessions..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>
                                {s.icon}
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live</span>
                        </div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
                        <p className="text-3xl font-black text-gray-900">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Exam Sessions */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Monitor size={20} className="text-blue-500" />
                            Live Exam Surveillance
                        </h3>
                        <div className="flex gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse mt-1" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest hidden sm:inline">Active Monitoring</span>
                        </div>
                    </div>
                    
                    {/* Desktop View Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                                    <th className="px-6 py-4">Student Identity</th>
                                    <th className="px-6 py-4">Session Info</th>
                                    <th className="px-6 py-4">Security Status</th>
                                    <th className="px-6 py-4">Progress</th>
                                    <th className="px-6 py-4 text-center">Intervene</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {activeExams.map((exam, idx) => (
                                    <tr key={idx} className="group border-b border-gray-50 hover:bg-blue-50/30 transition-all">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{exam.studentId}</p>
                                            <p className="text-[10px] text-gray-400 font-mono">ID: {exam.id.substring(0, 8)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-700 truncate max-w-[150px]">{examTitles[exam.examId] || 'Unknown Exam'}</p>
                                            <p className="text-xs text-gray-400">{new Date(exam.startTime).toLocaleTimeString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                exam.cheatingCount > 10 ? 'bg-red-100 text-red-700 border-red-200' :
                                                exam.cheatingCount > 0 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                'bg-green-100 text-green-700 border-green-200'
                                            }`}>
                                                {exam.cheatingCount} Issues
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }} />
                                                </div>
                                                <span className="text-[10px] font-bold text-blue-600 uppercase">{exam.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleReconduct(exam.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Reconduct">
                                                    <RotateCcw size={18} />
                                                </button>
                                                <button onClick={() => setSelectedExamId(exam.examId)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                    <Monitor size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View Cards */}
                    <div className="lg:hidden p-4 space-y-4 bg-gray-50/30">
                        {activeExams.map((exam, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-black text-gray-900">{exam.studentId}</p>
                                        <p className="text-[10px] text-gray-400 font-mono">@{examTitles[exam.examId] || 'System'}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                        exam.cheatingCount > 10 ? 'bg-red-100 text-red-700 border-red-200' :
                                        exam.cheatingCount > 0 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                        'bg-green-100 text-green-700 border-green-200'
                                    }`}>
                                        {exam.cheatingCount} Issues
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-1">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }} />
                                        </div>
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{exam.status}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleReconduct(exam.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl shadow-sm active:scale-90 transition-all border border-red-100">
                                            <RotateCcw size={18} />
                                        </button>
                                        <button onClick={() => setSelectedExamId(exam.examId)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm active:scale-90 transition-all border border-blue-100">
                                            <Monitor size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {activeExams.length === 0 && (
                            <div className="py-12 text-center opacity-50">
                                <Activity className="text-gray-200 h-10 w-10 mx-auto mb-2" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-loose">No Active Sessions</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Suspicious Activity Feed */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[700px]">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <ShieldAlert size={20} className="text-red-500" />
                                Threat Feed
                            </h3>
                        </div>
                        <select 
                            value={selectedExamId}
                            onChange={(e) => setSelectedExamId(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                        >
                            <option value="ALL">ALL EXAMS (GLOBAL)</option>
                            {[...new Set(activeExams.map(ex => ex.examId))].map(id => (
                                <option key={id} value={id}>{examTitles[id] || id.substring(0, 12)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="p-4 flex-grow space-y-3 overflow-y-auto bg-gray-50/30">
                        {cheatingLogs.map((log, idx) => (
                            <div key={idx} className={`p-4 rounded-2xl border bg-white shadow-sm flex gap-3 transition-all hover:translate-x-1 ${
                                log.severity === 'HIGH' ? 'border-l-4 border-l-red-500' : 
                                log.severity === 'MEDIUM' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-blue-500'
                            }`}>
                                <div className={`p-2 rounded-lg h-fit ${
                                    log.severity === 'HIGH' ? 'bg-red-50 text-red-600' : 
                                    log.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                    <AlertCircle size={16} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex justify-between items-start mb-1 gap-2">
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight truncate">{log.eventType}</p>
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${getSeverityStyle(log.severity)}`}>
                                            {log.severity}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-blue-600 font-bold truncate mb-1">{log.studentId}</p>
                                    <p className="text-[10px] text-gray-500 font-medium mb-2 truncate">@{examTitles[log.examId] || 'System'}</p>
                                    
                                    {log.details && (
                                        <div className="p-2 bg-gray-50 rounded-lg text-[9px] text-gray-400 font-mono mb-2 break-all line-clamp-2 hover:line-clamp-none transition-all">
                                            {log.details}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-[9px] text-gray-400 font-bold">
                                        <span>{new Date(log.eventTime).toLocaleTimeString()}</span>
                                        <span>•</span>
                                        <span>{new Date(log.eventTime).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {cheatingLogs.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                <CheckCircle className="text-green-500 h-10 w-10 mb-2" />
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Alerts Detected</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
