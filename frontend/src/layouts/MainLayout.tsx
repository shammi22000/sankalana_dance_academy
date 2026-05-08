import type { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return <div className="min-h-screen overflow-hidden bg-transparent text-mist">{children}</div>;
}

