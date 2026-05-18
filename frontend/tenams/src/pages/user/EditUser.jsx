import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserListAPI from '../../api/user/UserListAPI';
import CheckUserExistsAPI from '../../api/user/CheckUserExistsAPI';
import EditUserAPI from '../../api/user/EditUserAPI'
import Department from './Department.jsx';
import Roles from './Roles';


import { FaTrash, FaArrowLeft, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';

// ============================================================================================================================

const EditUser = () => {
    const { username } = useParams();
    // const [checkingUser] = useState(false);
    // const [userExists, setUserExists] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true); 
    const [errors, setErrors] = useState({});
    const [subDepartment, setSubDepartment] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)


    // const debounce = (func, delay) => {
    //     let timer;
    //     return function (...args) {
    //         clearTimeout(timer);
    //         timer = setTimeout(() => func.apply(this, args), delay);
    //     };
    // };

    // const handleUserChange = debounce(async (value) => {
    //     if (!value) return;

    //     try {
    //         const userData = await CheckUserExistsAPI(value);
    //         if (userData) {
    //             setFormData(prev => ({
    //                 ...prev,
    //             }));
    //             setUserExists(true);
    //         } else {
    //             setUserExists(false); // user doesn't exist - keep fields editable

    //         }
    //     } catch (error) {
    //         console.error("Error checking user:", error);
    //         setUserExists(false);
    //     }
    // }, 500); // 500ms delay
    // ============================================================================================================================
    useEffect(() => {
        const loadUser = async () => {
            try {
                const data = await CheckUserExistsAPI(username);
                console.log("Fetched user data:", data);   // 👈 check here
                console.log("Roles field type:", typeof data.user_roles_summary, data.user_roles_summary);
                setFormData({
                    ...data,
                    password: "",
                    confirm_password: "",
                    // user_roles_summary: data.user_roles_summary || [] 

                });
                setIsLoading(false);
            } catch (error) {
                console.error("Error loading data:", error);
                navigate('/user/list', { replace: true });
                setIsLoading(false);
            }
        };
        loadUser();
    }, [username, navigate]);

    //==========================================================================================================================================================================
    useEffect(() => {
        if (formData.department) {

            setSubDepartment(Department[formData.department] || []);
        }
    }, [formData.department]);

    // ============================================================================================================================

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
        // else (name === 'username')
        // handleUserChange(value);
    };

    // ============================================================================================================================
    // Validate form before submission
    const validateForm = () => {
        const newErrors = {};
        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.email) {
            newErrors.email = 'Mail Address is required';
        } else {
            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'Invalid email format';
            }
        }

        if (!formData.password) newErrors.password = 'Password is required';
        if (!formData.confirm_password) newErrors.confirm_password = 'Password is required';
        if (!formData.user_roles_summary) newErrors.user_roles_summary = 'Roles are required';

        // Validate dates
        if (formData.password && formData.confirm_password) {
            console.log("Password:", formData.password, "Confirm Password:", formData.confirm_password);
            if (formData.password !== formData.confirm_password) {
                newErrors.confirm_password = 'Password Mismatch';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // ============================================================================================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        const payload = {
            // ...formData,
            // username: formData.username,
            email: formData.email,
            password: formData.password,
            department: formData.department,
            sub_department: formData.sub_department,
            position: formData.position,
            shift: formData.shift || null,
            user_roles_summary: formData.user_roles_summary,
        };
        try {
            await EditUserAPI(username, payload);
            navigate('/user/list');
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update. Please check your inputs and try again.");
        }
    };
    // ============================================================================================================================

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    // ============================================================================================================================
    // Handle category change
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

    // Handle sub-class change
    const handleSubDepartmentChange = (e) => {
        const sub_department = e.target.value;
        setFormData(prev => ({
            ...prev,
            sub_department: sub_department
        }));
    };
    // ============================================================================================================================
    const handleRoleChange = (e) => {
        const { value, checked } = e.target;

        // Ensure it's always an array
        let updatedRoles = Array.isArray(formData.user_roles_summary)
            ? [...formData.user_roles_summary]
            : [];

        if (checked) {
            if (!updatedRoles.includes(value)) {
                updatedRoles.push(value); // Add only if not already in
            }
        } else {
            updatedRoles = updatedRoles.filter((role) => role !== value);
        }

        setFormData({ ...formData, user_roles_summary: updatedRoles });
    };

    // ============================================================================================================================

    return (
        <div className="container max-h-[70vh] mx-auto p-10 max-w-screen-3xl">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate('/user/list')}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                >
                    <FaArrowLeft className="mr-2" /> Back to User List
                </button>
            </div>

            <h1 className="text-2xl font-bold mb-6">Edit User Details: {formData.username}</h1>

            <form onSubmit={handleSubmit} className="overflow-y-auto bg-white p-6 rounded-lg shadow">
                <div className=" grid grid-cols-1 bg-white md:grid-cols-2 lg:grid-cols-3  gap-6 justify-center" >
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1">Password*</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />  <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}


                            <label className="block font-medium mb-1">Confirm Password*</label>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <span
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>

                            {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>}


                            <label className="block font-medium mb-1">Email*</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                    </div>
                    {/* Asset Information Column */}
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1">Department*</label>
                            <select
                                name="department"
                                value={formData.department || ''}
                                onChange={handleDepartmentChange}
                                className="w-full p-2 border rounded"
                                required
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
                                <label className="block font-medium mb-1">Sub Department*</label>
                                <select
                                    name="sub_department"
                                    value={formData.sub_department}
                                    onChange={handleSubDepartmentChange}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="">Select a sub_department</option>
                                    {subDepartment.map((sub_department) => (
                                        <option key={sub_department} value={sub_department}>
                                            {sub_department}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block font-medium mb-1">Shift</label>
                            <select
                                type="text"
                                name="shift"
                                value={formData.shift || ''}
                                onChange={handleChange}  // Changed to custom handler
                                className="w-full p-2 border rounded"
                                placeholder="Shift"
                                required
                            >
                                <option value="">Select a Shift</option>
                                <option value="Regular">Regular</option>
                                <option value="Day Shift">Day Shift</option>
                                <option value="Night Shift">Night Shift</option>
                                <option value="Shift Rotation">Shift Rotation</option>

                            </select>
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Position</label>
                            <input
                                type="text"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded ${errors.position ? 'border-red-500' : ''}`}

                            />
                            {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1">Roles</label>
                        <div className="grid grid-cols-5 gap-x-20 max-w-full gap-y-8 bg-white">
                            {Roles.map((role) => (
                                <label key={role} className="flex items-center space-x-2 ">
                                    <input
                                        type="checkbox"
                                        name="user_roles_summary"
                                        value={role}
                                        checked={formData.user_roles_summary.includes(role)}
                                        onChange={handleRoleChange}
                                    />
                                    <span>{role}</span>
                                </label>
                            ))}
                        </div>
                        {errors.user_roles_summary && (
                            <p className="text-red-500 text-sm mt-1">{errors.user_roles_summary}</p>
                        )}
                    </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8 border-t pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/user/list')}
                        className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                    >
                        <FaSave className="mr-2" /> Save Changes
                    </button>
                </div>
            </form >
        </div >
    );
};

export default EditUser;