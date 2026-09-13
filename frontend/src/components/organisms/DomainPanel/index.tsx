import { Edit3, FileUp, FolderPlus, Layers3, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteDomain } from "../../../domains/domain/hooks/useDeleteDomain";
import { useDomains } from "../../../domains/domain/hooks/useDomains";
import { useUpdateDomain } from "../../../domains/domain/hooks/useUpdateDomain";
import { useFiltersStore } from "../../../store/useFiltersStore";
import { Button } from "../../atoms/Button";
import { Input } from "../../atoms/Field";
import "./styles.css";

export type WorkspaceMode = "study" | "cards" | "domain" | "import";

/** Lista domínios e permite selecionar, editar ou excluir cada item. */
export function DomainPanel({ onNavigate }: { onNavigate: (mode: WorkspaceMode) => void }) {
  const { data } = useDomains();
  const { selectedDomainId, setSelectedDomainId } = useFiltersStore();
  const update = useUpdateDomain();
  const remove = useDeleteDomain();
  const [editingId, setEditingId] = useState<string>();
  const [name, setName] = useState("");
  const domains = data?.pages.flatMap((page) => page.items) ?? [];

  /** Salva o novo nome do domínio em edição. */
  function saveDomain(id: string) {
    if (!name.trim()) return;
    update.mutate(
      { id, name },
      {
        onSuccess: () => {
          setEditingId(undefined);
          setName("");
        },
      },
    );
  }

  return (
    <aside className="domain_panel">
      <div className="sidebar_brand">Cards</div>
      <div className="sidebar_actions">
        <Button variant="secondary" onClick={() => onNavigate("domain")}>
          <FolderPlus size={16} /> Novo domínio
        </Button>
        <Button variant="secondary" onClick={() => onNavigate("cards")}>
          <Layers3 size={16} /> Gerenciar cards
        </Button>
        <Button variant="secondary" onClick={() => onNavigate("import")}>
          <FileUp size={16} /> Importar TXT
        </Button>
      </div>
      <nav className="domain_list" aria-label="Domínios de estudo">
        <p className="sidebar_label">Domínios</p>
        {domains.map((domain) => (
          <div key={domain.id} className="domain_row">
            {editingId === domain.id ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  saveDomain(domain.id);
                }}
              >
                <Input
                  autoFocus
                  required
                  minLength={3}
                  maxLength={40}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                <Button type="submit" variant="ghost">
                  Salvar
                </Button>
                <Button type="button" variant="ghost" onClick={() => setEditingId(undefined)}>
                  Cancelar
                </Button>
              </form>
            ) : (
              <>
                <button
                  className={selectedDomainId === domain.id ? "domain active" : "domain"}
                  onClick={() => {
                    setSelectedDomainId(domain.id);
                    onNavigate("study");
                  }}
                >
                  {domain.name}
                </button>
                <button
                  className="icon_button"
                  onClick={() => {
                    setEditingId(domain.id);
                    setName(domain.name);
                  }}
                  aria-label={`Editar ${domain.name}`}
                >
                  <Edit3 size={14} />
                </button>
                <button
                  className="icon_button danger"
                  onClick={() => {
                    if (confirm(`Excluir o domínio ${domain.name} e todos os seus cards?`))
                      remove.mutate(domain.id, {
                        onSuccess: () => {
                          if (selectedDomainId === domain.id) setSelectedDomainId(undefined);
                        },
                      });
                  }}
                  aria-label={`Excluir ${domain.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        ))}
        {domains.length === 0 && <p className="sidebar_empty">Crie seu primeiro domínio.</p>}
      </nav>
    </aside>
  );
}
