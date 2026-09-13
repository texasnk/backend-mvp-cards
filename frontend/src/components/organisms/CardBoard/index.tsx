import { Edit3, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCards } from "../../../domains/card/hooks/useCards";
import { useCreateCard } from "../../../domains/card/hooks/useCreateCard";
import { useDeleteCard } from "../../../domains/card/hooks/useDeleteCard";
import { useUpdateCard } from "../../../domains/card/hooks/useUpdateCard";
import { useDomains } from "../../../domains/domain/hooks/useDomains";
import { useFiltersStore } from "../../../store/useFiltersStore";
import { approaches } from "../../../utils/constants";
import { approachLabel } from "../../../utils/formatters";
import type { ICardInput } from "../../../services/card/types";
import { cardService } from "../../../services/card/card";
import { getErrorMessage } from "../../../services/http";
import { Button } from "../../atoms/Button";
import { Badge } from "../../atoms/Badge";
import { Select, Textarea } from "../../atoms/Field";
import "./styles.css";

const blankCard: ICardInput = { studyDomainId: "", front: "", back: "", approach: "definicao" };
export function CardBoard() {
  const {
    selectedDomainId,
    sourceType,
    approach,
    setSelectedDomainId,
    setSourceType,
    setApproach,
  } = useFiltersStore();
  const cardsQuery = useCards({ studyDomainId: selectedDomainId, sourceType, approach });
  const domainsQuery = useDomains();
  const create = useCreateCard();
  const update = useUpdateCard();
  const remove = useDeleteCard();
  const [isFormOpen, setFormOpen] = useState(false);
  const [isImportOpen, setImportOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const [form, setForm] = useState<ICardInput>(blankCard);
  const [importDomainId, setImportDomainId] = useState(selectedDomainId ?? "");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [importSummary, setImportSummary] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const importCards = useMutation({
    mutationFn: () => cardService.importBlock(importDomainId, importText),
    onSuccess: (result) => {
      setImportText("");
      setImportError("");
      setImportSummary(
        result.failures.length
          ? `${result.total} card(s) importado(s); ${result.failures.length} duplicado(s) ignorado(s).`
          : `${result.total} card(s) importado(s).`,
      );
      void queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
    onError: (error) => setImportError(getErrorMessage(error)),
  });
  const cards = cardsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const domains = domainsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  function closeForm() {
    setForm(blankCard);
    setEditingId(undefined);
    setFormOpen(false);
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (editingId)
      update.mutate(
        { id: editingId, input: { front: form.front, back: form.back, approach: form.approach } },
        { onSuccess: closeForm },
      );
    else create.mutate(form, { onSuccess: closeForm });
  }
  function toggleCard(id: string) {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));
  }
  async function removeSelected() {
    if (!selectedIds.length || !confirm(`Excluir ${selectedIds.length} card(s)?`)) return;
    const result = await cardService.removeMany(selectedIds);
    setSelectedIds([]);
    setImportSummary(
      result.failures.length
        ? `${result.deletedIds.length} removido(s); ${result.failures.length} falha(s).`
        : `${result.deletedIds.length} card(s) removido(s).`,
    );
    void queryClient.invalidateQueries({ queryKey: ["cards"] });
  }
  /** Lê o arquivo TXT escolhido para reutilizar o mesmo fluxo de importação. */
  function readImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImportText(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => setImportError("Não foi possível ler o arquivo selecionado.");
    reader.readAsText(file, "UTF-8");
  }
  /** Envia o bloco integralmente para que o backend valide todas as linhas. */
  function submitImport(event: React.FormEvent) {
    event.preventDefault();
    setImportError("");
    if (!importDomainId) return setImportError("Selecione o domínio que receberá os cards.");
    if (!importText.trim())
      return setImportError("Escolha um TXT ou cole os cards no campo de texto.");
    importCards.mutate();
  }
  return (
    <section className="cards_area">
      <header className="section_header">
        <div>
          <p className="eyebrow">Revisão</p>
          <h1>Seus flashcards</h1>
          <p className="muted">Crie, filtre e revise sua base de estudos.</p>
        </div>
        <div className="header_actions">
          <Button
            variant="secondary"
            onClick={() => {
              setImportDomainId(selectedDomainId ?? "");
              setImportError("");
              setImportOpen((open) => !open);
            }}
          >
            Importar TXT
          </Button>
          <Button
            onClick={() => {
              setEditingId(undefined);
              setForm({ ...blankCard, studyDomainId: selectedDomainId ?? "" });
              setFormOpen(true);
            }}
          >
            <Plus size={17} /> Novo card
          </Button>
        </div>
      </header>
      {isImportOpen && (
        <form className="card_form import_form" onSubmit={submitImport}>
          <div className="form_title">
            <div>
              <h3>Importar cards em massa</h3>
              <p className="muted">
                Escolha o domínio e envie um TXT ou cole o conteúdo. Use uma linha por card:{" "}
                <code>pergunta;resposta</code>.
              </p>
            </div>
            <Button variant="ghost" type="button" onClick={() => setImportOpen(false)}>
              Cancelar
            </Button>
          </div>
          <Select
            required
            value={importDomainId}
            onChange={(event) => setImportDomainId(event.target.value)}
          >
            <option value="">Selecione o domínio que receberá os cards</option>
            {domains.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.name}
              </option>
            ))}
          </Select>
          <label className="upload_txt">
            <span>1. Escolha um arquivo .txt</span>
            <input accept=".txt,text/plain" type="file" onChange={readImportFile} />
          </label>
          <p className="import_divider">ou cole o conteúdo abaixo</p>
          <Textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder={"Quanto é 2 + 2?;4\nQual é a raiz de 81?;9"}
            rows={8}
          />
          {importError && <p className="error">{importError}</p>}
          <Button type="submit" disabled={importCards.isPending}>
            Importar {importText.split(/\r?\n/).filter((line) => line.trim()).length || 0} card(s)
          </Button>
        </form>
      )}
      <div className="filters">
        <Select
          value={selectedDomainId ?? ""}
          onChange={(event) => setSelectedDomainId(event.target.value || undefined)}
          aria-label="Filtrar por domínio"
        >
          <option value="">Todos os domínios</option>
          {domains.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.name}
            </option>
          ))}
        </Select>
        <Select
          value={sourceType ?? ""}
          onChange={(e) => setSourceType((e.target.value as typeof sourceType) || undefined)}
        >
          <option value="">Todas as origens</option>
          <option value="manual">Manuais</option>
          <option value="generated">Gerados por IA</option>
        </Select>
        <Select
          value={approach ?? ""}
          onChange={(e) => setApproach((e.target.value as typeof approach) || undefined)}
        >
          <option value="">Todas as abordagens</option>
          {approaches.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>
      {selectedIds.length > 0 && (
        <Button variant="danger" onClick={() => void removeSelected()}>
          Excluir {selectedIds.length} selecionado(s)
        </Button>
      )}
      {importSummary && <p className="muted">{importSummary}</p>}
      {isFormOpen && (
        <form className="card_form" onSubmit={submit}>
          <div className="form_title">
            <h3>{editingId ? "Editar flashcard" : "Novo flashcard"}</h3>
            <Button variant="ghost" type="button" onClick={closeForm}>
              Cancelar
            </Button>
          </div>
          <Select
            required
            disabled={Boolean(editingId)}
            value={form.studyDomainId}
            onChange={(e) => setForm({ ...form, studyDomainId: e.target.value })}
          >
            <option value="">Selecione o domínio</option>
            {domains.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.name}
              </option>
            ))}
          </Select>
          <Textarea
            required
            minLength={1}
            value={form.front}
            onChange={(e) => setForm({ ...form, front: e.target.value })}
            placeholder="Pergunta / frente do card"
          />
          <Textarea
            required
            minLength={3}
            value={form.back}
            onChange={(e) => setForm({ ...form, back: e.target.value })}
            placeholder="Resposta / verso do card"
          />
          <Select
            value={form.approach ?? ""}
            onChange={(e) =>
              setForm({ ...form, approach: e.target.value as ICardInput["approach"] })
            }
          >
            {approaches.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
          <Button type="submit" disabled={create.isPending || update.isPending}>
            Salvar card
          </Button>
        </form>
      )}
      <div className="card_grid">
        {cards.map((card) => (
          <article className="study_card" key={card.id}>
            <div className="card_top">
              <input
                type="checkbox"
                checked={selectedIds.includes(card.id)}
                onChange={() => toggleCard(card.id)}
                aria-label="Selecionar card"
              />
              <Badge>{card.sourceType === "manual" ? "Manual" : "IA"}</Badge>
              <div>
                <button
                  className="icon_button"
                  onClick={() => {
                    setForm({
                      studyDomainId: card.studyDomainId,
                      front: card.front,
                      back: card.back,
                      approach: card.approach,
                    });
                    setEditingId(card.id);
                    setFormOpen(true);
                  }}
                  aria-label="Editar card"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  className="icon_button danger"
                  onClick={() => {
                    if (confirm("Excluir este card?")) remove.mutate(card.id);
                  }}
                  aria-label="Excluir card"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <p className="card_label">Frente</p>
            <h3>{card.front}</h3>
            <div className="card_answer">
              <p className="card_label">Verso</p>
              <p>{card.back}</p>
            </div>
            <span className="approach">{approachLabel(card.approach)}</span>
          </article>
        ))}
      </div>
      {!cardsQuery.isLoading && cards.length === 0 && (
        <div className="empty">
          Nenhum card encontrado. Crie um manualmente ou processe um conteúdo.
        </div>
      )}
      {cardsQuery.hasNextPage && (
        <Button variant="secondary" onClick={() => cardsQuery.fetchNextPage()}>
          Carregar mais cards
        </Button>
      )}
    </section>
  );
}
