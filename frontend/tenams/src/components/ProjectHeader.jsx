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
import { FiLogOut } from 'react-icons/fi'; // Import logout icon

const ProjectHeader = () => {
    const { logout } = useAuth();

    return (
        <header className="fixed top-0 left-0 right-0 bg-[#0070EF] shadow-sm z-10">
            <div className="flex items-center justify-between h-12 px-6">
                {/* Left side - Empty */}
                <div></div>

                {/* Center - Logo/Title */}
                <div className="flex items-center gap-3">
                    <img src="/image.svg" alt="Logo" className="h-[108px] w-[108px]" />
                    <div className="text-xl font-semibold text-white">
                        TECHNIP ASSET MANAGEMENT PLATFORM_ENGINEERING TOOLS
                    </div>
                </div>

                {/* Right side - User profile/empty space */}
                <button
                    onClick={logout}
                    className="flex items-center space-x-2 text-white hover:text-blue-600 transition-colors"
                    aria-label="Logout"
                >
                    <FiLogOut className="w-5 h-5" />
                    <span className="hidden md:inline text-white">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default ProjectHeader;