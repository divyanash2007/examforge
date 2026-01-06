import React, { useState } from 'react';
import { X, Grid, ChevronRight } from 'lucide-react';

export default function QuestionNavigator({
    questions = [],
    currentQuestion = 0,
    answers = {},
    visited = new Set(),
    marked = new Set(),
    onNavigate
}) {
    const [isOpen, setIsOpen] = useState(false);

    if (!questions || questions.length === 0) return null;

    // Computed Stats
    const answeredCount = Object.keys(answers).length;
    const totalCount = questions.length;

    // Visited Count (Unique questions visited, regardless of answer status)
    // If we want "Visited but not Answered", we calculate differently.
    // User asked for "Visited and Not Visited count". 
    // Usually "Visited" in stats includes answered ones too, or distinct sets?
    // Let's show: Answered, Visited (Total seen), Not Visited (Total - Visited).
    const visitedCount = visited instanceof Set ? visited.size : 0;
    const notVisitedCount = totalCount - visitedCount;

    const handleSelect = (index) => {
        if (onNavigate) {
            onNavigate(index);
        }
        setIsOpen(false);
    };

    return (
        <>
            {/* Desktop Panel - Sticky Right */}
            <div className="hidden lg:block w-72 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Grid size={18} className="text-blue-600" />
                            Question Navigator
                        </h3>
                    </div>

                    <div className="p-4">
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((q, idx) => {
                                const isAnswered = !!answers[q.id];
                                const isCurrent = currentQuestion === idx;
                                const isVisited = visited instanceof Set ? visited.has(q.id) : false;
                                const isMarked = marked instanceof Set ? marked.has(q.id) : false;

                                // Priority: Current (Ring) > Marked (Red) > Answered (Green) > Visited (Blue) > Default (Gray)
                                let baseStyle = 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100';

                                if (isMarked) {
                                    baseStyle = 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200';
                                } else if (isAnswered) {
                                    baseStyle = 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200';
                                } else if (isVisited) {
                                    baseStyle = 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100';
                                }

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => handleSelect(idx)}
                                        className={`
                                            h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 relative
                                            ${baseStyle}
                                            ${isCurrent ? 'ring-2 ring-blue-600 ring-offset-2 z-10 scale-105' : ''}
                                        `}
                                    >
                                        {idx + 1}
                                        {isMarked && (
                                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white"></span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></span>
                                Answered
                            </div>
                            <span>{answeredCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-50 border border-blue-200"></span>
                                Visited
                            </div>
                            <span>{visitedCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200"></span>
                                Not Visited
                            </div>
                            <span>{notVisitedCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-transform active:scale-95 flex items-center gap-2 font-bold"
            >
                <Grid size={20} />
                <span className="text-sm">Questions</span>
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Grid size={18} className="text-blue-600" />
                                Question Palette
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-5 gap-3">
                                {questions.map((q, idx) => {
                                    const isAnswered = !!answers[q.id];
                                    const isCurrent = currentQuestion === idx;
                                    const isVisited = visited instanceof Set ? visited.has(q.id) : false;
                                    const isMarked = marked instanceof Set ? marked.has(q.id) : false;

                                    let baseStyle = 'bg-slate-50 text-slate-400 border border-slate-200';

                                    if (isMarked) {
                                        baseStyle = 'bg-red-100 text-red-700 border border-red-200';
                                    } else if (isAnswered) {
                                        baseStyle = 'bg-green-100 text-green-700 border border-green-200';
                                    } else if (isVisited) {
                                        baseStyle = 'bg-blue-50 text-blue-700 border border-blue-200';
                                    }

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => handleSelect(idx)}
                                            className={`
                                                h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 mx-auto relative
                                                ${baseStyle}
                                                ${isCurrent ? 'ring-2 ring-blue-600 ring-offset-2 z-10' : ''}
                                            `}
                                        >
                                            {idx + 1}
                                            {isMarked && (
                                                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-white"></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between gap-4 text-xs font-semibold text-slate-600">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></span>
                                Ans. ({answeredCount})
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-50 border border-blue-200"></span>
                                Vis. ({visitedCount})
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200"></span>
                                Not Vis. ({notVisitedCount})
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
