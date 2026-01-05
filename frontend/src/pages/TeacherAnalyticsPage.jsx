import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, BarChart2, TrendingUp, TrendingDown, Users, Award, Check } from 'lucide-react';

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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Analytics...</div>;
    if (error) return <div className="p-8 text-center text-red-600 font-semibold">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <Link to={`/teacher/assessments/${assessmentId}`} className="text-gray-500 hover:text-gray-800 flex items-center gap-2 mb-4">
                        <ArrowLeft size={20} /> Back to Assessment
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart2 className="text-blue-600" /> Assessment Analytics
                    </h1>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <SummaryCard
                        title="Total Attempts"
                        value={summary.total_attempts}
                        icon={<Users size={24} className="text-purple-600" />}
                        bgColor="bg-purple-50"
                    />
                    <SummaryCard
                        title="Average Score"
                        value={summary.average_score.toFixed(1)}
                        icon={<TrendingUp size={24} className="text-blue-600" />}
                        bgColor="bg-blue-50"
                    />
                    <SummaryCard
                        title="Highest Score"
                        value={summary.highest_score.toFixed(1)}
                        icon={<Award size={24} className="text-green-600" />}
                        bgColor="bg-green-50"
                    />
                    <SummaryCard
                        title="Lowest Score"
                        value={summary.lowest_score.toFixed(1)}
                        icon={<TrendingDown size={24} className="text-red-600" />}
                        bgColor="bg-red-50"
                    />
                </div>

                {/* Question Breakdown */}
                <h2 className="text-xl font-bold text-gray-800 mb-6">Question Performance</h2>
                <div className="space-y-8">
                    {questions.map((q, idx) => (
                        <div key={q.question_id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-lg mb-4 text-gray-800 flex gap-2">
                                <span className="text-gray-400">Q{idx + 1}.</span> {q.question_text}
                            </h3>

                            <div className="space-y-3">
                                {q.options.map((opt, i) => {
                                    const totalForQuestion = q.options.reduce((acc, o) => acc + o.selected_count, 0);
                                    const percentage = totalForQuestion > 0
                                        ? Math.round((opt.selected_count / totalForQuestion) * 100)
                                        : 0;

                                    return (
                                        <div key={i} className="relative">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className={`flex items-center gap-2 ${opt.is_correct ? 'font-semibold text-green-700' : 'text-gray-700'}`}>
                                                    {opt.option_text}
                                                    {opt.is_correct && <Check size={14} className="text-green-600" />}
                                                </span>
                                                <span className="text-gray-500 font-mono">
                                                    {opt.selected_count} ({percentage}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className={`h-2.5 rounded-full ${opt.is_correct ? 'bg-green-500' : 'bg-gray-400'}`}
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
    );
}

function SummaryCard({ title, value, icon, bgColor }) {
    return (
        <div className={`p-6 rounded-xl border border-gray-100 shadow-sm ${bgColor} flex flex-col items-center justify-center text-center`}>
            <div className="mb-3 p-3 bg-white rounded-full shadow-sm">
                {icon}
            </div>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
    );
}
