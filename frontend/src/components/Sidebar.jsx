import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    BarChart2,
    LogOut,
    Settings,
    MonitorPlay
} from 'lucide-react';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const isTeacher = user?.role === 'teacher';

    const links = isTeacher ? [
        { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard', end: true },
        // { to: '/teacher/assessments', icon: BookOpen, label: 'Assessments' }, // Assuming this route might exist or will be added
    ] : [
        { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
        // { to: '/student/assessments', icon: BookOpen, label: 'My Exams' },
    ];

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-10 transition-all duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-start gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">ExamForge</span>
            </div>

            <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                            ${isActive
                                ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }
                        `}
                    >
                        <link.icon className="w-5 h-5" />
                        {link.label}
                    </NavLink>
                ))}
            </div>

            <div className="p-4 border-t border-slate-100">
                <div className="bg-slate-50 rounded-xl p-4 mb-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                            {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-slate-500 truncate capitalize">
                            {user?.role}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign out
                </button>
            </div>
        </aside>
    );
}
