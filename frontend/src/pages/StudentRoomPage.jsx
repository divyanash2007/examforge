import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, Clock, PlayCircle, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';

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

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        </Layout>
    );

    if (error) return (
        <Layout>
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/student" className="group p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
                        <ArrowLeft size={20} className="text-slate-500 group-hover:text-slate-800" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Available Assessments</h1>
                        <p className="text-slate-500 text-sm">Select an assessment to begin</p>
                    </div>
                </div>

                {assessments.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No active assessments</h3>
                        <p className="text-slate-500 mt-1">
                            Your teacher hasn't posted any assessments yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {assessments.map(assessment => {
                            // Calculate duration for display
                            const duration = assessment.duration_minutes || (assessment.time_per_question * 10 / 60).toFixed(0);

                            return (
                                <div key={assessment.id} className="group bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-blue-500/30">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                                    {assessment.title}
                                                </h3>
                                                <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">
                                                    {assessment.type}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={16} />
                                                    {duration} mins
                                                </span>
                                                {assessment.total_questions && (
                                                    <span className="flex items-center gap-1.5">
                                                        <FileText size={16} />
                                                        {assessment.total_questions} Questions
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {assessment.is_submitted ? (
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="bg-green-50 text-green-700 border border-green-100 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 cursor-not-allowed text-sm">
                                                    <CheckCircle size={16} /> Completed
                                                </span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleStart(assessment.id)}
                                                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow flex items-center gap-2 transform active:scale-[0.98]"
                                            >
                                                Start Test <PlayCircle size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
}
