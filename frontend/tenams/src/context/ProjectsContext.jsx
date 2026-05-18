// contexts/ProjectsContext.jsx
import React, { createContext, useContext, useState } from 'react';
import getAllProjectsAPI from '../api/projects/getAllProjectsAPI';

const ProjectsContext = createContext();

export const  useProjects = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await getAllProjectsAPI();
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProject = (newProject) => {
    setProjects(prev => [newProject, ...prev]);
  };

  const refreshProjects = () => {
    loadProjects();
  };

  return (
    <ProjectsContext.Provider value={{
      projects,
      loading,
      loadProjects,
      addProject,
      refreshProjects
    }}>
      {children}
    </ProjectsContext.Provider>
  );
};