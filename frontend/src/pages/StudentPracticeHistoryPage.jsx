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
                                <div key={attempt.id} className="p-5 hover:bg-slate-50/80 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-slate-900 text-sm sm:text-base group-hover:text-blue-700 transition-colors">
                                                {attempt.title}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${attempt.is_submitted
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                {attempt.is_submitted ? 'Completed' : 'In Progress'}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} className="text-slate-400" />
                                                {new Date(attempt.created_at).toLocaleDateString()}
                                            </span>
                                            {attempt.time_per_question > 0 && (
                                                <span className="flex items-center gap-1" title="Time limit per question">
                                                    <Clock size={12} className="text-slate-400" />
                                                    ~{Math.round(attempt.time_per_question * (attempt.questions?.length || 0) / 60)}m
                                                </span>
                                            )}
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
                                        className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${attempt.is_submitted
                                            ? 'text-slate-600 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm'
                                            : 'text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow shadow-blue-200'
                                            }`}
                                    >
                                        {attempt.is_submitted ? 'Review' : 'Resume'}
                                        {attempt.is_submitted ? <BarChart2 size={14} /> : <ArrowRight size={14} />}
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
