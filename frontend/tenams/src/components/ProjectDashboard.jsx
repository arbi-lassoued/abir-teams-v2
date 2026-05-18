 import React, { useState } from "react"; // ✅ Added useState import
import ProjectSidebar from "./ProjectSidebar";
import ProjectHeader from "./ProjectHeader";
import { Outlet } from 'react-router-dom';

export default function ProjectDashboard() {
    const [sidebarRefresh, setSidebarRefresh] = useState(0);

    const refreshSidebar = () => {
        setSidebarRefresh(prev => prev + 1);
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Fixed Header */}
            <ProjectHeader />

            <div className="flex flex-1 pt-10">
                {/* Sidebar with refresh trigger */}
                <ProjectSidebar refreshTrigger={sidebarRefresh} /> {/* ✅ Added refreshTrigger prop */}

                {/* KPI Images Section - directly next to Sidebar */}
                <div className="flex flex-col ml-64 px-4 py-4 overflow-y-auto rounded-lg shadow-md">
                    {/* Your KPI images commented out */}
                    {/* <img
                        src="/images/KPI_1.png"
                        alt="KPIs Placeholder"
                        className="w-64 h-40 object-contain mb-6"
                    />
                    <div className="flex flex-col mt-5  px-4 py-4 overflow-x-auto w-max rounded-lg shadow-md"></div>
                    <img
                        src="/images/KPI_1.png"
                        alt="KPIs Placeholder"
                        className="w-64 h-40 object-contain mb-6"
                    />
                    <div className="flex flex-col mt-5  px-4 py-4 overflow-x-auto w-max rounded-lg shadow-md"></div>
                    <img
                        src="/images/KPI_1.png"
                        alt="KPIs Placeholder"
                        className="w-64 h-40 object-contain mb-6" 
                    />
                    <div className="flex flex-col mt-5  px-4 py-4 overflow-x-auto w-max rounded-lg shadow-md"></div>
                    <img
                        src="/images/KPI_1.png"
                        alt="KPIs Placeholder"
                        className="w-64 h-40 object-contain" 
                    /> */}
                </div>

                {/* Main Outlet Section - Pass refreshSidebar function to child components */}
                <div className="flex flex-1 px-6 py-4 overflow-x-auto">
                    <Outlet context={{ refreshSidebar }} /> {/* ✅ Pass refresh function to child routes */}
                </div>
            </div>

            {/* Fixed Footer */}
            <footer className="bg-white py-4 border-t text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Linknow. All rights reserved.
            </footer>
        </div>
    );
}