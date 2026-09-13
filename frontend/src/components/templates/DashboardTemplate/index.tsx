import type { ReactNode } from "react";
import "./styles.css";
export function DashboardTemplate({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="layout">
      {sidebar}
      <div className="workspace">{children}</div>
    </main>
  );
}
