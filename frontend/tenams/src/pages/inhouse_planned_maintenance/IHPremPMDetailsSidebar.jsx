import React from 'react';

const IHPremPMDetailsSidebar = ({ pm, isOpen, onClose }) => {
    if (!isOpen || !pm) return null;

    const DetailItem = ({ label, value }) => (
        <div className="mb-4">
            <h3 className="font-semibold text-gray-700 text-sm">{label}</h3>
            <p className="text-gray-900 mt-1">{value || '-'}</p>
        </div>
    );

    // const formatDate = (dateString) => {
    //     if (!dateString) return '-';
    //     return new Date(dateString).toLocaleDateString('en-US', {
    //         year: 'numeric',
    //         month: 'long',
    //         day: 'numeric'
    //     });
    // };

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

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b"> 
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Maintenance Details</h2>
                    <p className="text-gray-600 text-sm">#{pm.ih_prem_pm_id}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                    ×
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Asset Information</h3>
                        <div className="grid gap-4">
                            <DetailItem label="Asset ID" value={pm.eq_num} />
                            <DetailItem label="Asset Class Cetogory" value={pm.equipment_class_category} />
                            <DetailItem label="Asset Sub Class Code" value={pm.sub_equipment_class_code} />
                            <DetailItem label="Asset Sub Class Description" value={pm.sub_equipment_class_desc} />
                            <DetailItem label="Asset Type" value={pm.eq_type} />
                            <DetailItem label="Asset Type" value={pm.eq_type} />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Activity Information</h3>
                        <div className="grid gap-4">
                            <DetailItem label="Task Description" value={pm.maint_description} />
                            <DetailItem label="Maintenance Type" value={pm.maint_type} />
                            <DetailItem label="Task Code" value={pm.maint_prog_code} />
                            <DetailItem label="Methodology" value={pm.detection} />
                            <DetailItem label="Size Impact" value={pm.size_impact} />
                            <DetailItem label="Frequency" value={pm.frequency ? `${pm.frequency } Day(s)`  : '-'} />
                            <DetailItem label="Yearly Frequency" value={pm.task_occurrence_per_year ? `${pm.task_occurrence_per_year} Time(s) `  : '-'} />

                        </div>
                    </div>
                    {/* Ressources Information */}
                    <div>
                        <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Ressources</h3>
                        <div className="grid gap-4">
                            <DetailItem label="Task Duration for Small Size" value={pm.active_time_sm_eq ? `${pm.active_time_sm_eq} Houre(s)` : '-'} />
                            <DetailItem label="Task Duration for Medium Size" value={pm.active_time_med_eq ? `${pm.active_time_med_eq} Houre(s)` : '-'} />
                            <DetailItem label="Task Duration for Large Size" value={pm.active_time_lg_eq ? ` ${pm.active_time_lg_eq} Houre(s)` : '-'} />
                            <DetailItem label="Manpower for Small Size" value={pm.manpower_sm_eq ? `${pm.manpower_sm_eq} Worker(s)` : '-'} />
                            <DetailItem label="Manpower for Medium Size" value={pm.manpower_med_eq ? `${pm.manpower_med_eq} Worker(s) ` : '-'} />
                            <DetailItem label="Manpower for Large Size" value={pm.manpower_lg_eq ? `${pm.manpower_lg_eq} Worker(s)` : '-'} />
                            <DetailItem label="Task Worload for Small Size" value={pm.workload_per_sm_eq_task ? `${pm.workload_per_sm_eq_task} Houre(s)` : '-'} />
                            <DetailItem label="Task Worload for Medium Size" value={pm.workload_per_med_eq_task ? `${pm.workload_per_med_eq_task} Houre(s)` : '-'} />
                            <DetailItem label="Task Worload for Large Size" value={pm.workload_per_lg_eq_task ? `${pm.workload_per_lg_eq_task} Houre(s)` : '-'} />
                            <DetailItem label="Annual Workload for Small Size" value={pm.annual_workload_sm_eq ? `${pm.annual_workload_sm_eq} Houre(s)` : '-'} />
                            <DetailItem label="Annual Workload for Medium Size" value={pm.annual_workload_med_eq ? `${pm.annual_workload_med_eq} Houre(s)` : '-'} />
                            <DetailItem label="Annual Workload for Large Size" value={pm.annual_workload_lg_eq ? `${pm.annual_workload_lg_eq} Houre(s)` : '-'} />

                        </div>
                    </div>

                    {/* Status & Type */}
                    <div>
                        <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Status & State</h3>
                        <div className="grid gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-700 text-sm">Asset Status</h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(pm.eq_status)}`}>
                                    {pm.eq_status}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700 text-sm">Plant Status</h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(pm.plant_status)}`}>
                                    {pm.plant_status}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700 text-sm">Task Status</h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateBadgeColor(pm.maint_state)}`}>
                                    {pm.maint_state}
                                </span>
                            </div>

                            <DetailItem label="Scope" value={pm.scope} />
                            <DetailItem label="Procedure" value={pm.procedure} />
                        </div>
                    </div>

                    {/* Cost & Additional Info */}
                    <div>
                        <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Cost Information</h3>
                        <div className="grid gap-4">
                            <DetailItem label="Activity Cost for Small asset" value={pm.cost_per_sm_eq ? `$${pm.cost_per_sm_eq}` : '-'} />
                            <DetailItem label="Activity Cost for Medium asset" value={pm.cost_per_med_eq ? `$${pm.cost_per_med_eq}` : '-'} />
                            <DetailItem label="Activity Cost for large asset" value={pm.cost_per_lg_eq ? `$${pm.cost_per_lg_eq}` : '-'} />

                            {/* <DetailItem label="Notes" value={pm.notes} /> */}
                        </div>
                    </div>
                    {/* Additional Information */}
                    <div>
                        <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Additional Information</h3>
                        <div className="grid gap-4">
                            <DetailItem label="Sce" value={pm.sce} />
                            <DetailItem label="Robots Compatibility" value={pm.robots_compatibility} />
                            <DetailItem label="Manipulation Required" value={pm.manip_required} />
                            <DetailItem label="Remarks" value={pm.remarks} />
                            {/* <DetailItem label="Service Start Date" value={pm.sce} /> */}
                            {/* <DetailItem label="Forecast Duration" value={pm.forcast_duration ? `Houre(s) : ${pm.forcast_duration}` : '-'} />
                            <DetailItem label="Frequency" value={pm.frequency ? `Day(s) : ${pm.frequency}` : '-'} /> */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4">
                <button
                    onClick={onClose}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default IHPremPMDetailsSidebar;