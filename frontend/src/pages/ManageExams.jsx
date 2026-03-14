import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader2, Trash2, CheckCircle, Users2, ChevronDown } from 'lucide-react';

const ManageExams = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [batches, setBatches] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [selectedInstructorId, setSelectedInstructorId] = useState('');
    const [loading, setLoading] = useState(true);
    const [publishModal, setPublishModal] = useState(null); // exam being published
    const [selectedBatchIds, setSelectedBatchIds] = useState([]);

    const fetchExams = async () => {
        try {
            const examsRes = await api.get('/exams', {
                params: { instructorId: selectedInstructorId || undefined }
            });
            setExams(examsRes.data?.content || examsRes.data || []);
        } catch (err) {
            console.error('Failed to fetch exams', err);
        }
    };

    const fetchMetadata = async () => {
        try {
            const [batchesRes, instructorsRes] = await Promise.all([
                api.get('/batches'),
                api.get('/users/instructors').catch(() => ({ data: [] }))
            ]);
            setBatches(batchesRes.data || []);
            setInstructors(instructorsRes.data || []);
        } catch (err) {
            console.error('Failed to fetch metadata', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetadata();
    }, []);

    useEffect(() => {
        fetchExams();
    }, [selectedInstructorId]);

    const openPublishModal = (exam) => {
        setPublishModal(exam);
        setSelectedBatchIds(exam.batchIds || []);
    };

    const handlePublish = async () => {
        if (!publishModal) return;
        try {
            await api.put(`/exams/${publishModal.id}`, {
                title: publishModal.title,
                description: publishModal.description,
                duration: publishModal.duration,
                totalMarks: publishModal.totalMarks,
                startTime: publishModal.startTime,
                endTime: publishModal.endTime,
                status: 'PUBLISHED',
                batchIds: selectedBatchIds
            });
            setExams(exams.map(e =>
                e.id === publishModal.id
                    ? { ...e, status: 'PUBLISHED', batchIds: selectedBatchIds }
                    : e
            ));
            setPublishModal(null);
        } catch (err) {
            console.error('Failed to publish exam', err);
            alert('Failed to publish exam.');
        }
    };

    const handleDelete = async (examId) => {
        if (!window.confirm('Are you sure you want to delete this exam?')) return;
        try {
            await api.delete(`/exams/${examId}`);
            setExams(exams.filter(e => e.id !== examId));
        } catch (err) {
            console.error('Failed to delete exam', err);
            alert('Could not delete exam.');
        }
    };

    const toggleBatch = (batchId) => {
        setSelectedBatchIds(prev =>
            prev.includes(batchId)
                ? prev.filter(id => id !== batchId)
                : [...prev, batchId]
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Exams</h1>
                    <p className="text-gray-500">Publish exams and assign them to specific student batches.</p>
                </div>

                <div className="w-full md:w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Instructor</label>
                    <div className="relative">
                        <select
                            value={selectedInstructorId}
                            onChange={(e) => setSelectedInstructorId(e.target.value)}
                            className="w-full pl-3 pr-10 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-sm"
                        >
                            <option value="">All Instructors</option>
                            {instructors.map(instructor => (
                                <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 border-b">Exam Title</th>
                                <th className="px-6 py-4 border-b">Duration</th>
                                <th className="px-6 py-4 border-b">Marks</th>
                                <th className="px-6 py-4 border-b">Batches</th>
                                <th className="px-6 py-4 border-b">Status</th>
                                <th className="px-6 py-4 border-b text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">No exams found.</td>
                                </tr>
                            ) : exams.map((exam) => (
                                <tr key={exam.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{exam.title}</td>
                                    <td className="px-6 py-4">{exam.duration} min</td>
                                    <td className="px-6 py-4">{exam.totalMarks}</td>
                                    <td className="px-6 py-4">
                                        {(exam.batchIds || []).length === 0 ? (
                                            <span className="text-xs text-gray-400 italic">All students</span>
                                        ) : (
                                            <div className="flex flex-wrap gap-1">
                                                {(exam.batchIds || []).map(bid => {
                                                    const b = batches.find(b => b.id === bid);
                                                    return b ? (
                                                        <span key={bid} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                            {b.name}
                                                        </span>
                                                    ) : null;
                                                })}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${exam.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {exam.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/manage-exams/${exam.id}/attempts`)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium border border-blue-200"
                                            >
                                                <Users2 size={15} />
                                                View Attempts
                                            </button>
                                            <button
                                                onClick={() => openPublishModal(exam)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium border border-green-200"
                                            >
                                                <CheckCircle size={15} />
                                                {exam.status === 'PUBLISHED' ? 'Reassign' : 'Publish'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(exam.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Publish + Batch Selection Modal */}
            {publishModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Publish Exam</h3>
                        <p className="text-sm text-gray-500 mb-5">
                            Select which batches can see <span className="font-semibold text-gray-800">"{publishModal.title}"</span>.
                            Leave all unchecked for all students.
                        </p>

                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
                                <Users2 size={16} className="text-blue-600" />
                                Assign to Batches
                            </div>
                            <div className="space-y-2 max-h-52 overflow-y-auto border border-gray-200 rounded-xl p-3">
                                {batches.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-4">No batches available. Create batches first from Manage Batches.</p>
                                ) : batches.map(batch => (
                                    <label key={batch.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedBatchIds.includes(batch.id)}
                                            onChange={() => toggleBatch(batch.id)}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{batch.name}</p>
                                            <p className="text-xs text-gray-400">{(batch.studentEmails || []).length} student(s)</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {selectedBatchIds.length === 0 && (
                                <p className="text-xs text-amber-600 mt-2 font-medium">⚠ No batch selected — exam will be visible to all students.</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setPublishModal(null)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePublish}
                                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                            >
                                Publish Exam
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageExams;
