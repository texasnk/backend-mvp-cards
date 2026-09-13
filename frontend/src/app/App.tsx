import { useState } from "react";
import { DomainPanel, type WorkspaceMode } from "../components/organisms/DomainPanel";
import { StudySession } from "../components/organisms/StudySession";
import { CardBoard } from "../components/organisms/CardBoard";
import { WorkspacePanel } from "../components/organisms/WorkspacePanel";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
export function App() {
  const [mode, setMode] = useState<WorkspaceMode>("study");
  return (
    <DashboardTemplate sidebar={<DomainPanel onNavigate={setMode} />}>
      {mode === "study" ? (
        <StudySession />
      ) : mode === "cards" ? (
        <CardBoard />
      ) : (
        <WorkspacePanel mode={mode} onComplete={() => setMode("study")} />
      )}
    </DashboardTemplate>
  );
}
