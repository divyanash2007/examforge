import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Folder } from 'lucide-react';

export default function TeacherDashboard() {
    const { user, logout } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');
    const [error, setError] = useState('');

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
        try {
            await api.post('/rooms', { name: newRoomName });
            setNewRoomName('');
            fetchRooms();
        } catch (err) {
            setError('Failed to create room');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Teacher Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span>Welcome, {user.name || user.sub}</span>
                    <button onClick={logout} className="text-red-500 hover:text-red-700">Logout</button>
                </div>
            </nav>

            <main className="p-8 max-w-6xl mx-auto">
                <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Create New Room</h2>
                    <form onSubmit={createRoom} className="flex gap-4">
                        <input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            placeholder="Enter room name (e.g. Math 101)"
                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                            <Plus size={20} /> Create
                        </button>
                    </form>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-4">Your Rooms</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map(room => (
                        <Link key={room.id} to={`/teacher/rooms/${room.id}`} className="block">
                            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                                <div className="flex items-center gap-3 mb-2">
                                    <Folder className="text-blue-500" />
                                    <h3 className="font-semibold text-lg">{room.name}</h3>
                                </div>
                                <p className="text-gray-500 text-sm">Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{room.code}</span></p>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
