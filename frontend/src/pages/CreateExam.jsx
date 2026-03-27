import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Save, Trash2, Calendar, Clock, BookOpen, AlertCircle, Loader2, FileText, Upload, Users, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateExam = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [examData, setExamData] = useState({
        title: '',
        description: '',
        duration: 60,
        startTime: '',
        endTime: '',
        totalMarks: 0,
        status: 'DRAFT',
        batchIds: [],
        studentEmails: []
    });
    
    const [availableBatches, setAvailableBatches] = useState([]);
    const [studentsByBatch, setStudentsByBatch] = useState({}); // { batchId: [students] }
    const [fetchingBatches, setFetchingBatches] = useState(false);
    const [fetchingStudents, setFetchingStudents] = useState(false);

    const [questions, setQuestions] = useState([
        { questionText: '', options: ['', '', '', ''], correctAnswer: 0, marks: 5, difficultyLevel: 'MEDIUM' }
    ]);
    
    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setFetchingBatches(true);
        try {
            const response = await api.get('/batches');
            setAvailableBatches(response.data || []);
        } catch (err) {
            console.error('Failed to fetch batches:', err);
        } finally {
            setFetchingBatches(false);
        }
    };

    const fetchStudentsForBatch = async (batchId) => {
        if (studentsByBatch[batchId]) return; // Already fetched
        
        setFetchingStudents(true);
        try {
            const response = await api.get(`/batches/${batchId}/students`);
            setStudentsByBatch(prev => ({ ...prev, [batchId]: response.data || [] }));
        } catch (err) {
            console.error(`Failed to fetch students for batch ${batchId}:`, err);
        } finally {
            setFetchingStudents(false);
        }
    };

    const toggleBatch = (batchId) => {
        const isSelected = examData.batchIds.includes(batchId);
        let newBatchIds;
        if (isSelected) {
            newBatchIds = examData.batchIds.filter(id => id !== batchId);
            // Also clean up selected students from this batch
            const batchStudentEmails = (studentsByBatch[batchId] || []).map(s => s.email);
            const newStudentEmails = examData.studentEmails.filter(email => !batchStudentEmails.includes(email));
            setExamData(prev => ({ ...prev, batchIds: newBatchIds, studentEmails: newStudentEmails }));
        } else {
            newBatchIds = [...examData.batchIds, batchId];
            setExamData(prev => ({ ...prev, batchIds: newBatchIds }));
            fetchStudentsForBatch(batchId);
        }
    };

    const toggleStudent = (email) => {
        const isSelected = examData.studentEmails.includes(email);
        if (isSelected) {
            setExamData(prev => ({
                ...prev,
                studentEmails: prev.studentEmails.filter(e => e !== email)
            }));
        } else {
            setExamData(prev => ({
                ...prev,
                studentEmails: [...prev.studentEmails, email]
            }));
        }
    };

    const handlePdfUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setParsing(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/exams/parse-pdf', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data && response.data.length > 0) {
                // Map back correctOptionIndex to correctAnswer if needed (the model uses correctOptionIndex)
                const parsedQuestions = response.data.map(q => ({
                    ...q,
                    correctAnswer: q.correctOptionIndex !== undefined ? q.correctOptionIndex : 0
                }));

                setQuestions(parsedQuestions);

                // Estimate total marks
                const total = parsedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
                setExamData(prev => ({ ...prev, totalMarks: total }));

                alert(`Successfully parsed ${parsedQuestions.length} questions!`);
            } else {
                alert('Could not extract any questions from this PDF. Please try a different format.');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to parse PDF: ' + (err.message || 'Unknown error'));
        } finally {
            setParsing(false);
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Create Exam
            const examResponse = await api.post('/exams', examData);
            const examId = examResponse.data.id;

            // 2. Add Questions
            for (const q of questions) {
                await api.post('/questions', { ...q, examId });
            }

            alert('Exam and Questions created successfully!');
            navigate('/exams');
        } catch (err) {
            console.error(err);
            alert('Failed to create exam: ' + (err.message || 'Check inputs'));
        } finally {
            setLoading(false);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0, marks: 5, difficultyLevel: 'MEDIUM' }]);
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const updateOption = (qIdx, optIdx, value) => {
        const newQuestions = [...questions];
        newQuestions[qIdx].options[optIdx] = value;
        setQuestions(newQuestions);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Design New Exam</h1>
                    <p className="text-gray-500">Configure your exam settings and build your question bank.</p>
                </div>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-8 pb-20">
                {/* Exam Metadata */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Exam Title</label>
                        <input
                            type="text"
                            required
                            value={examData.title}
                            onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Advanced Java Assessment"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                            rows="3"
                            value={examData.description}
                            onChange={(e) => setExamData({ ...examData, description: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Specify instructions or topics covered..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Duration (Minutes)</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="number"
                                required
                                value={examData.duration}
                                onChange={(e) => setExamData({ ...examData, duration: parseInt(e.target.value) })}
                                className="w-full pl-10 p-3 border border-gray-200 rounded-xl outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Total Marks</label>
                        <div className="relative">
                            <BookOpen className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="number"
                                required
                                value={examData.totalMarks}
                                onChange={(e) => setExamData({ ...examData, totalMarks: parseInt(e.target.value) })}
                                className="w-full pl-10 p-3 border border-gray-200 rounded-xl outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                        <input
                            type="datetime-local"
                            required
                            value={examData.startTime}
                            onChange={(e) => setExamData({ ...examData, startTime: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                        <input
                            type="datetime-local"
                            required
                            value={examData.endTime}
                            onChange={(e) => setExamData({ ...examData, endTime: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                        />
                    </div>
                </div>

                {/* Batch and Student Selection */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <Users className="text-blue-600" size={24} />
                        <h3 className="text-lg font-bold text-gray-900">Batch & Student Assignment</h3>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700">Select Batches (Leave empty for all students)</label>
                        {fetchingBatches ? (
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Loader2 size={16} className="animate-spin" /> Loading batches...
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {availableBatches.map((batch) => (
                                    <button
                                        key={batch.id}
                                        type="button"
                                        onClick={() => toggleBatch(batch.id)}
                                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-sm font-medium ${examData.batchIds.includes(batch.id)
                                                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                                                : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-blue-200'
                                            }`}
                                    >
                                        {examData.batchIds.includes(batch.id) ? (
                                            <CheckSquare size={18} className="shrink-0" />
                                        ) : (
                                            <Square size={18} className="shrink-0" />
                                        )}
                                        <span className="truncate">{batch.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {examData.batchIds.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-gray-50">
                            <label className="block text-sm font-bold text-gray-700">
                                Specific Students (Optional - leave empty to select entire batch)
                            </label>
                            {fetchingStudents ? (
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <Loader2 size={16} className="animate-spin" /> Loading students...
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {examData.batchIds.map(batchId => {
                                        const batch = availableBatches.find(b => b.id === batchId);
                                        const students = studentsByBatch[batchId] || [];
                                        if (students.length === 0) return null;

                                        return (
                                            <div key={batchId} className="space-y-2">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{batch?.name}</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {students.map(student => (
                                                        <button
                                                            key={student.email}
                                                            type="button"
                                                            onClick={() => toggleStudent(student.email)}
                                                            className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-xs ${examData.studentEmails.includes(student.email)
                                                                    ? 'bg-green-50 border-green-200 text-green-700'
                                                                    : 'bg-white border-gray-100 text-gray-600 hover:border-green-200'
                                                                }`}
                                                        >
                                                            {examData.studentEmails.includes(student.email) ? (
                                                                <CheckSquare size={14} className="shrink-0" />
                                                            ) : (
                                                                <Square size={14} className="shrink-0" />
                                                            )}
                                                            <div className="text-left truncate">
                                                                <div className="font-bold">{student.name}</div>
                                                                <div className="text-[10px] opacity-70">{student.email}</div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* PDF Upload Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">AI Powered PDF Parsing</h3>
                                <p className="text-gray-600 text-sm">Upload a PDF to automatically extract questions and answers.</p>
                            </div>
                        </div>
                        <label className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold cursor-pointer transition-all ${parsing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                            }`}>
                            {parsing ? (
                                <><Loader2 size={18} className="animate-spin" /> Processing AI extraction...</>
                            ) : (
                                <><Upload size={18} /> Upload PDF & Generate</>
                            )}
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handlePdfUpload}
                                className="hidden"
                                disabled={parsing}
                            />
                        </label>
                    </div>
                </div>

                {/* Question Bank */}

                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">Question Bank</h3>
                    {questions.map((q, qIdx) => (
                        <div key={qIdx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative group">
                            <button
                                type="button"
                                onClick={() => removeQuestion(qIdx)}
                                className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={20} />
                            </button>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Question {qIdx + 1}</label>
                                <input
                                    type="text"
                                    required
                                    value={q.questionText}
                                    onChange={(e) => updateQuestion(qIdx, 'questionText', e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter question text..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="relative">
                                        <span className="absolute left-3 top-3.5 text-xs font-bold text-gray-400">{String.fromCharCode(65 + oIdx)}</span>
                                        <input
                                            type="text"
                                            required
                                            value={opt}
                                            onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                            className={`w-full pl-8 p-3 border rounded-xl outline-none ${q.correctAnswer === oIdx ? 'border-green-500 bg-green-50' : 'border-gray-200'
                                                }`}
                                            placeholder={`Option ${oIdx + 1}`}
                                        />
                                        <input
                                            type="radio"
                                            name={`correct-${qIdx}`}
                                            checked={q.correctAnswer === oIdx}
                                            onChange={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                                            className="absolute right-3 top-4 cursor-pointer"
                                            title="Mark as correct"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Marks</label>
                                    <input
                                        type="number"
                                        value={q.marks}
                                        onChange={(e) => updateQuestion(qIdx, 'marks', parseInt(e.target.value))}
                                        className="w-full p-2 border border-gray-200 rounded-lg outline-none"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Difficulty</label>
                                    <select
                                        value={q.difficultyLevel}
                                        onChange={(e) => updateQuestion(qIdx, 'difficultyLevel', e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded-lg outline-none"
                                    >
                                        <option value="EASY">Easy</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HARD">Hard</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-all font-bold"
                    >
                        <Plus size={20} />
                        Add Another Question
                    </button>
                </div>

                {/* Global Actions */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20 flex justify-center lg:pl-64">
                    <div className="w-full max-w-5xl flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/exams')}
                            className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 shrink-0"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:bg-blue-300 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            Save and Publish Exam
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateExam;
