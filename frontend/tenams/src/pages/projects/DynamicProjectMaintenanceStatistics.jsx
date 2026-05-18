// pages/projects/DynamicProjectMaintenanceStatistics.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import getProjectMaintenanceStatisticsAPI from "../../api/projects/getProjectMaintenanceStatisticsAPI";
import { FiFolder, FiFilter, FiX, FiBarChart2 } from 'react-icons/fi';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";

const ITEMS_PER_PAGE = 10;

const DynamicProjectMaintenanceStatistics = () => {
    const { projectId } = useParams();
    const [statistics, setStatistics] = useState([]);
    const [summary, setSummary] = useState(null);
    const [project, setProject] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        scope: ''
    });

    // Load project and statistics data
    const loadProjectData = React.useCallback(async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            const statisticsData = await getProjectMaintenanceStatisticsAPI(projectId);
            setStatistics(statisticsData.statistics || []);
            setSummary(statisticsData.summary || {});

            setProject({
                id: projectId,
                name: `Project ${projectId}`,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            setError(`Failed to load maintenance statistics: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        loadProjectData();
    }, [loadProjectData]);

    // Filter statistics
    const filteredStatistics = useMemo(() => {
        return statistics.filter(item => {
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch =
                String(item.scope || '').toLowerCase().includes(searchTermLower) ||
                String(item.unique_sub_equipment_codes?.join(', ') || '').toLowerCase().includes(searchTermLower) ||
                String(item.unique_equipment_types?.join(', ') || '').toLowerCase().includes(searchTermLower);

            const matchesFilters =
                (!filters.scope || item.scope === filters.scope);

            return matchesSearch && matchesFilters;
        });
    }, [statistics, searchTerm, filters]);

    // Pagination
    const paginatedStatistics = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredStatistics.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredStatistics, currentPage]);

    const totalPages = Math.ceil(filteredStatistics.length / ITEMS_PER_PAGE);

    if (loading) return <div className="flex justify-center items-center h-64">Loading maintenance statistics...</div>;
    if (error) return <div className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Project Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <FiBarChart2 className="text-3xl text-violet-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {project?.name} - Maintenance Statistics
                        </h1>
                        <p className="text-gray-600">Project ID: {projectId}</p>
                    </div>
                </div>
            </div>

            {/* Statistics Summary */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{summary.total_scopes || 0}</div>
                            <div className="text-sm text-blue-800">Total Scopes</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{summary.total_activities || 0}</div>
                            <div className="text-sm text-green-800">Total Activities</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-200">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{summary.total_enabled_maintenance || 0}</div>
                            <div className="text-sm text-purple-800">Enabled Maintenance</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-50 border-orange-200">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{summary.total_annual_workload || 0}</div>
                            <div className="text-sm text-orange-800">Total Annual Workload</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Statistics Summary Card */}
            <Card className="bg-violet-50 border-violet-200">
                <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-violet-800">Maintenance Statistics Summary</h2>
                            <p className="text-violet-600">{statistics.length} scope categories analyzed</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-violet-600">Showing {filteredStatistics.length} filtered scopes</p>
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
                                placeholder="Search by scope, equipment codes, or types..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <Select
                            value={filters.scope}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, scope: e.target.value }));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All Scopes</option>
                            {Array.from(new Set(statistics.map(stat => stat.scope))).map(scope => (
                                <option key={scope} value={scope}>{scope}</option>
                            ))}
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
                                setFilters({ scope: '' });
                                setSearchTerm('');
                            }}
                            size="sm"
                        >
                            <FiX className="mr-1" /> Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#0070EF] text-white">
                                <tr>
                                    <th className="p-4 text-left font-semibold">Scope</th>
                                    <th className="p-4 text-left font-semibold">Equipment Types</th>
                                    <th className="p-4 text-left font-semibold">Sub-Equipment Codes</th>
                                    <th className="p-4 text-left font-semibold">Enabled Activities</th>
                                    <th className="p-4 text-left font-semibold">Annual Workload</th>
                                    <th className="p-4 text-left font-semibold">Total Activities</th>
                                    <th className="p-4 text-left font-semibold">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {paginatedStatistics.map((stat, index) => (
                                    <tr key={index} className="hover:bg-violet-50">
                                        <td className="p-4 font-medium text-gray-900">
                                            {stat.scope}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-900">{stat.equipment_type_count}</div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {stat.unique_equipment_types?.slice(0, 3).join(', ')}
                                                {stat.unique_equipment_types?.length > 3 && '...'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-900">{stat.sub_equipment_code_count}</div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {stat.unique_sub_equipment_codes?.slice(0, 3).join(', ')}
                                                {stat.unique_sub_equipment_codes?.length > 3 && '...'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className={`font-semibold ${stat.enabled_maintenance_count > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                                {stat.enabled_maintenance_count}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-blue-600">{stat.total_annual_workload}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{stat.total_activities}</div>
                                        </td>
                                        <td className="p-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    // You can implement a modal to show detailed information
                                                    console.log('Detailed view for:', stat.scope);
                                                }}
                                            >
                                                View Details
                                            </Button>
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

            {/* Workload Distribution Chart (Optional) */}
            {statistics.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Workload Distribution by Scope</h3>
                        <div className="space-y-2">
                            {statistics.slice(0, 5).map((stat, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">{stat.scope}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-violet-600 h-2 rounded-full" 
                                                style={{ 
                                                    width: `${(stat.total_annual_workload / summary.total_annual_workload) * 100}%` 
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-16 text-right">
                                            {stat.total_annual_workload}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default DynamicProjectMaintenanceStatistics;