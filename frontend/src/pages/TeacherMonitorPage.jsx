import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, Clock, RefreshCw, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';

export default function TeacherMonitorPage() {
    const { assessmentId } = useParams();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const pollInterval = useRef(null);

    const fetchMonitorData = async () => {
        try {
            const res = await api.get(`/teacher/monitor/assessment/${assessmentId}`);
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

    if (loading && !lastUpdated) return (
        <Layout>
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Link to={`/teacher/assessments/${assessmentId}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-2 transition-colors group">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Assessment
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                            Live Exam Monitor
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                        <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
                        <span className="font-mono">Updated: {lastUpdated?.toLocaleTimeString()}</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead>
                                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Started At</th>
                                    <th className="px-6 py-4">Time Remaining</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                                            No students have started this assessment yet.
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((monitor) => (
                                        <tr key={monitor.student_id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-slate-900">{monitor.student_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`
                                                    inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                                                    ${monitor.status === 'in_progress'
                                                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                                        : 'bg-green-50 text-green-700 border border-green-100'}
                                                `}>
                                                    {monitor.status === 'in_progress' ? (
                                                        <> <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> In Progress </>
                                                    ) : (
                                                        <> <CheckCircle size={12} /> Submitted </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                                                {new Date(monitor.started_at).toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                                                {monitor.status === 'in_progress' ? (
                                                    <span className={`flex items-center gap-2 ${monitor.remaining_time_seconds < 60 ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                                                        <Clock size={14} className={monitor.remaining_time_seconds < 60 ? 'text-red-500' : 'text-slate-400'} />
                                                        {formatTime(monitor.remaining_time_seconds)}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
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
        </Layout>
    );
}
