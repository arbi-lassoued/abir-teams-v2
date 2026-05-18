// import React from "react";

// const Header = () => {
//     return (
//         <header className="fixed top-0 left-0 right-0 bg-blue-200 p-3 shadow-md border-b z-50 flex justify-center items-center">
//             <h1 className="text-xl font-semibold text-gray-800">ASSETS MANAGEMENT PLATFORM</h1>
//         </header>
//     );
// };

// export default Header;


import { useAuth } from '../context/UseAuth';
import { FiLink, FiLogIn, FiLogOut, FiTool } from 'react-icons/fi'; // Import logout icon
import { useLocation } from 'react-router-dom';

const Header = () => {
    const { logout, user } = useAuth();
    const location = useLocation();

    // Check if user is authenticated
    const isAuthenticated = !!user;
    
    // Check if user is admin (handle both array and string formats)
    let isAdmin = false;
    if (Array.isArray(user?.roles)) {
      isAdmin = user.roles.includes('Administrator');
    } else if (typeof user?.roles === 'string') {
      isAdmin = user.roles === 'Administrator';
    }
    
    // Determine the navigation link and label
    const navLink = isAdmin ? '/ih_prem_pm_list' : '/project_management';
    const navLabel = isAdmin ? 'In House Data' : 'Engineering Tools';
    
    // Determine the header title based on current page
    let headerTitle = 'TECHNIP ASSET MANAGEMENT PLATFORM';
    if (location.pathname.startsWith('/login') || location.pathname.startsWith('/signup')) {
        headerTitle = 'TECHNIP ASSET MANAGEMENT PLATFORM';
    } else if (location.pathname.startsWith('/user')) {
        headerTitle = 'TECHNIP ASSET MANAGEMENT PLATFORM';
    } else if (location.pathname.startsWith('/ih_prem_pm')) {
        headerTitle = 'TECHNIP ASSET MANAGEMENT PLATFORM_IN HOUSE DATA';
    } else if (location.pathname.startsWith('/ih_equipment') || location.pathname.startsWith('/ih_spares')) {
        headerTitle = 'TECHNIP ASSET MANAGEMENT PLATFORM_IN HOUSE DATA';
    } else if (location.pathname.startsWith('/project_management') || location.pathname.startsWith('/projects')) {
        headerTitle = 'TECHNIP ASSET MANAGEMENT PLATFORM_ENGINEERING TOOLS';
    } else {
        headerTitle = 'TECHNIP ASSET MANAGEMENT PLATFORM_IN HOUSE DATA';
    }

    return (
        <header className="fixed top-0 left-0 right-0 bg-[#0070EF] shadow-sm z-10">
            <div className="flex items-center justify-between h-12 px-6">
                {/* Left side - Navigation button */}
                <div className="w-20" />

                {/* Center - Logo/Title */}
                <div className="flex items-center gap-3">
                    <img src="/image.svg" alt="Logo" className="h-[108px] w-[108px]" />
                    <div className="text-xl font-semibold text-white">
                        {headerTitle}
                    </div>
                </div>

                {/* Right side - User profile/empty space */}
                {location.pathname !== '/login' && location.pathname !== '/signup' ? (
                    <button
                        onClick={logout}
                        className="flex items-center space-x-2 text-white hover:text-blue-600 transition-colors"
                        aria-label="Logout"
                    >
                        <FiLogOut className="w-5 h-5" />
                        <span className="hidden md:inline text-white">Logout</span>
                    </button>
                ) : (
                    <div className="w-20" />
                )}
            </div>
        </header>
    );
};

export default Header;