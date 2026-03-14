import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { Loader2, Trash2, Plus, Users2, UserPlus, UserMinus, X, Search, Check } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const ManageBatches = () => {
    const [batches, setBatches] = useState([]);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [newBatch, setNewBatch] = useState({ name: '', description: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [saving, setSaving] = useState(false);

    const stompClientRef = useRef(null);

    const fetchBatches = async () => {
        try {
            const res = await api.get('/batches');
            setBatches(res.data || []);
        } catch (err) {
            console.error('Failed to fetch batches', err);
        }
    };

    const fetchAvailableStudents = async () => {
        try {
            const res = await api.get('/users/available-students');
            setAvailableStudents(res.data || []);
        } catch (err) {
            console.error('Failed to fetch available students', err);
        }
    };

    const setupWebSocket = () => {
        const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/ws`);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to WebSocket');
                client.subscribe('/topic/available-students', (message) => {
                    console.log('Received student list update');
                    fetchAvailableStudents();
                    fetchBatches(); // Also refresh batches to see student count updates
                });
            },
            onStompError: (frame) => {
                console.error('STOMP error', frame);
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchBatches(), fetchAvailableStudents()]);
            setLoading(false);
        };
        init();
        const cleanup = setupWebSocket();
        return cleanup;
    }, []);

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/batches', newBatch);
            setNewBatch({ name: '', description: '' });
            setShowCreateModal(false);
            await fetchBatches();
        } catch (err) {
            alert('Failed to create batch: ' + (err.message || err));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteBatch = async (batchId) => {
        if (!window.confirm('Delete this batch? All students in this batch will be unassigned. Continue?')) return;
        try {
            await api.delete(`/batches/${batchId}`);
            setBatches(b => b.filter(batch => batch.id !== batchId));
            if (selectedBatch?.id === batchId) setSelectedBatch(null);
            fetchAvailableStudents();
        } catch (err) {
            alert('Failed to delete batch.');
        }
    };

    const handleAddStudent = async (email) => {
        if (!selectedBatch) return;
        try {
            const res = await api.post(`/batches/${selectedBatch.id}/students`, { email });
            setSelectedBatch(res.data);
            setBatches(b => b.map(batch => batch.id === res.data.id ? res.data : batch));
            // Available students will be refreshed via WebSocket
        } catch (err) {
            alert('Failed to add student: ' + (err.message || err));
        }
    };

    const handleRemoveStudent = async (email) => {
        try {
            const res = await api.delete(`/batches/${selectedBatch.id}/students/${encodeURIComponent(email)}`);
            setSelectedBatch(res.data);
            setBatches(b => b.map(batch => batch.id === res.data.id ? res.data : batch));
            // Available students will be refreshed via WebSocket
        } catch (err) {
            alert('Failed to remove student.');
        }
    };

    const filteredStudents = availableStudents.filter(s =>
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Batch Management</h1>
                    <p className="text-gray-500">Organize students into batches and manage their access.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                >
                    <Plus size={18} />
                    New Batch
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Batch List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <Users2 size={20} className="text-blue-600" />
                            Active Batches ({batches.length})
                        </h2>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <ul className="divide-y divide-gray-50">
                            {batches.length === 0 ? (
                                <li className="p-12 text-center">
                                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                        <Users2 className="text-gray-400" size={32} />
                                    </div>
                                    <p className="text-gray-500 font-medium">No batches found</p>
                                    <p className="text-sm text-gray-400">Create a batch to start adding students</p>
                                </li>
                            ) : batches.map(batch => (
                                <li
                                    key={batch.id}
                                    onClick={() => setSelectedBatch(batch)}
                                    className={`p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-blue-50/50 ${selectedBatch?.id === batch.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'}`}
                                >
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-900">{batch.name}</p>
                                        <p className="text-sm text-gray-500 line-clamp-1">{batch.description || 'No description provided'}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                                {(batch.studentEmails || []).length} Students
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteBatch(batch.id); }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Student Management Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px] overflow-hidden">
                    {selectedBatch ? (
                        <div className="flex flex-col h-full">
                            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <div>
                                    <h2 className="font-bold text-gray-800">
                                        Batch: <span className="text-blue-600">{selectedBatch.name}</span>
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">Manage student enrollment for this batch</p>
                                </div>
                                <button onClick={() => setSelectedBatch(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col overflow-hidden">
                                {/* Current Students Section */}
                                <div className="p-4 bg-blue-50/30 border-b border-blue-50">
                                    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 px-1">Enrolled Students</h3>
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                        {(selectedBatch.studentEmails || []).length === 0 ? (
                                            <p className="text-center py-4 text-sm text-gray-400 italic">No students enrolled yet</p>
                                        ) : (selectedBatch.studentEmails || []).map(email => (
                                            <div key={email} className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-blue-100 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                                        {email[0].toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{email}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveStudent(email)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove from batch"
                                                >
                                                    <UserMinus size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Add Students Section */}
                                <div className="flex-1 flex flex-col p-4 bg-gray-50/30">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Available Students</h3>

                                    <div className="relative mb-4">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="Search by name or email..."
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                                        />
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                        {filteredStudents.length === 0 ? (
                                            <div className="text-center py-8">
                                                <p className="text-sm text-gray-400">
                                                    {searchQuery ? 'No students match your search' : 'No available students found'}
                                                </p>
                                            </div>
                                        ) : filteredStudents.map(student => (
                                            <div
                                                key={student.id}
                                                className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-800 truncate">{student.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{student.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleAddStudent(student.email)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-bold text-xs hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                                                >
                                                    <UserPlus size={14} />
                                                    Add
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center p-12 text-center bg-gray-50/30">
                            <div>
                                <div className="p-6 bg-white rounded-3xl shadow-sm inline-block mb-6">
                                    <Users2 size={48} className="text-blue-100" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Select a Batch</h3>
                                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                    Choose a batch from the list on the left to manage student enrollment and view details.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Batch Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-600 text-white">
                            <h3 className="text-xl font-bold">New Batch</h3>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateBatch} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Batch Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newBatch.name}
                                    onChange={e => setNewBatch(b => ({ ...b, name: e.target.value }))}
                                    placeholder="e.g., Computer Science 2024"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={newBatch.description}
                                    onChange={e => setNewBatch(b => ({ ...b, description: e.target.value }))}
                                    placeholder="Brief details about this batch..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none transition-all"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="animate-spin" size={18} />
                                            <span>Creating...</span>
                                        </div>
                                    ) : 'Create Batch'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBatches;
