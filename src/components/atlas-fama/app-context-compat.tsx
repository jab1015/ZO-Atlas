"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const AppContext = createContext({ sidebarOpen: false, toggleSidebar: () => {} });

export function useAppContext() {
  return useContext(AppContext);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return <AppContext.Provider value={{ sidebarOpen, toggleSidebar: () => setSidebarOpen((value) => !value) }}>{children}</AppContext.Provider>;
}
