import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddPMAPI from '../../../api/planned_maintenance/basis_planned_maintenance/AddPMAPI';
import CheckKKSExistsAPI from '../../../api/equipment/CheckKKSExistsAPI';
import PostPMHistorianFromPMAPI from '../../../api/planned_maintenance_historian/basis_planned_maintenance_historian/PostPMHistorianFromPMAPI';
// import EquipmentClass from '../equipment/EquipmentClass';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import RichTextEditor from '../../../components/RichTextEditor';



const AddIHPremPM= () => {
    const navigate = useNavigate();
    const [checkingKKS] = useState(false);
    const [formData, setFormData] = useState({
        kks: '',
        asset_description: '',
        activity_description: '',
        location_key: '',
        parent_location_key: '',
        service_start_date: '',
        forcast_duration: '',
        service_end_date: '',
        frequency: '',
        status: '',
        cost: '',
        maintenance_type: '',
        scope: '',
        procedure: '',
        notes: '',
    });
    const frequencyMapping = {
        'Once': 9125,
        'Weekly': 7,
        'Bi_Weekly': 15,
        'Monthly': 30,
        '2_Months': 60,
        '3_Month': 90,
        '6_Months': 180,
        'yearly': 365,
        '2_Years': 730,
        '3_Years': 1095,
        '4_Years': 1640,
        '5_Years': 1825,
        '6_Years': 2190,
        '7_Years': 2555,
        '8_Years': 2920,
        '9_Years': 3285,
        '10_Years': 3650,
        '11_Years': 4015,
        '12_Years': 4380
    };

    // const [subClasses, setSubClasses] = useState([]);
    const [errors, setErrors] = useState({});
    const [kksExists, setKksExists] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const debounce = (func, delay) => {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    };


    const handleKKSChange = debounce(async (value) => {
        if (!value) return;

        try {
            const equipmentData = await CheckKKSExistsAPI(value);
            if (equipmentData) {
                setFormData(prev => ({
                    ...prev,
                    asset_description: equipmentData.asset_description || '',
                    location_key: equipmentData.location_key || '',
                    parent_location_key: equipmentData.parent_location_key || ''
                }));
                setKksExists(true);
            } else {
                setKksExists(false); // KKS doesn't exist - keep fields editable
                // Optionally clear the fields if KKS doesn't exist
                setFormData(prev => ({
                    ...prev,
                    asset_description: '',
                    location_key: '',
                    parent_location_key: ''
                }));
            }
        } catch (error) {
            console.error("Error checking KKS:", error);
            setKksExists(false);
        }
    }, 500); // 500ms delay

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'kks') {
            handleKKSChange(value);
        }
    };


    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.kks) newErrors.kks = 'KKS is required';
        if (!formData.activity_description) newErrors.activity_description = 'Activity description is required';
        if (!formData.frequency) newErrors.frequency = 'Frequency is required';
        if (!formData.cost) newErrors.cost = 'Cost is required';
        if (!formData.maintenance_type) newErrors.maintenance_type = 'Maintenance type is required';
        if (!formData.scope) newErrors.scope = 'Scope is required';
        // Validate dates
        if (formData.service_start_date && formData.service_end_date) {
            const startDate = new Date(formData.service_start_date);
            const endDate = new Date(formData.service_end_date);
            console.log("Start Date:", startDate, "End Date:", endDate);
            console.log("Start Date (string):", formData.service_start_date, "End Date (string):", formData.service_end_date);

            if (endDate < startDate) {
                newErrors.service_end_date = 'End date cannot be earlier than start date';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                kks: formData.kks,
                asset_description: formData.asset_description,
                activity_description: formData.activity_description,
                location_key: formData.location_key,
                parent_location_key: formData.parent_location_key,
                service_start_date: new Date(formData.service_start_date).toISOString(),
                forcast_duration: formData.forcast_duration || null,
                service_end_date: new Date(formData.service_end_date).toISOString(),
                // frequency: frequencyMapping[formData.frequency] || 0,
                frequency: Number.isInteger(frequencyMapping[formData.frequency]) ? frequencyMapping[formData.frequency] : 0,
                status: 'Enable',// Default to Enable if not selected 
                // state: formData.state ||'PM_Created',
                cost: formData.cost || '',
                maintenance_type: formData.maintenance_type || 'Preventive',
                scope: formData.scope || 'Mechanical',
                procedure: formData.procedure,
                notes: formData.notes,
            };
            const payloadPM = {
                kks: formData.kks,
                asset_description: formData.asset_description,
                activity_description: formData.activity_description,
                status: "Enable",
                frequency: Number.isInteger(frequencyMapping[formData.frequency]) ? frequencyMapping[formData.frequency] : 0,
                status_change_date: new Date().toISOString(),
                // frequency: pm.frequency
            };
            // Print the payload to console before sending
            console.log("JSON payload:", JSON.stringify(payload, null, 2));
            await AddPMAPI(payload);
            await PostPMHistorianFromPMAPI(payloadPM);
            navigate('/activities');
        } catch (error) {
            console.error("Error adding planned maintenance:", error);
            setErrors(prev => ({
                ...prev,
                submit: error.response?.data?.message || "Failed to add planned maintenance"
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

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


    return (
        <div className="container mx-auto p-10 w-full max-w-screen-2xl ">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate('/activities')}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                >
                    <FaArrowLeft className="mr-2" /> Back to Planned Maintenance List
                </button>
            </div>

            <h1 className="text-2xl font-bold mb-6">Add New Planned Maintenance</h1>

            {errors.submit && (
                <div className="bg-red-100 border-l-4 border-red-200 text-red-700 p-4 mb-4">
                    {errors.submit}
                </div>
            )}

            <form onSubmit={handleSubmit} className=" overflow-y-auto w-full p-6 rounded-lg  bg-violet-400 shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
                    {/* Basic Information Column */}
                    <div className="space-y-4">
                        <div>
                            <label className="block  font-medium mb-1 text-white">Asset Code*</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="kks"
                                    value={formData.kks}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded ${errors.kks ? 'border-red-500' : ''}`}
                                    required
                                />
                                {checkingKKS && (
                                    <div className="absolute right-3 top-2.5">
                                        {/* Add a loading spinner here */}
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                                    </div>
                                )}
                            </div>
                            {errors.kks && <p className="text-red-200 text-sm mt-1">{errors.kks}</p>}
                            {kksExists && (
                                <p className="text-green-300 text-sm mt-1">Equipment found. Details auto-filled.</p>
                            )}
                        </div>

                        <div>
                            <label className="block font-medium mb-1 text-white">Asset Description*</label>
                            <input
                                type="text"
                                name="asset_description"
                                value={formData.asset_description}
                                onChange={handleChange}
                                readOnly={kksExists}
                                className={`w-full p-2 border rounded ${kksExists ? 'bg-gray-300' : ''} ${errors.asset_description ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.asset_description && <p className="text-red-200 text-sm mt-1">{errors.asset_description}</p>}
                        </div>

                        <div>
                            <label className="block font-medium mb-1 text-white">Location Key</label>
                            <input
                                type="text"
                                name="location_key"
                                value={formData.location_key}
                                onChange={handleChange}
                                readOnly={kksExists}
                                className={`w-full p-2 border rounded ${kksExists ? 'bg-gray-300' : ''}`}
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1 text-white">Parent Location Key</label>
                            <input
                                type="text"
                                name="parent_location_key"
                                value={formData.parent_location_key}
                                onChange={handleChange}
                                readOnly={kksExists}
                                className={`w-full p-2 border rounded ${kksExists ? 'bg-gray-300' : ''}`}
                                required
                            />
                        </div>

                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1 text-white">Activity Description</label>
                            <input
                                type="text"
                                name="activity_description"
                                value={formData.activity_description}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded ${errors.activity_description ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.activity_description && <p className="text-red-200 text-sm mt-1">{errors.activity_description}</p>}

                        </div>

                        <div>
                            <label className="block font-medium mb-1 text-white">Maintenance Duration/Hrs</label>
                            <input
                                name="forcast_duration"
                                value={formData.forcast_duration}
                                onChange={handleFloatInput}
                                className="w-full p-2 border rounded"
                                placeholder="0 (default)"
                                required
                            />
                            {formData.forcast_duration &&
                                !/^[0-9]*\.?[0-9]+$/.test(formData.forcast_duration) && (
                                    <p className="text-red-200 text-sm mt-1">Please enter a valid number</p>
                                )}

                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Frequency</label>
                            <select
                                type="text"
                                name="frequency"
                                value={formData.frequency || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="">Select Frequency</option>
                                {Object.keys(frequencyMapping).map((freq) => (
                                    <option key={freq} value={freq}>
                                        {freq.replace(/_/g, ' ')}  {/* Replace underscores with spaces for display */}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Status</label>
                            <input
                                name="status"
                                value={'Enable'}
                                onChange={handleChange}  // Changed to custom handler
                                className="w-full p-2 border rounded bg-gray-300"
                                placeholder="Enable"
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1 text-white">Activity Cost ($)</label>
                            <input
                                name="cost"
                                value={formData.cost}
                                onChange={handleFloatInput}
                                // className="w-full p-2 border rounded"
                                className={`w-full p-2 border rounded ${errors.cost ? 'border-red-500' : ''}`}
                                placeholder="0$ (default)"

                            />
                            {errors.cost && <p className="text-red-200 text-sm mt-1">{errors.cost}</p>}
                            {formData.cost &&
                                !/^[0-9]*\.?[0-9]+$/.test(formData.cost) && (
                                    <p className="text-red-200 text-sm mt-1">Please enter a valid number</p>
                                )}
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Maintenance Type</label>
                            <select

                                name="maintenance_type"
                                value={formData.maintenance_type}
                                onChange={handleChange}
                                placeholder="Preventive"
                                className={`w-full p-2 border rounded ${errors.maintenance_type ? 'border-red-500' : ''}`}
                            >
                                <option value="">Select Maintenance Type</option>
                                <option value="Preventive">Preventive</option>
                                <option value="Predictive">Predictive</option>
                                <option value="RTF">RTF</option>

                            </select>
                            {errors.maintenance_type && <p className="text-red-200 text-sm mt-1">{errors.maintenance_type}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Scope</label>
                            <select
                                type="text"
                                name="scope"
                                value={formData.scope || ''}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded ${errors.scope ? 'border-red-500' : ''}`}
                            >
                                <option value="">Select Scope</option>
                                <option value="Mechanical">Mechanical</option>
                                <option value="Electrical">Electrical</option>
                                <option value="I&C">I&C</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Operation">Operation</option>
                                <option value="Regulatory">Regulatory</option>

                            </select>
                            {errors.maintenance_type && <p className="text-red-200 text-sm mt-1">{errors.scope}</p>}
                        </div>
                        <div>
                            <div className="col-span-1 md:col-span-2 lg:col-span-4">
                                <label className="block font-medium mb-1">Work Instruction</label>
                                <input
                                    type="text"
                                    name="procedure"
                                    value={formData.procedure || ''}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"

                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1 text-white">Notes</label>
                            <input
                                type="text"
                                name="notes"
                                value={formData.notes || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Service Start_Date*</label> 
                            <input
                                type="date"
                                name="service_start_date"
                                value={formData.service_start_date}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Service End_Date*</label>
                            <input
                                type="date"
                                name="service_end_date"
                                value={formData.service_end_date}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                            {errors.service_end_date && (
                                <p className="text-red-200 text-sm mt-1">{errors.service_end_date}</p>
                            )}
                        </div>
                    </div>
                </div >
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
                        className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center 'opacity-50 cursor-not-allowed' : ''
                            }`}                    >
                        {isSubmitting ? 'Saving...' : (
                            <>
                                <FaSave className="mr-2" /> Save
                            </>
                        )}
                    </button>
                </div>

            </form >
        </div >
    );
}

export default AddIHPremPM
;