import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';
import { Clock, CheckCircle, BarChart2, ArrowRight } from 'lucide-react';

export default function StudentPracticeHistoryPage() {
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/assessments/practice/history');
                setAttempts(res.data);
            } catch (err) {
                console.error("Failed to load history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return (
        <Layout>
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900">Practice History</h1>
                    <button
                        onClick={() => navigate('/student/practice/setup')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Start New Practice
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {attempts.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            No practice sessions yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {attempts.map((attempt) => (
                                <div key={attempt.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{attempt.title}</h3>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {new Date(attempt.created_at).toLocaleDateString()}
                                            </span>
                                            {attempt.time_per_question > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    Timer: {Math.round(attempt.time_per_question * (attempt.questions?.length || 0) / 60)}m (approx)
                                                </span>
                                            )}
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${attempt.is_submitted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {attempt.is_submitted ? 'Completed' : 'In Progress'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (attempt.is_submitted) {
                                                navigate(`/student/assessments/${attempt.id}/review`);
                                            } else {
                                                navigate(`/student/assessments/${attempt.id}/attempt`);
                                            }
                                        }}
                                        className="flex items-center gap-2 text-blue-600 font-medium hover:underline"
                                    >
                                        {attempt.is_submitted ? 'Review Analysis' : 'Resume'}
                                        {attempt.is_submitted ? <BarChart2 size={16} /> : <ArrowRight size={16} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
