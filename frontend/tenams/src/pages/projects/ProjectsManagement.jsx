// pages/projects/ProjectsManagement.jsx (SIMPLIFIED)
import React, { useState, useEffect } from 'react';
import ProjectSequencer from './ProjectSequencer';
import api from '../../api/axiosInstance';

const ProjectsManagement = () => {
  const [activeTab, setActiveTab] = useState('sequencer');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load projects when projects tab is opened
  useEffect(() => {
    if (activeTab === 'projects') {
      loadProjects();
    }
  }, [activeTab]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err) {
      setError('Failed to load projects: ' + (err.response?.data?.detail || err.message));
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // No need for useProjectStore anymore
  const handleProjectCreated = (project) => {
    console.log('Project created:', project);
    // Reload projects if the list tab is visible
    if (activeTab === 'projects') {
      loadProjects();
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600">Create and manage equipment projects with visual sequencing</p>
        </div>

        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'sequencer'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600'
              }`}
            onClick={() => setActiveTab('sequencer')}
          >
            🚀 Project Sequencer
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'projects'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600'
              }`}
            onClick={() => setActiveTab('projects')}
          >
            📋 Project List
          </button>
        </div>
      </div>

      {activeTab === 'sequencer' && (
        <ProjectSequencer onProjectCreated={handleProjectCreated} />
      )}

      {activeTab === 'projects' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">All Projects</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
                <p className="mt-2 text-gray-500">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-lg">No projects created yet</p>
                <p className="text-gray-400 text-sm mt-2">Create a project using the Project Sequencer tab</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Project Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Equipment Count</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.project_id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{project.project_name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {project.project_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{project.equipment_count} items</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(project.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(project.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsManagement;