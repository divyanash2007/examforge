import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Award, ArrowLeft, Trophy, Clock, User } from 'lucide-react';
import Layout from '../components/Layout';

export default function ReportPage() {
    const { assessmentId } = useParams();
    const [leaderboard, setLeaderboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get(`/reports/assessments/${assessmentId}/leaderboard`);
                setLeaderboard(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [assessmentId]);

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-4">
                    <Link to="/student" className="group p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
                        <ArrowLeft size={20} className="text-slate-500 group-hover:text-slate-800" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assessment Leaderboard</h1>
                        <p className="text-slate-500 text-sm">See how everyone performed</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600 shadow-sm">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">{leaderboard?.title}</h2>
                                <p className="text-slate-500 text-sm">Top Performers</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead>
                                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4 w-20 text-center">Rank</th>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4 text-right">Score</th>
                                    <th className="px-6 py-4 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {leaderboard?.entries.map((entry) => (
                                    <tr key={entry.rank} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`
                                                inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                                ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700 ring-4 ring-yellow-50' :
                                                    entry.rank === 2 ? 'bg-slate-100 text-slate-700 ring-4 ring-slate-50' :
                                                        entry.rank === 3 ? 'bg-orange-100 text-orange-800 ring-4 ring-orange-50' :
                                                            'text-slate-500 font-medium'
                                                }
                                            `}>
                                                {entry.rank}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <User size={16} />
                                                </div>
                                                <span className="font-semibold text-slate-900">{entry.student_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {entry.score} pts
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-slate-500 text-sm font-mono">
                                            {entry.time_taken}s
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {leaderboard?.entries.length === 0 && (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                                <Clock className="w-12 h-12 text-slate-200 mb-3" />
                                <p>No entries yet. Be the first!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
