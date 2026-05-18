import React, { useState, } from 'react';
import { useNavigate } from 'react-router-dom';
import AddEquipmentAPI from '../../api/equipment/AddEquipmentAPI';
import CheckKKSExistsAPI from '../../api/equipment/CheckKKSExistsAPI';
import EquipmentClass from '../../components/EquipmentClass';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

const AddIHEquipment = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        kks: '',
        site: '',
        life_cycle: '',
        location_key: '',
        parent_location_key: '',
        system: '',
        sub_system: '',
        asset_description: '',
        asset_status: 'Operating',
        downtime: '',
        // first_start: 'No',
        breakdown: '',
        wbs_key: '',
        weekly_operating_hour: '',
        equipment_class_category: '',
        equipment_sub_class_code: '',
        equipment_sub_class_desc: '',
        metter_reading: '',
        control_unit: '',
        priority_rpn: '',
        mttf: '',
        mtbf: '',
        reliability: '',
        availability: '',
        drawing_reference: '',
        tech_specification: '',
        nameplate: '',
        manufacturer: '',
        model: '',
        serial_number: '',
        external_document: '',
        cost: '',
        bare_code: '',
        warranty_information: '',
    });
    const [subClasses, setSubClasses] = useState([]);
    const [errors, setErrors] = useState({});
    const [kksExists, setKksExists] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    // Handle category change
    const handleCategoryChange = (e) => {
        const category = e.target.value;
        const newSubClasses = EquipmentClass[category] || [];

        setFormData((prev) => ({
            ...prev,
            equipment_class_category: category,
            equipment_sub_class_code: newSubClasses.length > 0 ? newSubClasses[0].code : '',
            equipment_sub_class_desc: newSubClasses.length > 0 ? newSubClasses[0].description : ''
        }));

        setSubClasses(newSubClasses);
    };

    // Handle sub-class change
    const handleSubClassChange = (e) => {
        const selectedCode = e.target.value;
        const selectedObj = subClasses.find((s) => s.code === selectedCode);

        setFormData((prev) => ({
            ...prev,
            equipment_sub_class_code: selectedCode,
            equipment_sub_class_desc: selectedObj ? selectedObj.description : ''
        }));
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear KKS exists error when KKS is changed
        if (name === 'kks') {
            setKksExists(false);
        }
    };

    // Check if KKS exists
    const checkKKSExists = async () => {
        try {
            const exists = await CheckKKSExistsAPI(formData.kks);
            setKksExists(exists);
            return exists;
        } catch (error) {
            console.error("Error checking KKS:", error);
            return false;
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.kks) newErrors.kks = 'KKS is required';
        if (!formData.site) newErrors.site = 'Site is required';
        if (!formData.life_cycle) newErrors.life_cycle = 'life cycle is required';
        if (!formData.asset_description) newErrors.asset_description = 'Asset description is required';
        if (!formData.location_key) newErrors.location_key = 'Location Key is required';
        if (!formData.parent_location_key) newErrors.parent_location_key = 'Parent Location Key is required';
        if (!formData.system) newErrors.system = 'System is required';
        if (!formData.sub_system) newErrors.sub_system = 'Sub System is required';


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const kksExists = await checkKKSExists();
        if (kksExists) return;

        setIsSubmitting(true);
        const payload = {
            kks: formData.kks,
            site: formData.site,
            life_cycle: formData.life_cycle === '' ? '25' : formData.life_cycle,
            location_key: formData.location_key,
            parent_location_key: formData.parent_location_key,
            system: formData.system,
            sub_system: formData.sub_system,
            asset_description: formData.asset_description,
            asset_status: "Under Commissioning",
            downtime: formData.downtime ? parseFloat(formData.downtime) : null,
            // first_start: 'No',
            breakdown: formData.breakdown || 'No',
            wbs_key: formData.wbs_key,
            weekly_operating_hour: formData.weekly_operating_hour === '' ? '168' : formData.weekly_operating_hour,
            equipment_class_category: formData.equipment_class_category,
            sub_equipment_class_code: formData.equipment_sub_class_code,
            sub_equipment_class_desc: formData.equipment_sub_class_desc,
            metter_reading: formData.metter_reading === '' ? '0' : formData.metter_reading,
            control_unit: formData.control_unit,
            priority_rpn: formData.priority_rpn === '' ? '0' : formData.priority_rpn,
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
        // Log the payload that will be sent to the API
        console.log("JSON payload:", JSON.stringify(payload, null, 2));
        try {
            await AddEquipmentAPI(payload);
            navigate('/equipment');
        } catch (error) {
            console.error("Error updating equipment:", error);
        };
    }


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
        // Otherwise, don't update the state (invalid input is ignored)
    };

    // Helper function to check if a value is a valid integer
    const isValidInteger = (value) => {
        if (value === '') return true;
        return /^-?\d+$/.test(value);
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
        <div className="container mx-auto p-10 max-w-screen-2xl max-h-[85vh] overflow-auto ">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate('/equipment')}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                >
                    <FaArrowLeft className="mr-2" /> Back to Equipment List
                </button>
            </div>

            <h1 className="text-2xl font-bold mb-6">Add New Equipment</h1>

            {errors.submit && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    {errors.submit}
                </div>
            )}

            <form onSubmit={handleSubmit} className="overflow-y-auto bg-violet-400 p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Basic Information Column */}
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1 text-white">Asset Code*</label>
                            <input
                                type="text"
                                name="kks"
                                value={formData.kks}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded ${errors.kks ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.kks && <p className="text-red-500 text-sm mt-1">{errors.kks}</p>}
                            {kksExists && (
                                <p className="text-red-200 text-sm mt-1">This equipment code already exists</p>
                            )}
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Site*</label>
                            <input
                                type="text"
                                name="site"
                                value={formData.site}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded ${errors.site ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.site && <p className="text-red-200 text-sm mt-1">{errors.site}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Location Key*</label>
                            <input
                                type="text"
                                name="location_key"
                                value={formData.location_key}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded ${errors.location_key ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.location_key && <p className="text-red-200 text-sm mt-1">{errors.location_key}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Parent Location Key*</label>
                            <input
                                type="text"
                                name="parent_location_key"
                                value={formData.parent_location_key}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded ${errors.parent_location_key ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.parent_location_key && <p className="text-red-200 text-sm mt-1">{errors.parent_location_key}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">System*</label>
                            <input
                                type="text"
                                name="system"
                                value={formData.system}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded ${errors.system ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.system && <p className="text-red-200 text-sm mt-1">{errors.system}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Sub System*</label>
                            <input
                                type="text"
                                name="sub_system"
                                value={formData.sub_system}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded ${errors.sub_system ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.sub_system && <p className="text-red-200 text-sm mt-1">{errors.sub_system}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Weekly Operating Houres</label>
                            <input
                                type="number"
                                name="weekly_operating_hour"
                                value={formData.weekly_operating_hour || ''}
                                onChange={handleFloatInput}  // Changed to custom handler
                                className="w-full p-2 border rounded"
                                placeholder="168 (default)"
                            />
                            {formData.weekly_operating_hour &&
                                !/^[0-9]*\.?[0-9]+$/.test(formData.weekly_operating_hour) && (
                                    <p className="text-red-200 text-sm mt-1">Please enter a valid number</p>
                                )}
                        </div>
                    </div>

                    {/* Equipment Class Column */}
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1 text-white">Life Cycle</label>
                            <input type="number"
                                name="life_cycle"
                                value={formData.life_cycle || ''}
                                onChange={handleIntegerInput}
                                placeholder='25 (default)'
                                className={`w-full p-2 border rounded ${!isValidInteger(formData.life_cycle) && formData.life_cycle !== '' ? 'bg-red-100' : 'bg-white'}`}
                                required
                            />
                            {!isValidInteger(formData.life_cycle) && formData.life_cycle !== '' && (
                                <p className="text-red-200 text-sm">Please enter a valid integer</p>

                            )}
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Equipment Class*</label>
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
                                <label className="block font-medium mb-1 text-white">Equipment Sub Class*</label>
                                <select
                                    name="equipment_sub_class_code"
                                    value={formData.equipment_sub_class_code || ''}
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
                            <label className="block font-medium mb-1 text-white">Asset Status*</label>
                            <input
                                name="asset_status"
                                // value={formData.asset_status}
                                value="Under Commissioning"
                                onChange={handleChange}
                                className="w-full p-2 border rounded bg-gray-100"
                            />
                            {/* <option value="Operating">Operating</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Decommissioned">Decommissioned</option>
                                <option value="Under Commissioning">Under Commissioning</option> */}


                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Downtime*</label>
                            <input
                                type="text"
                                name="downtime"
                                value={formData.downtime || ''}
                                onChange={handleFloatInput}  // Changed to custom handler
                                className="w-full p-2 border rounded"
                                placeholder="0 (default)"
                            />
                            {formData.downtime &&
                                !/^[0-9]*\.?[0-9]+$/.test(formData.downtime) && (
                                    <p className="text-red-200 text-sm mt-1">Please enter a valid number</p>
                                )}
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Nameplate</label>
                            <input
                                type="text"
                                name="nameplate"
                                value={formData.nameplate || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Bare_code</label>
                            <input
                                type="text"
                                name="bare_code"
                                value={formData.bare_code || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div hidden>
                            <label className="block font-medium mb-1 text-white">Tech Specification</label>
                            <input
                                type="text"
                                name="tech_specification"
                                value={formData.tech_specification || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"

                            />
                        </div>
                    </div>

                    {/* Asset Information Column */}
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1 text-white">Asset Description*</label>
                            <input
                                type="text"
                                name="asset_description"
                                value={formData.asset_description}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded ${errors.asset_description ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.asset_description && (
                                <p className="text-red-200 text-sm mt-1">{errors.asset_description}</p>
                            )}
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Manufacturer</label>
                            <input
                                type="text"
                                name="manufaturer"
                                value={formData.manufacturer}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Model</label>
                            <input
                                type="text"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">WBS Key</label>
                            <input
                                type="text"
                                name="wbs_key"
                                value={formData.wbs_key || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Serial Number</label>
                            <input
                                type="text"
                                name="serial_number"
                                value={formData.serial_number}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Priority RPN</label>
                            <input type="text"
                                name="priority_rpn"
                                value={formData.priority_rpn || ''}
                                onChange={handleIntegerInput}
                                placeholder='0 (default)'
                                className={`w-full p-2 border rounded ${!isValidInteger(formData.priority_rpn) && formData.priority_rpn !== '' ? 'bg-red-100' : 'bg-white'}`}
                            />
                            {!isValidInteger(formData.priority_rpn) && formData.priority_rpn !== '' && (
                                <p className="text-red-200 text-sm">Please enter a valid integer</p>

                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1 text-white">Metter Reading Counter</label>
                            <input
                                value={formData.metter_reading || ''}
                                onChange={handleFloatInput}  // Changed to custom handler
                                className="w-full p-2 border rounded"
                                placeholder="0 (default)"
                            />
                            {formData.metter_reading &&
                                !/^[0-9]*\.?[0-9]+$/.test(formData.metter_reading) && (
                                    <p className="text-red-200 text-sm mt-1">Please enter a valid number</p>
                                )}
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Control Unit</label>
                            <input
                                type="text"
                                name="control_unit"
                                value={formData.control_unit || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Drawing Reference</label>
                            <input
                                type="text"
                                name="drawing_reference"
                                value={formData.drawing_reference || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">External Document</label>
                            <input
                                type="text"
                                name="external_document"
                                value={formData.external_document || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Warranty Information</label>
                            <input
                                type="text"
                                name="warranty_information"
                                value={formData.warranty_information || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-white">Cost ($)</label>
                            <input
                                value={formData.cost || ''}
                                onChange={handleFloatInput}  // Changed to custom handler
                                className="w-full p-2 border rounded"
                                placeholder="0$ (default)"
                            />
                            {formData.cost &&
                                !/^[0-9]*\.?[0-9]+$/.test(formData.cost) && (
                                    <p className="text-red-200 text-sm mt-1">Please enter a valid number</p>
                                )}
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
                                disabled={isSubmitting || kksExists}
                                className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center ${isSubmitting || kksExists ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSubmitting ? 'Saving...' : (
                                    <>
                                        <FaSave className="mr-2" /> Save Equipment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default AddIHEquipment;