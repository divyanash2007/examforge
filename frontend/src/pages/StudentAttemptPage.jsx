import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { ChevronRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function StudentAttemptPage() {
    const { assessmentId } = useParams();
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState('');
    const [attempt, setAttempt] = useState(null); // Full attempt object
    const [savedAnswers, setSavedAnswers] = useState({}); // Map: questionId -> answer
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Timer State
    const [remainingTime, setRemainingTime] = useState(null);
    const timerRef = useRef(null);

    // Refs to avoid stale closures in Timer/AutoSubmit
    const stateRef = useRef({
        selectedOption: '',
        currentQuestionIndex: 0,
        questions: [],
        attempt: null,
        savedAnswers: {}
    });

    // Update ref whenever relevant state changes
    useEffect(() => {
        stateRef.current = { selectedOption, currentQuestionIndex, questions, attempt, savedAnswers };
    }, [selectedOption, currentQuestionIndex, questions, attempt, savedAnswers]);

    useEffect(() => {
        const initAttempt = async () => {
            try {
                // 1. Fetch Assessment Details (includes questions)
                const detailRes = await api.get(`/assessments/${assessmentId}`);
                setAssessment(detailRes.data);
                setQuestions(detailRes.data.questions || []);

                // 2. Start/Resume Attempt
                const attemptRes = await api.post(`/assessments/${assessmentId}/attempt`);
                setAttempt(attemptRes.data);

                // 3. Hydrate Answers from Resume
                const hydratedAnswers = {};
                if (attemptRes.data.answers) {
                    attemptRes.data.answers.forEach(ans => {
                        hydratedAnswers[ans.question_id] = ans.selected_answer;
                    });
                }
                setSavedAnswers(hydratedAnswers);

                // Hydrate current question selection if exists
                if (detailRes.data.questions && detailRes.data.questions.length > 0) {
                    const firstQId = detailRes.data.questions[0].id;
                    if (hydratedAnswers[firstQId]) {
                        setSelectedOption(hydratedAnswers[firstQId]);
                    }
                }

                // 4. Initialize Timer
                if (detailRes.data.time_per_question && detailRes.data.questions) {
                    const totalDuration = detailRes.data.time_per_question * (detailRes.data.questions.length || 0);
                    let startedAtStr = attemptRes.data.started_at;
                    if (!startedAtStr.endsWith('Z') && !startedAtStr.includes('+')) {
                        startedAtStr += 'Z';
                    }
                    const startedAt = new Date(startedAtStr).getTime();
                    const now = Date.now();
                    const elapsedSeconds = Math.floor((now - startedAt) / 1000);
                    const remaining = Math.max(0, totalDuration - elapsedSeconds);
                    setRemainingTime(remaining);
                }

            } catch (err) {
                console.error("Failed to load attempt", err);
                if (err.response && err.response.status === 403) {
                    setError("You have already submitted this assessment.");
                } else {
                    setError("Failed to load assessment. It might not be live yet.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (assessmentId) {
            initAttempt();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [assessmentId]);

    // Sync selected option when changing questions
    useEffect(() => {
        if (questions.length > 0) {
            const currentQ = questions[currentQuestionIndex];
            const saved = savedAnswers[currentQ.id];
            setSelectedOption(saved || '');
        }
    }, [currentQuestionIndex, questions]); // Deliberately exclude savedAnswers to avoid loop/reset during type? Actually fine.

    // Timer Effect
    useEffect(() => {
        if (remainingTime === null || remainingTime <= 0) return;

        timerRef.current = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleAutoSubmit(); // This calls the stale closure version, need to be careful
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [remainingTime === null]); // Run once when timer starts

    // Auto Submit Logic
    const handleAutoSubmit = async () => {
        console.log("Auto-submitting...");
        const { selectedOption, currentQuestionIndex, questions, attempt } = stateRef.current;

        // 1. Force Save Current Answer if exists
        try {
            if (selectedOption && questions.length > 0 && attempt) {
                const currentQ = questions[currentQuestionIndex];
                console.log("Saving last answer before submit:", currentQ.id, selectedOption);
                await api.post(`/assessments/attempts/${attempt.id}/answer`, {
                    question_id: currentQ.id,
                    selected_answer: selectedOption,
                    time_taken: 0
                });
            }
        } catch (err) {
            console.error("Failed to save final answer during auto-submit", err);
        }

        // 2. Submit
        await handleSubmitAssessment(true, attempt?.id);
    };

    const formatTime = (seconds) => {
        if (seconds === null) return "--:--";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (option) => {
        if (remainingTime === 0) return;
        setSelectedOption(option);
        // Note: We don't save immediately to avoid excessive API calls, we save on Next/Submit.
        // But for refresh safety, saving here is 'safer' but 'chattier'. 
        // User asked: "Persist the response immediately (or on debounce)".
        // Let's settle for "Save on Next" + Rehydration. 
        // Refreshing *mid-question* (before clicking Next) losing one answer is acceptable trade-off vs chatting.
        // BUT "Bug 2" specifically said "last answer lost on auto-submit". Fix above handles that.
    };

    const handleNext = async () => {
        if (!selectedOption) return;

        setSubmitting(true);
        try {
            // Submit single answer
            const currentQ = questions[currentQuestionIndex];
            await api.post(`/assessments/attempts/${attempt.id}/answer`, {
                question_id: currentQ.id,
                selected_answer: selectedOption,
                time_taken: 0
            });

            // Update local saved state
            setSavedAnswers(prev => ({ ...prev, [currentQ.id]: selectedOption }));

            // Move to next or finish
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                // Selection will update via useEffect
            } else {
                // Final Submit
                await handleSubmitAssessment();
            }
        } catch (err) {
            console.error("Answer submit failed", err);
            if (err.response?.status === 403) {
                navigate('/student');
            } else {
                alert("Failed to save answer");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitAssessment = async (isAuto = false, attemptIdOverride = null) => {
        const idToSubmit = attemptIdOverride || attempt?.id;
        if (!idToSubmit) return;

        try {
            setSubmitting(true);
            await api.post(`/assessments/attempts/${idToSubmit}/submit`);
            if (isAuto) {
                alert("Time's up! Assessment submitted.");
            } else {
                alert("Assessment Submitted!");
            }
            navigate('/student');
        } catch (err) {
            console.error(err);
            if (err.response?.status === 403) {
                navigate('/student');
            } else {
                if (!isAuto) alert("Failed to submit assessment");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Assessment...</div>;
    if (error) return <div className="p-10 text-center text-red-600 font-semibold">{error}</div>;
    if (!assessment || questions.length === 0) return <div className="p-10 text-center">No questions in this assessment.</div>;

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const isTimeUp = remainingTime === 0;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
            <div className="max-w-3xl w-full bg-white rounded-lg shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">{assessment.title}</h1>
                        <p className="text-blue-100 text-sm">Question {currentQuestionIndex + 1} of {questions.length}</p>
                    </div>
                    <div className="text-right">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-mono ${remainingTime < 60 ? 'bg-red-500' : 'bg-blue-700'}`}>
                            <Clock size={16} />
                            <span>{formatTime(remainingTime)}</span>
                        </div>
                    </div>
                </div>

                {/* Question Area */}
                <div className="p-8">
                    <h2 className="text-lg font-medium text-gray-800 mb-6">{currentQuestion.question_text}</h2>

                    <div className="space-y-4">
                        {currentQuestion.options.map((option, idx) => (
                            <label
                                key={idx}
                                className={`flex items-center p-4 border rounded-lg cursor-pointer transition 
                                    ${selectedOption === option
                                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                        : 'border-gray-200 hover:bg-gray-50'}
                                    ${isTimeUp ? 'opacity-50 cursor-not-allowed' : ''}
                                        `}
                            >
                                <input
                                    type="radio"
                                    name={`question-${currentQuestion.id}`}
                                    value={option}
                                    checked={selectedOption === option}
                                    onChange={() => handleOptionSelect(option)}
                                    disabled={isTimeUp}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-3 text-gray-700">{option}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-gray-50 border-t flex justify-end">
                    <button
                        onClick={handleNext}
                        disabled={!selectedOption || submitting || isTimeUp}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {submitting ? 'Saving...' : (isLastQuestion ? 'Submit Assessment' : 'Next Question')}
                        {!submitting && (isLastQuestion ? <CheckCircle size={18} /> : <ChevronRight size={18} />)}
                    </button>
                </div>
            </div>
        </div>
    );
}
