import React, { useState, useEffect } from 'react';
import { FiTrash2, FiRefreshCw } from 'react-icons/fi';
import api from '../../api/axiosInstance';
import deleteProjectAPI from '../../api/projects/deleteProjectAPI';

const DeleteProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      setProjects(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load projects: ' + (err.response?.data?.detail || err.message));
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`Are you sure you want to delete project "${projectName}" and all associated data? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(projectId);
      setError('');
      setSuccess('');
      
      await deleteProjectAPI(projectId);
      
      setSuccess(`Project "${projectName}" deleted successfully!`);
      setProjects(projects.filter(p => p.project_id !== projectId));
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete project: ' + (err.response?.data?.detail || err.message));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delete Project</h1>
          <p className="text-gray-600">Select a project to delete it and all associated equipment</p>
        </div>
        <button
          onClick={loadProjects}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
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
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">No projects to delete</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Project Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Equipment Count</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.project_id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{project.project_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {project.project_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{project.equipment_count} items</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteProject(project.project_id, project.project_name)}
                      disabled={deleting === project.project_id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiTrash2 size={16} />
                      {deleting === project.project_id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeleteProjectList;
