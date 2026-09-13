import { AppHeader } from "../components/organisms/AppHeader";
import { CardBoard } from "../components/organisms/CardBoard";
import { DomainPanel } from "../components/organisms/DomainPanel";
import { ProcessingPanel } from "../components/organisms/ProcessingPanel";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
export function App() {
  return (
    <>
      <AppHeader />
      <DashboardTemplate sidebar={<DomainPanel />}>
        <ProcessingPanel />
        <CardBoard />
      </DashboardTemplate>
    </>
  );
}
