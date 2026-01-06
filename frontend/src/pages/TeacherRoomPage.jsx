import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Plus, ArrowLeft, FileText, Clock, MoreVertical, X } from 'lucide-react';
import Layout from '../components/Layout';

export default function TeacherRoomPage() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Explicit Create Assessment State
    const [isCreateAssessmentOpen, setIsCreateAssessmentOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: 'LIVE',
        duration_minutes: 30,
        time_per_question: 60
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchRoomAndAssessments();
    }, [roomId]);

    const fetchRoomAndAssessments = async () => {
        try {
            // Fetch room details
            const roomsRes = await api.get('/rooms/my');
            const foundRoom = roomsRes.data.find(r => r.id === parseInt(roomId));

            if (!foundRoom) {
                setError('Room not found or access denied.');
                setLoading(false);
                return;
            }
            setRoom(foundRoom);

            // Fetch assessments
            const assessmentsRes = await api.get(`/assessments/room/${roomId}`);
            setAssessments(assessmentsRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
            setError('Failed to load room details.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const payload = {
                room_id: parseInt(roomId),
                title: formData.title,
                type: formData.type,
                time_per_question: parseInt(formData.time_per_question)
            };

            await api.post('/assessments', payload);

            // Refresh list
            const assessmentsRes = await api.get(`/assessments/room/${roomId}`);
            setAssessments(assessmentsRes.data);

            // Close and reset
            setIsCreateAssessmentOpen(false);
            setFormData({ title: '', type: 'LIVE', duration_minutes: 30, time_per_question: 60 });
        } catch (err) {
            console.error("Create failed", err);
            alert("Failed to create assessment");
        } finally {
            setCreating(false);
        }
    };

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        </Layout>
    );

    if (error) return (
        <Layout>
            <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-200">
                {error}
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <Link to="/teacher" className="mt-1.5 text-slate-400 hover:text-slate-700 transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{room.name}</h1>
                            <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
                                <span>Code:</span>
                                <span className="font-mono font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700 select-all border border-slate-200">
                                    {room.code}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCreateAssessmentOpen(true)}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-all text-sm font-semibold"
                    >
                        <Plus size={18} /> New Assessment
                    </button>
                </div>

                {/* Assessments List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Assessments ({assessments.length})
                    </h2>

                    {assessments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                <Plus className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="font-medium text-slate-600">No assessments created</p>
                            <p className="text-sm mt-1">Get started by creating your first test.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {assessments.map(assessment => (
                                <div
                                    key={assessment.id}
                                    onClick={() => navigate(`/teacher/assessments/${assessment.id}`)}
                                    className="group bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                                                {assessment.title}
                                            </h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${assessment.status === 'LIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    assessment.status === 'DRAFT' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                                        'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                {assessment.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={14} />
                                                {new Date(assessment.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono text-slate-600">
                                                {assessment.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
                                        <ArrowLeft className="rotate-180" size={20} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Assessment Modal Overlay */}
            {isCreateAssessmentOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900">Create Assessment</h2>
                            <button
                                onClick={() => setIsCreateAssessmentOpen(false)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                    required
                                    placeholder="e.g. Midterm Examination"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['LIVE', 'HOMEWORK'].map((type) => (
                                        <label key={type} className={`
                                            flex items-center justify-center py-2.5 border rounded-lg cursor-pointer transition-all text-sm font-medium
                                            ${formData.type === type
                                                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }
                                        `}>
                                            <input
                                                type="radio"
                                                name="type"
                                                value={type}
                                                checked={formData.type === type}
                                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                                className="sr-only"
                                            />
                                            {type === 'LIVE' ? 'Live Test' : 'Homework'}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Mins</label>
                                    <input
                                        type="number"
                                        value={formData.duration_minutes}
                                        onChange={e => setFormData({ ...formData, duration_minutes: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Secs/Quest</label>
                                    <input
                                        type="number"
                                        value={formData.time_per_question}
                                        onChange={e => setFormData({ ...formData, time_per_question: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        min="5"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateAssessmentOpen(false)}
                                    className="flex-1 px-4 py-2.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-70 disabled:cursor-wait shadow-sm shadow-blue-200 transition-all"
                                >
                                    {creating ? 'Creating...' : 'Create Assessment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
