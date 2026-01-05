import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { LogIn, BookOpen } from 'lucide-react';

export default function StudentDashboard() {
    const { user, logout } = useAuth();
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
            setError('Invalid code or already joined');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Student Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span>Welcome, {user.name || user.sub}</span>
                    <button onClick={logout} className="text-red-500 hover:text-red-700">Logout</button>
                </div>
            </nav>

            <main className="p-8 max-w-6xl mx-auto">
                <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Join a Room</h2>
                    <form onSubmit={joinRoom} className="flex gap-4">
                        <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="Enter 6-character room code"
                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
                            <LogIn size={20} /> Join
                        </button>
                    </form>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-4">My Classrooms</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map(room => (
                        <Link key={room.id} to={`/student/rooms/${room.id}`} className="block">
                            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition border-l-4 border-green-500">
                                <div className="flex items-center gap-3 mb-2">
                                    <BookOpen className="text-green-600" />
                                    <h3 className="font-semibold text-lg">{room.name}</h3>
                                </div>
                                <p className="text-gray-500 text-sm">Teacher ID: {room.teacher_id}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
