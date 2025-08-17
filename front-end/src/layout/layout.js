
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './sidebar';
import Header from './header';
const Layout = () => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50">
            <div
                className="relative"
                onMouseEnter={() => setIsSidebarExpanded(true)}
                onMouseLeave={() => setIsSidebarExpanded(false)}
            >
                <Sidebar />
            </div>

            <div className="flex flex-col flex-1">
                <Header isSidebarExpanded={isSidebarExpanded} />
                <main className={`p-0 flex-1 overflow-auto transition-all duration-300 ${isSidebarExpanded ? 'ml-48' : 'ml-16'
                    }`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;