// pages/projects/DynamicProjectEquipmentList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import getProjectEquipmentAPI from "../../api/projects/getProjectEquipmentAPI";
// import getProjectAPI from "../../api/projects/getProjectEquipmentAPI";
import uploadProjectEquipmentAPI from "../../api/projects/uploadProjectEquipmentAPI"

import { FiUpload, FiDownload, FiFilter, FiX, FiFolder } from 'react-icons/fi';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";
 

const ITEMS_PER_PAGE = 10;

const DynamicProjectEquipmentList = () => {
    const { projectId } = useParams();
    const [equipment, setEquipment] = useState([]);
    const [project, setProject] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        equipment_class_category: '',
        sub_equipment_class_desc: ''
    });

    // Load project and equipment data
    const loadProjectData = React.useCallback(async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            // In a real app, you'd fetch project details and equipment
            const equipmentData = await getProjectEquipmentAPI(projectId);
            setEquipment(equipmentData);

            // For now, set a mock project - you'll fetch this from API
            setProject({
                id: projectId,
                name: `Project ${projectId}`,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            setError(`Failed to load equipment: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        loadProjectData();
    }, [loadProjectData]); // Runs when loadProjectData changes (which happens when projectId changes)


    // Handle CSV upload
    const handleUploadCSV = async () => {
        if (!csvFile || !projectId) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', csvFile);
            formData.append('project_id', projectId);

            await uploadProjectEquipmentAPI(formData);
            setShowUploadModal(false);
            setCsvFile(null);
            loadProjectData(); // Refresh equipment list
        } catch (error) {
            setError(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    // Filter equipment
    const filteredEquipment = useMemo(() => {
        return equipment.filter(item => {
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch =
                String(item.asset_description || '').toLowerCase().includes(searchTermLower) ||
                String(item.sub_equipment_class_desc || '').toLowerCase().includes(searchTermLower) ||
                String(item.tech_specification || '').toLowerCase().includes(searchTermLower);

            const matchesFilters =
                (!filters.equipment_class_category || item.equipment_class_category === filters.equipment_class_category) &&
                (!filters.sub_equipment_class_desc || item.sub_equipment_class_desc === filters.sub_equipment_class_desc);

            return matchesSearch && matchesFilters;
        });
    }, [equipment, searchTerm, filters]);

    // Pagination
    const paginatedEquipment = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredEquipment.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredEquipment, currentPage]);

    const totalPages = Math.ceil(filteredEquipment.length / ITEMS_PER_PAGE);

    if (loading) return <div className="flex justify-center items-center h-64">Loading project equipment...</div>;
    if (error) return <div className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Project Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <FiFolder className="text-3xl text-violet-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {project?.name} - Equipment List
                        </h1>
                        <p className="text-gray-600">Project ID: {projectId}</p>
                    </div>
                </div>

                <Button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700"
                >
                    <FiUpload />
                    Upload Equipment CSV
                </Button>
            </div>

            {/* Equipment Summary */}
            <Card className="bg-violet-50 border-violet-200">
                <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-violet-800">Equipment Summary</h2>
                            <p className="text-violet-600">{equipment.length} equipment items</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-violet-600">Showing {filteredEquipment.length} filtered items</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <Input
                                placeholder="Search by description, technical spec..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <Select
                            value={filters.sub_equipment_class_desc}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, sub_equipment_class_desc: e.target.value }));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All Equipment Classes</option>
                            {/* Dynamic options would go here */}
                        </Select>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiFilter />
                            <span>Project: {project?.name}</span>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setFilters({ equipment_class_category: '', sub_equipment_class_desc: '' });
                                setSearchTerm('');
                            }}
                            size="sm"
                        >
                            <FiX className="mr-1" /> Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Equipment Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#0070EF] text-white">
                                <tr>
                                    <th className="p-4 text-left font-semibold">ID</th>
                                    <th className="p-4 text-left font-semibold">Asset Description</th>
                                    <th className="p-4 text-left font-semibold">TAG</th>
                                    <th className="p-4 text-left font-semibold">Category</th>
                                    <th className="p-4 text-left font-semibold">Sub Class Desc</th>
                                    <th className="p-4 text-left font-semibold">Sub Class Code</th>
                                    <th className="p-4 text-left font-semibold">Technical Specification</th>
                                    <th className="p-4 text-left font-semibold">Drawing Reference</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {paginatedEquipment.map((item) => (
                                    <tr key={item.id} className="hover:bg-violet-50">
                                        <td className="p-4 font-medium">{item.id}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{item.asset_description}</div>
                                        </td>
                                        <td className="p-4 text-gray-600">{item.asset_tag}</td>
                                        <td className="p-4 text-gray-600">{item.equipment_class_category}</td>
                                        <td className="p-4 text-gray-600">{item.sub_equipment_class_desc}</td>
                                        <td className="p-4 text-gray-600">{item.sub_equipment_class_code}</td>
                                        <td className="p-4 text-gray-600">{item.tech_specification}</td>
                                        <td className="p-4 text-gray-600">{item.drawing_reference}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t">
                            <div className="text-sm text-gray-700">
                                Page {currentPage} of {totalPages}
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

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-bold mb-4">Upload Equipment CSV</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Upload a CSV file with these columns:
                                <br />
                                <strong>asset_description, sub_equipment_class_desc, tech_specification, drawing_reference</strong>
                            </p>

                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => setCsvFile(e.target.files[0])}
                                className="w-full p-2 border rounded mb-4"
                            />

                            {csvFile && (
                                <p className="text-sm text-gray-600 mb-4">Selected: {csvFile.name}</p>
                            )}

                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowUploadModal(false)}
                                    disabled={uploading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUploadCSV}
                                    disabled={!csvFile || uploading}
                                    className="bg-violet-600 hover:bg-violet-700"
                                >
                                    {uploading ? 'Uploading...' : 'Upload CSV'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default DynamicProjectEquipmentList;