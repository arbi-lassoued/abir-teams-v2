import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FetchEquipmentAPI from '../../api/equipment/FetchEquipmentAPI';
import EditEquipmentAPI from '../../api/equipment/EditEquipmentAPI';
import DeleteEquipmentAPI from '../../api/equipment/DeleteEquipmentAPI';
import EquipmentClass from '../../components/EquipmentClass';
import { FaTrash, FaArrowLeft, FaSave } from 'react-icons/fa';

const EditIHEquipment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({});
    const [subClasses, setSubClasses] = useState([]);
    const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    //==========================================================================================================================================================================
    useEffect(() => {
        const loadEquipment = async () => {
            try {
                const data = await FetchEquipmentAPI(id);
                // console.log("API Response:", data); 
                // console.log("Equipment_class from API:", data.equipment_class);
                // console.log("sub_equipment_class from API:", data.sub_equipment_class);
                setFormData(data)
                setIsLoading(false);

            } catch (error) {
                console.error("Error loading equipment:", error);
                navigate('/equipment', { replace: true });
            }
        };

        loadEquipment();
    }, [id, navigate]);
    //==========================================================================================================================================================================
    useEffect(() => {
        if (formData.equipment_class_category) {
            console.log("EquipmentClass object:", EquipmentClass);
            console.log("Available subclasses for this category:", EquipmentClass[formData.equipment_class_category]);
            setSubClasses(EquipmentClass[formData.equipment_class_category] || []);
        }
    }, [formData.equipment_class_category]);


    // const handleCategoryChange = (e) => {
    //     const category = e.target.value;
    //     setFormData(prev => ({
    //         ...prev,
    //         equipment_class: category,
    //         sub_equipment_class: '' // reset subclass when category changes
    //     }));
    // };
    const handleCategoryChange = (e) => {
        const category = e.target.value;
        const newSubClasses = EquipmentClass[category] || [];

        setFormData((prev) => ({
            ...prev,
            equipment_class_category: category,
            sub_equipment_class_code: newSubClasses.length > 0 ? newSubClasses[0].code : '',
            sub_equipment_class_desc: newSubClasses.length > 0 ? newSubClasses[0].description : ''
        }));

        setSubClasses(newSubClasses);
    };


    // const handleSubClassChange = (e) => {
    //     const subClass = e.target.value;
    //     setFormData(prev => ({
    //         ...prev,
    //         sub_equipment_class: subClass
    //     }));
    // };
    const handleSubClassChange = (e) => {
        const selectedCode = e.target.value;
        const selectedObj = subClasses.find((s) => s.code === selectedCode);

        setFormData((prev) => ({
            ...prev,
            sub_equipment_class_code: selectedCode,
            sub_equipment_class_desc: selectedObj ? selectedObj.description : ''
        }));
    };
    //==========================================================================================================================================================================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    //==========================================================================================================================================================================
    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // if (!formData.kks) newErrors.kks = 'KKS is required';
        if (!formData.site) newErrors.site = 'Site is required';
        if (!formData.life_cycle) newErrors.site = 'life cycle is required';
        if (!formData.asset_description) newErrors.asset_description = 'Asset description is required';
        if (!formData.location_key) newErrors.location_key = 'Location Key is required';
        if (!formData.parent_location_key) newErrors.parent_location_key = 'Parent Location Key is required';
        if (!formData.system) newErrors.system = 'System is required';
        if (!formData.sub_system) newErrors.sub_system = 'Sub System is required';


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    //==========================================================================================================================================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        const payload = {
            kks: formData.kks,
            site: formData.site,
            life_cycle: formData.life_cycle,
            location_key: formData.location_key,
            parent_location_key: formData.parent_location_key,
            system: formData.system,
            sub_system: formData.sub_system,
            asset_description: formData.asset_description,
            asset_status: formData.asset_status,
            downtime: formData.downtime ? parseFloat(formData.downtime) : null,
            breakdown: formData.breakdown || 'No',
            wbs_key: formData.wbs_key,
            weekly_operating_hour: formData.weekly_operating_hour ? parseFloat(formData.weekly_operating_hour) : null,
            equipment_class_category: formData.equipment_class_category,
            sub_equipment_class_code: formData.sub_equipment_class_code,
            sub_equipment_class_desc: formData.sub_equipment_class_desc,

            // equipment_class: formData.equipment_class,
            // sub_equipment_class: formData.sub_equipment_class,

            metter_reading: formData.metter_reading,
            control_unit: formData.control_unit,
            priority_rpn: formData.priority_rpn,
            mtbf: formData.mtbf ? parseFloat(formData.mtbf) : null,
            mttf: formData.mttf ? parseFloat(formData.mttf) : null,
            reliability: formData.reliability ? parseFloat(formData.reliability) : null,
            availability: formData.availability ? parseFloat(formData.availability) : null,
            drawing_reference: formData.drawing_reference,
            tech_specification: formData.tech_specification,
            nameplate: formData.nameplate,
            manufacturer: formData.manufacturer,
            model: formData.model,
            serial_number: formData.serial_number,
            external_document: formData.external_document,
            cost: formData.cost ? parseFloat(formData.cost) : null,
            bare_code: formData.bare_code,
            warranty_information: formData.warranty_information,

        };
        try {
            console.log("JSON payload:", JSON.stringify(payload, null, 2));
            await EditEquipmentAPI(id, payload);
            navigate('/equipment');
        } catch (error) {
            console.error("Error updating equipment:", error);
        }
    };
    //==========================================================================================================================================================================

    const handleDelete = async () => {
        try {
            await DeleteEquipmentAPI(id);
            navigate('/equipment');
        } catch (error) {
            console.error("Error deleting equipment:", error);
        }
    };
    //==========================================================================================================================================================================
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    //==========================================================================================================================================================================
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
    //==========================================================================================================================================================================
    const handleIntegerInput = (e) => {
        const { name, value } = e.target;

        // Check if the input is empty or a valid integer
        if (value === '' || /^-?\d*$/.test(value)) {
            // Update the state only if valid
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    const isValidInteger = (value) => {
        if (value === '') return true;
        return /^-?\d+$/.test(value);
    };
    //==========================================================================================================================================================================
    return (
        <div className="container max-h-[70vh] mx-auto p-10 max-w-screen-3xl">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate('/equipment')}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                >
                    <FaArrowLeft className="mr-2" /> Back to Equipment List
                </button>

                {!isDeleteConfirm ? (
                    <button
                        onClick={() => setIsDeleteConfirm(true)}
                        className="flex items-center text-red-600 hover:text-red-800"
                    >
                        <FaTrash className="mr-2" /> Delete Equipment
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

            <h1 className="text-2xl font-bold mb-6">Edit Equipment: {formData.kks}</h1>

            <form onSubmit={handleSubmit} className="overflow-y-auto bg-gray-100 p-6 rounded-lg shadow">
                <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-6" >
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1">Equipment Code</label>
                            <input
                                type="text"
                                name="kks"
                                value={formData.kks || ''}
                                onChange={handleChange}
                                readOnly
                                className="w-full p-2 border rounded bg-gray-300"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Site</label>
                            <input
                                type="text"
                                name="site"
                                value={formData.site || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />

                            {errors.site && <p className="text-red-500 text-sm mt-1">{errors.site}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Location Key</label>
                            <input
                                type="text"
                                name="location_key"
                                value={formData.location_key || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                            {errors.location_key && <p className="text-red-500 text-sm mt-1">{errors.location_key}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Parent Location Key</label>
                            <input
                                type="text"
                                name="parent_location_Key"
                                value={formData.parent_location_key || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                            {errors.parent_location_key && <p className="text-red-500 text-sm mt-1">{errors.parent_location_key}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-1">System*</label>
                            <input
                                type="text"
                                name="system"
                                value={formData.system}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded ${errors.system ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.system && <p className="text-red-500 text-sm mt-1">{errors.system}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Sub System*</label>
                            <input
                                type="text"
                                name="sub_system"
                                value={formData.sub_system}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded ${errors.sub_system ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.sub_system && <p className="text-red-500 text-sm mt-1">{errors.sub_system}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Weekly Operating Hour</label>
                            <input
                                type="text"
                                name="weekly_operating_hour"
                                value={formData.weekly_operating_hour || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>


                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1">Equipment Class*</label>
                            <select
                                name="equipment_class_category"
                                value={formData.equipment_class_category || ''}
                                onChange={handleCategoryChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="">Select a category</option>
                                {Object.keys(EquipmentClass).map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {formData.equipment_class_category && (
                            <div>
                                <label className="block font-medium mb-1">Equipment Sub Class*</label>
                                <select
                                    name="equipment_sub_class_code"
                                    value={formData.sub_equipment_class_code || ''}
                                    onChange={handleSubClassChange}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="">Select a sub-class</option>
                                    {subClasses.map((subClass) => (
                                        <option key={subClass.code} value={subClass.code}>
                                            {subClass.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block font-medium mb-1">Asset Status</label>
                            <input
                                name="asset_status"
                                value={formData.asset_status || ''}
                                onChange={handleChange}
                                readOnly
                                className="w-full p-2 border rounded bg-gray-300"
                            >
                            </input>
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Downtime</label>
                            <input
                                type="text"
                                name="downtime"
                                value={formData.downtime || ''}
                                onChange={handleFloatInput}  // Changed to custom handler
                                readOnly
                                className="w-full p-2 border rounded bg-gray-300"
                            />
                            {formData.downtime &&
                                !/^[0-9]*\.?[0-9]+$/.test(formData.downtime) && (
                                    <p className="text-red-500 text-sm mt-1">Please enter a valid number</p>
                                )}
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Breakdown</label>
                            <select
                                name="breakdown"
                                value={formData.breakdown || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-medium mb-1 ">Life Cycle</label>
                            <input type="text"
                                name="life_cycle"
                                value={formData.life_cycle || ''}
                                onChange={handleChange}
                                readOnly
                                className="w-full p-2 border rounded  bg-gray-300"
                            />

                        </div>
                        <div>
                            <label className="block font-medium mb-1">Nameplate</label>
                            <input
                                type="text"
                                name="nameplate"
                                value={formData.nameplate || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1">Asset Description</label>
                            <input
                                type="text"
                                name="asset_description"
                                value={formData.asset_description || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Manufacturer</label>
                            <input
                                type="text"
                                name="manufacturer"
                                value={formData.manufacturer || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Model</label>
                            <input
                                type="text"
                                name="model"
                                value={formData.model || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">WBS_Key</label>
                            <input
                                type="text"
                                name="wbs_key"
                                value={formData.wbs_key || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Serial_Number</label>
                            <input
                                type="text"
                                name="serial_number"
                                value={formData.serial_number || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1 ">Priority_RPN</label>
                            <input type="text"
                                name="priority_rpn"
                                value={formData.priority_rpn || ''}
                                onChange={handleIntegerInput}
                                className={`w-full p-2 border rounded ${!isValidInteger(formData.priority_rpn) && formData.priority_rpn !== '' ? 'bg-red-100' : 'bg-white'}`}
                            />
                            {!isValidInteger(formData.priority_rpn) && formData.priority_rpn !== '' && (
                                <p className="text-red-500 text-sm">Please enter a valid integer</p>
                            )}
                        </div>
                        
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1">Metter_Reading</label>
                            <input
                                type="text"
                                name="metter_reading"
                                value={formData.metter_reading || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Control_Unit</label>
                            <input
                                type="text"
                                name="control_unit"
                                value={formData.control_unit || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Drawing_Reference</label>
                            <input
                                type="text"
                                name="drawing_reference"
                                value={formData.drawing_reference || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">External_Document</label>
                            <input
                                type="text"
                                name="external_document"
                                value={formData.external_document || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Warranty_Information</label>
                            <input
                                type="text"
                                name="warranty_information"
                                value={formData.warranty_information || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Cost ($)</label>
                            <input
                                value={formData.cost ? `$${formData.cost}` : '-'}
                                onChange={handleFloatInput}  // Changed to custom handler
                                className="w-full p-2 border rounded"
                                placeholder="0 (default)"
                            />
                            {formData.cost &&
                                !/^[0-9]*\.?[0-9]+$/.test(formData.cost) && (
                                    <p className="text-red-500 text-sm mt-1">Please enter a valid number</p>
                                )}
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Bare_Code</label>
                            <input
                                type="text"
                                name="bare_code"
                                value={formData.bare_code || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8 border-t pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/equipment')}
                        className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {isSubmitting ? 'Saving...' : (
                            <>
                                <FaSave className="mr-2" /> Save Equipment
                            </>
                        )}
                    </button>
                </div>
            </form >
        </div >
    );
};

export default EditIHEquipment;