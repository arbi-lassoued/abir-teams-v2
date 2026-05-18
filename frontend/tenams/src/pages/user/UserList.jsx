 import React, { useEffect, useState, useMemo, useCallback } from "react";
import UserListAPI from "../../api/user/UserListAPI";
import DeleteUserAPI from "../../api/user/DeleteUserAPI";
import { FaEdit, FaTrash, FaPlus, FaFileExcel, FaFilter, FaTimes, FaUsers, FaUser } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import UserDetailsSidebar from "./UserDetailsSidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";

const ITEMS_PER_PAGE = 20;

const UserList = () => {
    const [user, setUser] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [selectedUser, setSelectedUser] = useState(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        role: '',
        department: ''
    });
    const [sortConfig, setSortConfig] = useState({ key: 'user_id', direction: 'asc' });
    const [confirmationMessage, setConfirmationMessage] = useState({
        show: false,
        type: '', // 'delete'
        user: null,
        action: null
    });

    // Load user data
    const loadUsersList = useCallback(async () => {
        try {
            setLoading(true);
            const data = await UserListAPI();
            setUser(data);
            setError(null);
        } catch (error) {
            setError('Failed to load user list');
            console.error("Error loading user list:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsersList();
    }, [loadUsersList]);

    // Get unique values for filters
    const uniqueValues = useMemo(() => {
        return {
            role: [...new Set(user.map(item => {
                // Handle both array and string formats
                if (Array.isArray(item.user_roles_summary)) {
                    return item.user_roles_summary[0];
                }
                return item.user_roles_summary;
            }))].filter(Boolean),
            department: [...new Set(user.map(item => item.department))].filter(Boolean)
        };
    }, [user]);

    // Filter and sort users
    const filteredAndSortedUsers = useMemo(() => {
        let filtered = user.filter(item => {
            // Get role as string for comparison
            const roleString = Array.isArray(item.user_roles_summary) 
                ? item.user_roles_summary[0] 
                : item.user_roles_summary;
            
            const matchesSearch = 
                item.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                roleString?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilters = 
                (!filters.role || roleString === filters.role) &&
                (!filters.department || item.department === filters.department);

            return matchesSearch && matchesFilters;
        });

        // Sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                // Handle numeric sorting
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                }
                
                // Handle string sorting
                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [user, searchTerm, filters, sortConfig]);

    // Pagination
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedUsers, currentPage]);

    const totalPages = Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE);

    // Handle sort
    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Handle row click
    const handleRowClick = (user) => {
        setSelectedUser(user);
        setShowSidebar(true);
    };

    // Confirmation system
    const showConfirmation = (type, user, action) => {
        setConfirmationMessage({
            show: true,
            type,
            user,
            action
        });
    };

    const hideConfirmation = () => {
        setConfirmationMessage({
            show: false,
            type: '',
            user: null,
            action: null
        });
    };

    const confirmAction = async () => {
        if (confirmationMessage.action) {
            await confirmationMessage.action();
        }
        hideConfirmation();
    };

    // Action handlers
    const handleEditClick = (e, username) => {
        e.stopPropagation();
        navigate(`/user/edit/${username}`);
    };

    const handleDeleteClick = async (e, user) => {
        e.stopPropagation();
        showConfirmation('delete', user, async () => {
            try {
                await DeleteUserAPI(user.user_id);
                loadUsersList();
            } catch (error) {
                console.error("Error deleting user:", error);
                setError("Failed to delete user.");
            }
        });
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredAndSortedUsers);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, `users_list_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const clearFilters = () => {
        setFilters({ role: '', department: '' });
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Get confirmation message details
    const getConfirmationDetails = () => {
        const { type, user } = confirmationMessage;
        
        const messages = {
            delete: {
                title: 'Delete User',
                icon: 'trash',
                color: 'red',
                message: `Are you sure you want to delete user "${user?.username}"? This action cannot be undone.`,
                confirmText: 'Delete User'
            }
        };

        return messages[type] || messages.delete;
    };

    // Get role badge color
    const getRoleBadgeColor = (role) => {
        // Handle both array and string formats
        const roleString = Array.isArray(role) ? role[0] : role;
        const normalizedRole = roleString?.toLowerCase() || '';
        
        switch (normalizedRole) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'administrator': return 'bg-red-100 text-red-800';
            case 'manager': return 'bg-purple-100 text-purple-800';
            case 'supervisor': return 'bg-blue-100 text-blue-800';
            case 'operator': return 'bg-green-100 text-green-800';
            case 'user': return 'bg-yellow-100 text-yellow-800';
            case 'technician': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading users...</div>;
    if (error) return <div className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <FaUsers className="text-blue-600" />
                    User Management
                </h1>
                <div className="flex gap-3">
                    <Button
                        onClick={() => navigate('/user/add')}
                        className="flex items-center gap-2"
                    >
                        <FaPlus /> Add User
                    </Button>
                    <Button
                        onClick={handleExportExcel}
                        variant="secondary"
                        className="flex items-center gap-2"
                    >
                        <FaFileExcel /> Export
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <Input
                                placeholder="Search by username, email, department, role..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <Select
                            value={filters.role}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, role: e.target.value }));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All Roles</option>
                            {uniqueValues.role.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </Select>
                        <Select
                            value={filters.department}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, department: e.target.value }));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All Departments</option>
                            {uniqueValues.department.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaFilter />
                            <span>Showing {filteredAndSortedUsers.length} of {user.length} users</span>
                        </div>
                        <Button variant="ghost" onClick={clearFilters} size="sm">
                            <FaTimes className="mr-1" /> Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto max-h-[45vh] rounded-xl">
                        <table className="w-full overflow-auto">
                            <thead className="bg-[#0070EF] border-b text-white sticky top-0">
                                <tr>
                                    <th 
                                        className="p-4 text-left font-semibold cursor-pointer"
                                        onClick={() => handleSort('user_id')}
                                    >
                                        User ID {sortConfig.key === 'user_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        className="p-4 text-left font-semibold cursor-pointer"
                                        onClick={() => handleSort('username')}
                                    >
                                        Username {sortConfig.key === 'username' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        className="p-4 text-left font-semibold cursor-pointer "
                                        onClick={() => handleSort('email')}
                                    >
                                        Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        className="p-4 text-left font-semibold cursor-pointer"
                                        onClick={() => handleSort('department')}
                                    >
                                        Department {sortConfig.key === 'department' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        className="p-4 text-left font-semibold cursor-pointer"
                                        onClick={() => handleSort('user_roles_summary')}
                                    >
                                        Role {sortConfig.key === 'user_roles_summary' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="p-4 text-left font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {paginatedUsers.map((user) => (
                                    <tr 
                                        key={user.user_id} 
                                        className="hover:bg-violet-200 cursor-pointer transition-colors"
                                        onClick={() => handleRowClick(user)}
                                    >
                                        <td className="p-4 font-mono text-sm text-gray-600">#{user.user_id}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                                <FaUser className="text-gray-400" />
                                                {user.username}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium">{user.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium">{user.department}</div>
                                            <div className="text-sm text-gray-500">{user.sub_department}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.user_roles_summary)}`}>
                                                {Array.isArray(user.user_roles_summary) ? user.user_roles_summary[0] : user.user_roles_summary}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => handleEditClick(e, user.username)}
                                                    title="Edit User"
                                                >
                                                    <FaEdit className="text-blue-600" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => handleDeleteClick(e, user)}
                                                    title="Delete User"
                                                >
                                                    <FaTrash className="text-red-600" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t">
                            <div className="text-sm text-gray-700">
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} results
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(pageNum)}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                    {totalPages > 5 && <span className="px-2">...</span>}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* User Details Sidebar */}
            <UserDetailsSidebar
                user={selectedUser}
                isOpen={showSidebar}
                onClose={() => setShowSidebar(false)}
            />

            {/* Confirmation Message Card */}
            {confirmationMessage.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4`}>
                                    <FaTrash className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {getConfirmationDetails().title}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {getConfirmationDetails().message}
                                </p>
                                {confirmationMessage.user && (
                                    <div className="bg-gray-50 p-3 rounded-lg mb-6 text-left">
                                        <p className="text-sm font-medium">User Details:</p>
                                        <p className="text-sm"><strong>Username:</strong> {confirmationMessage.user.username}</p>
                                        <p className="text-sm"><strong>Email:</strong> {confirmationMessage.user.email}</p>
                                        <p className="text-sm"><strong>Role:</strong> {confirmationMessage.user.user_roles_summary}</p>
                                    </div>
                                )}
                                <div className="flex gap-3 justify-center">
                                    <Button
                                        variant="outline"
                                        onClick={hideConfirmation}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={confirmAction}
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                    >
                                        {getConfirmationDetails().confirmText}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default UserList;