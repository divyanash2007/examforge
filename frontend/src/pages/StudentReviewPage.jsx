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
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                {/* Header and Summary */}
                <div className="space-y-6">
                    <Link to="/student" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors group px-1">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-1">Assessment Analysis</h1>
                                <p className="text-slate-500">Review your performance and detailed answers.</p>
                            </div>

                        </div>

                        {/* Summary Stats */}
                        {(() => {
                            const total = report.questions.length;
                            const correct = report.questions.filter(q => q.is_correct).length;
                            const incorrect = total - correct;
                            const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

                            // Stats for insights
                            const avgTime = Math.round(report.questions.reduce((acc, q) => acc + (q.time_taken || 0), 0) / total) || 0;
                            const strength = accuracy >= 80 ? 'Excellent' : accuracy >= 60 ? 'Good' : 'Needs Practice';
                            const strengthColor = accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-blue-600' : 'text-amber-600';

                            return (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Accuracy</span>
                                            <span className={`text-2xl font-bold ${strengthColor}`}>{accuracy}%</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Correct</span>
                                            <span className="text-2xl font-bold text-green-600">{correct}</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Incorrect</span>
                                            <span className="text-2xl font-bold text-red-600">{incorrect}</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Time</span>
                                            <span className="text-2xl font-bold text-slate-700">{avgTime}s</span>
                                        </div>
                                    </div>

                                    {/* Simple Performance Insight */}
                                    {total > 0 && (
                                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-5 text-white shadow-md relative overflow-hidden">
                                            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <Trophy className="text-yellow-400" size={16} />
                                                        <h3 className="font-bold text-base">Performance Insight</h3>
                                                    </div>
                                                    <p className="text-slate-300 text-sm max-w-xl leading-relaxed opacity-90">
                                                        {accuracy === 100 ? "Perfect score! Outstanding performance." :
                                                            accuracy >= 80 ? "You're showing strong command of this topic. Keep it up!" :
                                                                accuracy >= 60 ? "Good progress. Reviewing incorrect answers will help you improve." :
                                                                    "Focus on understanding the core concepts of the incorrect questions."}
                                                    </p>
                                                </div>
                                                <div className="text-right hidden md:block">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Overall Rating</span>
                                                    <span className={`text-2xl font-bold ${strength === 'Excellent' ? 'text-green-400' : strength === 'Good' ? 'text-blue-400' : 'text-amber-400'}`}>{strength}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Questions Review */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 px-1">Detailed Review</h2>
                    {report.questions.map((q, idx) => (
                        <div key={idx} className={`bg-white rounded-xl shadow-sm border transition-shadow overflow-hidden ${q.is_correct ? 'border-slate-200' : 'border-red-100 ring-1 ring-red-50'}`}>
                            <div className="p-6">
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <div className="flex gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-sm">
                                            {idx + 1}
                                        </span>
                                        <div>
                                            <h3 className="text-lg text-slate-900 font-medium leading-relaxed">
                                                {q.question_text}
                                            </h3>
                                        </div>
                                    </div>

                                    <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${q.is_correct
                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                        : 'bg-red-100 text-red-700 border border-red-200'
                                        }`}>
                                        {q.is_correct ? (
                                            <><CheckCircle size={14} /> Correct</>
                                        ) : (
                                            <><XCircle size={14} /> Incorrect</>
                                        )}
                                    </span>
                                </div>

                                <div className="ml-12 space-y-4">
                                    {/* Options / Answers layout */}
                                    {/* Since we don't have all options in the report schema typically, 
                                        we focus on showing Selected vs Correct clearly as per existing design */}

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className={`p-4 rounded-lg border ${q.is_correct ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'
                                            }`}>
                                            <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70 flex items-center gap-2">
                                                {q.is_correct ? <span className="text-green-700">Your Answer (Correct)</span> : <span className="text-red-700">Your Answer</span>}
                                            </p>
                                            <p className={`font-medium ${q.is_correct ? 'text-green-900' : 'text-red-900'}`}>
                                                {q.selected_answer || <span className="italic opacity-60">No Answer Selected</span>}
                                            </p>
                                        </div>

                                        {!q.is_correct && (
                                            <div className="bg-green-50/50 p-4 rounded-lg border border-green-100">
                                                <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-1 opacity-70">
                                                    Correct Answer
                                                </p>
                                                <p className="font-medium text-green-900">
                                                    {q.correct_answer}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2 flex items-center justify-end gap-2 text-xs text-slate-400 font-medium border-t border-slate-50 mt-4">
                                        <Clock size={14} />
                                        <span>Time taken: {q.time_taken || 0}s</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
