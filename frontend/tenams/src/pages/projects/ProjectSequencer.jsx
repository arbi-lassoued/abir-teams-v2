// components/ProjectSequencer.jsx
import React, { useState, useEffect } from 'react';
import createProjectAPI from "../../api/projects/createProjectAPI";
import uploadProjectEquipmentAPI from "../../api/projects/uploadProjectEquipmentAPI";
import generateTaxonomyAPI from '../../api/projects/generateTaxonomyAPI';
import generateSparesAPI from '../../api/projects/generateSparesAPI';
import generateMaintenancePlanAPI from "../../api/projects/generateMaintenancePlanAPI";
import generateMaintenanceStatisticsAPI from "../../api/projects/generateMaintenanceStatisticsAPI"
import { useOutletContext } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { FaPlay } from 'react-icons/fa';

// ==========================================================================================================================
const INITIAL_STEPS = [
  {
    id: 1,
    name: 'Create Project',
    status: 'pending',
    active: true,
    description: 'Create a new project and generate equipment list page'
  },
  {
    id: 2,
    name: 'Upload Equipment List',
    status: 'pending',
    active: false,
    description: 'Upload CSV with equipment data (4 columns)'
  },
  {
    id: 3,
    name: 'Generate Taxonomy',
    status: 'pending',
    active: false,
    description: 'Set up the equipment class as per the ISO 14224'
  },
  {
    id: 4,
    name: 'Generate Spare Parts',
    status: 'pending',
    active: false,
    description: 'Generate spare parts list as defined in in house database'
  },
  {
    id: 5,
    name: 'Generate a Preliminary Maintenance Plan',
    status: 'pending',
    active: false,
    description: 'Generate a prelimanary maintenance plan as defined in in house database'
  },
  {
    id: 6,
    name: 'Generate Maintenance Statistics',
    status: 'pending',
    active: false,
    description: 'Set up maintenance parameters and technical specs'
  }
];

