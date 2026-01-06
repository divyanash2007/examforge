import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';
import { CheckCircle, XCircle, PlayCircle, BookOpen, AlertCircle, Clock, ChevronDown } from 'lucide-react';

export default function StudentPracticeSetupPage() {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [timeLimit, setTimeLimit] = useState(null); // null = Unlimited
    const [filter, setFilter] = useState('all'); // 'all', 'incorrect', 'correct'
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

                        <div className="relative group">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-hover:text-blue-500 transition-colors">
                                <Clock size={16} />
                            </div>
                            <select
                                value={timeLimit || ''}
                                onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : null)}
                                className="appearance-none w-full bg-white border border-slate-200 text-slate-700 text-sm py-2.5 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium shadow-sm transition-all cursor-pointer hover:border-blue-300"
                            >
                                <option value="">Unlimited Time</option>
                                <option value="15">15 Minutes</option>
                                <option value="30">30 Minutes</option>
                                <option value="45">45 Minutes</option>
                                <option value="60">1 Hour</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 group-hover:text-slate-600 transition-colors">
                                <ChevronDown size={16} />
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
                    <div className="space-y-4">
                        {/* Filters and Selection Summary */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter('incorrect')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'incorrect' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Incorrect Only
                                </button>
                                <button
                                    onClick={() => setFilter('correct')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'correct' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Correct Only
                                </button>
                            </div>

                            <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                {(() => {
                                    const selectedQuestions = questions.filter(q => selectedIds.includes(q.id));
                                    const incCount = selectedQuestions.filter(q => !q.is_correct).length;
                                    const corrCount = selectedQuestions.filter(q => q.is_correct).length;

                                    if (selectedIds.length === 0) return <span>Select questions to start</span>;

                                    return (
                                        <>
                                            <span className="text-slate-900 font-bold">{selectedIds.length}</span> selected
                                            <span className="text-slate-300 mx-1">|</span>
                                            <span className="text-red-600">{incCount} Incorrect</span>
                                            <span className="text-slate-300 mx-1">•</span>
                                            <span className="text-green-600">{corrCount} Correct</span>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600">
                                    Showing {questions.filter(q => filter === 'all' || (filter === 'incorrect' ? !q.is_correct : q.is_correct)).length} questions
                                </span>
                                <button
                                    onClick={() => {
                                        const visible = questions.filter(q => filter === 'all' || (filter === 'incorrect' ? !q.is_correct : q.is_correct));
                                        const allVisibleSelected = visible.every(q => selectedIds.includes(q.id));

                                        if (allVisibleSelected) {
                                            // Deselect visible
                                            const visibleIds = visible.map(q => q.id);
                                            setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
                                        } else {
                                            // Select visible
                                            const visibleIds = visible.map(q => q.id);
                                            setSelectedIds(prev => [...new Set([...prev, ...visibleIds])]);
                                        }
                                    }}
                                    className="text-sm text-blue-600 font-medium hover:underline"
                                >
                                    Toggle Visible
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                                {questions
                                    .filter(q => filter === 'all' || (filter === 'incorrect' ? !q.is_correct : q.is_correct))
                                    .map(q => (
                                        <label
                                            key={q.id}
                                            className={`flex items-start gap-3 p-3 cursor-pointer transition-all border-l-4 group/item ${selectedIds.includes(q.id)
                                                ? 'bg-blue-50/60 border-blue-500'
                                                : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                                                }`}
                                        >
                                            <div className="pt-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(q.id)}
                                                    onChange={() => toggleQuestion(q.id)}
                                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                    <p className="text-slate-900 font-medium text-sm leading-relaxed">{q.question_text}</p>
                                                    <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${q.is_correct
                                                        ? 'bg-green-100/70 text-green-700'
                                                        : 'bg-red-100/70 text-red-700'
                                                        }`}>
                                                        {q.is_correct ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                                        {q.is_correct ? 'Correct' : 'Incorrect'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1.5 font-medium flex items-center gap-1 group-hover/item:text-slate-500 transition-colors">
                                                    <BookOpen size={12} />
                                                    {q.source_assessment_title}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                {questions.filter(q => filter === 'all' || (filter === 'incorrect' ? !q.is_correct : q.is_correct)).length === 0 && (
                                    <div className="p-8 text-center text-slate-500">
                                        No questions match this filter.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
