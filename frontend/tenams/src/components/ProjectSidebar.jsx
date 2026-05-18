// components/ProjectSidebar.jsx
import { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { FiChevronDown, FiChevronRight, FiFolder, FiPlus } from 'react-icons/fi';
import { hasRole, getUser } from '../utils/auth';
import getAllProjectsAPI from "../api/projects/getAllProjectsAPI"

const ProjectSidebar = ({ refreshTrigger = 0 }) => {
  const [showUser, setShowUser] = useState(false);
  const [showProjectsEquipment, setShowProjectsEquipment] = useState(false);
  const [showProjectsSpares, setShowProjectsSpares] = useState(false);
  const [showProjectsPM, setShowProjectsPM] = useState(false);
  const [showProjectsStat, setShowProjectsStat] = useState(false);
  const [showProjectsManagement, setShowProjectsManagement] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState([]);

  const user = getUser();

  // Load projects function
  const loadProjects = useCallback(async () => {
    try {
      setRefreshing(true);
      const projectsData = await getAllProjectsAPI();
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Load projects on mount AND when refreshTrigger changes
  useEffect(() => {
    loadProjects();
  }, [loadProjects, refreshTrigger]);

  return (
    <aside className="fixed top-14 left-0 h-[calc(100vh-7rem)] w-64 bg-white shadow-sm border-r z-10 flex flex-col">
      <div className="p-3 flex justify-center font-semibold text-lg border-b text-white bg-[#0070EF]">
        Project Dashboard ({user.username})
      </div>

      <nav className="flex-1 flex flex-col overflow-y-auto p-4 space-y-0">
        {/* Only Administrator can see Users section */}
        {hasRole("Administrator") && (
          <>
            <button
              onClick={() => setShowUser(!showUser)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-blue-100 hover:text-violet-600 transition-all duration-200"
            >
              <span className="flex items-center text-blue-400">
                <span className="mr-3 text-left"></span>
                Users
              </span>
              {showUser ? <FiChevronDown /> : <FiChevronRight />}
            </button>

            {showUser && (
              <div className="ml-8 space-y-1">
                <NavLink
                  to="/user/list"
                  end
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-violet-600 text-white font-medium'
                      : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                    }`
                  }
                >
                  Users list
                </NavLink>
                <NavLink
                  to="/user/add"
                  end
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-violet-600 text-white font-medium'
                      : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                    }`
                  }
                >
                  Add New User
                </NavLink>
              </div>
            )}
          </>
        )}
        {/* Project Management */}
        <button
          onClick={() => setShowProjectsManagement(!showProjectsManagement)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all duration-200"
        >
          <span className="flex items-start text-blue-400 text-left">
            <span className="mr-3 text-left "></span>
            Project Management
          </span>
          {showProjectsManagement ? <FiChevronDown /> : <FiChevronRight />}
        </button>

        {showProjectsManagement && (
          <div className="ml-8 space-y-1 ">

            <NavLink
              to="/project_management"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-violet-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`
              }
            >
              Create Project
            </NavLink>
            <NavLink
              to="/delete_project"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-violet-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`
              }
            >
              Delete Project
            </NavLink>

          </div>
        )}

        {/* Equipment Management Section */}
        <button
          onClick={() => setShowProjectsEquipment(!showProjectsEquipment)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-blue-100 hover:text-violet-600 transition-all duration-200"
        >
          <span className="flex items-center text-blue-400">
            <FiFolder className="mr-3" />
             Equipment
          </span>
          {showProjectsEquipment ? <FiChevronDown /> : <FiChevronRight />}
        </button>

        {showProjectsEquipment && (
          <div className="ml-8 space-y-1">        
            {/* Dynamic Project List */}
            {projects.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500 italic">
                No projects created yet
              </div>
            ) : (
              projects.map(project => (
                <NavLink
                  key={project.project_id}
                  to={`/project/${project.project_id}/equipment`}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-violet-600 text-white font-medium'
                      : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                    }`
                  }
                >
                  <FiFolder className="mr-3" />
                  {project.project_name} Equipment List
                </NavLink>
              ))
            )}
          </div>
        )}

        {/* Spare Parts Management Section */}
        <button
          onClick={() => setShowProjectsSpares(!showProjectsSpares)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-blue-100 hover:text-violet-600 transition-all duration-200"
        >
          <span className="flex items-center text-blue-400">
            <FiFolder className="mr-3" />
             Spares
          </span>
          {showProjectsSpares ? <FiChevronDown /> : <FiChevronRight />}
        </button>
        {showProjectsSpares && (
          <div className="ml-8 space-y-1">
            {/* Dynamic Project List */}
            {projects.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500 italic">
                No projects created yet
              </div>
            ) : (
              projects.map(project => (
                <NavLink
                  key={project.project_id}
                  to={`/project/${project.project_id}/spares`}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-violet-600 text-white font-medium'
                      : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                    }`
                  }
                >
                  <FiFolder className="mr-3" />
                  {project.project_name} Spare Part List
                </NavLink>
              ))
            )}
          </div>
        )}

        {/* Maintenance Plan Section */}
        <button
          onClick={() => setShowProjectsPM(!showProjectsPM)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-blue-100 hover:text-violet-600 transition-all duration-200"
        >
          <span className="flex items-center text-blue-400">
            <FiFolder className="mr-3" />
            Maintenance Plan
          </span>
          {showProjectsPM ? <FiChevronDown /> : <FiChevronRight />}
        </button>
        {showProjectsPM && (
          <div className="ml-8 space-y-1">
            {/* Dynamic Project List */}
            {projects.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500 italic">
                No projects created yet
              </div>
            ) : (
              projects.map(project => (
                <NavLink
                  key={project.project_id}
                  to={`/project/${project.project_id}/activities`}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-violet-600 text-white font-medium'
                      : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                    }`
                  }
                >
                  <FiFolder className="mr-3" />
                  {project.project_name} Maintenance Plan 
                </NavLink>
              ))
            )}
          </div>
        )}

         {/* Maintenance Statistics */}
        <button
          onClick={() => setShowProjectsStat(!showProjectsStat)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-blue-100 hover:text-violet-600 transition-all duration-200"
        >
          <span className="flex items-center text-blue-400">
            <FiFolder className="mr-3" />
            Statistics
          </span>
          {showProjectsStat ? <FiChevronDown /> : <FiChevronRight />}
        </button>
        {showProjectsStat && (
          <div className="ml-8 space-y-1">
            {/* Dynamic Project List */}
            {projects.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500 italic">
                No projects created yet
              </div>
            ) : (
              projects.map(project => (
                <NavLink
                  key={project.project_id}
                  to={`/project/${project.project_id}/statistics`}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-violet-600 text-white font-medium'
                      : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                    }`
                  }
                >
                  <FiFolder className="mr-2" />
                  {project.project_name} Maintenance Statistics
                </NavLink>
              ))
            )}
          </div>
        )}


      </nav>
      {/* Projects Summary */}
      <div className="p-3 border-t bg-gray-50">
        <div className="text-xs text-gray-600">
          <div className="font-semibold">Projects Summary</div>
          <div>
            {refreshing ? 'Refreshing...' : `${projects.length} project${projects.length !== 1 ? 's' : ''} active`}
          </div>
        </div>
      </div>
    </aside >
  );
};

export default ProjectSidebar;