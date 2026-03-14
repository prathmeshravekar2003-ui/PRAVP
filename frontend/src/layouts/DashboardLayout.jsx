import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children }) => {
    return (
        <div className="bg-slate-50 min-h-screen selection:bg-indigo-100">
            <Navbar />
            <div className="flex pt-20 overflow-hidden">
                <Sidebar />
                <main className="relative w-full h-full overflow-y-auto bg-slate-50 lg:ml-64 min-h-[calc(100vh-80px)]">
                    <div className="px-4 py-8 md:px-10 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
