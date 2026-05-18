import React, { useEffect, useState, useMemo, useCallback } from "react";
import PMHistorianListAPI from "../../../api/planned_maintenance_historian/basis_planned_maintenance_historian/PMHistorianListAPI";
import { FaFileExcel, FaFilter, FaTimes, FaHistory, FaInfoCircle } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import PMHistoryDetailsSidebar from "./PMHistoryDetailsSidebar";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select } from "../../../components/ui/select";
import { Card, CardContent } from "../../../components/ui/card";

const ITEMS_PER_PAGE = 20;

const HistoryPMList = ({ refreshTrigger }) => {
    const [hist_activity, sethist_Activity] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedhist_Activity, setSelectedhist_Activity] = useState(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        status: '',
        kks: ''
    });
    const [sortConfig, setSortConfig] = useState({ key: 'hist_maint_id', direction: 'desc' });

    // Load planned maintenance history data
    const loadhistPMs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await PMHistorianListAPI();
            sethist_Activity(data);
            setError(null);
        } catch (error) {
            setError('Failed to load planned maintenance history');
            console.error("Error loading planned maintenance history:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadhistPMs();
    }, [loadhistPMs, refreshTrigger]);

    // Get unique values for filters
    const uniqueValues = useMemo(() => {
        return {
            status: [...new Set(hist_activity.map(item => item.status))].filter(Boolean),
            kks: [...new Set(hist_activity.map(item => item.kks))].filter(Boolean)
        };
    }, [hist_activity]);

    // Filter and sort planned maintenance history
    const filteredAndSortedHistPMs = useMemo(() => {
        let filtered = hist_activity.filter(item => {
            const matchesSearch = 
                item.kks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.asset_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.activity_description?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilters = 
                (!filters.status || item.status === filters.status) &&
                (!filters.kks || item.kks === filters.kks);

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
    }, [hist_activity, searchTerm, filters, sortConfig]);

    // Pagination
    const paginatedHistPMs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedHistPMs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedHistPMs, currentPage]);

    const totalPages = Math.ceil(filteredAndSortedHistPMs.length / ITEMS_PER_PAGE);

    // Handle sort
    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Handle row click
    const handleRowClick = (hist_pm) => {
        setSelectedhist_Activity(hist_pm);
        setShowSidebar(true);
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredAndSortedHistPMs);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Planned Maintenance History");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, `planned_maintenance_history_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const clearFilters = () => {
        setFilters({ status: '', kks: '' });
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status badge color
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Enable': return 'bg-green-100 text-green-800';
            case 'Disable': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading maintenance history...</div>;
    if (error) return <div className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Search and Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <Input
                                placeholder="Search by KKS, asset description, activity..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <Select
                            value={filters.status}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, status: e.target.value }));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All Status</option>
                            {uniqueValues.status.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </Select>
                        <Select
                            value={filters.kks}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, kks: e.target.value }));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All KKS Codes</option>
                            {uniqueValues.kks.map(kks => (
                                <option key={kks} value={kks}>{kks}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaFilter />
                            <span>Showing {filteredAndSortedHistPMs.length} of {hist_activity.length} history records</span>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={clearFilters} size="sm">
                                <FaTimes className="mr-1" /> Clear Filters
                            </Button>
                            <Button
                                onClick={handleExportExcel}
                                variant="secondary"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <FaFileExcel /> Export
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Planned Maintenance History Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto max-h-[45vh] rounded-xl">
                        <table className="w-full">
                            <thead className="bg-[#0070EF] border-b text-white sticky top-0">
                                <tr>
                                    <th 
                                        className="p-4 text-left font-semibold cursor-pointer "
                                        onClick={() => handleSort('hist_maint_id')}
                                    >
                                        History ID {sortConfig.key === 'hist_maint_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('kks')}
                                    >
                                        KKS Code {sortConfig.key === 'kks' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('asset_description')}
                                    >
                                        Asset Description {sortConfig.key === 'asset_description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('activity_description')}
                                    >
                                        Activity {sortConfig.key === 'activity_description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                      <th 
                                        className="p-4 text-left font-semibold  cursor-pointer"
                                        onClick={() => handleSort('frequency')}
                                    >
                                        Frequency (Days) {sortConfig.key === 'frequency' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        className="p-4 text-left font-semibold cursor-pointer"
                                        onClick={() => handleSort('status')}
                                    >
                                        Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        className="p-4 text-left font-semibold cursor-pointer"
                                        onClick={() => handleSort('status_change_date')}
                                    >
                                        Change Date {sortConfig.key === 'status_change_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                       <th 
                                        className="p-4 text-left font-semibold cursor-pointer"
                                        onClick={() => handleSort('recorder')}
                                    >
                                        By {sortConfig.key === 'recorder' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {paginatedHistPMs.map((hist_pm) => (
                                    <tr 
                                        key={hist_pm.hist_maint_id} 
                                        className="hover:bg-violet-200 cursor-pointer transition-colors"
                                        onClick={() => handleRowClick(hist_pm)}
                                    >
                                        <td className="p-4 font-mono text-sm text-gray-600">#{hist_pm.hist_maint_id}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{hist_pm.kks}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium">{hist_pm.asset_description}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium">{hist_pm.activity_description}</div>
                                        </td>
                                         <td className="p-4">
                                            <div className="font-medium">{hist_pm.frequency}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(hist_pm.status)}`}>
                                                {hist_pm.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {formatDate(hist_pm.status_change_date)}
                                        </td>
                                         <td className="p-4">
                                            <div className="font-medium">{hist_pm.recorder}</div>
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
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedHistPMs.length)} of {filteredAndSortedHistPMs.length} results
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

            {/* PM History Details Sidebar */}
            <PMHistoryDetailsSidebar
                hist_pm={selectedhist_Activity}
                isOpen={showSidebar}
                onClose={() => setShowSidebar(false)}
            />
        </div>
    );
};

export default HistoryPMList;