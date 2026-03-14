import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    Loader2, AlertTriangle, ShieldCheck, RefreshCw, X, 
    Users, AlertCircle, CheckCircle2, Flag, ArrowLeft, 
    Filter, Download, Search, Info, Target, Check
} from 'lucide-react';

const ExamAttempts = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [alertModal, setAlertModal] = useState(null); 
    const [alerts, setAlerts] = useState([]);
    const [loadingAlerts, setLoadingAlerts] = useState(false);

    const [reportModal, setReportModal] = useState(null);
    const [performanceReport, setPerformanceReport] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);

    const fetchData = async () => {
        try {
            const [examRes, attemptsRes] = await Promise.all([
                api.get(`/exams/${examId}`),
                api.get(`/instructor/attempts/exam/${examId}`)
            ]);
            setExam(examRes.data?.data || examRes.data);
            setAttempts(attemptsRes.data?.data || attemptsRes.data || []);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [examId]);

    const viewAlerts = async (attempt) => {
        setAlertModal(attempt);
        setLoadingAlerts(true);
        try {
            const res = await api.get(`/instructor/attempts/${attempt.studentId}/${examId}/alerts`);
            setAlerts(res.data?.data || res.data || []);
        } catch (err) {
            console.error('Failed to fetch alerts', err);
        } finally {
            setLoadingAlerts(false);
        }
    };

    const viewPerformanceReport = async (attempt) => {
        setReportModal(attempt);
        setLoadingReport(true);
        try {
            const res = await api.get(`/instructor/attempts/${attempt.id}/performance`);
            setPerformanceReport(res.data?.data || res.data);
        } catch (err) {
            console.error('Failed to fetch performance report', err);
            alert("Could not load performance report. Data may not be evaluated yet.");
        } finally {
            setLoadingReport(false);
        }
    };

    const handleAction = async (attemptId, action) => {
        if (action === 'reconduct') {
            const reason = prompt("Enter a reason for reconducting the exam:");
            if (!reason) return;
            try {
                await api.post(`/instructor/attempts/${attemptId}/reconduct`, { reason });
                alert("Exam Reconduct scheduled.");
                fetchData();
                setAlertModal(null);
            } catch (err) {
                console.error('Failed to reconduct', err);
                alert("Failed to reconduct exam.");
            }
        } else if (action === 'approve') {
            try {
                await api.post(`/instructor/attempts/${attemptId}/approve`);
                fetchData();
            } catch (err) {
                console.error("Failed to approve", err);
            }
        } else if (action === 'flag') {
            try {
                await api.post(`/instructor/attempts/${attemptId}/flag`);
                fetchData();
            } catch (err) {
                console.error("Failed to flag", err);
            }
        }
    };

    const stats = useMemo(() => {
        const total = attempts.length;
        const suspicious = attempts.filter(a => a.isSuspicious || a.alertCount > 5).length;
        const submitted = attempts.filter(a => ['SUBMITTED', 'AUTO_SUBMITTED'].includes(a.status)).length;
        const critical = attempts.filter(a => a.alertCount > 10).length;
        return { total, suspicious, submitted, critical };
    }, [attempts]);

    const filteredAttempts = attempts.filter(a =>
        a.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = async () => {
        try {
            const response = await api.get(`/instructor/attempts/exam/${examId}/export`, {
                responseType: 'blob'
            });

            // The 'api' interceptor already returns 'response.data', which is the Blob
            const url = window.URL.createObjectURL(new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `results_${examId}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to export data', err);
            alert("Could not export data. Please try again.");
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toUpperCase()) {
            case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
            case 'MEDIUM': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'LOW': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
            <p className="text-gray-500 font-medium">Fetching exam attempts...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="space-y-1">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="group flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 mb-2 transition-colors"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Exams
                    </button>
                    <h1 className="text-2xl font-black text-gray-900">Monitoring: <span className="text-blue-600 font-bold">{exam?.title}</span></h1>
                    <p className="text-gray-500 font-medium italic">Security Logs & Attempt Analysis</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                        >
                            <Download size={18} className="text-blue-600" />
                            Export Data
                        </button>
                    </div>
                    <button onClick={fetchData} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm">
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Users size={24} /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Attempts</p>
                        <p className="text-3xl font-black text-gray-900">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><CheckCircle2 size={24} /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Completed</p>
                        <p className="text-3xl font-black text-gray-900">{stats.submitted}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><AlertTriangle size={24} /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Suspicious</p>
                        <p className="text-3xl font-black text-gray-900">{stats.suspicious}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl"><ShieldCheck size={24} /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Critical Risks</p>
                        <p className="text-3xl font-black text-gray-900">{stats.critical}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search student by name or email..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600">
                            <Filter size={16} /> Filters
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/80 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Session Info</th>
                                <th className="px-6 py-4">Security Metrics</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredAttempts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <Info size={40} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500 font-medium">No attempts match your search.</p>
                                    </td>
                                </tr>
                            ) : filteredAttempts.map(attempt => (
                                <tr key={attempt.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                                                {attempt.studentName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{attempt.studentName}</p>
                                                <p className="text-[10px] text-gray-400 font-mono">{attempt.studentId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <RefreshCw size={14} className="text-gray-400" />
                                            <span>Started: {new Date(attempt.startTime).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors
                                                ${attempt.alertCount > 10 ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 
                                                  attempt.alertCount > 5 ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                                                  attempt.alertCount > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-400 border-gray-100'}
                                            `}>
                                                <AlertCircle size={14} />
                                                {attempt.alertCount} Alerts
                                            </div>
                                            {attempt.isSuspicious && (
                                                <span className="flex items-center gap-1 text-red-600 font-black text-[10px] uppercase tracking-tighter">
                                                    <Flag size={14} className="fill-red-600" /> Suspicious
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm
                                            ${attempt.status === 'SUBMITTED' || attempt.status === 'AUTO_SUBMITTED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {attempt.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => viewPerformanceReport(attempt)} 
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-1.5"
                                            >
                                                <Target size={14} />
                                                Report
                                            </button>
                                            <button 
                                                onClick={() => viewAlerts(attempt)} 
                                                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                                            >
                                                Details
                                            </button>
                                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                                <button onClick={() => handleAction(attempt.id, 'approve')} className="p-2 text-green-600 hover:bg-white rounded-lg transition-all" title="Approve"><CheckCircle2 size={18} /></button>
                                                <button onClick={() => handleAction(attempt.id, 'flag')} className="p-2 text-amber-600 hover:bg-white rounded-lg transition-all" title="Flag"><Flag size={18} /></button>
                                                <button onClick={() => handleAction(attempt.id, 'reconduct')} className="p-2 text-red-600 hover:bg-white rounded-lg transition-all" title="Reconduct"><RefreshCw size={18} /></button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Alert Viewer Modal */}
            {alertModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-100">
                        <div className="flex justify-between items-center p-6 border-b border-gray-50 bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Security Analysis: {alertModal.studentName}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{alertModal.studentId}</p>
                            </div>
                            <button onClick={() => setAlertModal(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} /></button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto flex-1 space-y-6">
                            {loadingAlerts ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Analyzing log data...</p>
                                </div>
                            ) : alerts.length === 0 ? (
                                <div className="text-center py-20 bg-green-50 rounded-3xl border border-dashed border-green-200">
                                    <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                                    <p className="text-green-700 font-bold text-lg">Clean Session</p>
                                    <p className="text-green-600/70">No suspicious behavior detected for this attempt.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Incident Log Timeline</h4>
                                    {alerts.map((alert, idx) => (
                                        <div key={idx} className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] ${getSeverityColor(alert.severity)}`}>
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center shrink-0">
                                                        <AlertCircle size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-base">{alert.eventType || alert.incidentType}</p>
                                                        <p className="text-[10px] font-bold opacity-70 mt-0.5">
                                                            {new Date(alert.eventTime || alert.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 bg-white/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    {alert.severity || 'LOW'}
                                                </span>
                                            </div>
                                            {alert.details && (
                                                <p className="mt-4 text-sm font-medium opacity-80 leading-relaxed border-t border-current/10 pt-3">
                                                    {alert.details}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-50 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 italic">
                                <Info size={14} /> Critical incidents highlighted in red require immediate review.
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={() => setAlertModal(null)} className="flex-1 px-6 py-3 text-sm font-bold bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-gray-50 transition-colors">Close</button>
                                <button 
                                    onClick={() => handleAction(alertModal.id, 'reconduct')} 
                                    className="flex-1 px-6 py-3 text-sm font-bold bg-red-600 text-white rounded-2xl shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-95"
                                >
                                    Reconduct Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Performance Report Modal */}
            {reportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
                        <div className="flex justify-between items-center p-6 border-b border-gray-50 bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Performance Report: {reportModal.studentName}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{reportModal.studentId}</p>
                            </div>
                            <button onClick={() => setReportModal(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} /></button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto flex-1">
                            {loadingReport ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Generating report...</p>
                                </div>
                            ) : !performanceReport ? (
                                <div className="text-center py-20 bg-amber-50 rounded-3xl border border-dashed border-amber-200">
                                    <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
                                    <p className="text-amber-700 font-bold text-lg">Report Unavailable</p>
                                    <p className="text-amber-600/70">Detailed data for this attempt could not be retrieved.</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
                                            <p className="text-blue-600 font-bold uppercase text-[10px] tracking-widest mb-1">Total Score</p>
                                            <p className="text-3xl font-black text-blue-900">{performanceReport.totalScore} / {performanceReport.totalMarks}</p>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
                                            <p className="text-indigo-600 font-bold uppercase text-[10px] tracking-widest mb-1">Percentage</p>
                                            <p className="text-3xl font-black text-indigo-900">
                                                {((performanceReport.totalScore / performanceReport.totalMarks) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
                                            <p className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest mb-1">Accuracy</p>
                                            <p className="text-3xl font-black text-emerald-900">
                                                {Math.round((performanceReport.questions.filter(q => q.isCorrect).length / performanceReport.questions.length) * 100)}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Question Breakdown */}
                                    <div className="space-y-6">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Target size={16} className="text-blue-600" />
                                            Attempt Analysis
                                        </h4>
                                        {performanceReport.questions.map((q, idx) => (
                                            <div key={idx} className={`p-6 rounded-2xl border transition-all ${q.isCorrect ? 'border-green-100 bg-green-50/20' : 'border-red-100 bg-red-50/20'}`}>
                                                <div className="flex justify-between items-start gap-4 mb-4">
                                                    <div className="flex gap-4">
                                                        <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${q.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {idx + 1}
                                                        </span>
                                                        <p className="text-lg font-bold text-gray-900 leading-snug">{q.questionText}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${q.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {q.isCorrect ? `+${q.marks} Marks` : '0 Marks'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-12">
                                                    {q.options.map((opt, oIdx) => {
                                                        const isSelected = q.selectedOptionIndex === oIdx;
                                                        const isCorrect = q.correctOptionIndex === oIdx;

                                                        let stateClass = "bg-white border-gray-100 text-gray-600";
                                                        if (isCorrect) stateClass = "bg-green-100/50 border-green-200 text-green-800 font-bold shadow-sm";
                                                        else if (isSelected && !isCorrect) stateClass = "bg-red-100/50 border-red-200 text-red-800 font-bold shadow-sm";

                                                        return (
                                                            <div
                                                                key={oIdx}
                                                                className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-sm ${stateClass}`}
                                                            >
                                                                <span className="flex-1">{opt}</span>
                                                                {isCorrect && <Check size={16} className="text-green-600" />}
                                                                {isSelected && !isCorrect && <X size={16} className="text-red-600" />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                {q.selectedOptionIndex === null && (
                                                    <p className="ml-12 mt-3 text-xs text-amber-600 font-bold italic">
                                                        Not Answered
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-50 bg-gray-50 flex justify-between items-center">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Info size={14} /> Correct answers are highlighted in Green.
                            </div>
                            <button onClick={() => setReportModal(null)} className="px-8 py-3 bg-gray-900 text-white rounded-2xl text-sm font-black hover:bg-gray-800 transition-colors shadow-xl shadow-gray-200">
                                Close Analysis
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamAttempts;
