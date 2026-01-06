import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';
import { ArrowLeft, CheckCircle, XCircle, Clock, Trophy } from 'lucide-react';
import LoadingFallback from '../components/LoadingFallback';

export default function StudentReviewPage() {
    const { attemptId, assessmentId } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReport = async () => {
            try {
                let targetAttemptId = attemptId;

                // If no attemptId, resolve it from assessmentId
                if (!targetAttemptId && assessmentId) {
                    const detailRes = await api.get(`/assessments/${assessmentId}`);
                    const assessment = detailRes.data;

                    if (assessment.type === 'SELF') {
                        const historyRes = await api.get('/assessments/practice/history');
                        const match = historyRes.data.find(a => a.id === parseInt(assessmentId));
                        if (match?.attempt_id) {
                            targetAttemptId = match.attempt_id;
                        }
                    } else {
                        // Classroom Assessment
                        if (assessment.room_id) {
                            const roomRes = await api.get(`/assessments/room/${assessment.room_id}`);
                            const match = roomRes.data.find(a => a.id === parseInt(assessmentId));
                            if (match?.attempt_id) {
                                targetAttemptId = match.attempt_id;
                            }
                        }
                    }
                }

                if (!targetAttemptId) {
                    throw new Error("Attempt not found for this assessment.");
                }

                const res = await api.get(`/attempts/${targetAttemptId}/report`);
                setReport(res.data);
            } catch (err) {
                console.error("Failed to fetch report", err);
                setError(err.response?.data?.detail || 'Failed to load assessment review.');
            } finally {
                setLoading(false);
            }
        };

        if (attemptId || assessmentId) {
            fetchReport();
        }
    }, [attemptId, assessmentId]);

    if (loading) return <LoadingFallback />;

    if (error) return (
        <Layout>
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
                <XCircle size={20} />
                {error}
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <Link to="/student" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-1">Assessment Review</h1>
                            <p className="text-slate-500">Review your answers and performance.</p>
                        </div>

                        <div className="flex flex-wrap gap-4 justify-end">
                            {/* Stats Calculation */}
                            {(() => {
                                const total = report.questions.length;
                                const correct = report.questions.filter(q => q.is_correct).length;
                                const incorrect = total - correct;
                                const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

                                return (
                                    <>
                                        <div className="text-center px-5 py-3 bg-blue-50 rounded-xl border border-blue-100 min-w-[100px]">
                                            <p className="text-xs uppercase tracking-wider font-bold text-blue-600 mb-1">Accuracy</p>
                                            <p className="text-2xl font-bold text-slate-900">{accuracy}%</p>
                                        </div>
                                        <div className="text-center px-5 py-3 bg-green-50 rounded-xl border border-green-100 min-w-[100px]">
                                            <p className="text-xs uppercase tracking-wider font-bold text-green-600 mb-1">Correct</p>
                                            <p className="text-2xl font-bold text-slate-900">{correct}</p>
                                        </div>
                                        <div className="text-center px-5 py-3 bg-red-50 rounded-xl border border-red-100 min-w-[100px]">
                                            <p className="text-xs uppercase tracking-wider font-bold text-red-600 mb-1">Incorrect</p>
                                            <p className="text-2xl font-bold text-slate-900">{incorrect}</p>
                                        </div>
                                        {/* Rank - Hide if it seems like a self assessment (often rank 1/1) or if accuracy is purely shown */}
                                        {/* User requested NO leaderboard impact/visibility for practice. But report object has rank.
                                            We can check if rank is > 0. For now, let's keep it but maybe less prominent or just these cards.
                                            Actually, explicit instruction: "No comparison with other students". 
                                            Since we can't easily distinguish 'type' here without fetching assessment details, 
                                            and generic reports usually have ranks... 
                                            Let's show Rank ONLY if it's explicitly valuable. 
                                            If we want to be safe for Practice, we can just hide it if we adding stats.
                                            But let's stick to the 3 requested cards: Accuracy, Correct, Incorrect. 
                                            Score is also good.
                                         */}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                {/* Questions Review */}
                <div className="space-y-6">
                    {report.questions.map((q, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-start gap-4 mb-4">
                                <h3 className="text-lg font-semibold text-slate-900 flex gap-3">
                                    <span className="text-slate-400 font-mono">Q{idx + 1}.</span>
                                    {q.question_text}
                                </h3>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 flex-shrink-0 ${q.is_correct
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-red-100 text-red-700 border border-red-200'
                                    }`}>
                                    {q.is_correct ? (
                                        <><CheckCircle size={14} /> Correct</>
                                    ) : (
                                        <><XCircle size={14} /> Incorrect</>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 pl-4 sm:pl-8 border-l-2 border-slate-100">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Answer</p>
                                    <p className={`font-medium ${q.is_correct ? 'text-green-700' : 'text-red-600'
                                        }`}>
                                        {q.selected_answer || <span className="text-slate-400 italic">Not answered</span>}
                                    </p>
                                </div>

                                {!q.is_correct && (
                                    <div className="space-y-1 pt-2">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Correct Answer</p>
                                        <p className="font-medium text-green-700">
                                            {q.correct_answer}
                                        </p>
                                    </div>
                                )}

                                <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                                    <Clock size={12} />
                                    <span>Time taken: {q.time_taken || 0}s</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
