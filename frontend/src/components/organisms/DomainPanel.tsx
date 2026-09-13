import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCreateDomain } from "../../domains/domain/hooks/useCreateDomain";
import { useDeleteDomain } from "../../domains/domain/hooks/useDeleteDomain";
import { useDomains } from "../../domains/domain/hooks/useDomains";
import { useUpdateDomain } from "../../domains/domain/hooks/useUpdateDomain";
import { useFiltersStore } from "../../store/useFiltersStore";
import { getErrorMessage } from "../../services/http";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Field";

export function DomainPanel() {
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { data, fetchNextPage, hasNextPage, isLoading } = useDomains(search);
  const create = useCreateDomain();
  const update = useUpdateDomain();
  const remove = useDeleteDomain();
  const { selectedDomainId, setSelectedDomainId } = useFiltersStore();
  const domains = data?.pages.flatMap((page) => page.items) ?? [];
  async function addDomain(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await create.mutateAsync({ name });
      setName("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }
  return (
    <aside className="domain-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Biblioteca</p>
          <h2>Domínios</h2>
        </div>
        <span>{domains.length}</span>
      </div>
      <div className="search">
        <Search size={16} />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar" />
      </div>
      <form className="add-domain" onSubmit={addDomain}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={3}
          maxLength={40}
          required
          placeholder="Novo domínio"
        />
        <Button type="submit" disabled={create.isPending} aria-label="Adicionar domínio">
          <Plus size={17} />
        </Button>
      </form>
      {error && <p className="error">{error}</p>}
      <nav className="domain-list">
        <button
          className={!selectedDomainId ? "domain active" : "domain"}
          onClick={() => setSelectedDomainId()}
        >
          Todos os cards
        </button>
        {domains.map((domain) => (
          <div className="domain-row" key={domain.id}>
            <button
              className={selectedDomainId === domain.id ? "domain active" : "domain"}
              onClick={() => setSelectedDomainId(domain.id)}
            >
              {domain.name}
            </button>
            <button
              className="icon-button"
              onClick={() => {
                const next = prompt("Novo nome do domínio", domain.name)?.trim();
                if (next && next !== domain.name) update.mutate({ id: domain.id, name: next });
              }}
              aria-label={`Editar ${domain.name}`}
            >
              <Pencil size={13} />
            </button>
            <button
              className="icon-button"
              onClick={() => {
                if (confirm(`Excluir ${domain.name}?`)) remove.mutate(domain.id);
              }}
              aria-label={`Excluir ${domain.name}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </nav>
      {!isLoading && hasNextPage && (
        <Button variant="ghost" onClick={() => fetchNextPage()}>
          Carregar mais
        </Button>
      )}
    </aside>
  );
}
