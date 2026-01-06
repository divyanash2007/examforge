import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
    const { user } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="h-screen bg-slate-50 font-sans flex overflow-hidden">
            {/* Sidebar with Responsive Props */}
            <Sidebar
                isOpen={isMobileOpen}
                onClose={() => setIsMobileOpen(false)}
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />

            <div className={`flex-1 flex flex-col h-full relative transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-56 lg:ml-64'}`}>
                {/* Mobile Header (visible only on small screens) */}
                <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between z-20 shadow-sm flex-shrink-0">
                    <div className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">E</span>
                        ExamForge
                    </div>
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {/* Main Scrollable Area */}
                <main className="flex-1 overflow-y-auto scroll-smooth w-full relative">
                    <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
