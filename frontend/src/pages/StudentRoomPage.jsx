import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, Clock, PlayCircle, CheckCircle } from 'lucide-react';

export default function StudentRoomPage() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAssessments();
    }, [roomId]);

    const fetchAssessments = async () => {
        try {
            console.log(`Fetching assessments for room: ${roomId}`);
            const res = await api.get(`/assessments/room/${roomId}`);
            console.log("Assessments loaded:", res.data);
            setAssessments(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load assessments');
        } finally {
            setLoading(false);
        }
    };

    const handleStart = async (assessmentId) => {
        try {
            // Attempt to start/resume. If 403, it means already submitted.
            await api.post(`/assessments/${assessmentId}/attempt`);
            navigate(`/student/assessments/${assessmentId}/attempt`);
        } catch (err) {
            if (err.response && err.response.status === 403) {
                alert("You have already submitted this assessment.");
            } else {
                console.error(err);
                alert("Failed to start assessment");
            }
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <Link to="/student" className="text-gray-500 hover:text-gray-800">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800">Available Assessments</h1>
                </div>

                {assessments.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 bg-white rounded-lg shadow-sm">
                        <p>No active assessments at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {assessments.map(assessment => (
                            <div key={assessment.id} className="bg-white p-6 rounded-lg shadow-sm border flex justify-between items-center transition hover:shadow-md">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">{assessment.title}</h3>
                                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock size={16} /> {assessment.duration_minutes || (assessment.time_per_question * 10 / 60).toFixed(0)} mins
                                            {/* Note: Backend schema didn't fully implement duration_minutes, using estimate or time_per_question */}
                                        </span>
                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold uppercase">
                                            {assessment.type}
                                        </span>
                                    </div>
                                </div>
                                {assessment.is_submitted ? (
                                    <div className="text-right">
                                        <span className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 cursor-not-allowed border border-gray-200">
                                            <CheckCircle size={18} /> Plan Completed
                                        </span>
                                        <p className="text-xs text-red-500 mt-1">You have already submitted this assessment.</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleStart(assessment.id)}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                                    >
                                        Start Test <PlayCircle size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
