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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Timer State
    const [remainingTime, setRemainingTime] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        const initAttempt = async () => {
            try {
                // 1. Fetch Assessment Details (includes questions)
                const detailRes = await api.get(`/assessments/${assessmentId}`);
                setAssessment(detailRes.data);
                setQuestions(detailRes.data.questions || []);

                // 2. Start/Resume Attempt
                const attemptRes = await api.post(`/assessments/${assessmentId}/attempt`);
                setAttempt(attemptRes.data); // Store full attempt

                // 3. Initialize Timer
                if (detailRes.data.time_per_question && detailRes.data.questions) {
                    const totalDuration = detailRes.data.time_per_question * (detailRes.data.questions.length || 0);
                    // Ensure UTC parsing by appending Z if missing
                    let startedAtStr = attemptRes.data.started_at;
                    if (!startedAtStr.endsWith('Z') && !startedAtStr.includes('+')) {
                        startedAtStr += 'Z';
                    }
                    const startedAt = new Date(startedAtStr).getTime();
                    const now = Date.now();
                    // IMPORTANT: Adjust for client-server time drift if needed, but for now assuming synced or close enough
                    // or naive/aware utc matching
                    // Converting server UTC string to local timestamp vs Date.now() (local) works if string is ISO with Z or similar
                    // Python fastAPI default json usually is ISO.
                    // If started_at is e.g. "2023-10-10T10:00:00", new Date() treats as local. 
                    // Ideally we should treat as UTC. 
                    // Let's rely on standard parsing. If it's off, we might need 'Z' suffix.

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

    // Timer Effect
    useEffect(() => {
        if (remainingTime === null || remainingTime <= 0) return;

        timerRef.current = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [remainingTime === null]); // Only restart interval if we transition from null? No, simpler to just run if > 0

    // Separate Auto Submit handler to avoid dependencies in effect
    const handleAutoSubmit = async () => {
        // Prevent double call if already submitting
        // But we can't easily access state inside interval closure without ref or functional update
        // The functional update in setRemainingTime handles the trigger condition.

        // We need to call submit.
        console.log("Auto-submitting...");
        await handleSubmitAssessment(true);
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

            // Move to next or finish
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedOption('');
            } else {
                // Final Submit
                await handleSubmitAssessment();
            }
        } catch (err) {
            console.error("Answer submit failed", err);
            // If error is 403 (already submitted), redirect
            if (err.response?.status === 403) {
                navigate('/student');
            } else {
                alert("Failed to save answer");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitAssessment = async (isAuto = false) => {
        if (!attempt) return;
        try {
            setSubmitting(true);
            await api.post(`/assessments/attempts/${attempt.id}/submit`);
            if (isAuto) {
                alert("Time's up! Assessment submitted.");
            } else {
                alert("Assessment Submitted!");
            }
            navigate('/student');
        } catch (err) {
            console.error(err);
            if (err.response?.status === 403) {
                // Already submitted
                navigate('/student');
            } else {
                alert("Failed to submit assessment");
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
