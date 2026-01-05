import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, ArrowLeft, FileText } from 'lucide-react';

export default function TeacherRoomPage() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
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
            console.log(`Fetching assessments for room: ${roomId}`);
            const assessmentsRes = await api.get(`/assessments/room/${roomId}`);
            console.log("Assessments loaded:", assessmentsRes.data);
            setAssessments(assessmentsRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
            setError('Failed to load room details.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        console.log("Create Assessment clicked");
        setIsCreateAssessmentOpen(true);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting Create Assessment form:", formData);
        setCreating(true);
        try {
            const payload = {
                room_id: parseInt(roomId),
                title: formData.title,
                type: formData.type,
                time_per_question: parseInt(formData.time_per_question)
            };

            const res = await api.post('/assessments', payload);
            console.log("API Success:", res.data);

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

    if (loading) return <div className="p-8 text-center">Loading Room Details...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!room) return <div className="p-8 text-center">Room not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8 relative">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/teacher" className="text-gray-500 hover:text-gray-800">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
                        <p className="text-gray-500">
                            Code: <span className="font-mono bg-white px-2 py-1 rounded border shadow-sm select-all">{room.code}</span>
                        </p>
                    </div>
                    <div className="ml-auto">
                        <button
                            onClick={handleOpenCreate}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm transition"
                        >
                            <Plus size={20} /> Create Assessment
                        </button>
                    </div>
                </div>

                {/* Assessments List */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
                        <FileText className="text-blue-500" /> Assessments
                    </h2>

                    {assessments.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
                            <p className="mb-2">No assessments created yet.</p>
                            <p className="text-sm">Click "Create Assessment" to add a new test.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {assessments.map(assessment => (
                                <div
                                    key={assessment.id}
                                    onClick={() => {
                                        console.log("Navigating to assessment:", assessment.id);
                                        navigate(`/teacher/assessments/${assessment.id}`);
                                    }}
                                    className="border rounded-lg p-5 flex justify-between items-center hover:bg-gray-50 transition bg-white shadow-sm cursor-pointer"
                                >
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900">{assessment.title}</h3>
                                        <div className="flex gap-2 mt-2">
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${assessment.status === 'LIVE' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                assessment.status === 'DRAFT' ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                                                    'bg-red-100 text-red-700 border border-red-200'
                                                }`}>
                                                {assessment.status}
                                            </span>
                                            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                {assessment.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(assessment.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Assessment Modal */}
            {isCreateAssessmentOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Create New Assessment</h2>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                    placeholder="e.g. Midterm Exam"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="LIVE">Live Test</option>
                                    <option value="HOMEWORK">Homework</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                                    <input
                                        type="number"
                                        value={formData.duration_minutes}
                                        onChange={e => setFormData({ ...formData, duration_minutes: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Secs/Question</label>
                                    <input
                                        type="number"
                                        value={formData.time_per_question}
                                        onChange={e => setFormData({ ...formData, time_per_question: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        min="5"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateAssessmentOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {creating ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
