import React, { createContext, useContext, useState } from "react";

type ProjectCtx = {
  currentProjectId: string | null;
  setProjectId: (id: string | null) => void;
};

const Ctx = createContext<ProjectCtx | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProjectId, setProjectId] = useState<string | null>(null);
  return <Ctx.Provider value={{ currentProjectId, setProjectId }}>{children}</Ctx.Provider>;
}

export function useProject() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}