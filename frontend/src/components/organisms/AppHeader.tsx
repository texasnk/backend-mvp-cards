import { Activity, BookOpen } from "lucide-react";
import { useHealth } from "../../domains/health/hooks/useHealth";
export function AppHeader() {
  const health = useHealth();
  return (
    <header className="app-header">
      <div className="brand">
        <span>
          <BookOpen size={20} />
        </span>
        <strong>
          Card<span>ly</span>
        </strong>
      </div>
      <div className={`health ${health.isSuccess ? "online" : "offline"}`}>
        <Activity size={15} />
        {health.isSuccess ? "Sistema online" : "Verificando sistema"}
      </div>
    </header>
  );
}
