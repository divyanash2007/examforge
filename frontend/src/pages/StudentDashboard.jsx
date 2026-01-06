import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { LogIn, BookOpen, Clock, ArrowRight, Activity } from 'lucide-react';
import Layout from '../components/Layout';

export default function StudentDashboard() {
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [joinCode, setJoinCode] = useState('');
    const [error, setError] = useState('');

    const fetchRooms = async () => {
        try {
            const res = await api.get('/rooms/joined');
            setRooms(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const joinRoom = async (e) => {
        e.preventDefault();
        try {
            await api.post('/rooms/join', { code: joinCode });
            setJoinCode('');
            fetchRooms();
            setError('');
        } catch (err) {
            setError('Invalid code or already joined. Please try again.');
        }
    };

    return (
        <Layout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                        <p className="text-slate-500 mt-1">
                            Welcome back, {user.name?.split(' ')[0] || 'Student'}! Here's your learning overview.
                        </p>
                    </div>
                </div>

                {/* Join Room Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <LogIn className="w-5 h-5 text-blue-600" />
                        Join a New Classroom
                    </h2>
                    <form onSubmit={joinRoom} className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="Enter 6-character room code"
                            className="flex-1 px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                            required
                        />
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                        >
                            <LogIn size={18} /> Join Class
                        </button>
                    </form>
                    {error && (
                        <p className="text-red-600 text-sm mt-3 flex items-center gap-2 animate-pulse">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                            {error}
                        </p>
                    )}
                </div>

                {/* Classrooms Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            Your Classrooms
                        </h2>
                        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            {rooms.length} Enrolled
                        </span>
                    </div>

                    {rooms.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">No classrooms yet</h3>
                            <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                                Join your first classroom using a code from your teacher to get started.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rooms.map(room => (
                                <Link
                                    key={room.id}
                                    to={`/student/rooms/${room.id}`}
                                    className="group block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-500/50 hover:shadow-md transition-all duration-200 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                                        {room.name}
                                    </h3>
                                    <p className="text-slate-500 text-sm flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                        Teacher ID: <span className="font-mono text-xs">{room.teacher_id}</span>
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
