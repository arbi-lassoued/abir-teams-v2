import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PMListAPI from "../../../api/planned_maintenance/basis_planned_maintenance/PMListAPI";
import DeletePMAPI from "../../../api/planned_maintenance/basis_planned_maintenance/DeletePMAPI";
import UploadPMListAPI from "../../../api/planned_maintenance/basis_planned_maintenance/UploadPMListAPI";
import UpdatePMStatusAPI from "../../../api/planned_maintenance/basis_planned_maintenance/UpdatePMStatusAPI";
import FetchPMAPI from "../../../api/planned_maintenance/basis_planned_maintenance/FetchPMAPI";
import EditPMAPI from "../../../api/planned_maintenance/basis_planned_maintenance/EditPMAPI";


import { FaTrash, FaArrowLeft, FaSave } from 'react-icons/fa';

const EditIHPremPM= () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({});
    const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState({});
    // ============================================================================================================================
    useEffect(() => {
        const loadPM = async () => {
            try {
                const data = await FetchPMAPI(id);
                if (data.service_start_date) {
                    data.service_start_date = new Date(data.service_start_date).toISOString().split('T')[0]; // => "2025-01-05"
                }
                if (data.service_end_date) {
                    data.service_end_date = new Date(data.service_end_date).toISOString().split('T')[0];
                }

                setFormData(data); // Store directly in formData
                setIsLoading(false);
            } catch (error) {
                console.error("Error loading data:", error);
                navigate('/activities', { replace: true });
                setIsLoading(false);
            }
        };
        loadPM();
    }, [id, navigate]);

    // ============================================================================================================================

    // const formatDateForInput = (dateString) => {
    //     if (!dateString) return '';

    //     try {
    //         // Handle both ISO strings and Date objects
    //         const date = new Date(dateString);
    //         if (isNaN(date.getTime())) return '';

    //         // Convert to YYYY-MM-DD format
    //         const year = date.getFullYear();
    //         const month = String(date.getMonth() + 1).padStart(2, '0');
    //         const day = String(date.getDate()).padStart(2, '0');

    //         return `${year}-${month}-${day}`;
    //     } catch (e) {
    //         console.error("Error formatting date:", e);
    //         return '';
    //     }
    // };
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
    };
    // ============================================================================================================================
    // Validate form before submission
    const validateForm = () => {
        const newErrors = {};

        // Validate frequency (must be a valid float if provided)
        if (formData.frequency && isNaN(parseInt(formData.frequency))) {
            newErrors.frequency = 'Please enter a valid number';
        }

        // Validate service dates
        if (formData.service_start_date) {
            const startDate = new Date(formData.service_start_date);
            if (isNaN(startDate.getTime())) {
                newErrors.service_start_date = 'Invalid date format (YYYY-MM-DD)';
            }
        }

        if (formData.service_end_date) {
            const endDate = new Date(formData.service_end_date);
            if (isNaN(endDate.getTime())) {
                newErrors.service_end_date = 'Invalid date format (YYYY-MM-DD)';
            }
        }

        // Validate forecast duration (must be a valid float if provided)
        if (formData.forcast_duration && isNaN(parseFloat(formData.forcast_duration))) {
            newErrors.forcast_duration = 'Please enter a valid number';
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
            kks: formData.kks,
            asset_description: formData.asset_description,
            activity_description: formData.activity_description,
            location_key: formData.location_key,
            parent_location_key: formData.parent_location_key,
            service_start_date: formData.service_start_date ? new Date(formData.service_start_date + 'T00:00:00Z').toISOString() : null,
            forcast_duration: formData.forcast_duration ? parseFloat(formData.forcast_duration) : null,
            service_end_date: formData.service_end_date ? new Date(formData.service_end_date + 'T00:00:00Z').toISOString() : null,
            status: formData.status,
            cost: formData.cost? parseFloat(formData.cost) : null,
            frequency: formData.frequency ? parseInt(formData.frequency) : null,
            maintenance_type: formData.maintenance_type,
            scope: formData.scope,
            procedure: formData.procedure,
            notes: formData.notes,
        };
        try {
            await EditPMAPI(id, payload);
            navigate('/activities');
        } catch (error) {
            console.error("Error updating planned activity:", error);
            alert("Failed to update. Please check your inputs and try again.");
        }
    };
    // ============================================================================================================================
      const handleDelete = async () => {
        try {
            await DeletePMAPI(id);
            navigate('/activities');
        } catch (error) {
            console.error("Error deleting planned activity:", error);  
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    // ============================================================================================================================
    const handleIntegerInput = (e) => {
        const { name, value } = e.target;

        // Check if the input is empty or a valid integer
        if (value === '' || /^-?\d*$/.test(value)) {
            // Update the cost only if valid
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        // Otherwise, don't update the cost (invalid input is ignored)
    };

    // Helper function to check if a value is a valid integer
    // const isValidInteger = (value) => {
    //     if (value === '') return true;
    //     return /^-?\d+$/.test(value);
    // };

    // ============================================================================================================================
    const handleFloatInput = (e) => {
        const { name, value } = e.target;

        // Allow empty string or valid float numbers (including numbers with decimal point)
        if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    // ============================================================================================================================
    return (
        <div className="container max-h-[70vh] mx-auto p-10 max-w-screen-3xl">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate('/equipment')}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                >
                    <FaArrowLeft className="mr-2" /> Back to Planned Maintenance List
                </button>

                {!isDeleteConfirm ? (
                    <button
                        onClick={() => setIsDeleteConfirm(true)}
                        className="flex items-center text-red-600 hover:text-red-800"
                    >
                        <FaTrash className="mr-2" /> Delete planned Activity
                    </button>
                ) : (
                    <div className="flex items-center space-x-4">
                        <span className="text-red-600">Are you sure?</span>
                        <button
                            onClick={handleDelete}
                            className="px-3 py-1 bg-red-600 text-white rounded"
                        >
                            Yes, Delete
                        </button>
                        <button
                            onClick={() => setIsDeleteConfirm(false)}
                            className="px-3 py-1 border border-gray-300 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            <h1 className="text-2xl font-bold mb-6">Edit Planned Activity: {formData.kks}</h1>

            <form onSubmit={handleSubmit} className="overflow-y-auto bg-white p-6 rounded-lg shadow">
                <div className=" grid grid-cols-1 bg-white md:grid-cols-2 lg:grid-cols-3  gap-6 justify-center" >
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1">Asset Code</label>
                            <input
                                type="text"
                                name="kks"
                                value={formData.kks || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Asset Description</label>
                            <input
                                type="text"
                                name="asset_description"
                                value={formData.asset_description || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Planned Activity Description</label>
                            <input
                                type="text"
                                name="activity_description"
                                value={formData.activity_description || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Location Key</label>
                            <input
                                type="text"
                                name="location_key"
                                value={formData.location_key || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Parent Location Key</label>
                            <input
                                type="text"
                                name="parent_location_Key"
                                value={formData.parent_location_key || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>

                    {/* Additional Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1">Service Start Date</label>
                            <input
                                type="date"
                                name="service_start_date"
                                value={formData.service_start_date || ''}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded ${errors.service_start_date ? 'border-red-500' : ''}`}
                            />
                            {errors.service_start_date && (
                                <p className="text-red-500 text-sm mt-1">{errors.service_start_date}</p>
                            )}
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Forcast Duration</label>
                            <input
                                type="text"
                                name="forcast_duration"
                                value={formData.forcast_duration || ''}
                                onChange={handleFloatInput}
                                className={`w-full p-2 border rounded ${errors.forcast_duration ? 'border-red-500' : ''}`}
                            />
                            {errors.forcast_duration && (
                                <p className="text-red-500 text-sm mt-1">{errors.forcast_duration}</p>)}

                        </div>

                        <div>
                            <label className="block font-medium mb-1">Service End Ddate</label>
                            <input
                                type="date"
                                name="service_end_date"
                                value={formData.service_end_date || ''}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded ${errors.service_end_date ? 'border-red-500' : ''}`}
                            />
                            {errors.service_end_date && (
                                <p className="text-red-500 text-sm mt-1">{errors.service_end_date}</p>
                            )}
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Asset Status</label>
                            <select
                                name="status"
                                value={formData.status || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            >
                                {/* <option value="">Enable</option> Optional default */}
                                {['Enable', 'Disable'].map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Activity Cost ($)</label>
                            <input
                                type="text"
                                name="cost"
                                value={formData.cost || ''}
                                 onChange={handleFloatInput}
                                className={`w-full p-2 border rounded ${errors.cost ? 'border-red-500' : ''}`}
                            />
                            {errors.cost && (
                                <p className="text-red-500 text-sm mt-1">{errors.cost}</p>)}
                        </div>
                    </div>
                    {/* Additional Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1">Frequency</label>
                            <input
                                type="text"
                                name="frequency"
                                value={formData.frequency || ''}
                                onChange={handleIntegerInput}
                                className={`w-full p-2 border rounded ${errors.frequency ? 'border-red-500' : ''}`}
                            />
                            {errors.frequency && (
                                <p className="text-red-500 text-sm mt-1">{errors.frequency}</p>
                            )}
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Mintenance Type</label>
                            <input
                                type="text"
                                name="maintenance_type"
                                value={formData.maintenance_type || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1 ">Scope</label>
                            <input type="text"
                                name="scope"
                                value={formData.scope || ''}
                                onChange={handleChange}

                                className="w-full p-2 border rounded bg-blue-100"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Procedure</label>
                            <input
                                type="text"
                                name="procedure"
                                value={formData.procedure || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Notes</label>
                            <input
                                type="text"
                                name="notes"
                                value={formData.notes || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                    </div>

                </div>

                <div className="flex justify-end space-x-4 mt-8 border-t pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/activities')}
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

export default EditIHPremPM;