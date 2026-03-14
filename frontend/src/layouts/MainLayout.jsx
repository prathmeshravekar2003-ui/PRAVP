import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = ({ children, showFooter = true }) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-grow pt-20">
                {children}
            </main>
            {showFooter && <Footer />}
        </div>
    );
};

export default MainLayout;
