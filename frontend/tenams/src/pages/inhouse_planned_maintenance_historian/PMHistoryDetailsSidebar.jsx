import React from 'react';

const PMHistoryDetailsSidebar = ({ hist_pm, isOpen, onClose }) => {
    if (!isOpen || !hist_pm) return null;

    const DetailItem = ({ label, value }) => (
        <div className="mb-4">
            <h3 className="font-semibold text-gray-700 text-sm">{label}</h3>
            <p className="text-gray-900 mt-1">{value || '-'}</p>
        </div>
    );

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Enable': return 'bg-green-100 text-green-800';
            case 'Disable': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Maintenance History</h2>
                    <p className="text-gray-600 text-sm">#{hist_pm.hist_maint_id}</p>
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
                        <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Basic Information</h3>
                        <div className="grid gap-4">
                            <DetailItem label="History ID" value={hist_pm.hist_maint_id} />
                            <DetailItem label="KKS Code" value={hist_pm.kks} />
                            <DetailItem label="Asset Description" value={hist_pm.asset_description} />
                            <DetailItem label="Activity Description" value={hist_pm.activity_description} />
                        </div>
                    </div>

                    {/* Status Information */}
                    <div>
                        <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Status Change</h3>
                        <div className="grid gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-700 text-sm">Status</h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(hist_pm.status)}`}>
                                    {hist_pm.status}
                                </span>
                            </div>
                            <DetailItem label="Status Change Date" value={formatDate(hist_pm.status_change_date)} />
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div>
                        <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Additional Details</h3>
                        <div className="grid gap-4">
                            {/* <DetailItem label="Maintenance ID" value={hist_pm.maint_id} />  */}
                            <DetailItem label="Recorded By" value={hist_pm.recorder} />
                            <DetailItem label="System Notes" value={hist_pm.notes} />
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

export default PMHistoryDetailsSidebar;