import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';
import { CheckCircle, XCircle, PlayCircle, BookOpen, AlertCircle, Clock } from 'lucide-react';

export default function StudentPracticeSetupPage() {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [timeLimit, setTimeLimit] = useState(null); // null = Unlimited
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            // Using POST to match backend route configuration (shadowing issue resolution)
            // Added empty body {} to ensure axios interceptors attach Authorization header correctly
            const res = await api.post('/assessments/practice/questions', {});
            setQuestions(res.data);
        } catch (err) {
            console.error("Failed to load history", err);
            setError('Failed to load question history.');
        } finally {
            setLoading(false);
        }
    };

    const toggleQuestion = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === questions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(questions.map(q => q.id));
        }
    };

    const handleStartPractice = async () => {
        if (selectedIds.length === 0) {
            setError("Please select at least one question start.");
            return;
        }

        setCreating(true);
        setError('');

        try {
            // Ensure IDs are integers (backend expects List[int])
            const cleanIds = selectedIds.map(id => parseInt(id, 10));

            console.log("Starting practice with IDs:", cleanIds);

            const res = await api.post('/assessments/practice', {
                question_ids: cleanIds,
                title: `Practice Session - ${new Date().toLocaleDateString()}`,
                time_limit: timeLimit ? parseInt(timeLimit) : null
            });

            if (res.data && res.data.id) {
                navigate(`/student/assessments/${res.data.id}/attempt`);
            } else {
                throw new Error("Invalid response: Missing assessment ID");
            }
        } catch (err) {
            console.error("Practice creation failed:", err);
            const msg = err.response?.data?.detail || "Failed to create practice session";
            setError(msg);
            setCreating(false);
        }
    };

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
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Self Assessment Practice</h1>
                        <p className="text-slate-500">Select questions from your history to practice.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/student/practice/history')}
                            className="text-slate-600 hover:text-blue-600 font-medium px-4"
                        >
                            View History
                        </button>

                        <div className="relative">
                            <select
                                value={timeLimit || ''}
                                onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : null)}
                                className="appearance-none bg-white border border-slate-300 text-slate-700 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium shadow-sm transition-shadow cursor-pointer hover:border-slate-400"
                            >
                                <option value="">Unlimited Time</option>
                                <option value="15">15 Minutes</option>
                                <option value="30">30 Minutes</option>
                                <option value="45">45 Minutes</option>
                                <option value="60">1 Hour</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <Clock size={16} />
                            </div>
                        </div>

                        <button
                            onClick={handleStartPractice}
                            disabled={selectedIds.length === 0 || creating}
                            className={`px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm ${selectedIds.length === 0 || creating
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow shadow-blue-200'
                                }`}
                        >
                            {creating ? 'Creating...' : 'Start Practice'}
                            {!creating && <PlayCircle size={18} />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {questions.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="text-slate-300" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No practice questions available</h3>
                        <p className="text-slate-500 mt-2">
                            Once you complete assessments, questions will appear here for review and practice.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">
                                {selectedIds.length} questions selected
                            </span>
                            <button
                                onClick={toggleAll}
                                className="text-sm text-blue-600 font-medium hover:underline"
                            >
                                {selectedIds.length === questions.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {questions.map(q => (
                                <label
                                    key={q.id}
                                    className={`flex items-start gap-4 p-4 cursor-pointer transition-colors ${selectedIds.includes(q.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(q.id)}
                                        onChange={() => toggleQuestion(q.id)}
                                        className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <p className="text-slate-900 font-medium">{q.question_text}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs">
                                            <span className="text-slate-500">From: {q.source_assessment_title}</span>
                                            {q.is_correct ? (
                                                <span className="flex items-center gap-1 text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                                                    <CheckCircle size={12} /> Correct previously
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded">
                                                    <XCircle size={12} /> Incorrect previously
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
