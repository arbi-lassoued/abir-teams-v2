import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddUserAPI from '../../api/user/AddUserAPI';
import CheckUserExistsAPI from '../../api/user/CheckUserExistsAPI';
import { FaSave, FaArrowLeft, FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';
import Department from './Department.jsx';
import Roles from './Roles';

const AddUser = () => {
    const navigate = useNavigate();
    const [checkingUser, setCheckingUser] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        department: '',
        sub_department: '',
        position: '',
        shift: '',
        user_roles_summary: [],
        service_start_date: '',
    });
    const [errors, setErrors] = useState({});
    const [userExists, setUserExists] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [subDepartment, setSubDepartment] = useState([]);

    const debounce = (func, delay) => {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const handleUserChange = debounce(async (value) => {
        if (!value) return;
        setCheckingUser(true);
        try {
            const userData = await CheckUserExistsAPI(value);
            setUserExists(!!userData);
        } catch (error) {
            console.error("Error checking user:", error);
            setUserExists(false);
        } finally {
            setCheckingUser(false);
        }
    }, 500);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'username') {
            handleUserChange(value);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.username.trim()) newErrors.username = 'Username is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'Invalid email format';
            }
        }
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match';
        }
        if (!formData.user_roles_summary.length) newErrors.user_roles_summary = 'At least one role is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm() || userExists) return;

        setIsSubmitting(true);
        try {
            const payload = {
                username: formData.username.trim(),
                email: formData.email.trim(),
                password: formData.password,
                department: formData.department,
                sub_department: formData.sub_department,
                position: formData.position.trim(),
                shift: formData.shift || null,
                user_roles_summary: formData.user_roles_summary,
                service_start_date: new Date().toISOString(),
            };
            
            console.log("JSON payload:", JSON.stringify(payload, null, 2));
            await AddUserAPI(payload);
            navigate('/user/list');
        } catch (error) {
            console.error("Error adding user:", error);
            setErrors(prev => ({
                ...prev,
                submit: error.response?.data?.message || "Failed to add user"
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDepartmentChange = (e) => {
        const department = e.target.value;
        const sub_departments = Department[department] || [];

        setFormData(prev => ({
            ...prev,
            department,
            sub_department: sub_departments.length > 0 ? sub_departments[0] : ''
        }));

        setSubDepartment(sub_departments);
    };

    const handleRoleChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            user_roles_summary: checked 
                ? [...prev.user_roles_summary, value]
                : prev.user_roles_summary.filter(role => role !== value)
        }));
    };

    return (
        <div className=" bg-white w-full  py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto ">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/user/list')}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200 mb-4 group"
                    >
                        <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                        Back to Users List
                    </button>
                    
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                            <FaUserPlus className="text-2xl text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Add New User</h1>
                            <p className="text-gray-600 mt-1">Create a new user account with appropriate permissions</p>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="rounded-2xl shadow-lg border  border-gray-200 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8">
                        {errors.submit && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                                <div className="flex items-center">
                                    <FaTimes className="text-red-500 mr-3" />
                                    <span className="text-red-700 font-medium">{errors.submit}</span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Personal Information */}
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r p-6 rounded-xl border border-indigo-100">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <div className="w-2 h-2 bg-[#0070EF] rounded-full mr-3"></div>
                                        Account Information
                                    </h2>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Username *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                                                        errors.username ? 'border-red-500' : 'border-gray-300'
                                                    } ${userExists ? 'border-red-500' : ''}`}
                                                    placeholder="Enter username"
                                                />
                                                {checkingUser && (
                                                    <div className="absolute right-3 top-3.5">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
                                                    </div>
                                                )}
                                                {!checkingUser && formData.username && (
                                                    <div className="absolute right-3 top-3.5">
                                                        {userExists ? (
                                                            <FaTimes className="text-red-500" />
                                                        ) : (
                                                            <FaCheck className="text-green-500" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {errors.username && (
                                                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                                            )}
                                            {userExists && (
                                                <p className="text-red-500 text-sm mt-1">Username already exists</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Password *
                                                </label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                                                        errors.password ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    placeholder="Enter password"
                                                />
                                                {errors.password && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Confirm Password *
                                                </label>
                                                <input
                                                    type="password"
                                                    name="confirm_password"
                                                    value={formData.confirm_password}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                                                        errors.confirm_password ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    placeholder="Confirm password"
                                                />
                                                {errors.confirm_password && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="user@company.com"
                                            />
                                            {errors.email && (
                                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Department Information */}
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r  p-6 rounded-xl border border-blue-100">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                        Department Information
                                    </h2>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Department *
                                            </label>
                                            <select
                                                name="department"
                                                value={formData.department}
                                                onChange={handleDepartmentChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            >
                                                <option value="">Select a department</option>
                                                {Object.keys(Department).map((department) => (
                                                    <option key={department} value={department}>
                                                        {department}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {formData.department && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Sub Department *
                                                </label>
                                                <select
                                                    name="sub_department"
                                                    value={formData.sub_department}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                >
                                                    <option value="">Select a sub department</option>
                                                    {subDepartment.map((sub) => (
                                                        <option key={sub} value={sub}>
                                                            {sub}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Position
                                                </label>
                                                <input
                                                    type="text"
                                                    name="position"
                                                    value={formData.position}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    placeholder="e.g., Manager, Engineer"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Shift
                                                </label>
                                                <select
                                                    name="shift"
                                                    value={formData.shift}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                >
                                                    <option value="">Select a shift</option>
                                                    <option value="Regular">Regular</option>
                                                    <option value="Day Shift">Day Shift</option>
                                                    <option value="Night Shift">Night Shift</option>
                                                    <option value="Shift Rotation">Shift Rotation</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Roles Section */}
                        <div className="mt-8">
                            <div className="bg-gradient-to-r  p-6 rounded-xl border border-purple-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                    User Roles & Permissions *
                                </h2>
                                
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                                        {Roles.map((role) => (
                                            <label key={role} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer border border-gray-200">
                                                <input
                                                    type="checkbox"
                                                    value={role}
                                                    checked={formData.user_roles_summary.includes(role)}
                                                    onChange={handleRoleChange}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <span className="ml-3 text-sm text-gray-700 font-medium">{role}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.user_roles_summary && (
                                        <p className="text-red-500 text-sm mt-3">{errors.user_roles_summary}</p>
                                    )}
                                    <div className="mt-4 text-sm text-gray-600">
                                        Selected: {formData.user_roles_summary.length} roles
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate('/user/list')}
                                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || userExists}
                                className={`px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium flex items-center transition-all duration-200 ${
                                    isSubmitting || userExists 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : 'hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5'
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Creating User...
                                    </>
                                ) : (
                                    <>
                                        <FaSave className="mr-2" />
                                        Create User
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddUser;