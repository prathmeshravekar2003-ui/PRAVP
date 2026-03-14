import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Trophy, ArrowRight, BookOpen, Loader2, CheckCircle } from 'lucide-react';

const ExamList = () => {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [completedExamIds, setCompletedExamIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const examsRes = await api.get('/exams');
                setExams(examsRes.data.content);

                if (user?.email) {
                    const resultsRes = await api.get(`/results/student/${user.email}`);
                    const list = resultsRes.data?.data || resultsRes.data;
                    const completedIds = new Set(Array.isArray(list) ? list.map(r => r.examId) : []);
                    setCompletedExamIds(completedIds);
                }
            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Available Exams</h1>
                    <p className="text-gray-500">Pick an exam to start your assessment.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {exams.map((exam) => {
                    const isCompleted = completedExamIds.has(exam.id);
                    return (
                        <div key={exam.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 rounded-xl">
                                    <BookOpen size={24} className="text-blue-600" />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${exam.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {exam.status}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{exam.title}</h3>
                            <p className="text-sm text-gray-500 mb-6 line-clamp-2 h-10">{exam.description}</p>

                            <div className="space-y-3 mb-6 flex-grow">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock size={16} className="mr-2" />
                                    <span>{exam.duration} Minutes</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Trophy size={16} className="mr-2" />
                                    <span>{exam.totalMarks} Total Marks</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar size={16} className="mr-2" />
                                    <span>Starts: {new Date(exam.startTime).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/exam/attempt/${exam.id}`)}
                                disabled={exam.status !== 'PUBLISHED' || isCompleted}
                                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-colors
                                    ${isCompleted
                                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
                                    }`}
                            >
                                {isCompleted ? (
                                    <>
                                        Completed
                                        <CheckCircle size={18} />
                                    </>
                                ) : (
                                    <>
                                        Start Exam
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {exams.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No exams available at the moment.</p>
                </div>
            )}
        </div>
    );
};

export default ExamList;
