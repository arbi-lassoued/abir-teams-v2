import React, { useEffect, useState } from 'react';
// import EquipmentListHistorian from "../../pages/equipment_historian/EquipmentListHistorian";

const IHSparesDetailsSidebar = ({ equipment, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        if (isOpen) {
            setActiveTab('details');
        }
    }, [isOpen]);

    if (!isOpen || !equipment) return null;

    const DetailItem = ({ label, value }) => (
        <div className="mb-4">
            <h3 className="font-semibold text-gray-700 text-sm">{label}</h3>
            <p className="text-gray-900 mt-1">{value || '-'}</p>
        </div>
    );
    //   const formatDate = (dateString) => {
    //     if (!dateString) return '-';
    //     return new Date(dateString).toLocaleDateString('en-US', {
    //         year: 'numeric',
    //         month: 'long',
    //         day: 'numeric'
    //     });
    // };

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
                <div>
                    {/* <h2 className="text-xl font-bold text-gray-900">{equipment.ih_eq_id}</h2> */}
                    <p className="text-lg font-bold text-gray-900">{equipment.equipment_description}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                    ×
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b">
                <div className="flex">
                    <button
                        className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'details'
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('details')}
                    >
                        Asset Details
                    </button>
                    {/* <button
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button> */}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'details' && (
                    <div className="p-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Basic Information</h3>
                                <div className="grid gap-4">
                                    <DetailItem label="Asset ID" value={equipment.ih_eq_id} />
                                    <DetailItem label="Asset Description" value={equipment.equipment_description} />
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Technical Details</h3>
                                <div className="grid gap-4">
                                    <DetailItem label="Equipment Class Category" value={equipment.equipment_class_category} />
                                    <DetailItem label="Sub Equipment Class Description" value={equipment.sub_equipment_class_desc} />
                                    <DetailItem label="Sub Equipment Class Code" value={equipment.sub_equipment_class_code} />
                                    <DetailItem label="Life Cycle" value={equipment.equipment_life_cycle ? ` ${equipment.equipment_life_cycle} Years` : '-'} />
                                    {/* <DetailItem label="End of Life" value={formatDate(equipment.end_life_cycle_date)} /> */}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Maintenance Details</h3>
                                <div className="grid gap-4">
                                    <DetailItem label="GOSP" value={equipment.gosp} />
                                    <DetailItem label="Maintenance Type" value={equipment.maint_type} />
                                    <DetailItem label="Maintenance Program Code" value={equipment.maint_prog_code} />
                                    <DetailItem label="Number of Maintenance Task(s)" value={equipment.nbre_maint_task} />

                                    {/* <DetailItem label="End of Life" value={formatDate(equipment.end_life_cycle_date)} /> */}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Performance</h3>
                                <div className="grid gap-4">
                                    <DetailItem label="MTBF" value={equipment.mtbf} />
                                    <DetailItem label="MTTF" value={equipment.mttf} />
                                    <DetailItem label="MTTR" value={equipment.mttr} />
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Cost</h3>
                                <div className="grid gap-4">
                                    <DetailItem label="Cost Of Small Asset" value={equipment.cost_sm_eq} />
                                    <DetailItem label="Cost Of Medium Asset" value={equipment.cost_med_eq} />
                                    <DetailItem label="Cost Of Large Asset" value={equipment.cost_lg_eq} />

                                </div>
                            </div>
                        </div>
                        <h3 className="font-semibold text-white bg-violet-400 rounded-lg mb-4 text-lg">Other</h3>
                        <div className="grid gap-4">
                            <DetailItem label="Remarks" value={equipment.remark} />
                        </div>
                    </div>
                )}

                {/* {activeTab === 'history' && (
          <div className="p-6">
            <EquipmentListHistorian
              equipmentId={equipment.eq_id}
              refreshTrigger={refreshTrigger}
            /> 
          </div>
        )} */}
            </div>
        </div>
    );
};

export default IHSparesDetailsSidebar;