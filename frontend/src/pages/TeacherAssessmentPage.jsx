import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, Clock, Play, Plus, Trash, CheckCircle, BarChart2, Eye } from 'lucide-react';

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
        try {
            await api.patch(`/assessments/${assessmentId}/start`);
            fetchAssessment();
        } catch (err) {
            console.error(err);
            alert("Failed to start assessment");
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;
    if (!assessment) return <div className="p-8">Assessment not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link to={`/teacher/rooms/${assessment.room_id}`} className="text-gray-500 hover:text-gray-800 flex items-center gap-2 mb-4">
                        <ArrowLeft size={20} /> Back to Room
                    </Link>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{assessment.title}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${assessment.status === 'LIVE' ? 'bg-green-100 text-green-800' :
                                    assessment.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    {assessment.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-600">
                                <span className="flex items-center gap-1"><Clock size={16} /> {assessment.time_per_question}s / question</span>
                                <span>{assessment.type}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {(assessment.status === 'LIVE' || assessment.status === 'CLOSED') && (
                                <>
                                    <Link
                                        to={`/teacher/assessments/${assessmentId}/analytics`}
                                        className="bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 shadow-sm"
                                    >
                                        <BarChart2 size={20} /> View Analytics
                                    </Link>
                                    <Link
                                        to={`/teacher/assessments/${assessmentId}/monitor`}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm"
                                    >
                                        <Eye size={20} /> Live Monitor
                                    </Link>
                                </>
                            )}

                            {assessment.status === 'DRAFT' && (
                                <button
                                    onClick={handleStartAssessment}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 shadow-sm"
                                >
                                    <Play size={20} /> Start Assessment
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Question List */}
                <div className="space-y-6 mb-12">
                    {assessment.questions.map((q, idx) => (
                        <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex justify-between mb-4">
                                <h3 className="font-semibold text-lg">Q{idx + 1}: {q.question_text}</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {q.options.map((opt, i) => (
                                    <div key={i} className={`p-3 rounded border ${opt === q.correct_answer ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50'}`}>
                                        {opt}
                                        {opt === q.correct_answer && <CheckCircle size={16} className="inline ml-2" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Question Form */}
                {assessment.status === 'DRAFT' && (
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
                        <h3 className="text-xl font-bold mb-4">Add New Question</h3>
                        <form onSubmit={handleAddQuestion} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Question Text</label>
                                <textarea
                                    value={newQuestion.question_text}
                                    onChange={e => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                                    className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500"
                                    rows="2"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {newQuestion.options.map((opt, i) => (
                                    <div key={i}>
                                        <label className="block text-sm font-medium mb-1">Option {i + 1}</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={e => handleOptionChange(i, e.target.value)}
                                                className="w-full border rounded p-2"
                                                required
                                            />
                                            <input
                                                type="radio"
                                                name="correct"
                                                checked={newQuestion.correct_option === opt && opt !== ''}
                                                onChange={() => setNewQuestion({ ...newQuestion, correct_option: opt })}
                                                className="mt-3"
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full flex justify-center gap-2">
                                <Plus size={20} /> Add Question
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
