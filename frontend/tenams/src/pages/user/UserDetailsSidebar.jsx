import React from 'react';
import { FaUser, FaEnvelope, FaBuilding, FaIdBadge, FaClock, FaShieldAlt } from 'react-icons/fa';

const UserDetailsSidebar = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    const DetailItem = ({ label, value, icon }) => (
        <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <h3 className="font-semibold text-gray-700 text-sm">{label}</h3>
            </div>
            <p className="text-gray-900 ml-6">{value || '-'}</p>
        </div>
    );

    const getRoleBadgeColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'manager': return 'bg-purple-100 text-purple-800';
            case 'supervisor': return 'bg-blue-100 text-blue-800';
            case 'operator': return 'bg-green-100 text-green-800';
            case 'technician': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                    <p className="text-gray-600 text-sm">#{user.user_id}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                    ×
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 ">
                <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Basic Information</h3>
                        <div className="grid gap-4">
                            <DetailItem 
                                label="User ID" 
                                value={user.user_id} 
                                icon={<FaIdBadge className="text-gray-400" />}
                            />
                            <DetailItem 
                                label="Username" 
                                value={user.username} 
                                icon={<FaUser className="text-gray-400" />}
                            />
                            <DetailItem 
                                label="Email" 
                                value={user.email} 
                                icon={<FaEnvelope className="text-gray-400" />}
                            />
                        </div>
                    </div>

                    {/* Department Information */}
                    <div>
                        <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Department</h3>
                        <div className="grid gap-4">
                            <DetailItem 
                                label="Department" 
                                value={user.department} 
                                icon={<FaBuilding className="text-gray-400" />}
                            />
                            <DetailItem 
                                label="Sub Department" 
                                value={user.sub_department} 
                                icon={<FaBuilding className="text-gray-400" />}
                            />
                            <DetailItem 
                                label="Shift" 
                                value={user.shift} 
                                icon={<FaClock className="text-gray-400" />}
                            />
                        </div>
                    </div>

                    {/* Role Information */}
                    <div>
                        <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Role & Permissions</h3>
                        <div className="grid gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <FaShieldAlt className="text-gray-400" />
                                    <h3 className="font-semibold text-gray-700 text-sm">Role</h3>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-6 ${getRoleBadgeColor(user.user_roles_summary)}`}>
                                    {user.user_roles_summary}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div>
                        <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Additional Details</h3>
                        <div className="grid gap-4">
                            <DetailItem 
                                label="Created Date" 
                                value={user.created_date} 
                                icon={<FaClock className="text-gray-400" />}
                            />
                            <DetailItem 
                                label="Last Login" 
                                value={user.last_login} 
                                icon={<FaClock className="text-gray-400" />}
                            />
                            <DetailItem 
                                label="Status" 
                                value={user.status} 
                                icon={<FaUser className="text-gray-400" />}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4">
                <button
                    onClick={onClose}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default UserDetailsSidebar;