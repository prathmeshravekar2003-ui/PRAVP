import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Trophy, Target, AlertCircle, Calendar, ArrowLeft, X, Check, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResultPage = () => {
    const { user } = useAuth();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDetailedResult, setSelectedDetailedResult] = useState(null);
    const [detailedLoading, setDetailedLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await api.get(`/results/student/${user.email}`);
                // response is the ApiResponse wrapper { success, data: [...], message }
                const list = response?.data;
                setResults(Array.isArray(list) ? list : []);
            } catch (err) {
                console.error('Failed to fetch results', err);
                setError('Could not load your results. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        if (user?.email) fetchResults();
    }, [user]);

    const fetchDetailedResult = async (resultId) => {
        try {
            setDetailedLoading(true);
            const response = await api.get(`/results/detailed/${resultId}`);
            if (response.success) {
                setSelectedDetailedResult(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch detailed result', err);
            alert('Could not load detailed result.');
        } finally {
            setDetailedLoading(false);
        }
    };

    const formatDate = (dateVal) => {
        if (!dateVal) return 'N/A';
        try {
            // Handle both ISO string and LocalDateTime array from Java
            const date = Array.isArray(dateVal)
                ? new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0)
                : new Date(dateVal);
            return isNaN(date) ? 'N/A' : date.toLocaleDateString();
        } catch {
            return 'N/A';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
                    <p className="text-gray-500">Review your past performances and scores.</p>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {results.map((result, idx) => {
                    const pct = typeof result.percentage === 'number' ? result.percentage : 0;
                    const passed = pct >= 40;
                    const colorClass = pct >= 70 ? 'text-green-600' : pct >= 40 ? 'text-blue-600' : 'text-red-600';
                    const bgClass = pct >= 70 ? 'bg-green-50 text-green-600' : pct >= 40 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600';

                    return (
                        <div
                            key={result.id || idx}
                            onClick={() => fetchDetailedResult(result.id)}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-wrap items-center justify-between gap-8 transition-all hover:shadow-md hover:border-blue-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-6 min-w-[300px]">
                                <div className={`p-4 rounded-2xl ${bgClass}`}>
                                    <Trophy size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        Exam: {result.examTitle || (result.examId || '').substring(0, 12) + '...'}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            <span>{formatDate(result.submittedAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Target size={14} />
                                            <span>{result.score ?? 0} / {result.totalMarks ?? 0} Marks</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="text-center">
                                    <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-widest">Score</p>
                                    <p className={`text-4xl font-black ${colorClass}`}>
                                        {pct.toFixed(1)}%
                                    </p>
                                </div>

                                <div className="text-center min-w-[120px]">
                                    <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-widest">Status</p>
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm inline-block ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {passed ? 'PASSED' : 'FAILED'}
                                    </span>
                                </div>

                                <div className="hidden group-hover:flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 transition-all">
                                    <Eye size={20} />
                                </div>
                            </div>
                        </div>
                    );
                })}

                {results.length === 0 && !loading && !error && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Trophy size={48} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No exam results recorded yet.</p>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                )}
            </div>

            {/* Detailed Result Modal */}
            {selectedDetailedResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedDetailedResult.examTitle}</h2>
                                <p className="text-gray-500 font-medium">Detailed Performance Report</p>
                            </div>
                            <button
                                onClick={() => setSelectedDetailedResult(null)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
                                    <p className="text-blue-600 font-bold uppercase text-xs tracking-widest mb-1">Total Score</p>
                                    <p className="text-3xl font-black text-blue-900">{selectedDetailedResult.totalScore} / {selectedDetailedResult.totalMarks}</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
                                    <p className="text-indigo-600 font-bold uppercase text-xs tracking-widest mb-1">Percentage</p>
                                    <p className="text-3xl font-black text-indigo-900">
                                        {((selectedDetailedResult.totalScore / selectedDetailedResult.totalMarks) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
                                    <p className="text-emerald-600 font-bold uppercase text-xs tracking-widest mb-1">Accuracy</p>
                                    <p className="text-3xl font-black text-emerald-900">
                                        {Math.round((selectedDetailedResult.questions.filter(q => q.isCorrect).length / selectedDetailedResult.questions.length) * 100)}%
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Target size={20} className="text-blue-600" />
                                    Question Breakdown
                                </h3>
                                {selectedDetailedResult.questions.map((q, idx) => (
                                    <div key={idx} className={`p-6 rounded-2xl border ${q.isCorrect ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <div className="flex gap-4">
                                                <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${q.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {idx + 1}
                                                </span>
                                                <p className="text-lg font-semibold text-gray-900 pt-0.5">{q.questionText}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${q.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {q.isCorrect ? `+${q.marks} Marks` : '0 Marks'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-12">
                                            {q.options.map((opt, oIdx) => {
                                                const isSelected = q.selectedOptionIndex === oIdx;
                                                const isCorrect = q.correctOptionIndex === oIdx;

                                                let stateClass = "bg-white border-gray-200 text-gray-700";
                                                if (isCorrect) stateClass = "bg-green-100 border-green-300 text-green-800 font-bold";
                                                else if (isSelected && !isCorrect) stateClass = "bg-red-100 border-red-300 text-red-800 font-bold";

                                                return (
                                                    <div
                                                        key={oIdx}
                                                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${stateClass}`}
                                                    >
                                                        <span className="flex-1">{opt}</span>
                                                        {isCorrect && <Check size={16} className="text-green-600" />}
                                                        {isSelected && !isCorrect && <X size={16} className="text-red-600" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {q.selectedOptionIndex === null && (
                                            <p className="ml-12 mt-3 text-sm text-amber-600 font-medium italic">
                                                You did not answer this question.
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setSelectedDetailedResult(null)}
                                className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                            >
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {detailedLoading && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
                    <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-900 font-bold">Loading detailed report...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultPage;
