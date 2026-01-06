import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Folder, Users, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';

export default function TeacherDashboard() {
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const fetchRooms = async () => {
        try {
            const res = await api.get('/rooms/my');
            setRooms(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const createRoom = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await api.post('/rooms', { name: newRoomName });
            setNewRoomName('');
            fetchRooms();
            setError('');
        } catch (err) {
            setError('Failed to create room');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Instructor Dashboard</h1>
                        <p className="text-slate-500 mt-1">
                            Manage your classrooms and assessments.
                        </p>
                    </div>
                </div>

                {/* Create Room Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-600" />
                        Create New Classroom
                    </h2>
                    <form onSubmit={createRoom} className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            placeholder="Data Structures & Algorithms"
                            className="flex-1 px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all invalid:border-red-300"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                        >
                            {isCreating ? 'Creating...' : <>Create <Plus size={18} /></>}
                        </button>
                    </form>
                    {error && (
                        <p className="text-red-600 text-sm mt-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                            {error}
                        </p>
                    )}
                </div>

                {/* Rooms Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Folder className="w-5 h-5 text-blue-600" />
                            Active Classrooms
                        </h2>
                        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            {rooms.length} Active
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map(room => (
                            <Link
                                key={room.id}
                                to={`/teacher/rooms/${room.id}`}
                                className="group block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-500/50 hover:shadow-md transition-all duration-200 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Folder className="w-6 h-6" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                </div>

                                <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1 group-hover:text-blue-700 transition-colors">
                                    {room.name}
                                </h3>

                                <div className="flex items-center gap-4 text-slate-500 text-sm mt-4">
                                    <span className="bg-slate-100 px-2 py-1 rounded font-mono text-xs text-slate-600 border border-slate-200" title="Join Code">
                                        {room.code}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Users size={14} />
                                        Students
                                    </span>
                                </div>
                            </Link>
                        ))}

                        {rooms.length === 0 && (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                                <Folder className="w-12 h-12 mb-3 text-slate-200" />
                                <p>No classrooms created yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
