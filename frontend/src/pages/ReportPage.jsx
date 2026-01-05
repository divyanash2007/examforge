import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Award, Check, X, ArrowLeft } from 'lucide-react';

export default function ReportPage() {
    // We are routing here as /report/:assessmentId.
    // Ideally we should show the Leaderboard AND My Report if available.

    // For Teacher: Show Assessment Report.
    // For Student: Show Attempt Report (if exists) + Leaderboard.

    // To get Attempt Report, we need attempt ID.
    // Or we query "My Report for this Assessment".
    // Currently API is `GET /attempts/{id}/report`.
    // We lack `GET /assessments/{id}/my-attempt`.

    // I'll update the endpoint to use `assessmentId` if possible, but for now let's assume filtering.
    // Or I can list attempts?
    // Let's implement Leaderboard first as it's straightforward.

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

    if (loading) return <div className="p-8">Loading Report...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-800">
                    <ArrowLeft size={20} /> Back to Dashboard
                </Link>

                <div className="bg-white p-8 rounded-lg shadow mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                            <Award size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{leaderboard?.title}</h1>
                            <p className="text-gray-500">Leaderboard</p>
                        </div>
                    </div>

                    <div className="overflow-hidden border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leaderboard?.entries.map((entry) => (
                                    <tr key={entry.rank}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                                    entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
                                                        entry.rank === 3 ? 'bg-orange-100 text-orange-800' : 'text-gray-500'
                                                }`}>
                                                {entry.rank}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{entry.student_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{entry.score}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{entry.time_taken}s</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {leaderboard?.entries.length === 0 && (
                            <p className="text-center py-8 text-gray-500">No entries yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
