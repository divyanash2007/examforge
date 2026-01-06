import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, Clock, Play, Plus, Trash, CheckCircle, BarChart2, Eye, Save } from 'lucide-react';
import Layout from '../components/Layout';

export default function TeacherAssessmentPage() {
    const { assessmentId } = useParams();
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Create Question State
    const [newQuestion, setNewQuestion] = useState({
        question_text: '',
        options: ['', '', '', ''],
        correct_option: '',
        question_order: 1
    });

    useEffect(() => {
        fetchAssessment();
    }, [assessmentId]);

    const fetchAssessment = async () => {
        try {
            const res = await api.get(`/assessments/${assessmentId}`);
            setAssessment(res.data);
            setNewQuestion(prev => ({ ...prev, question_order: (res.data.questions?.length || 0) + 1 }));
        } catch (err) {
            console.error(err);
            setError('Failed to load assessment');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...newQuestion.options];
        newOptions[index] = value;
        setNewQuestion({ ...newQuestion, options: newOptions });
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        try {
            if (!newQuestion.correct_option) {
                alert("Please select a correct option");
                return;
            }
            await api.post(`/assessments/${assessmentId}/questions/create`, newQuestion);
            // Reset and refresh
            setNewQuestion({
                question_text: '',
                options: ['', '', '', ''],
                correct_option: '',
                question_order: assessment.questions.length + 2
            });
            fetchAssessment();
        } catch (err) {
            console.error(err);
            alert("Failed to add question");
        }
    };

    const handleStartAssessment = async () => {
        if (!window.confirm("Are you sure you want to start this assessment? Students will be able to join immediately.")) return;
        try {
            await api.patch(`/assessments/${assessmentId}/start`);
            fetchAssessment();
        } catch (err) {
            console.error(err);
            alert("Failed to start assessment");
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
            <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-200">
                {error}
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <Link to={`/teacher/rooms/${assessment.room_id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Room
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{assessment.title}</h1>
                                <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${assessment.status === 'LIVE' ? 'bg-green-100 text-green-700 border-green-200' :
                                        assessment.status === 'DRAFT' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                            'bg-red-100 text-red-700 border-red-200'
                                    }`}>
                                    {assessment.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-6 text-slate-500 font-medium text-sm">
                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                                    <Clock size={16} className="text-slate-400" /> {assessment.time_per_question}s per question
                                </span>
                                <span className="uppercase tracking-wide text-xs font-bold text-slate-400">{assessment.type}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {(assessment.status === 'LIVE' || assessment.status === 'CLOSED') && (
                                <>
                                    <Link
                                        to={`/teacher/assessments/${assessmentId}/analytics`}
                                        className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all font-medium"
                                    >
                                        <BarChart2 size={18} /> Analytics
                                    </Link>
                                    <Link
                                        to={`/teacher/assessments/${assessmentId}/monitor`}
                                        className="bg-indigo-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm transition-all font-semibold"
                                    >
                                        <Eye size={18} /> Live Monitor
                                    </Link>
                                </>
                            )}

                            {assessment.status === 'DRAFT' && (
                                <button
                                    onClick={handleStartAssessment}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 shadow-sm shadow-green-200 transition-all font-bold"
                                >
                                    <Play size={18} /> Start Assessment
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Question List */}
                <div className="space-y-6">
                    {assessment.questions.map((q, idx) => (
                        <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-semibold text-lg text-slate-900 mb-4 flex gap-2">
                                <span className="text-slate-400">Q{idx + 1}.</span> {q.question_text}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {q.options.map((opt, i) => (
                                    <div key={i} className={`
                                        flex items-center gap-3 p-3 rounded-lg border text-sm font-medium
                                        ${opt === q.correct_answer
                                            ? 'bg-green-50 border-green-200 text-green-800'
                                            : 'bg-slate-50 border-slate-100 text-slate-600'}
                                    `}>
                                        <div className={`
                                            w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0
                                            ${opt === q.correct_answer ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300 bg-white'}
                                        `}>
                                            {opt === q.correct_answer && <CheckCircle size={12} />}
                                        </div>
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {assessment.questions.length === 0 && assessment.status === 'DRAFT' && (
                        <div className="text-center py-10 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200 text-slate-400">
                            Add questions below to build your assessment.
                        </div>
                    )}
                </div>

                {/* Add Question Form */}
                {assessment.status === 'DRAFT' && (
                    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Plus size={20} className="text-blue-500" /> Add New Question
                            </h3>
                        </div>
                        <form onSubmit={handleAddQuestion} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Question Text</label>
                                <textarea
                                    value={newQuestion.question_text}
                                    onChange={e => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
                                    rows="3"
                                    required
                                    placeholder="Enter your question here..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {newQuestion.options.map((opt, i) => (
                                    <div key={i}>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Option {i + 1}</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={e => handleOptionChange(i, e.target.value)}
                                                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                required
                                                placeholder={`Answer option ${i + 1}`}
                                            />
                                            <div className="flex items-center justify-center pt-1" title="Mark as correct answer">
                                                <input
                                                    type="radio"
                                                    name="correct"
                                                    checked={newQuestion.correct_option === opt && opt !== ''}
                                                    onChange={() => setNewQuestion({ ...newQuestion, correct_option: opt })}
                                                    className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                                <button className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all font-semibold flex items-center gap-2">
                                    <Save size={18} /> Save Question
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </Layout>
    );
}
