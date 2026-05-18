// pages/projects/DynamicProjectSparesList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { FiUpload, FiDownload, FiFilter, FiX, FiFolder } from 'react-icons/fi';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";

const ITEMS_PER_PAGE = 10;

const DynamicProjectSparesList = () => {
    const { projectId } = useParams();
    const [spares, setSpares] = useState([]);
    const [project, setProject] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        spare_type: '',
        status: ''
    });

    // Load project and spares data
    const loadProjectData = React.useCallback(async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            // TODO: Fetch spares data from API
            // const sparesData = await getProjectSparesAPI(projectId);
            setSpares([]);

            // Set mock project data
            setProject({
                id: projectId,
                name: `Project ${projectId}`,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            setError(`Failed to load spares: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        loadProjectData();
    }, [loadProjectData]);

    // Filter and search logic
    const filteredSpares = useMemo(() => {
        return spares.filter(spare => {
            const matchesSearch = spare.spare_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                spare.spare_code?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilters = (!filters.spare_type || spare.spare_type === filters.spare_type) &&
                                  (!filters.status || spare.status === filters.status);
            return matchesSearch && matchesFilters;
        });
    }, [spares, searchTerm, filters]);

    // Pagination logic
    const totalPages = Math.ceil(filteredSpares.length / ITEMS_PER_PAGE);
    const paginatedSpares = useMemo(() => {
        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredSpares.slice(startIdx, startIdx + ITEMS_PER_PAGE);
    }, [filteredSpares, currentPage]);

    // Handle CSV upload
    const handleUpload = async () => {
        if (!csvFile) {
            alert('Please select a file');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', csvFile);
            formData.append('projectId', projectId);

            // TODO: Implement upload API call
            // await uploadProjectSparesAPI(formData);
            
            setShowUploadModal(false);
            setCsvFile(null);
            await loadProjectData();
        } catch (error) {
            setError(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    // Handle export CSV
    const handleExport = () => {
        // TODO: Implement export functionality
        console.log('Export spares list');
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
    };

    if (loading) {
        return <div className="p-8 text-center">Loading spares...</div>;
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Project Spares</h1>
                    {project && <p className="text-gray-600">{project.name}</p>}
                </div>
                <div className="space-x-2 flex">
                    <Button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2">
                        <FiUpload /> Upload CSV
                    </Button>
                    <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
                        <FiDownload /> Export
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                        <FiX />
                    </button>
                </div>
            )}

            {/* Filters Section */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <Input
                                type="text"
                                placeholder="Search by spare name or code..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Spare Type</label>
                            <Select
                                value={filters.spare_type}
                                onChange={(e) => handleFilterChange('spare_type', e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="mechanical">Mechanical</option>
                                <option value="electrical">Electrical</option>
                                <option value="hydraulic">Hydraulic</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <Select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="available">Available</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </Select>
                        </div>
                        <Button 
                            variant="outline"
                            onClick={() => {
                                setFilters({ spare_type: '', status: '' });
                                setSearchTerm('');
                                setCurrentPage(1);
                            }}
                        >
                            <FiX /> Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table Section */}
            <Card>
                <CardContent className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium text-gray-700">Spare Code</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-700">Spare Name</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-700">Type</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-700">Quantity</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-700">Status</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-700">Unit Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedSpares.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            <FiFolder className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                            <p>No spares found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSpares.map(spare => (
                                        <tr key={spare.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-900">{spare.spare_code || '-'}</td>
                                            <td className="px-6 py-4 text-gray-900">{spare.spare_name || '-'}</td>
                                            <td className="px-6 py-4 text-gray-600">{spare.spare_type || '-'}</td>
                                            <td className="px-6 py-4 text-gray-900">{spare.quantity || 0}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    spare.status === 'available' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {spare.status || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">${spare.unit_price || 0}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center gap-2">
                            <Button
                                variant="outline"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(curr => Math.max(1, curr - 1))}
                            >
                                Previous
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? 'default' : 'outline'}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                variant="outline"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(curr => Math.min(totalPages, curr + 1))}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-96">
                        <CardContent className="p-6 space-y-4">
                            <h2 className="text-lg font-bold">Upload Spares CSV</h2>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => setCsvFile(e.target.files?.[0])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setCsvFile(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleUpload} disabled={uploading}>
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default DynamicProjectSparesList;
