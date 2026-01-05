import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, Clock, RefreshCw, Eye } from 'lucide-react';

export default function TeacherMonitorPage() {
    const { assessmentId } = useParams();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const pollInterval = useRef(null);

    const fetchMonitorData = async () => {
        try {
            const res = await api.get(`/teacher/monitor/assessment/${assessmentId}`);
            console.log("Live Monitor API Response:", res.data);
            setStudents(res.data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Failed to fetch monitor data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonitorData();

        // Poll every 5 seconds
        pollInterval.current = setInterval(fetchMonitorData, 5000);

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [assessmentId]);

    const formatTime = (seconds) => {
        if (seconds === null || seconds === undefined) return "--";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <Link to={`/teacher/assessments/${assessmentId}`} className="text-gray-500 hover:text-gray-800 flex items-center gap-2 mb-2">
                            <ArrowLeft size={20} /> Back to Assessment
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Eye className="text-indigo-600" /> Live Attempt Monitor
                        </h1>
                    </div>
                    <div className="text-right text-sm text-gray-500 flex items-center gap-2">
                        <RefreshCw size={14} className="animate-spin-slow" />
                        Auto-refreshing (every 5s)
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining Time</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        No students have started this assessment yet.
                                    </td>
                                </tr>
                            ) : (
                                students.map((monitor) => (
                                    <tr key={monitor.student_id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{monitor.student_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${monitor.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                {monitor.status === 'in_progress' ? 'In Progress' : 'Submitted'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(monitor.started_at).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                                            {monitor.status === 'in_progress' ? (
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} className="text-gray-400" /> {formatTime(monitor.remaining_time_seconds)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
