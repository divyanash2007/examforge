import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, BarChart2, TrendingUp, TrendingDown, Users, Award, Check } from 'lucide-react';
import Layout from '../components/Layout';

export default function TeacherAnalyticsPage() {
    const { assessmentId } = useParams();
    const [summary, setSummary] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, questionsRes] = await Promise.all([
                    api.get(`/teacher/analytics/assessment/${assessmentId}/summary`),
                    api.get(`/teacher/analytics/assessment/${assessmentId}/questions`)
                ]);
                setSummary(summaryRes.data);
                setQuestions(questionsRes.data);
            } catch (err) {
                console.error("Failed to load analytics", err);
                setError("Failed to load analytics data");
            } finally {
                setLoading(false);
            }
        };

        if (assessmentId) {
            fetchData();
        }
    }, [assessmentId]);

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
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Link to={`/teacher/assessments/${assessmentId}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-2 transition-colors group">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Assessment
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            Performance Analytics
                        </h1>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard
                        title="Total Attempts"
                        value={summary.total_attempts}
                        icon={<Users size={20} className="text-purple-600" />}
                        bgColor="bg-purple-100/50"
                        borderColor="border-purple-200"
                    />
                    <SummaryCard
                        title="Average Score"
                        value={summary.average_score.toFixed(1)}
                        icon={<TrendingUp size={20} className="text-blue-600" />}
                        bgColor="bg-blue-100/50"
                        borderColor="border-blue-200"
                    />
                    <SummaryCard
                        title="Highest Score"
                        value={summary.highest_score.toFixed(1)}
                        icon={<Award size={20} className="text-green-600" />}
                        bgColor="bg-green-100/50"
                        borderColor="border-green-200"
                    />
                    <SummaryCard
                        title="Lowest Score"
                        value={summary.lowest_score.toFixed(1)}
                        icon={<TrendingDown size={20} className="text-red-600" />}
                        bgColor="bg-red-100/50"
                        borderColor="border-red-200"
                    />
                </div>

                {/* Question Breakdown */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <BarChart2 className="text-blue-600 w-5 h-5" /> Question Breakdown
                    </h2>

                    <div className="grid gap-6">
                        {questions.map((q, idx) => (
                            <div key={q.question_id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="font-semibold text-base mb-6 text-slate-900 flex gap-2">
                                    <span className="text-slate-400 font-mono">Q{idx + 1}</span> {q.question_text}
                                </h3>

                                <div className="space-y-4">
                                    {q.options.map((opt, i) => {
                                        const totalForQuestion = q.options.reduce((acc, o) => acc + o.selected_count, 0);
                                        const percentage = totalForQuestion > 0
                                            ? Math.round((opt.selected_count / totalForQuestion) * 100)
                                            : 0;

                                        return (
                                            <div key={i} className="relative group">
                                                <div className="flex justify-between text-sm mb-1.5 align-middle">
                                                    <span className={`
                                                        flex items-center gap-2 font-medium transition-colors
                                                        ${opt.is_correct ? 'text-green-700' : 'text-slate-600'}
                                                    `}>
                                                        {opt.option_text}
                                                        {opt.is_correct && <Check size={14} className="text-green-600" />}
                                                    </span>
                                                    <span className="text-slate-500 font-mono text-xs">
                                                        {opt.selected_count} ({percentage}%)
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-500 ${opt.is_correct ? 'bg-green-500' : 'bg-slate-400/50'}`}
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function SummaryCard({ title, value, icon, bgColor, borderColor }) {
    return (
        <div className={`p-5 rounded-xl border ${borderColor} ${bgColor} flex flex-col justify-between h-full`}>
            <div className="flex justify-between items-start mb-2">
                <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">{title}</p>
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100/50">
                    {icon}
                </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
    );
}
