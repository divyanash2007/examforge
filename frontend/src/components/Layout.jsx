import React from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
    const { user } = useAuth();

    return (
        <div className="h-screen bg-slate-50 font-sans flex overflow-hidden">
            {/* Sidebar for Desktop */}
            <Sidebar />

            <div className="flex-1 flex flex-col md:ml-64 h-full relative transition-all duration-300">
                {/* Mobile Header (visible only on small screens) */}
                <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between z-20 shadow-sm flex-shrink-0">
                    <div className="font-bold text-lg text-slate-900">ExamForge</div>
                    <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {/* Main Scrollable Area */}
                {/* We move scrolling here to support smooth scrolling without affecting global window scroll */}
                <main className="flex-1 overflow-y-auto scroll-smooth w-full relative">
                    <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
