import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Clock, Play, FileText, Award } from 'lucide-react';

export default function RoomPage() {
    const { roomId } = useParams();
    const { user } = useAuth();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAssessments = async () => {
        try {
            const res = await api.get(`/assessments/room/${roomId}`);
            setAssessments(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssessments();
    }, [roomId]);

    const startAssessment = async (id) => {
        if (user.role === 'teacher') {
            await api.post(`/assessments/${id}/start`);
            fetchAssessments();
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Room Assessments</h1>
                    <Link to={user.role === 'teacher' ? "/teacher" : "/student"} className="text-blue-600 hover:underline">
                        Back to Dashboard
                    </Link>
                </div>

                <div className="grid gap-4">
                    {assessments.map(assessment => (
                        <div key={assessment.id} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    {assessment.title}
                                    <span className={`text-xs px-2 py-1 rounded-full ${assessment.status === 'LIVE' ? 'bg-green-100 text-green-800' :
                                            assessment.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {assessment.status}
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                                        {assessment.type}
                                    </span>
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Created: {new Date(assessment.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                {user.role === 'teacher' && assessment.status === 'DRAFT' && (
                                    <button
                                        onClick={() => startAssessment(assessment.id)}
                                        className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"
                                    >
                                        <Play size={16} /> Start Live
                                    </button>
                                )}

                                <Link
                                    to={`/report/${assessment.id}`}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-200"
                                >
                                    <Award size={16} /> Leaderboard
                                </Link>

                                {user.role === 'student' && assessment.status === 'LIVE' && (
                                    <Link
                                        to={`/attempt/${assessment.id}`}
                                        className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
                                    >
                                        <FileText size={16} /> Attempt
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                    {assessments.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No assessments found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
