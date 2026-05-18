import React, { useEffect, useState, useMemo } from "react";
import IHSparesListAPI from "../../api/inhouse_spares/IHSparesListAPI";
import DeleteIHSpareAPI from "../../api/inhouse_spares/DeleteIHSpareAPI";
import UpdateIHSpareStateAPI from "../../api/inhouse_spares/UpdateIHSpareStateAPI";
import { FaEdit, FaTrash, FaPlus, FaPlay, FaStop, FaRocket, FaFileExcel, FaBan, FaFilter, FaTimes } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import UploadIHSparesListAPI from "../../api/inhouse_spares/UploadIHSparesListAPI";
import IHSparesDetailsSidebar from "./IHSparesDetailsSidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";

const ITEMS_PER_PAGE = 10;

const IHSparesList = () => {
    const [spare, setSpare] = useState([]);
    const [spareErrors, setSpareErrors] = useState({});
    // const [equipmentErrors, setEquipmentErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [selectedSpare, setSelectedSpare] = useState(null);
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
        spare: null,
        action: null // function to execute on confirm
    });

    // Load equipment data
    const loadSpares = async () => {
        try {
            const data = await IHSparesListAPI();
            setSpare(data);
        } catch (error) {
            setError(`Failed to load spare parts: ${error.message || 'Unknown error'}`);
            console.error('Spare load error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSpares();
    }, []);


    // Filter and sort equipment
    const uniqueValues = useMemo(() => {
        return {
            equipment_class_category: [...new Set(spare.map(item => item.equipment_class_category))].filter(Boolean),
            sub_equipment_class_code: [...new Set(spare.map(item => item.sub_equipment_class_code))].filter(Boolean),
            // site: [...new Set(equipment.map(item => item.site))].filter(Boolean)
        };
    }, [spare]);

    // Filter and sort equipment
    const filteredAndSortedSpares = useMemo(() => {
        let filtered = spare.filter(item => {
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
    }, [spare, searchTerm, filters, sortConfig]);
    // Pagination
    const paginatedEquipments = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedSpares.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedSpares, currentPage]);

    const totalPages = Math.ceil(filteredAndSortedSpares.length / ITEMS_PER_PAGE);

    // Handle sort
    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Handle row click
    const handleRowClick = (spare) => {
        setSelectedSpare(spare);
        setShowSidebar(true);
        // setRefreshHistorian(prev => prev + 1);
    };

    // Show confirmation message
    const showConfirmation = (type, spare, action) => {
        setConfirmationMessage({
            show: true,
            type:type.toLowerCase(),
            spare,
            action
        });
    };

    // Hide confirmation message
    const hideConfirmation = () => {
        setConfirmationMessage({
            show: false,
            type: '',
            spare: null,
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
        navigate(`/spare/edit/${id}`);
    };

    const handleDeleteClick = async (e, spare) => {
        e.stopPropagation();
        showConfirmation('delete', spare, async () => {
            try {
                await DeleteIHSpareAPI(spare.ih_sp_id);
                loadSpares();
            } catch (error) {
                console.error("Error deleting spare:", error);
                setError("Failed to delete spare.");
            }
        });
    };

    const handleEnableClick = async (e, ih_sp_id, spare) => {
        e.stopPropagation();
        showConfirmation('enable', spare,async () => {
            const errors = {};
            try {
                setIsSubmitting(true);
                try {
                    await UpdateIHSpareStateAPI(ih_sp_id, "Enable");
                    await loadSpares();
                    // successCount++;
                } catch (error) {
                    console.error("Could not update spare status in ih spares list, please reach out to your admin.", error);
                    errors.update_pm_status = `* Could not update spare status in ih spares list, please reach out to your administrator.`;
                }
            } catch (error) {

                console.error("Unexpected error in handle enable ih spare status in ih spares list:", error);
                setSpareErrors(prev => ({
                    ...prev,
                    [spare.ih_sp_id]: `Unexpected error during enabling ih spare status in ih spares list`
                }));
            } finally {
                setIsSubmitting(false);
            }
        });
    };
    const handleDisableClick = async (e, ih_sp_id, spare) => {
        e.stopPropagation();
        showConfirmation('disable', spare, async () => {
            const errors = {};
            try {
                setIsSubmitting(true);
                try {
                    await UpdateIHSpareStateAPI(ih_sp_id, "Disable");
                    await loadSpares();
                    // successCount++;
                } catch (error) {
                    console.error("Could not update spare status in ih spares list, please reach out to your admin.", error);
                    errors.update_pm_status = `* Could not update spare status in ih spares list, please reach out to your administrator.`;
                }
            } catch (error) {

                console.error("Unexpected error in handle enable ih spare status in ih spares list:", error);
                setSpareErrors(prev => ({
                    ...prev,
                    [spare.ih_sp_id]: `Unexpected error during enabling ih spare status in ih spares list`
                }));
            } finally {
                setIsSubmitting(false);
            }
        });
    };

    


    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredAndSortedSpares);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Spare_Parts");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, `In_House_Spare_Parts_list_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const clearFilters = () => {
        setFilters({ equipment_class_category: '', sub_equipment_class_code: '' });
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Get confirmation message details based on action type
    const getConfirmationDetails = () => {
        const { type, spare } = confirmationMessage;

        const messages = {
          
            delete: {
                title: 'Delete Spare Part',
                icon: 'trash',
                color: 'red',
                message: `Are you sure you want to delete "${spare?.sp_description}"? This action cannot be undone.`,
                confirmText: 'Delete Spare Part'
            },
            enable: {
                title: 'Enable Spare Part',
                icon: 'play',
                color: 'green',
                message: `Are you sure you want to enable "${spare?.sp_description}"?`,
                confirmText: 'Enable Spare Part'
            },
            disable: {
                title: 'Disable Spare Part',
                icon: 'stop',
                color: 'red',
                message: `Are you sure you want to disable "${spare?.sp_description}"?`,
                confirmText: 'Disable Spare Part'
            }           
        };

        return messages[type] || messages.delete;
    };
    // ==============================================================================================================================================================================

    // Render appropriate action buttons based on spare status
    const renderActionButtons = (spare) => {
        return (
            <div className="flex flex-wrap gap-1" onClick={e => e.stopPropagation()}>
                {/* Edit Button - Always visible */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleEditClick(e, spare.ih_sp_id)}
                    title="Edit Spare"
                >
                    <FaEdit className="text-blue-600" />
                </Button>

                {/* Delete Button - Always visible */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleDeleteClick(e, spare)}
                    title="Delete Spare"
                >
                    <FaTrash className="text-red-600" />
                </Button>
                {spare.sp_state === "Disable" && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleEnableClick(e, spare.ih_sp_id, spare)}
                        title="Enable Spare Part"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                        <FaPlay />
                    </Button>
                )}
                {spare.sp_state === "Enable" && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleDisableClick(e, spare.ih_sp_id, spare)}
                        title="Disable Spare Part"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                        <FaStop />
                    </Button>
                )}

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
                <h1 className="text-3xl font-bold text-gray-900">Spares Management</h1>
                <div className="flex gap-3">
                    <Button
                        onClick={() => document.getElementById('fileInput').click()}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <FaPlus /> Upload List
                    </Button>
                    <Button
                        onClick={() => navigate('/ih_spare/add')}
                        className="flex items-center gap-2"
                    >
                        <FaPlus /> Add Spare
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
                            <span>Showing {filteredAndSortedSpares.length} of {spare.length} spare</span>
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
                                        onClick={() => handleSort('ih_sp_id')}
                                    >
                                        ID {sortConfig.key === 'ih_eq_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>

                                    <th
                                        className="p-4 text-left font-semibold cursor-pointer"
                                        onClick={() => handleSort('equipment_class_category')}
                                    >
                                        Category {sortConfig.key === 'equipment_class_category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('sp_description')}
                                    >
                                        Description {sortConfig.key === 'sp_description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>

                                    <th
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('storage_condition')}
                                    >
                                        Storage {sortConfig.key === 'storage_condition' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="p-4 text-left font-semibold cursor-pointer"
                                        onClick={() => handleSort('sp_state')}
                                    >
                                        State {sortConfig.key === 'sp_state' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    {/* <th
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('comm_sp')}
                                    >
                                        Commissioning {sortConfig.key === 'comm_sp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('op_sp')}
                                    >
                                        Operation {sortConfig.key === 'op_sp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('overh_sp')}
                                    >
                                        Overhauling {sortConfig.key === 'overh_sp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('capital_sp')}
                                    >
                                        Capital {sortConfig.key === 'capital_sp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th> */}
                                    {/* <th
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('consumable')}
                                    >
                                        Consumable {sortConfig.key === 'consumable' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th> */}
                                    <th className="p-4 text-left font-semibold ">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {paginatedEquipments.map((spare) => (
                                    <tr
                                        key={spare.ih_sp_id}
                                        className="hover:bg-violet-200 cursor-pointer transition-colors"
                                        onClick={() => handleRowClick(spare)}
                                    >
                                        <td className="p-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{spare.ih_sp_id}</div>
                                                {spareErrors[spare.ih_sp_id] && (
                                                    <div className="text-red-500 text-sm mt-1">{spareErrors[spare.ih_sp_id]}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{spare.equipment_class_category}</div>
                                                {/* <div className="text-sm text-gray-500">{eq.sub_equipment_class_desc}</div> */}
                                                <div className="text-sm text-gray-500">{spare.sub_equipment_class_code}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-500">{spare.sp_description}</div>
                                            {/* <div className="text-sm text-gray-500">{eq.maint_type}</div> */}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium">{spare.storage_condition}</div>
                                            {/* <div className="text-sm text-gray-500">{sp.maint_prog_code}</div> */}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{spare.sp_state}</div>
                                        </td>
                                        {/* <td className="p-4">
                                            <div className="font-medium text-gray-900">{sp.comm_sp}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{sp.op_sp}</div>
                                        </td>
                                        <td className="p-4">

                                            <div className="font-medium text-gray-900">{sp.overh_sp}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{sp.capital_sp}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{sp.consumable}</div>
                                        </td> */}
                                        <td className="p-4">
                                            {renderActionButtons(spare)}
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
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedSpares.length)} of {filteredAndSortedSpares.length} results
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
            <IHSparesDetailsSidebar
                equipment={selectedSpare}
                isOpen={showSidebar}
                onClose={() => setShowSidebar(false)}
            // refreshTrigger={refreshHistorian}
            />

            {/* Confirmation Message Card */}
            {confirmationMessage.show && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-6">
                            <div className="text-center">
                                {/* Icon */}
                                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-${getConfirmationDetails().color}-100 mb-4`}>
                                    {/* {getConfirmationDetails().icon === 'rocket' && (
                                        <FaRocket className={`h-6 w-6 text-${getConfirmationDetails().color}-600`} />
                                    )} */}
                                    {getConfirmationDetails().icon === 'play'  && (
                                        <FaPlay className={`h-6 w-6 text-${getConfirmationDetails().color}-600`} />
                                    )}
                                    {getConfirmationDetails().icon === 'stop' && (
                                        <FaStop className={`h-6 w-6 text-${getConfirmationDetails().color}-600`} />
                                    )}
                                    {getConfirmationDetails().icon === 'trash' && (
                                        <FaTrash className={`h-6 w-6 text-${getConfirmationDetails().color}-600`} />
                                    )}
                                    {/* {getConfirmationDetails().icon === 'ban' && (
                                        <FaBan className={`h-6 w-6 text-${getConfirmationDetails().color}-600`} />
                                    )} */}
                                </div>

                                {/* Title and Message */}
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {getConfirmationDetails().title}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {getConfirmationDetails().message}
                                </p>

                                {/* Equipment Details */}
                                {confirmationMessage.spare && (
                                    <div className="bg-gray-50 p-3 rounded-lg mb-6 text-left">
                                        <p className="text-sm font-medium">Spare Details:</p>
                                        <p className="text-sm"><strong>Spare ID:</strong> {confirmationMessage.spare.ih_sp_id}</p>
                                        <p className="text-sm"><strong>Spare Description:</strong> {confirmationMessage.spare.sp_description}</p>
                                        <p className="text-sm"><strong>Spare State:</strong> {confirmationMessage.spare.sp_state}</p>
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
                            <p className="text-xl font-bold">Upload Spare Parts List</p>
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
                                            await UploadIHSparesListAPI(formData);
                                            setUploadSuccess(true);
                                            loadSpares();
                                            setIsSubmitting(true);
                                            setShowUploadModal(false);
                                            setFile(null);
                                            setTimeout(() => setUploadSuccess(false), 3000);
                                        } catch (error) {
                                            console.error("Error uploading file:", error);
                                            setError("Failed to upload Spare Parts list.");
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
                    Spare Parts list uploaded successfully!
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

export default IHSparesList; 