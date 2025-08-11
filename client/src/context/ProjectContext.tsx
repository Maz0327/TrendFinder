// client/src/context/ProjectContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ProjectContextType = {
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'active_project_id';

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setActiveProjectIdState(saved);
  }, []);

  const setActiveProjectId = (id: string | null) => {
    setActiveProjectIdState(id);
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(() => ({ activeProjectId, setActiveProjectId }), [activeProjectId]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProjectContext = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjectContext must be used within ProjectProvider');
  return ctx;
};