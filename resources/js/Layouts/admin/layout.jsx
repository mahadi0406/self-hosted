import React, {useState, useEffect} from 'react';
import {Toaster} from 'sonner';
import Sidebar from "@/Layouts/admin/sidebar.jsx";
import Topbar from "@/Layouts/admin/topbar.jsx";

const Layout = ({
                    pageTitle = 'Overview',
                    pageSection = 'Dashboard',
                    children
                }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('mineinvest-dark-mode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('mineinvest-dark-mode', 'false');
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setSidebarOpen(false);
        };

        const savedDarkMode = localStorage.getItem('mineinvest-dark-mode') === 'true';
        setDarkMode(savedDarkMode);
        if (savedDarkMode) document.documentElement.classList.add('dark');

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0B]">
            <Sidebar
                isOpen={sidebarOpen}
                isMobile={isMobile}
                onCloseSidebar={closeSidebar}
            />

            {sidebarOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={closeSidebar}
                />
            )}

            <Topbar
                darkMode={darkMode}
                pageTitle={pageTitle}
                pageSection={pageSection}
                onToggleSidebar={toggleSidebar}
                onToggleDarkMode={toggleDarkMode}
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
            />

            <main
                className="pt-16 min-h-screen transition-all duration-300"
                style={{
                    marginLeft: isMobile ? 0 : (sidebarOpen ? 260 : 72)
                }}
            >
                <div className="p-6">
                    <div className="sm:hidden flex items-center gap-2 text-sm mb-4">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{pageSection}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7"/>
                        </svg>
                        <span className="text-gray-900 dark:text-gray-100 font-semibold">{pageTitle}</span>
                    </div>

                    {children}
                </div>
            </main>

            <Toaster position="top-right"/>
        </div>
    );
};

export default Layout;
