import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    BarChart2,
    LogOut,
    Settings,
    MonitorPlay,
    ChevronLeft,
    ChevronRight,
    User,
    History
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, isCollapsed, toggleCollapse }) {
    const { user, logout } = useAuth();
    const isTeacher = user?.role === 'teacher';

    const renderLinks = () => {
        const commonClasses = `
            relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
            ${isCollapsed ? 'justify-center' : ''}
        `;

        const activeClasses = 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100';
        const inactiveClasses = 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';

        const sections = [
            {
                title: 'MAIN',
                items: isTeacher ? [
                    { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard', end: true },
                ] : [
                    { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
                ]
            },
            {
                title: 'PRACTICE',
                items: isTeacher ? [] : [
                    { to: '/student/practice/setup', icon: MonitorPlay, label: 'Practice Mode' },
                    { to: '/student/practice/history', icon: History, label: 'History' },
                ]
            },
            // {
            //     title: 'ACCOUNT',
            //     items: [
            //         { to: '/settings', icon: Settings, label: 'Settings' }
            //     ]
            // }
        ];

        return sections.map((section, idx) => (
            <div key={idx} className="mb-6 last:mb-0">
                {!isCollapsed && section.items.length > 0 && (
                    <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {section.title}
                    </div>
                )}
                <div className="space-y-1">
                    {section.items.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            onClick={onClose} // Close mobile sidebar on link click
                            className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}
                            title={isCollapsed ? link.label : ''}
                        >
                            {({ isActive }) => (
                                <>
                                    <link.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`} />

                                    {!isCollapsed && (
                                        <span className="truncate">{link.label}</span>
                                    )}

                                    {/* Active Indicator Line for Collapsed Mode (Optional visual cue) */}
                                    {isActive && isCollapsed && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                                    )}

                                    {/* Tooltip for Collapsed Mode */}
                                    {isCollapsed && (
                                        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
                                            {link.label}
                                        </div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        ));
    };

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-50 shadow-xl md:shadow-none flex flex-col transition-all duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${isCollapsed ? 'w-20' : 'md:w-56 lg:w-64'}
                `}
            >
                {/* Header */}
                <div className={`h-16 flex items-center border-b border-slate-100 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="text-white w-5 h-5" />
                        </div>

                        {!isCollapsed && (
                            <span className="text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
                                ExamForge
                            </span>
                        )}
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 py-6 px-3 overflow-y-auto overflow-x-hidden">
                    {renderLinks()}
                </div>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    {!isCollapsed ? (
                        <div className="mb-4">
                            <div className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-default">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-base shadow-sm">
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">
                                        {user?.name || 'User'}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate capitalize font-medium">
                                        {user?.role} Account
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-lg shadow-sm cursor-help relative group"
                                title={user?.name}
                            >
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                                <div className="absolute left-full ml-3 px-3 py-2 bg-white text-slate-800 text-xs rounded-lg shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
                                    <p className="font-bold">{user?.name}</p>
                                    <p className="text-slate-500 capitalize">{user?.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Desktop Collapse Toggle (Hidden on Mobile) */}
                <button
                    onClick={toggleCollapse}
                    className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1 shadow-md text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors hidden md:flex items-center justify-center z-50"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </aside>
        </>
    );
}
