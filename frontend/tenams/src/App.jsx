import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/user/Login';
import SignUp from './pages/user/SignUp';
import IHDashboard from './components/IHDashboard';
import ProjectDashboard from './components/ProjectDashboard';
import ProtectedRoute from './components/ProtectedRoute';

{/* ================================================================================== */ }
import UserList from './pages/user/UserList';
import AddUser from './pages/user/AddUser';
import EditUser from './pages/user/EditUser';
{/* ================================================================================== */ }

import IHPremPMList from './pages/inhouse_planned_maintenance/IHPremPMList'; 
// import EditPM from './pages/planned_maintenance/basis_planned_maintenance/EditPM';
// import AddPM from './pages/planned_maintenance/basis_planned_maintenance/AddPM';
{/* ================================================================================== */ }
import IHEquipmentList from './pages/inhouse_equipment/IHEquipmentList';

// import HistoryPMList from './pages/planned_maintenance_historian/basis_planned_maintenance_historian/HistoryPMList';

{/* ================================================================================== */ }
import IHSparesList from './pages/spare_parts/IHSparesList';

{/* ================================================================================== */ }
import ProjectsManagement from './pages/projects/ProjectsManagement';
import DeleteProjectList from './pages/projects/DeleteProjectList';
import DynamicProjectEquipmentList from './pages/projects/DynamicProjectEquipmentList';

import DynamicProjectSparesList from './pages/projects/DynamicProjectSparesList';
import DynamicProjectMaintenancePlan from './pages/projects/DynamicProjectMaintenancePlan';
import DynamicProjectMaintenanceStatistics from './pages/projects/DynamicProjectMaintenanceStatistics';



function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected routes - In House Data (Admin only) */}
        <Route element={<ProtectedRoute requiredRole="Administrator"><IHDashboard /></ProtectedRoute>}>
          {/* ================================================================================== */}
          {/* Service Selection Page */}

          <Route path="/user/list" element={<UserList />} />
          <Route path="user/add" element={<AddUser />} />
          <Route path="user/edit/:username" element={<EditUser />} />
          {/* ================================================================================== */}
          <Route path="/ih_equipment_list" element={<IHEquipmentList />} />
          {/* <Route path="/equipment/edit/:id" element={<EditEquipment />} />
          <Route path="/equipment/add" element={<AddEquipment />} />
          <Route path="/equipmentCriticality" element={<EquipmentCriticality />} /> */}
          {/* ================================================================================== */}
          <Route path="/ih_spares_list" element={<IHSparesList />} />
          {/* ================================================================================== */}
          <Route path="/ih_prem_pm_list" element={<IHPremPMList />} />
          {/* <Route path="/activity/edit/:id" element={<EditPM />} />
          <Route path="/activity/add" element={<AddPM />} />
          <Route path="/activityHistorian" element={<HistoryPMList />} /> */}
          {/* ================================================================================== */}
        </Route>

        {/* Protected routes - Project Dashboard (Separate Layout) */}
        <Route element={<ProtectedRoute><ProjectDashboard /></ProtectedRoute>}>
          <Route path="/project/:projectId/equipment" element={<DynamicProjectEquipmentList />} />
          <Route path="/project/:projectId/spares" element={<DynamicProjectSparesList />} />
          <Route path="/project/:projectId/activities" element={<DynamicProjectMaintenancePlan />} />
          <Route path="/project/:projectId/statistics" element={<DynamicProjectMaintenanceStatistics />} />
          <Route path="/project_management" element={<ProjectsManagement />} />
          <Route path="/delete_project" element={<DeleteProjectList />} />

          {/* ================================================================================== */}
          {/* <Route path="/dup_pm" element={<DuplicatePMList />} />
          <Route path="/dup_pm_reported" element={<DuplicatePMReported />} />
          <Route path="/dup_pm/pm_execution_report/${dup_pm}" element={<ExecutionReportDupPM />} /> */}
          {/* ================================================================================== */}
          {/* <Route path="/srs" element={<ServiceRequestList />} />
          <Route path="/srs/edit/:id" element={<EditServiceRequest />} />
          <Route path="/sr/add" element={<AddServiceRequest />} /> */}
          {/* ================================================================================== */}
          {/* <Route path="/srhistory" element={<HistoryServiceRequest />} /> */}
          {/* ================================================================================== */}
          {/* <Route path="/woc" element={<WorkOrderCreatedList />} /> */}
          {/* <Route path="/woc/edit/:id" element={<EditWorkOredr />} /> */}
          {/* <Route path="/woc/add" element={<CreateWorkOrderFromSr />} /> */}
          {/* ================================================================================== */}
          {/* <Route path="/wop" element={<WorkOrderPlannedList />} /> */}
          {/* <Route path="/woc/edit/:id" element={<EditWorkOredr />} /> */}
          {/* <Route path="/woc/add" element={<AddWorkOrder />} /> */}
          {/* ================================================================================== */}
          {/* <Route path="/wos" element={<WorkOrderScheduledList />} /> */}
          {/* <Route path="/woc/edit/:id" element={<EditWorkOredr />} /> */}
          {/* <Route path="/woc/add" element={<AddWorkOrder />} /> */}
          {/* ================================================================================== */}
          {/* <Route path="/woe" element={<WorkOrderExecutedList />} /> */}
          {/* <Route path="/woc/edit/:id" element={<EditWorkOredr />} /> */}
          {/* <Route path="/woc/add" element={<AddWorkOrder />} /> */}
          {/* ================================================================================== */}
          {/* <Route path="/wocom" element={<WorkOrderCompletedList />} /> */}
          {/* <Route path="/woc/edit/:id" element={<EditWorkOredr />} /> */}
          {/* <Route path="/woc/add" element={<AddWorkOrder />} /> */}
          {/* ================================================================================== */}
          {/* <Route path="/woar" element={<WorkOrderArchivedList />} /> */}
          {/* <Route path="/woc/edit/:id" element={<EditWorkOredr />} /> */}
          {/* <Route path="/woc/add" element={<AddWorkOrder />} /> */}
          {/* ================================================================================== */}
          {/* <Route path="/woh" element={<WorkOrderHistorianList />} /> */}
          {/* <Route path="/woc/edit/:id" element={<EditWorkOredr />} /> */}
          {/* <Route path="/woc/add" element={<AddWorkOrder />} /> */}
          {/* ================================================================================== */}
          {/* <Route path="/woKPI" element={<WorkOrderKPI />} />
          <Route path="/srKPI" element={<SerciceRequestKPI />} />
          <Route path="/PDMKPI" element={<PDMKPI />} />
          <Route path="/EquipmentKPI" element={<EquipmentKPI />} /> */}
          {/* ================================================================================== */}

          {/* <Route path="/sp" element={<SparePartsList />} /> */}

          {/* ================================================================================== */}

        </Route>
      </Routes>
    </Router>
  );
}

export default App;