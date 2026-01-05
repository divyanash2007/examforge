import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Clock, CheckCircle } from 'lucide-react';

export default function AttemptPage() {
    const { assessmentId } = useParams(); // Note: Route is /attempt/:assessmentId, but we might need to know attemptId?
    // Actually flow: Assessment -> Start -> Returns Attempt -> Fetch Attempt Detail.

    // Wait, the user lands here via /attempt/:assessmentId.
    // We should call "Start Attempt" to get the attempt ID or resume existing one.

    const navigate = useNavigate();
    const [attempt, setAttempt] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({}); // {question_id: answer}
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        const initAttempt = async () => {
            try {
                // First try to start/resume attempt
                const startRes = await api.post(`/assessments/${assessmentId}/attempt`);
                const attemptId = startRes.data.id;

                // Then fetch full details including questions
                const detailRes = await api.get(`/assessments/attempts/${attemptId}`);
                setAttempt(detailRes.data);
                setQuestions(detailRes.data.questions);
            } catch (err) {
                console.error("Failed to load attempt", err);
                alert("Could not start attempt.");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        initAttempt();
    }, [assessmentId]);

    const submitAnswer = async (questionId, answer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
        // Send to backend
        try {
            await api.post(`/assessments/attempts/${attempt.id}/answer`, {
                question_id: questionId,
                selected_answer: answer,
                time_taken: 0 // TODO: track time
            });
        } catch (err) {
            console.error("Failed to save answer");
        }
    };

    const finishAttempt = async () => {
        if (!window.confirm("Are you sure you want to submit?")) return;
        try {
            await api.post(`/assessments/attempts/${attempt.id}/submit`);
            navigate(`/report/${attempt.assessment_id}`); // Redirect to report? Or Attempt Result?
            // Wait, report endpoint is /attempts/{id}/report.
            // But we might want to redirect to general assessment page or specific report.
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8">Loading Assessment...</div>;
    if (!questions.length) return <div className="p-8">No questions in this assessment.</div>;

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold">Question {currentQuestionIndex + 1} of {questions.length}</h1>
                    <div className="flex items-center gap-2 text-gray-500">
                        <Clock size={20} />
                        <span>--:--</span>
                    </div>
                </div>

                <div className="mb-8">
                    <p className="text-lg font-medium mb-4">{currentQuestion.question_text}</p>
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => submitAnswer(currentQuestion.id, option)}
                                className={`w-full text-left p-4 rounded border transition ${answers[currentQuestion.id] === option
                                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                        : 'hover:bg-gray-50 border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[currentQuestion.id] === option ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                                        }`}>
                                        {answers[currentQuestion.id] === option && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    {option}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between mt-8 pt-6 border-t">
                    <button
                        onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Previous
                    </button>

                    {currentQuestionIndex < questions.length - 1 ? (
                        <button
                            onClick={() => setCurrentQuestionIndex(p => Math.min(questions.length - 1, p + 1))}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={finishAttempt}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                        >
                            <CheckCircle size={20} /> Submit Assessment
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
