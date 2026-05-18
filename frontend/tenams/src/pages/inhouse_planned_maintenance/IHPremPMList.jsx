import React, { useEffect, useState, useMemo, useCallback } from "react";
import IHPremPMListAPI from "../../api/inhouse_planned_maintenance/IHPremPMListAPI";
import DeleteIHPremPMAPI from "../../api/inhouse_planned_maintenance/DeleteIHPremPMAPI";

import UploadIHPremPMListAPI from "../../api/inhouse_planned_maintenance/UploadIHPremPMListAPI";

import UpdateIHPremPMStatusAPI from "../../api/inhouse_planned_maintenance/UpdateIHPremPMStateAPI";
// import PostPMHistorianFromPMAPI from "../../../api/planned_maintenance_historian/basis_planned_maintenance_historian/PostPMHistorianFromPMAPI";
import { FaEdit, FaTrash, FaPlus, FaPlay, FaStop, FaFileExcel, FaFilter, FaTimes, FaTools } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import IHPremPMDetailsSidebar from "./IHPremPMDetailsSidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";
import UpdateIHPremPMStateAPI from "../../api/inhouse_planned_maintenance/UpdateIHPremPMStateAPI";

const ITEMS_PER_PAGE = 10;

const IHPremPMList = () => {
    const [pm, setPm] = useState([]);
    const [pmErrors, setPmErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [selectedPm, setSelectedPm] = useState(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    // const [showHistorian, setShowHistorian] = useState(false);
    // const [refreshHistorian, setRefreshHistorian] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        eq_status: '',
        eq_state: '',
        maintenance_type: ''
    });
    const [sortConfig, setSortConfig] = useState({ key: 'ih_prem_pm_id', direction: 'asc' });
    const [confirmationMessage, setConfirmationMessage] = useState({
        show: false,
        type: '', // 'delete', 'enable', 'disable'
        pm: null,
        action: null
    });

    // Load planned maintenance data
    const loadPMs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await IHPremPMListAPI();
            setPm(data);
            setError(null);
            // setShowHistorian(true);
        } catch (error) {
            setError('Failed to load planned maintenance');
            console.error("Error loading planned maintenance:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPMs();
    }, [loadPMs]);

    // Get unique values for filters
    const uniqueValues = useMemo(() => {
        return {
            eq_num: [...new Set(pm.map(item => item.eq_num))].filter(Boolean),
            eq_status: [...new Set(pm.map(item => item.eq_status))].filter(Boolean),
            // eq_state: [...new Set(pm.map(item => item.eq_status))].filter(Boolean),
            maint_type: [...new Set(pm.map(item => item.maint_type))].filter(Boolean)
        };
    }, [pm]);

    // Filter and sort planned maintenance
    const filteredAndSortedPMs = useMemo(() => {
        let filtered = pm.filter(item => {
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch =
                String(item.eq_num || '').toLowerCase().includes(searchTermLower) ||
                String(item.maint_type || '').toLowerCase().includes(searchTermLower);

            const matchesFilters =
                (!filters.eq_status || item.eq_status === filters.eq_status) &&
                //   (!filters.maint__state || item.eq_status === filters.maint_state) &&
                (!filters.maint_type || item.maint_type === filters.maint_type);

            return matchesSearch && matchesFilters;
        });

        // Sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                // Handle date sorting
                if (sortConfig.key.includes('date')) {
                    const aDate = new Date(aValue || 0);
                    const bDate = new Date(bValue || 0);
                    return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
                }

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
    }, [pm, searchTerm, filters, sortConfig]);

    // Pagination
    const paginatedPMs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedPMs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedPMs, currentPage]);

    const totalPages = Math.ceil(filteredAndSortedPMs.length / ITEMS_PER_PAGE);

    // Handle sort
    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Handle row click
    const handleRowClick = (pm) => {
        setSelectedPm(pm);
        setShowSidebar(true);
    };

    // Confirmation system
    const showConfirmation = (type, pm, action) => {
        setConfirmationMessage({
            show: true,
            type,
            pm,
            action
        });
    };

    const hideConfirmation = () => {
        setConfirmationMessage({
            show: false,
            type: '',
            pm: null,
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
    const handleEditClick = (e, id) => {
        e.stopPropagation();
        navigate(`/ih_prem_pm_edit/${id}`);
    };

    const handleDeleteClick = async (e, pm, ih_prem_pm_id) => {
        e.stopPropagation();
        showConfirmation('delete', pm, async () => {
            // const errors = {};
            // let successCount = 0;
            // const payloadDel = {
            //     kks: pm.kks,
            //     asset_description: pm.asset_description,
            //     activity_description: pm.activity_description,
            //     status: "Deleted",
            //     status_change_date: new Date().toISOString(),
            //     frequency: pm.frequency,
            // };
            try {
                setIsSubmitting(true);
                await DeleteIHPremPMAPI(ih_prem_pm_id);
                await loadPMs();

                // try {
                //     await DeleteIHPremPMAPI(maint_id);
                //     // successCount++;
                // } catch (error) {
                //     console.error("Could not delete planned maintenance activity, please reach out to your administrator.", error);
                //     errors.update_pm_status = `* Could not delete planned maintenance activity, please reach out to your administrator.`;
                // }

                // try {

                //     await PostPMHistorianFromPMAPI(payloadDel);
                //     successCount++;
                // } catch (error) {
                //     console.error("Could not save this action to the historian, please reach out to your admin.", error);
                //     errors.update_pm_status = `* Could not save this action to the historian, please reach out to your administrator.`;
                // }


                // await loadPMs();
                // if (Object.keys(errors).length > 0) {
                //     const errorList = Object.values(errors);

                //     setPmErrors(prev => ({
                //         ...prev,
                //         [pm.maint_id]: `Warning: ${successCount}/3 successful operations, the issue(s): ${errorList.join('; ')}`
                //     }));
                // } else {
                //     // Clear errors if all succeeded
                //     setPmErrors(prev => {
                //         const newErrors = { ...prev };
                //         delete newErrors[pm.maint_id];
                //         return newErrors;
                //     });
                // }
            } catch (error) {

                console.error("Unexpected error in handleFirstStartClick:", error);
                setPmErrors(prev => ({
                    ...prev,
                    [pm.maint_id]: `Unexpected error during equipment start`
                }));
            } finally {
                setIsSubmitting(false);
            }
        });
    };


    const handleEnableClick = async (e, ih_prem_pm_id, pm) => {
        e.stopPropagation();
        showConfirmation('enable', pm, async () => {
            const errors = {};
            // let successCount = 0;
            // const payloadPMHist = {
            //     kks: pm.kks,
            //     asset_description: pm.asset_description,
            //     activity_description: pm.activity_description,
            //     status: "Enable",
            //     status_change_date: new Date().toISOString(),
            //     frequency: pm.frequency,
            // };
            try {
                setIsSubmitting(true);
                try {
                    await UpdateIHPremPMStateAPI(ih_prem_pm_id, "Enable");
                    await loadPMs();
                    // successCount++;
                } catch (error) {
                    console.error("Could not update planned maintenance status in ih maintenance activities, please reach out to your admin.", error);
                    errors.update_pm_status = `* Could not update planned maintenance status, please reach out to your administrator.`;
                }

                // try {
                //     await PostPMHistorianFromPMAPI(payloadPMHist);
                //     successCount++;
                // } catch (error) {
                //     console.error("Could not update planned maintenance historian, please reach out to your admin.", error);
                //     errors.post_historian = `* Could not update planned maintenance historian, please reach out to your administrator.`;
                // }



                // await loadPMs();
                // if (Object.keys(errors).length > 0) {
                //     const errorList = Object.values(errors);

                //     setPmErrors(prev => ({
                //         ...prev,
                //         [pm.maint_id]: `Warning: ${successCount}/3 successful operations, the issue(s): ${errorList.join('; ')}`
                //     }));
                // } else {
                //     // Clear errors if all succeeded
                //     setPmErrors(prev => {
                //         const newErrors = { ...prev };
                //         delete newErrors[pm.maint_id];
                //         return newErrors;
                //     });
                // }
            } catch (error) {

                console.error("Unexpected error in handle enable ih planned maintenance:", error);
                setPmErrors(prev => ({
                    ...prev,
                    [pm.ih_prem_pm_id]: `Unexpected error during enabling ih planned maintenance`
                }));
            } finally {
                setIsSubmitting(false);
            }
        });
    };



    const handleDisableClick = async (e, ih_prem_pm_id, pm) => {
        e.stopPropagation();
        showConfirmation('disable', pm, async () => {
            const errors = {};
            // let successCount = 0;
            // const payload = {
            //     kks: pm.kks,
            //     asset_description: pm.asset_description,
            //     activity_description: pm.activity_description,
            //     status: "Disable",
            //     status_change_date: new Date().toISOString(),
            //     frequency: pm.frequency,
            // };
            try {
                setIsSubmitting(true);
                try {
                    await UpdateIHPremPMStateAPI(ih_prem_pm_id, "Disable");
                    await loadPMs();
                    // successCount++;
                } catch (error) {
                    console.error("Could not update planned maintenance status in basis maintenance activities, please reach out to your admin.", error);
                    errors.update_pm_status = `* Could not update planned maintenance status, please reach out to your admin.`;
                }

                // try {
                //     await PostPMHistorianFromPMAPI(payload);
                //     successCount++;
                // } catch (error) {
                //     console.error("Could not update planned maintenance historian, please reach out to your admin.", error);
                //     errors.post_historian = `* Could not update planned maintenance historian, please reach out to your admin.`;
                // }

                // await loadPMs();
                // if (Object.keys(errors).length > 0) {
                //     const errorList = Object.values(errors);

                //     setPmErrors(prev => ({
                //         ...prev,
                //         [pm.maint_id]: `Warning: ${successCount}/3 successful operations, the issue(s): ${errorList.join('; ')}`
                //     }));
                // } else {
                //     // Clear errors if all succeeded
                //     setPmErrors(prev => {
                //         const newErrors = { ...prev };
                //         delete newErrors[pm.maint_id];
                //         return newErrors;
                //     });
                // }
            } catch (error) {

                console.error("Unexpected error in handleFirstStartClick:", error);
                setPmErrors(prev => ({
                    ...prev,
                    [pm.ih_prem_pm_id]: `Unexpected error during equipment start`
                }));
            } finally {
                setIsSubmitting(false);
            }
        });
    };


    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredAndSortedPMs);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "In House Planned Maintenance");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, `in_house_planned_maintenance_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleFileUpload = async () => {
        if (!file) {
            alert('Please select a file first');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            await UploadIHPremPMListAPI(formData);
            setUploadSuccess(true);
            loadPMs();
            setShowUploadModal(false);
            setFile(null);
            setTimeout(() => setUploadSuccess(false), 3000);
        } catch (error) {
            console.error("Error uploading file:", error);
            setError("Failed to upload planned maintenance list.");
        } finally {
            setUploading(false);
        }
    };

    const clearFilters = () => {
        setFilters({ status: '', maint_type: '' });
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Format date for display
    // const formatDate = (dateString) => {
    //     if (!dateString) return '-';
    //     return new Date(dateString).toLocaleDateString('en-US', {
    //         year: 'numeric',
    //         month: 'short',
    //         day: 'numeric'
    //     });
    // };

    // Get confirmation message details
    const getConfirmationDetails = () => {
        const { type, pm } = confirmationMessage;

        const messages = {
            delete: {
                title: 'Delete Planned Maintenance',
                icon: 'trash',
                color: 'red',
                message: `Are you sure you want to delete "${pm?.maint_description}"? This action cannot be undone.`,
                confirmText: 'Delete Maintenance'
            },
            enable: {
                title: 'Enable Planned Maintenance',
                icon: 'play',
                color: 'green',
                message: `Are you sure you want to enable "${pm?.maint_description}"?`,
                confirmText: 'Enable Maintenance'
            },
            disable: {
                title: 'Disable Planned Maintenance',
                icon: 'stop',
                color: 'red',
                message: `Are you sure you want to disable "${pm?.maint_description}"?`,
                confirmText: 'Disable Maintenance'
            }
        };

        return messages[type] || messages.delete;
    };

    // Get status badge color
    const getStatusBadgeColor = (eq_status) => {
        switch (eq_status) {
            case 'Online': return 'bg-green-100 text-green-800';
            case 'Isolated': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-gray-800';
        }
    };

     // Get status badge color
    const getStateBadgeColor = (maint_state) => {
        switch (maint_state) {
            case 'Enable': return 'bg-green-100 text-green-800';
            case 'Disable': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-gray-800';
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading planned maintenance...</div>;
    if (error) return <div className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <FaTools className="text-blue-600" />
                    Planned Maintenance Management
                </h1>
                <div className="flex gap-3">
                    <Button
                        onClick={() => document.getElementById('pmFileInput').click()}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <FaPlus /> Upload PM List
                    </Button>
                    <Button
                        onClick={() => navigate('/activity/add')}
                        className="flex items-center gap-2"
                    >
                        <FaPlus /> Add PM Activity
                    </Button>
                    <Button
                        onClick={handleExportExcel}
                        variant="secondary"
                        className="flex items-center gap-2 bg-green-500 text-white"
                    >
                        <FaFileExcel /> Export
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="sm:col-span-1">
                            <Input
                                placeholder="Search activity..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <Select
                            value={filters.eq_status}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, eq_status: e.target.value }));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All Asset Status</option>
                            {uniqueValues.eq_status.map(eq_status => (
                                <option key={eq_status} value={eq_status}>{eq_status}</option>
                            ))}
                        </Select>
                        {/* <Select
                            value={filters.eq_state}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, eq_state: e.target.value }));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All State</option>
                            {uniqueValues.eq_state.map(eq_state => (
                                <option key={eq_state} value={eq_state}>{eq_state}</option>
                            ))}
                        </Select> */}
                        <Select
                            value={filters.maint_type}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, maint_type: e.target.value }));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All Task Types</option>
                            {uniqueValues.maint_type.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaFilter />
                            <span>Showing {filteredAndSortedPMs.length} of {pm.length} maintenance activities</span>
                        </div>
                        <Button variant="ghost" onClick={clearFilters} size="sm">
                            <FaTimes className="mr-1" /> Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Planned Maintenance Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto max-h-[45vh] rounded-xl">
                        <table className="w-full">
                            <thead className="bg-[#0070EF] border-b text-white sticky top-0">
                                <tr>
                                    <th
                                        className="p-4 text-left font-semibold cursor-pointer"
                                        onClick={() => handleSort('ih_prem_pm_id')}
                                    >
                                        ID {sortConfig.key === 'ih_prem_pm_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>

                                    {/* <th
                                        className="p-4 text-left font-semibold cursor-pointer"
                                        onClick={() => handleSort('eq_num')}
                                    >
                                        Asset {sortConfig.key === 'eq_num' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th> */}

                                    <th
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('maint_description')}
                                    >
                                        Activity Description {sortConfig.key === 'maint_description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>

                                    <th
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('equipment_class_category')}
                                    >
                                        Asset Category {sortConfig.key === 'equipment_class_category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>

                                    <th
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('frequency')}
                                    >
                                        Frequency  {sortConfig.key === 'frequency' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>

                                    <th
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('plant_status')}
                                    >
                                        Plant Staus {sortConfig.key === 'plant_status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('eq_status')}
                                    >
                                        Asset Status {sortConfig.key === 'eq_status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>

                                    <th
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('maint_state')}
                                    >
                                       Task State {sortConfig.key === 'maint_state' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>

                                    <th className="p-4 text-left font-semibold ">Actions</th>

                                </tr>
                            </thead>


                            <tbody className="divide-y">
                                {paginatedPMs.map((pm) => (
                                    <tr
                                        key={pm.ih_prem_pm_id}
                                        className="hover:bg-violet-200 cursor-pointer transition-colors"
                                        onClick={() => handleRowClick(pm)}
                                    >
                                        <td className="p-4 font-mono text-sm text-gray-600">#{pm.ih_prem_pm_id}</td>

                                        {/* <td className="p-4">
                                            <div className="font-medium text-gray-900">{pm.eq_num}</div>
                                            {sortConfig.key === 'eq_num' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </td> */}
                                        <td className="p-4">
                                            <div className="font-medium">{pm.maint_description}</div>
                                            <div className="text-sm text-gray-500">{pm.maint_type}</div>
                                            {pmErrors[pm.maint_description] && (
                                                <div className="text-red-500 text-sm mt-1">{pmErrors[pm.maint_description]}</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium">{pm.equipment_class_category}</div>                                                                                         
                                            <div className="text-sm text-gray-500">{pm.sub_equipment_class_code}</div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">{pm.frequency} Day(s)</td>
                                        <td className="p-4 font-mono text-sm text-gray-600">{pm.plant_status}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(pm.eq_status)}`}>
                                                {pm.eq_status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateBadgeColor(pm.maint_state)}`}>
                                                {pm.maint_state}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => handleEditClick(e, pm.ih_prem_pm_id)}
                                                    title="Edit Maintenance"
                                                >
                                                    <FaEdit className="text-blue-600" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => handleDeleteClick(e, pm, pm.ih_prem_pm_id)}
                                                    title="Delete Maintenance"
                                                >
                                                    <FaTrash className="text-red-600" />
                                                </Button>
                                                {pm.maint_state === "Disable" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => handleEnableClick(e, pm.ih_prem_pm_id, pm)}
                                                        title="Enable Maintenance"
                                                        className="text-green-600 border-green-200 hover:bg-green-50"
                                                    >
                                                        <FaPlay />
                                                    </Button>
                                                )}
                                                {pm.maint_state === "Enable" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => handleDisableClick(e, pm.ih_prem_pm_id, pm)}
                                                        title="Disable Maintenance"
                                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                                    >
                                                        <FaStop />
                                                    </Button>
                                                )}
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
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedPMs.length)} of {filteredAndSortedPMs.length} results
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

            {/* PM Details Sidebar */}
            <IHPremPMDetailsSidebar
                pm={selectedPm}
                isOpen={showSidebar}
                onClose={() => setShowSidebar(false)}
            />

            {/* Confirmation Message Card */}
            {confirmationMessage.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${confirmationMessage.type === 'enable' ? 'bg-green-100' : 'bg-red-100'
                                    } mb-4`}>
                                    {confirmationMessage.type === 'Enable' ? (
                                        <FaPlay className="h-6 w-6 text-green-600" />
                                    ) : confirmationMessage.type === 'Disable' ? (
                                        <FaStop className="h-6 w-6 text-red-600" />
                                    ) : (
                                        <FaTrash className="h-6 w-6 text-red-600" />
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {getConfirmationDetails().title}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {getConfirmationDetails().message}
                                </p>
                                {confirmationMessage.pm && (
                                    <div className="bg-gray-50 p-3 rounded-lg mb-6 text-left">
                                        <p className="text-sm font-medium">Maintenance Details:</p>
                                        <p className="text-sm"><strong>Asset Nbr:</strong> {confirmationMessage.pm.eq_num}</p>
                                        <p className="text-sm"><strong>Activity:</strong> {confirmationMessage.pm.maint_description}</p>
                                        <p className="text-sm"><strong>State:</strong> {confirmationMessage.pm.maint_state}</p>
                                    </div>
                                )}
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
                                        className={`flex-1 ${confirmationMessage.type === 'enable'
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                            }`}
                                    >
                                        {getConfirmationDetails().confirmText}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Upload Modal */}
            <input
                id="pmFileInput"
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
                            <p className="text-xl font-bold">Upload Planned Maintenance List</p>
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
                                    onClick={handleFileUpload}
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
                    Planned Maintenance list uploaded successfully!
                    <button
                        onClick={() => setUploadSuccess(false)}
                        className="ml-2"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Planned Maintenance Historian Section */}
            {/* <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                    <FaTools className="text-blue-600 text-xl" />
                    <h2 className="text-2xl font-bold text-gray-900">Planned Maintenance History</h2>
                </div>
                {showHistorian && <HistoryPMList refreshTrigger={refreshHistorian} />}
            </div> */}
        </div>
    );
};

export default IHPremPMList;