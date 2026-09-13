import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, FolderPlus } from "lucide-react";
import { useState } from "react";
import { useCreateDomain } from "../../../domains/domain/hooks/useCreateDomain";
import { useDomains } from "../../../domains/domain/hooks/useDomains";
import { cardService } from "../../../services/card/card";
import { getErrorMessage } from "../../../services/http";
import { useFiltersStore } from "../../../store/useFiltersStore";
import { Button } from "../../atoms/Button";
import { Input, Select, Textarea } from "../../atoms/Field";
import type { WorkspaceMode } from "../DomainPanel";
import "./styles.css";

/** Conteúdo central para criação de domínio ou importação de cards. */
export function WorkspacePanel({
  mode,
  onComplete,
}: {
  mode: Exclude<WorkspaceMode, "study" | "cards">;
  onComplete: () => void;
}) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const { selectedDomainId, setSelectedDomainId } = useFiltersStore();
  const domainsQuery = useDomains();
  const domains = domainsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const create = useCreateDomain();
  const queryClient = useQueryClient();
  const importCards = useMutation({
    mutationFn: () => cardService.importBlock(selectedDomainId!, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cards"] });
      onComplete();
    },
    onError: (reason) => setError(getErrorMessage(reason)),
  });

  /** Cria o domínio e direciona a pessoa imediatamente à revisão. */
  async function createDomain(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const domain = await create.mutateAsync({ name });
      setSelectedDomainId(domain.id);
      onComplete();
    } catch (reason) {
      setError(getErrorMessage(reason));
    }
  }
  /** Carrega um arquivo local no campo de pré-visualização. */
  function readTextFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => setError("Não foi possível ler este arquivo.");
    reader.readAsText(file, "UTF-8");
  }
  /** Envia o lote para validação e persistência no domínio selecionado. */
  function importText(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!selectedDomainId) return setError("Escolha o domínio que receberá os cards.");
    if (!text.trim()) return setError("Envie ou cole um arquivo TXT.");
    importCards.mutate();
  }

  if (mode === "domain")
    return (
      <section className="workspace_panel">
        <FolderPlus size={28} />
        <h1>Novo domínio</h1>
        <p className="muted">Dê um nome ao que você quer estudar.</p>
        <form onSubmit={createDomain}>
          <Input
            autoFocus
            required
            minLength={3}
            maxLength={40}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Matemática"
          />
          <Button type="submit" disabled={create.isPending}>
            Criar domínio
          </Button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>
    );
  return (
    <section className="workspace_panel">
      <FileText size={28} />
      <h1>Importar cards</h1>
      <p className="muted">
        Escolha o domínio e use uma linha por card: <code>pergunta;resposta</code>.
      </p>
      <form onSubmit={importText}>
        <Select
          required
          value={selectedDomainId ?? ""}
          onChange={(event) => setSelectedDomainId(event.target.value || undefined)}
        >
          <option value="">Selecione o domínio</option>
          {domains.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.name}
            </option>
          ))}
        </Select>
        <label className="workspace_upload">
          Escolher arquivo TXT
          <input accept=".txt,text/plain" type="file" onChange={readTextFile} />
        </label>
        <p className="import_divider">ou cole abaixo</p>
        <Textarea
          rows={10}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={"Quanto é 2 + 2?;4\nQual é a raiz de 81?;9"}
        />
        <Button type="submit" disabled={importCards.isPending}>
          Importar {text.split(/\r?\n/).filter((line) => line.trim()).length || ""} cards
        </Button>
      </form>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
