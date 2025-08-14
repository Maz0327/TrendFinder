import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ProjectContextValue = {
  currentProjectId: string | null;
  setProjectId: (id: string | null) => void;
};

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
};

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("currentProjectId");
    if (saved) setCurrentProjectId(saved);
  }, []);

  const setProjectId = (id: string | null) => {
    setCurrentProjectId(id);
    if (id) localStorage.setItem("currentProjectId", id);
    else localStorage.removeItem("currentProjectId");
  };

  const value = useMemo(() => ({ currentProjectId, setProjectId }), [currentProjectId]);
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};
