import React, { useEffect, useState, useMemo } from "react";
import IHEquipmentListAPI from "../../api/inhouse_equipment/IHEquipmentListAPI";
import DeleteEquipmentAPI from "../../api/inhouse_equipment/DeleteIHEquipmentAPI";
import { FaEdit, FaTrash, FaPlus, FaPlay, FaStop, FaRocket, FaFileExcel, FaBan, FaFilter, FaTimes } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import UploadIHEquipmentListAPI from "../../api/inhouse_equipment/UploadIHEquipmentListAPI";
import IHEquipmentDetailsSidebar from "./IHEquipmentDetailsSidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";

const ITEMS_PER_PAGE = 10;

const IHEquipmentList = () => {
    const [equipment, setEquipment] = useState([]);
    // const [equipmentErrors, setEquipmentErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    // const [showDecommissionConfirm, setShowDecommissionConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const [refreshHistorian, setRefreshHistorian] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        status: '',
        system: '',
        site: ''
    });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // New state for confirmation messages
    const [confirmationMessage, setConfirmationMessage] = useState({
        show: false,
        type: '', // 'start', 'stop', 'delete', 'decommission'
        equipment: null,
        action: null // function to execute on confirm
    });

    // Load equipment data
    const loadEquipments = async () => {
        try {
            const data = await IHEquipmentListAPI();
            setEquipment(data);
        } catch (error) {
            setError(`Failed to load equipment: ${error.message || 'Unknown error'}`);
            console.error('Equipment load error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEquipments();
    }, []);


    // Filter and sort equipment
    const uniqueValues = useMemo(() => {
        return {
            equipment_class_category: [...new Set(equipment.map(item => item.equipment_class_category))].filter(Boolean),
            sub_equipment_class_code: [...new Set(equipment.map(item => item.sub_equipment_class_code))].filter(Boolean),
            // site: [...new Set(equipment.map(item => item.site))].filter(Boolean)
        };
    }, [equipment]);

    // Filter and sort equipment
    const filteredAndSortedEquipments = useMemo(() => {
        let filtered = equipment.filter(item => {
            const searchTermLower = searchTerm.toLowerCase();

            const matchesSearch =
                String(item.equipment_class_category || '').toLowerCase().includes(searchTermLower) ||
                String(item.sub_equipment_class_code || '').toLowerCase().includes(searchTermLower);

            const matchesFilters =
                (!filters.equipment_class_category || item.equipment_class_category === filters.equipment_class_category) &&
                (!filters.sub_equipment_class_code || item.sub_equipment_class_code === filters.sub_equipment_class_code);
            // (!filters.site || item.site === filters.site);

            return matchesSearch && matchesFilters;
        });

        // Sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                // Handle null/undefined values
                if (aValue == null && bValue == null) return 0;
                if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
                if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;

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
    }, [equipment, searchTerm, filters, sortConfig]);
    // Pagination
    const paginatedEquipments = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedEquipments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedEquipments, currentPage]);

    const totalPages = Math.ceil(filteredAndSortedEquipments.length / ITEMS_PER_PAGE);

    // Handle sort
    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Handle row click
    const handleRowClick = (eq) => {
        setSelectedEquipment(eq);
        setShowSidebar(true);
        // setRefreshHistorian(prev => prev + 1);
    };

    // Show confirmation message
    const showConfirmation = (type, equipment, action) => {
        setConfirmationMessage({
            show: true,
            type,
            equipment,
            action
        });
    };

    // Hide confirmation message
    const hideConfirmation = () => {
        setConfirmationMessage({
            show: false,
            type: '',
            equipment: null,
            action: null
        });
    };

    // Execute confirmed action
    const confirmAction = async () => {
        if (confirmationMessage.action) {
            await confirmationMessage.action();
        }
        hideConfirmation();
    };

    // Action handlers
    const handleEditClick = (e, id) => {
        e.stopPropagation();
        navigate(`/equipment/edit/${id}`);
    };

    const handleDeleteClick = async (e, equipment) => {
        e.stopPropagation();
        showConfirmation('delete', equipment, async () => {
            try {
                await DeleteEquipmentAPI(equipment.eq_id);
                loadEquipments();
            } catch (error) {
                console.error("Error deleting equipment:", error);
                setError("Failed to delete equipment.");
            }
        });
    };

    // Status action handlers
    // const handleFirstStartClick = async (e, eqId, equipment) => {
    //     e.stopPropagation();
    //     showConfirmation('first_start', equipment, async () => {
    // const errors = {}; // Object to collect errors for each API call
    // let successCount = 0;

    // const payloadEQ = {
    //     eq_id: parseInt(equipment.eq_id),
    //     kks: equipment.kks,
    //     asset_description: equipment.asset_description,
    //     start_date: new Date().toISOString(),
    //     asset_status: 'First_Start',
    //     breakdown: 'No',
    // };

    // const endDate = new Date();
    // endDate.setFullYear(endDate.getFullYear() + equipment.life_cycle);

    // const payloadDuplicatePM = {
    //     kks: equipment.kks,
    //     asset_description: equipment.asset_description,
    //     location_key: equipment.location_key,
    //     parent_location_key: equipment.parent_location_key,
    //     life_cycle: Number(equipment.life_cycle),
    //     service_start_date: new Date().toISOString(),
    //     status: "Enable",
    //     state: "PM Pending",
    // };

    // const payloadHistPM = {
    //     kks: equipment.kks,
    //     asset_description: equipment.asset_description,
    //     status: "Enable",
    //     status_change_date: new Date().toISOString(),
    // };

    // const payloadPMStatus = {
    //     kks: equipment.kks,
    //     service_start_date: new Date().toISOString(),
    //     service_end_date: endDate.toISOString(),
    // };

    // try {
    //     setIsSubmitting(true);

    // Individual API calls with independent error handling
    // try {
    //     await UpdateEquipmentStatusAPI(eqId, "No", "First_Start");
    //     successCount++;
    // } catch (error) {
    //     console.error("Equipment status update failed:", error);
    //     errors.equipment_status = `* Equipment status update from under commissioning to operating failed.`;
    // }
    // try {
    //     await PostEquipmentFirstStartHistoryAPI(payloadEQ);
    //     successCount++;
    // } catch (error) {
    //     console.error("First start history failed:", error);
    //     errors.first_start_history = `* Equipment History recording failed.`;
    // }
    // try {
    //     await EnablePMAfterFirstStartAPI(payloadPMStatus);
    //     successCount++;
    // } catch (error) {
    //     console.error("Enable PM failed:", error);
    //     errors.enable_pm = `* Planned Maintenance not found to enable, please make sure that your equipment has planned maintenance programm.`;
    // }

    // try {
    //     await DuplicatePMAfterFirstStartAPI(payloadDuplicatePM);
    //     successCount++;
    // } catch (error) {
    //     console.error("Duplicate PM failed:", error);
    //     errors.duplicate_pm = `* Could not create maintenance plan, please make sure that your equipment has planned maintenance programm.`;
    // }

    // try {
    //     await PostPMHistorianFromEQAPI(payloadHistPM);
    //     successCount++;
    // } catch (error) {
    //     console.error("PM historian failed:", error);
    //     errors.pm_historian = `* Could not update the Planned maintenance history , please make sure that your equipment has planned maintenance programm.`;
    // }

    // Always reload equipment regardless of individual failures
    // await loadEquipments();

    // Set comprehensive error message if any failures occurred
    // if (Object.keys(errors).length > 0) {
    //     const errorList = Object.values(errors);

    //     setEquipmentErrors(prev => ({
    //         ...prev,
    //         [equipment.kks]: `Warning: ${successCount}/5 successful operations, the issues: ${errorList.join('; ')}`
    //     }));
    // } else {
    //     // Clear errors if all succeeded
    //     setEquipmentErrors(prev => {
    //         const newErrors = { ...prev };
    //         delete newErrors[equipment.kks];
    //         return newErrors;
    //     });
    // }

    //         } catch (error) {
    //             // This catch is for unexpected errors outside the individual API calls
    //             console.error("Unexpected error in handleFirstStartClick:", error);
    //             setEquipmentErrors(prev => ({
    //                 ...prev,
    //                 [equipment.kks]: `Unexpected error during equipment start`
    //             }));
    //         } finally {
    //             setIsSubmitting(false);
    //         }
    //     });
    // };


    // const handleRestartClick = async (e, eqId, equipment) => {
    //     e.stopPropagation();
    //     showConfirmation('start', equipment, async () => {
    //         const payload = {
    //             eq_id: parseInt(equipment.eq_id),
    //             kks: equipment.kks,
    //             asset_description: equipment.asset_description,
    //             start_date: new Date().toISOString(),
    //             asset_status: 'Operating',
    //             breakdown: 'No',
    //         };
    //         try {
    //             setIsSubmitting(true);
    //             await UpdateEquipmentStatusAPI(eqId, "No", "Operating");
    //             await PostEquipmentRestarttHistoryAPI(payload);
    //             loadEquipments();
    //             // setRefreshHistorian(prev => prev + 1);
    //         } catch (error) {
    //             console.error("Error:", error.response?.data || error);
    //             setError(error.response?.data?.message || "Failed to update equipment status");
    //         } finally {
    //             setIsSubmitting(false);
    //         }
    //     });
    // };

    // const handleStopClick = async (e, eqId, equipment) => {
    //     e.stopPropagation();
    //     showConfirmation('stop', equipment, async () => {
    //         const stopPayload = {
    //             eq_id: parseInt(equipment.eq_id),
    //             kks: equipment.kks,
    //             asset_description: equipment.asset_description,
    //             stop_date: new Date().toISOString(),
    //             asset_status: 'Inactive',
    //             breakdown: 'No',
    //             failure_code: '',
    //             sub_failure_code: '',
    //         };

    //         try {
    //             setIsSubmitting(true);
    //             await UpdateEquipmentStatusAPI(eqId, "No", "Inactive");
    //             await PostEquipmentStopHistoryAPI(stopPayload);
    //             // setRefreshHistorian(prev => prev + 1);
    //             loadEquipments();
    //         } catch (error) {
    //             console.error("Error stopping equipment:", error);
    //             setError("Failed to update equipment status");
    //         } finally {
    //             setIsSubmitting(false);
    //         }
    //     });
    // };

    // const handleDecommissionClick = (e, eqId, equipment) => {
    //     e.stopPropagation();
    //     showConfirmation('decommission', equipment, async () => {
    //         const payload = {
    //             eq_id: parseInt(equipment.eq_id),
    //             kks: equipment.kks,
    //             asset_description: equipment.asset_description,
    //             stop_date: new Date().toISOString(),
    //             asset_status: "Decommissioned",
    //             breakdown: "No",
    //         };

    //         try {
    //             setIsSubmitting(true);
    //             await UpdateEquipmentStatusAPI(eqId, "No", "Decommissioned");
    //             await PostEquipmentDecommHistoryAPI(payload);
    //             loadEquipments();
    //             // setRefreshHistorian(prev => prev + 1);
    //         } catch (error) {
    //             console.error("Error decommissioning equipment:", error);
    //             setError("Failed to decommission equipment");
    //         } finally {
    //             setIsSubmitting(false);
    //         }
    //     });
    // };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredAndSortedEquipments);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Equipment");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, `equipment_list_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const clearFilters = () => {
        setFilters({ equipment_class_category: '', sub_equipment_class_code: '' });
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Get confirmation message details based on action type
    const getConfirmationDetails = () => {
        const { type, equipment } = confirmationMessage;

        const messages = {
            //         first_start: {  // Add this new type for rocket icon
            //             title: 'Equipment First Start',
            //             icon: 'rocket',
            //             color: 'green',
            //             message: `Are you sure you want to perform FIRST START for "${equipment?.asset_description}"? This is the initial commissioning start and This action cannot be undone.`,
            //             confirmText: 'First Start'
            //         },

            //         start: {
            //             title: 'Start Equipment',
            //             icon: 'play',
            //             color: 'green',
            //             message: `Are you sure you want to start "${equipment?.asset_description}"?`,
            //             confirmText: 'Start Equipment'
            //         },
            //         stop: {
            //             title: 'Stop Equipment',
            //             icon: 'stop',
            //             color: 'red',
            //             message: `Are you sure you want to stop "${equipment?.asset_description}"?`,
            //             confirmText: 'Stop Equipment'
            //         },
            delete: {
                title: 'Delete Equipment',
                icon: 'trash',
                color: 'red',
                message: `Are you sure you want to delete "${equipment?.asset_description}"? This action cannot be undone.`,
                confirmText: 'Delete Equipment'
            },
            //         decommission: {
            //             title: 'Decommission Equipment',
            //             icon: 'ban',
            //             color: 'orange',
            //             message: `Are you sure you want to decommission "${equipment?.asset_description}"? This action cannot be undone.`,
            //             confirmText: 'Decommission'
            //         }
        };

        return messages[type] || messages.delete;
    };
    // ==============================================================================================================================================================================

    // Render appropriate action buttons based on equipment status
    const renderActionButtons = (eq) => {
        return (
            <div className="flex flex-wrap gap-1" onClick={e => e.stopPropagation()}>
                {/* Edit Button - Always visible */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleEditClick(e, eq.eq_id)}
                    title="Edit Equipment"
                >
                    <FaEdit className="text-blue-600" />
                </Button>

                {/* Delete Button - Always visible */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleDeleteClick(e, eq)}
                    title="Delete Equipment"
                >
                    <FaTrash className="text-red-600" />
                </Button>

                {/* Status-specific buttons */}
                {/* {eq.asset_status === "Under Commissioning" && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleFirstStartClick(e, eq.eq_id, eq)}  
                        disabled={isSubmitting}
                        title="Equipment First Start"
                    >
                        <FaRocket className="text-green-600" />
                    </Button>
                )} */}

                {/* {(eq.asset_status === "Operating" || eq.asset_status === "First_Start") && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleStopClick(e, eq.eq_id, eq)}
                        disabled={isSubmitting}
                        title="Stop Equipment"
                    >
                        <FaStop className="text-red-600" />
                    </Button>
                )} */}

                {/* {eq.asset_status === "Inactive" && (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleRestartClick(e, eq.eq_id, eq)}
                            disabled={isSubmitting}
                            title="Restart Equipment"
                        >
                            <FaPlay className="text-green-600" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleDecommissionClick(e, eq.eq_id, eq)}
                            disabled={isSubmitting}
                            title="Decommission Equipment"
                        >
                            <FaBan className="text-orange-600" />
                        </Button>
                    </>
                )} */}
            </div>
        );
    };
    // ==============================================================================================================================================================================
    if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
    if (error) return <div className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>;
    // ==============================================================================================================================================================================
    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1> 
                <div className="flex gap-3">
                    <Button
                        onClick={() => document.getElementById('fileInput').click()}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <FaPlus /> Upload List
                    </Button>
                    <Button
                        onClick={() => navigate('/equipment/add')}
                        className="flex items-center gap-2"
                    >
                        <FaPlus /> Add Equipment
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
                                placeholder="Search by description,..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <Select
                            value={filters.equipment_class_category}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, equipment_class_category: e.target.value }));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All Category</option>
                            {uniqueValues.equipment_class_category.map(equipment_class_category => (
                                <option key={equipment_class_category} value={equipment_class_category}>{equipment_class_category}</option>
                            ))}
                        </Select>
                        <Select
                            value={filters.sub_equipment_class_code}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, sub_equipment_class_code: e.target.value }));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All Sub_class Code</option>
                            {uniqueValues.sub_equipment_class_code.map(sub_equipment_class_code => (
                                <option key={sub_equipment_class_code} value={sub_equipment_class_code}>{sub_equipment_class_code}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaFilter />
                            <span>Showing {filteredAndSortedEquipments.length} of {equipment.length} equipment</span>
                        </div>
                        <Button variant="ghost" onClick={clearFilters} size="sm">
                            <FaTimes className="mr-1" /> Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Equipment Table */}
            <Card>
                <CardContent className="p-0 ">
                    <div className="overflow-x-auto max-h-[45vh] rounded-xl">
                        <table className="w-full overflow-auto">
                            <thead className="bg-[#0070EF] border-b text-white sticky top-0">
                                <tr>
                                    <th
                                        className="p-4 text-left font-semibold cursor-pointer"
                                        onClick={() => handleSort('ih_eq_id')}
                                    >
                                        ID {sortConfig.key === 'ih_eq_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('equipment_description')}
                                    >
                                        Description {sortConfig.key === 'equipment_description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="p-4 text-left font-semibold cursor-pointer"
                                        onClick={() => handleSort('equipment_class_category')}
                                    >
                                        Category {sortConfig.key === 'equipment_class_category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>

                                    <th
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('maint_type')}
                                    >
                                        Maintenance Type {sortConfig.key === 'maint_type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="p-4 text-left font-semibold cursor-pointer"
                                        onClick={() => handleSort('mtbf')}
                                    >
                                        MTBF {sortConfig.key === 'mtbf' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('mttr')}
                                    >
                                        MTTR {sortConfig.key === 'mttr' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                      <th
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('mttr')}
                                    >
                                        MTTF {sortConfig.key === 'mttf' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="p-4 text-left font-semibold ">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {paginatedEquipments.map((eq) => (
                                    <tr
                                        key={eq.ih_eq_id}
                                        className="hover:bg-violet-200 cursor-pointer transition-colors"
                                        onClick={() => handleRowClick(eq)}
                                    >
                                        <td className="p-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{eq.ih_eq_id}</div>
                                                {/* {equipmentErrors[eq.kks] && (
                                                    <div className="text-red-500 text-sm mt-1">{equipmentErrors[eq.kks]}</div>
                                                )} */}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-500">{eq.equipment_description}</div>
                                            {/* <div className="text-sm text-gray-500">{eq.maint_type}</div> */}
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{eq.equipment_class_category}</div>
                                                {/* <div className="text-sm text-gray-500">{eq.sub_equipment_class_desc}</div> */}
                                                <div className="text-sm text-gray-500">{eq.sub_equipment_class_code}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium">{eq.maint_type}</div>
                                            <div className="text-sm text-gray-500">{eq.maint_prog_code}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{eq.mtbf}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{eq.mttr}</div>
                                        </td>
                                         <td className="p-4">
                                            <div className="font-medium text-gray-900">{eq.mttf}</div>
                                        </td>
                                        <td className="p-4">
                                            {renderActionButtons(eq)}
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
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedEquipments.length)} of {filteredAndSortedEquipments.length} results
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

            {/* Equipment Details Sidebar */}
            <IHEquipmentDetailsSidebar
                equipment={selectedEquipment}
                isOpen={showSidebar}
                onClose={() => setShowSidebar(false)}
            // refreshTrigger={refreshHistorian}
            />

            {/* Confirmation Message Card */}
            {confirmationMessage.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-6">
                            <div className="text-center">
                                {/* Icon */}
                                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-${getConfirmationDetails().color}-100 mb-4`}>
                                    {getConfirmationDetails().icon === 'rocket' && (
                                        <FaRocket className={`h-6 w-6 text-${getConfirmationDetails().color}-600`} />
                                    )}
                                    {getConfirmationDetails().icon === 'play' && (
                                        <FaPlay className={`h-6 w-6 text-${getConfirmationDetails().color}-600`} />
                                    )}
                                    {getConfirmationDetails().icon === 'stop' && (
                                        <FaStop className={`h-6 w-6 text-${getConfirmationDetails().color}-600`} />
                                    )}
                                    {getConfirmationDetails().icon === 'trash' && (
                                        <FaTrash className={`h-6 w-6 text-${getConfirmationDetails().color}-600`} />
                                    )}
                                    {getConfirmationDetails().icon === 'ban' && (
                                        <FaBan className={`h-6 w-6 text-${getConfirmationDetails().color}-600`} />
                                    )}
                                </div>

                                {/* Title and Message */}
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {getConfirmationDetails().title}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {getConfirmationDetails().message}
                                </p>

                                {/* Equipment Details */}
                                {confirmationMessage.equipment && (
                                    <div className="bg-gray-50 p-3 rounded-lg mb-6 text-left">
                                        <p className="text-sm font-medium">Equipment Details:</p>
                                        <p className="text-sm"><strong>KKS:</strong> {confirmationMessage.equipment.kks}</p>
                                        <p className="text-sm"><strong>System:</strong> {confirmationMessage.equipment.system}</p>
                                        <p className="text-sm"><strong>Current Status:</strong> {confirmationMessage.equipment.asset_status}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 justify-center">
                                    <Button
                                        variant="outline"
                                        onClick={hideConfirmation}
                                        disabled={isSubmitting}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={confirmAction}
                                        disabled={isSubmitting}
                                        className={`flex-1 bg-${getConfirmationDetails().color}-600 hover:bg-${getConfirmationDetails().color}-700`}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Processing...
                                            </div>
                                        ) : (
                                            getConfirmationDetails().confirmText
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Upload Modal */}
            <input
                id="fileInput"
                type="file"
                accept=".csv"
                onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    if (selectedFile) {
                        setFile(selectedFile);
                        setShowUploadModal(true);
                        e.target.value = '';
                    }
                }}
                className="hidden"
            />

            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center border-b p-4">
                            <p className="text-xl font-bold">Upload Equipment List</p>
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    setFile(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="mb-4">Selected file: {file?.name}</p>
                            <div className="flex justify-center space-x-3">
                                <Button
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setFile(null);
                                    }}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={async () => {
                                        if (!file) {
                                            alert('Please select a file first');
                                            return;
                                        }
                                        setUploading(true);
                                        try {
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            await UploadIHEquipmentListAPI(formData);
                                            setUploadSuccess(true);
                                            loadEquipments();
                                            setIsSubmitting(true);
                                            setShowUploadModal(false);
                                            setFile(null);
                                            setTimeout(() => setUploadSuccess(false), 3000);
                                        } catch (error) {
                                            console.error("Error uploading file:", error);
                                            setError("Failed to upload equipment list.");
                                        } finally {
                                            setUploading(false);
                                        }
                                    }}
                                    disabled={uploading}
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Notification */}
            {uploadSuccess && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
                    Equipment list uploaded successfully!
                    <button
                        onClick={() => setUploadSuccess(false)}

                        className="ml-2"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
};

export default IHEquipmentList; 