// ==========================================================================================================================
const ProjectSequencer = () => {
  const { refreshSidebar } = useOutletContext();

  // Load state from localStorage on component mount
  const [steps, setSteps] = useState(() => {
    const saved = localStorage.getItem('projectSequencerState');
    return saved ? JSON.parse(saved) : INITIAL_STEPS;
  });
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('projectSequencerLogs');
    return saved ? JSON.parse(saved) : [];
  });
  const [createdProject, setCreatedProject] = useState(() => {
    const saved = localStorage.getItem('projectSequencerProject');
    return saved ? JSON.parse(saved) : null;
  });

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [maintenanceStatistics, setMaintenanceStatistics] = useState([]);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);

  // ✅ SAVE STATE TO LOCALSTORAGE WHENEVER IT CHANGES
  useEffect(() => {
    localStorage.setItem('projectSequencerState', JSON.stringify(steps));
  }, [steps]);

  useEffect(() => {
    localStorage.setItem('projectSequencerLogs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('projectSequencerProject', JSON.stringify(createdProject));
  }, [createdProject]);

  // Add log entry
  const addLog = (step, status, message) => {
    const logEntry = {
      step,
      status,
      message,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [logEntry, ...prev]);
  };
  // ==========================================================================================================================
  // Update step status
  const updateStepStatus = (stepId, status) => {
    console.log(`🔄 Updating step ${stepId} to status: ${status}`);
    setSteps(prev => prev.map(step =>
      step.id === stepId
        ? { ...step, status, active: status === 'completed' ? false : step.active }
        : step
    ));
  };

  // Activate next step
  const activateNextStep = (currentStepId) => {
    console.log(`🎯 Activating step ${currentStepId + 1} after completing step ${currentStepId}`);
    setSteps(prev => prev.map(step =>
      step.id === currentStepId + 1
        ? { ...step, active: true }
        : step
    ));
  };
  // ==========================================================================================================================
  // ✅ RESET FUNCTION - Clear all progress
  const resetSequencer = () => {
    if (window.confirm('Are you sure you want to reset the sequencer? All progress will be lost.')) {
      setSteps(INITIAL_STEPS);
      setLogs([]);
      setCreatedProject(null);
      setProjectName('');
      setCsvFile(null);

      // Clear localStorage
      localStorage.removeItem('projectSequencerState');
      localStorage.removeItem('projectSequencerLogs');
      localStorage.removeItem('projectSequencerProject');

      addLog('System', 'info', 'Sequencer reset to initial state');
      console.log('🔄 Sequencer reset complete');
    }
  };
  // ==========================================================================================================================
  // ✅ CHECK IF SEQUENCER IS COMPLETED
  const isSequencerCompleted = steps.every(step => step.status === 'completed');
  // ==========================================================================================================================
  // Step 1: Create Project
  const handleCreateProject = async () => {
    if (!projectName.trim()) return;

    setCreating(true);
    addLog('Create Project', 'in_progress', `Creating project: ${projectName}`);

    try {
      const requestData = {
        project_name: projectName
      };

      console.log('📤 Sending project creation request:', requestData);
      const response = await createProjectAPI(requestData);
      console.log('✅ Project creation successful:', response);

      // Update state with the response
      setCreatedProject(response);

      // Update steps - Step 1 completed, activate Step 2
      updateStepStatus(1, 'completed');
      activateNextStep(1);

      // Refresh sidebar to show new project
      refreshSidebar();

      addLog('Create Project', 'success',
        `Project "${response.project_name}" created successfully.`
      );

      setShowProjectModal(false);
      setProjectName('');

    } catch (error) {
      console.log('❌ Project creation failed:', error);
      const errorMessage = error.response?.data?.detail || error.message;
      updateStepStatus(1, 'error');
      addLog('Create Project', 'error', `Failed: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };
  // ==========================================================================================================================
  // Step 2: Upload Equipment CSV
  const handleUploadCSV = async () => {
    if (!csvFile || !createdProject) return;

    setUploading(true);
    addLog('Upload Equipment List', 'in_progress', `Uploading CSV for ${createdProject.project_name}`);

    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('project_id', createdProject.project_id); // ✅ Correct field name

      console.log('📤 Uploading CSV for project:', createdProject.project_id);

      const response = await uploadProjectEquipmentAPI(formData);

      console.log('✅ CSV upload successful:', response);

      if (response.success) {
        updateStepStatus(2, 'completed');
        activateNextStep(2);
        addLog('Upload Equipment List', 'success',
          `Successfully uploaded ${response.imported} equipment items`
        );
        setCsvFile(null);
      }
    } catch (error) {
      console.log('❌ CSV upload failed:', error);
      updateStepStatus(2, 'error');
      addLog('Upload Equipment List', 'error', `Upload failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setUploading(false);
    }
  };
  // ==========================================================================================================================
  // Step 3: Generate Taxonomy
  const generateTaxonomyProject = async () => {
    if (!createdProject) {
      addLog('Generate Taxonomy', 'error', 'No project selected');
      return;
    }

    addLog('Generate Taxonomy', 'in_progress', `Generating taxonomy for project: ${createdProject.project_name}`);

    try {
      console.log('📤 Activating taxonomy for project:', createdProject.project_id);
      const response = await generateTaxonomyAPI(createdProject.project_id);
      console.log('✅ Taxonomy activation successful:', response);

      if (response.success) {
        updateStepStatus(3, 'completed');
        activateNextStep(3);

        let logMessage = `Taxonomy generated: ${response.updated_count} items updated out of ${response.total_equipment}`;
        if (response.unmatched_codes && response.unmatched_codes.length > 0) {
          logMessage += `. Unmatched codes: ${response.unmatched_codes.join(', ')}`;
        }

        addLog('Generate Taxonomy', 'success', logMessage);
      }
    } catch (error) {
      console.log('❌ Taxonomy generation failed:', error);
      updateStepStatus(3, 'error');
      const errorMessage = error.response?.data?.detail || error.message;
      addLog('Generate Taxonomy', 'error', `Failed: ${errorMessage}`);
    }
  };
  // ==========================================================================================================================
  // Step 4: Generate Spare Parts
  const generateProjectSpares = async () => {
    if (!createdProject) {
      addLog('Generate Spares', 'error', 'No project selected');
      return;
    }

    addLog('Generate Spares', 'in_progress', `Generating spares for project: ${createdProject.project_name}`);

    try {
      console.log('📤 Generating spares for project:', createdProject.project_id);
      const response = await generateSparesAPI(createdProject.project_id);
      console.log('✅ Spares generation successful:', response);

      if (response.success) {
        updateStepStatus(4, 'completed');
        activateNextStep(4);

        let logMessage = `Spare Parts generated: ${response.generated_count} items from ${response.total_equipment} equipment`;
        if (response.equipment_without_spares && response.equipment_without_spares.length > 0) {
          logMessage += `. Equipment without spares: ${response.equipment_without_spares.join(', ')}`;
        }

        addLog('Generate Spares', 'success', logMessage);
      }
    } catch (error) {
      console.log('❌ Spares generation failed:', error);
      updateStepStatus(4, 'error');
      const errorMessage = error.response?.data?.detail || error.message;
      addLog('Generate Spares', 'error', `Failed: ${errorMessage}`);
    }
  };
  // ==========================================================================================================================
  // Step 5: Generate Maintenance Plan
  const generateMaintenancePlan = async () => {
    if (!createdProject) {
      addLog('Generate Maintenance Plan', 'error', 'No project selected');
      return;
    }

    addLog('Generate Maintenance Plan', 'in_progress', `Generating maintenance plan for project: ${createdProject.project_name}`);

    try {
      console.log('📤 Generating maintenance plan for project:', createdProject.project_id);
      const response = await generateMaintenancePlanAPI(createdProject.project_id);
      console.log('✅ Maintenance plan generation successful:', response);

      if (response.success) {
        updateStepStatus(5, 'completed');
        activateNextStep(5);

        let logMessage = `Maintenance Plan generated: ${response.generated_count} activities from ${response.total_equipment} equipment`;
        if (response.equipment_without_plan && response.equipment_without_plan.length > 0) {
          logMessage += `. Equipment without plan: ${response.equipment_without_plan.join(', ')}`;
        }

        addLog('Generate Maintenance Plan', 'success', logMessage);
      }
    } catch (error) {
      console.log('❌ Maintenance plan generation failed:', error);
      updateStepStatus(5, 'error');
      const errorMessage = error.response?.data?.detail || error.message;
      addLog('Generate Maintenance Plan', 'error', `Failed: ${errorMessage}`);
    }
  };
  // ==========================================================================================================================
  // Step 6: Generate Maintenance Statistics
  const generateMaintenanceStatistics = async () => {
    if (!createdProject) {
      addLog('Generate Maintenance Statistics', 'error', 'No project selected');
      return;
    }

    addLog('Generate Maintenance Statistics', 'in_progress', `Generating maintenance statistics for project: ${createdProject.project_name}`);

    try {
      console.log('📤 Generating maintenance statistics for project:', createdProject.project_id);
      const response = await generateMaintenanceStatisticsAPI(createdProject.project_id);
      console.log('✅ Maintenance statistics generation successful:', response);

      if (response.success) {
        updateStepStatus(6, 'completed');
        setMaintenanceStatistics(response.statistics); // Store for display
        const { summary, statistics } = response;
        let logMessage = `Maintenance Statistics: ${summary.total_scopes} scopes, ${summary.total_activities} activities, Total workload: ${summary.total_annual_workload}`;

        // Add top 3 scopes by workload
        if (statistics.length > 0) {
          const topScopes = statistics.slice(0, 3).map(stat =>
            `${stat.scope} (${stat.total_annual_workload})`
          ).join(', ');
          logMessage += `. Top scopes: ${topScopes}`;
        }

        addLog('Generate Maintenance Statistics', 'success', logMessage);

        // You can also store the statistics in state to display in a table
        // setMaintenanceStatistics(response.statistics);
      }
    } catch (error) {
      console.log('❌ Maintenance statistics generation failed:', error);
      updateStepStatus(6, 'error');
      const errorMessage = error.response?.data?.detail || error.message;
      addLog('Generate Maintenance Statistics', 'error', `Failed: ${errorMessage}`);
    }
  };

  // ==========================================================================================================================
  const getStepColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'active': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'error': return '❌';
      case 'in_progress': return '⏳';
      case 'active': return '🔵';
      default: return '⚪';
    }
  };
  // ==========================================================================================================================
  return (
    <div className="w-full max-w-screen mx-auto p-6 space-y-6">
      {/* Grafcet Visualization */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">

            <h2 className="text-2xl font-bold mb-6 text-gray-800">Project Setup Sequencer</h2>
            <p className="text-gray-600">
              Progress: {steps.filter(step => step.status === 'completed').length} of {steps.length} steps completed
              {createdProject && ` • Project: ${createdProject.project_name}`}
            </p>

            <Button
              onClick={resetSequencer}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              🔄 Reset Sequencer
            </Button>
          </div>
          {/* Completion Banner */}
          {isSequencerCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🎉</span>
                  <div>
                    <h3 className="font-semibold text-green-800">Sequencer Completed!</h3>
                    <p className="text-green-600">All steps have been successfully completed.</p>
                  </div>
                </div>
                <Button
                  onClick={resetSequencer}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Start New Project
                </Button>
              </div>
            </div>
          )}
          {/* Steps Visualization */}
          <div className="flex justify-between items-start mb-8 relative">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1 relative">
                {/* Connection Line */}
                {index > 0 && (
                  <div className={`absolute h-1 w-1/2 top-6 left-0 -translate-x-1/2 -z-10 ${steps[index - 1].status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                )}

                {/* Step Circle */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getStepColor(step.status)} mb-3 shadow-lg`}>
                  {getStatusIcon(step.status)}
                </div>

                {/* Step Name */}
                <span className={`text-lg font-semibold text-center ${step.active ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                  {step.name}
                </span>

                {/* Step Description */}
                <span className="text-sm text-gray-500 text-center mt-1">
                  {step.description}
                </span>

                {/* Step Actions */}
                <div className="mt-3">
                  {step.id === 1 && step.active && (
                    <Button
                      onClick={() => setShowProjectModal(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Start Project
                    </Button>
                  )}

                  {step.id === 2 && step.active && (
                    <div className="flex flex-col gap-2 items-center">
                      <p className="text-sm text-green-600 font-medium">Step 2 Active - Upload your CSV file</p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          console.log('📁 File selected:', file);
                          setCsvFile(file);
                        }}
                        className="text-sm border border-gray-300 p-2 rounded w-full max-w-xs"
                      />
                      {csvFile && (
                        <div className="text-center">
                          <p className="text-sm text-blue-600 mb-2">
                            Selected: <strong>{csvFile.name}</strong> 
                          </p>
                          <Button
                            onClick={handleUploadCSV}
                            disabled={uploading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {uploading ? 'Uploading...' : 'Upload CSV'}
                          </Button>
                        </div>
                      )}
                      {!csvFile && (
                        <p className="text-sm text-gray-500 text-center">
                          Please select a CSV file with equipment data
                        </p>
                      )}
                    </div>
                  )}

                  {/* Show message for completed steps */}
                  {step.status === 'completed' && (
                    <p className="text-sm text-green-600 font-medium text-center">
                      ✓ Completed
                    </p>
                  )}
                  {step.id === 3 && step.active && (
                    <div className="flex flex-col gap-2 items-center">
                      <p className="text-sm text-green-600 font-medium">Step 3 Active - Generate Equipment Taxonomy</p>
                      <Button
                        onClick={generateTaxonomyProject}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <FaPlay />
                        Generate Taxonomy
                      </Button>
                      <p className="text-sm text-gray-500 text-center">
                        This will classify equipment based on ISO 14224 standards
                      </p>
                    </div>
                  )}
                  {step.id === 4 && step.active && (
                    <div className="flex flex-col gap-2 items-center">
                      <p className="text-sm text-green-600 font-medium">Step 4 Active - Generate Spare Parts</p>
                      <Button
                        onClick={generateProjectSpares}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <FaPlay />
                        Generate Spares
                      </Button>
                      <p className="text-sm text-gray-500 text-center">
                        This will generate the prelimanary spare parts for the ptoject
                      </p>
                    </div>
                  )}
                  {step.id === 5 && step.active && (
                    <div className="flex flex-col gap-2 items-center">
                      <p className="text-sm text-green-600 font-medium">Step 5 Active - Generate Maintenance Plan</p>
                      <Button
                        onClick={generateMaintenancePlan}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <FaPlay />
                        Generate Maintenance Plan
                      </Button>
                      <p className="text-sm text-gray-500 text-center">
                        This will generate the preliminary maintenance plan for the project
                      </p>
                    </div>
                  )}
                  {step.id === 6 && step.active && (
                    <div className="flex flex-col gap-2 items-center">
                      <p className="text-sm text-green-600 font-medium">Step 6 Active - Generate Maintenance Statistics</p>
                      <Button
                        onClick={generateMaintenanceStatistics}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <FaPlay />
                        Generate Statistics
                      </Button>
                      <p className="text-sm text-gray-500 text-center">
                        This will analyze maintenance parameters and generate statistics
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Current Project Info */}
          {createdProject && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Active Project</h3>
              <p><strong>Name:</strong> {createdProject.project_name}</p>
              <p><strong>ID:</strong> {createdProject.project_id}</p>
              <p><strong>Created:</strong> {new Date(createdProject.created_at).toLocaleString()}</p>
              <p><strong>Status:</strong> {createdProject.project_status}</p>
            </div>
          )}

          {/* Debug Info - Remove in production */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
            {/* <h4 className="font-semibold text-gray-800 mb-2">Current Status:</h4> */}
            <div className="grid grid-cols-6 gap-2 pl-12 text-sm">
              <div>Step 1 Active: <span className={steps[0]?.active ? 'text-green-600 font-bold' : 'text-gray-600'}>{steps[0]?.active ? 'YES' : 'NO'}</span></div>
              <div>Step 2 Active: <span className={steps[1]?.active ? 'text-green-600 font-bold' : 'text-gray-600'}>{steps[1]?.active ? 'YES' : 'NO'}</span></div>
              <div>Step 3 Active: <span className={steps[2]?.active ? 'text-green-600 font-bold' : 'text-gray-600'}>{steps[2]?.active ? 'YES' : 'NO'}</span></div>
              <div>Step 4 Active: <span className={steps[3]?.active ? 'text-green-600 font-bold' : 'text-gray-600'}>{steps[3]?.active ? 'YES' : 'NO'}</span></div>
              <div>Step 5 Active: <span className={steps[4]?.active ? 'text-green-600 font-bold' : 'text-gray-600'}>{steps[4]?.active ? 'YES' : 'NO'}</span></div>
              <div>Step 6 Active: <span className={steps[5]?.active ? 'text-green-600 font-bold' : 'text-gray-600'}>{steps[5]?.active ? 'YES' : 'NO'}</span></div>

              <div>Step 1 Status: <span className="font-medium">{steps[0]?.status}</span></div>
              <div>Step 2 Status: <span className="font-medium">{steps[1]?.status}</span></div>
              <div>Step 3 Status: <span className="font-medium">{steps[2]?.status}</span></div>
              <div>Step 4 Status: <span className="font-medium">{steps[3]?.status}</span></div>
              <div>Step 5 Status: <span className="font-medium">{steps[4]?.status}</span></div>
              <div>Step 6 Status: <span className="font-medium">{steps[5]?.status}</span></div>

              <div className="col-span-2">Project Created: <span className={createdProject ? 'text-green-600 font-bold' : 'text-gray-600'}>{createdProject ? createdProject.project_name : 'None'}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Process Logs */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Process Logs</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No logs yet</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${log.status === 'success' ? 'border-green-500 bg-green-50' :
                  log.status === 'error' ? 'border-red-500 bg-red-50' :
                    'border-yellow-500 bg-yellow-50'
                  }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{log.step}</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${log.status === 'success' ? 'bg-green-200 text-green-800' :
                        log.status === 'error' ? 'bg-red-200 text-red-800' :
                          'bg-yellow-200 text-yellow-800'
                        }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{log.message}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Create New Project</h3>
              <p className="text-gray-600 mb-4">Enter a name for your new project. This will create a dedicated equipment list page.</p>

              <Input
                type="text"
                placeholder="Project Name (e.g., Hydrogen, CarbonCapture)"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="mb-4"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
              />

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowProjectModal(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={!projectName.trim() || creating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Maintenance Statistics Table - Optional */}
      {maintenanceStatistics.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Maintenance Statistics by Scope</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left font-semibold">Scope</th>
                    <th className="p-3 text-left font-semibold">Equipment Types</th>
                    <th className="p-3 text-left font-semibold">Sub-Equipment Codes</th>
                    <th className="p-3 text-left font-semibold">Enabled Activities</th>
                    <th className="p-3 text-left font-semibold">Annual Workload</th>
                    <th className="p-3 text-left font-semibold">Total Activities</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {maintenanceStatistics.map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{stat.scope}</td>
                      <td className="p-3">{stat.equipment_type_count}</td>
                      <td className="p-3">{stat.sub_equipment_code_count}</td>
                      <td className="p-3">{stat.enabled_maintenance_count}</td>
                      <td className="p-3">{stat.total_annual_workload}</td>
                      <td className="p-3">{stat.total_activities}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Button - Remove in production */}
      {/* <div className="text-center">
        <Button
          variant="outline"
          onClick={() => {
            console.log('🎯 Debug: Manually activating Step 2');
            setSteps(prev => prev.map(step =>
              step.id === 2 ? { ...step, active: true } : step
            ));
          }}
          className="border-red-500 text-red-500 hover:bg-red-50"
        >
          DEBUG: Force Activate Step 2
        </Button>
      </div> */}
    </div>
  );
};

export default ProjectSequencer;