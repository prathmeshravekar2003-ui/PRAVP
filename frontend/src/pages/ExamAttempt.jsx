import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAntiCheat } from '../hooks/useAntiCheat';
import QuestionCard from '../components/QuestionCard';
import { ChevronLeft, ChevronRight, Send, Timer, AlertCircle, Loader2 } from 'lucide-react';

const ExamAttempt = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [examSession, setExamSession] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const [securityChances, setSecurityChances] = useState(3);
    const [showSecurityOverlay, setShowSecurityOverlay] = useState(false);
    const [violationType, setViolationType] = useState('');
    const timerRef = useRef(null);
    const lastViolationRef = useRef(0);

    // Initialize Anti-cheat
    const { warnings } = useAntiCheat(examId, !loading);

    const startAttemptRef = useRef(false);

    useEffect(() => {
        if (startAttemptRef.current) return;
        startAttemptRef.current = true;
        
        const startExam = async () => {
            try {
                const sessionRes = await api.post(`/exam/start/${examId}`);
                const sessionData = sessionRes.data;
                setExamSession(sessionData);

                const questionsRes = await api.get(`/exam/${examId}/questions`);
                setQuestions(questionsRes.data);

                // Calculate initial time left
                const endTime = new Date(sessionData.endTime).getTime();
                const now = new Date().getTime();
                setTimeLeft(Math.max(0, Math.floor((endTime - now) / 1000)));

                setLoading(false);
            } catch (err) {
                console.error('Failed to start exam ERROR OBJECT:', err);
                const errorMessage = typeof err === 'string' ? err : err.message || JSON.stringify(err) || 'Unknown error occurred';
                alert('Could not start exam. Error: ' + errorMessage);
                navigate('/exams');
            }
        };
        startExam();
    }, [examId, navigate]);

    useEffect(() => {
        if (loading) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [loading]);

    // Full-screen control
    const enterFullScreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        }
    };

    useEffect(() => {
        if (!loading && examSession) {
            enterFullScreen();
        }
    }, [loading, examSession]);

    // Security Violation Handler
    const handleViolation = (type) => {
        if (loading || !examSession) return;

        const now = Date.now();
        // Prevent multiple deductions for the same event (e.g. blur + visibilitychange)
        if (now - lastViolationRef.current < 2000) return;
        lastViolationRef.current = now;

        setSecurityChances(prev => {
            const newChances = prev - 1;
            if (newChances <= 0) {
                handleSubmit(true); // Auto-submit on zero chances
                return 0;
            }
            setViolationType(type);
            setShowSecurityOverlay(true);
            return newChances;
        });
    };

    useEffect(() => {
        if (loading) return;

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                handleViolation('FULLSCREEN_EXIT');
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleViolation('TAB_SWITCH');
            }
        };

        const handleBlur = () => {
            handleViolation('WINDOW_BLUR');
        };

        // Anti-Copy Security
        const handleContextMenu = (e) => e.preventDefault();
        const handleCopy = (e) => {
            e.preventDefault();
            handleViolation('COPY_ATTEMPT');
        };
        const handleKeyDown = (e) => {
            // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+U, Ctrl+Shift+I, F12
            if (
                (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'u')) ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                e.key === 'F12'
            ) {
                e.preventDefault();
                handleViolation('FORBIDDEN_KEY');
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [loading, examSession, showSecurityOverlay]);

    const handleResumeExam = () => {
        enterFullScreen();
        setShowSecurityOverlay(false);
    };

    const handleSaveAnswer = async (value) => {
        const question = questions[currentIndex];
        const questionId = question.id;
        
        setAnswers(prev => ({ ...prev, [questionId]: value }));

        try {
            const payload = {
                studentExamId: examSession.studentExamId,
                questionId: questionId
            };

            if (question.type === 'CODE') {
                payload.codeAnswer = value;
            } else {
                payload.selectedOptionIndex = value;
            }

            await api.post('/exam/save-answer', payload);
        } catch (err) {
            console.error('Failed to auto-save answer', err);
        }
    };

    const handleSubmit = async (isAuto = false) => {
        if (!isAuto && !window.confirm('Are you sure you want to submit the exam?')) return;

        setLoading(true);
        try {
            await api.post(`/exam/submit/${examSession.studentExamId}`);
            navigate('/results');
        } catch (err) {
            console.error('Submission failed', err);
            alert('Submission failed. Please try again.');
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (loading && !examSession) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Initializing secure exam session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 select-none no-copy" style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>
            {/* Exam Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-4 md:px-8">
                <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <Timer size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Time Remaining</p>
                            <p className={`text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                                {formatTime(timeLeft)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${securityChances <= 1 ? 'bg-red-100 text-red-800 border-red-200' : 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                            <span>Security Chances: {securityChances}</span>
                        </div>
                        {warnings > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold border border-yellow-200">
                                <AlertCircle size={16} />
                                <span>Alerts ({warnings})</span>
                            </div>
                        )}
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={loading}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 ${loading ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Send size={18} />}
                            {loading ? 'Submitting...' : 'Submit Exam'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3">
                    {questions.length > 0 && (
                        <QuestionCard
                            question={questions[currentIndex]}
                            answer={answers[questions[currentIndex].id]}
                            onAnswer={handleSaveAnswer}
                        />
                    )}

                    {/* Navigation Controls */}
                    <div className="mt-8 flex justify-between items-center">
                        <button
                            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all"
                        >
                            <ChevronLeft size={20} />
                            Previous
                        </button>
                        <span className="text-sm font-bold text-gray-500">
                            Question {currentIndex + 1} of {questions.length}
                        </span>
                        <button
                            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            disabled={currentIndex === questions.length - 1}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all"
                        >
                            Next
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Sidebar Mini-Map */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Question Map</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {questions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold border-2 transition-all ${currentIndex === idx
                                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                                        : answers[q.id] !== undefined
                                            ? 'border-green-200 bg-green-50 text-green-600'
                                            : 'border-gray-100 text-gray-400 hover:border-gray-200'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <div className="w-3 h-3 rounded bg-green-50 border border-green-200" />
                                <span>Answered</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <div className="w-3 h-3 rounded bg-blue-50 border border-blue-600" />
                                <span>Current</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <div className="w-3 h-3 rounded bg-white border border-gray-100" />
                                <span>Unvisited</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Violation Overlay */}
            {showSecurityOverlay && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/90 backdrop-blur-md p-6">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-3">Security Violation</h2>
                        <div className="text-gray-500 mb-8 leading-relaxed">
                            {violationType === 'TAB_SWITCH' && (
                                <p>You attempted to switch tabs. This is strictly prohibited.</p>
                            )}
                            {violationType === 'WINDOW_BLUR' && (
                                <p>You lost focus on the exam window. This is tracked as a violation.</p>
                            )}
                            {violationType === 'FULLSCREEN_EXIT' && (
                                <p>Full-screen mode is mandatory for this exam. Do not exit it.</p>
                            )}
                            {violationType === 'COPY_ATTEMPT' && (
                                <p>Copying content is strictly prohibited during the exam.</p>
                            )}
                            {violationType === 'FORBIDDEN_KEY' && (
                                <p>This keyboard shortcut is disabled for security reasons.</p>
                            )}
                            <div className="mt-4 font-bold text-red-600 p-3 bg-red-50 rounded-xl inline-block">
                                Remaining Chances: {securityChances}
                            </div>
                        </div>

                        <button
                            onClick={handleResumeExam}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 transition-all active:scale-95"
                        >
                            Return to Exam
                        </button>

                        <p className="mt-6 text-xs text-gray-400 font-medium uppercase tracking-widest">
                            {securityChances === 1 ? 'Final Warning: Next violation results in failure' : 'Continuous violations will lead to automatic submission'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamAttempt;
