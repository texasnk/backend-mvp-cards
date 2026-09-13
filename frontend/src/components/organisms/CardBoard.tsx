import { Edit3, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCards } from "../../domains/card/hooks/useCards";
import { useCreateCard } from "../../domains/card/hooks/useCreateCard";
import { useDeleteCard } from "../../domains/card/hooks/useDeleteCard";
import { useUpdateCard } from "../../domains/card/hooks/useUpdateCard";
import { useDomains } from "../../domains/domain/hooks/useDomains";
import { useFiltersStore } from "../../store/useFiltersStore";
import { approaches } from "../../utils/constants";
import { approachLabel } from "../../utils/formatters";
import type { ICardInput } from "../../services/card/types";
import { Button } from "../atoms/Button";
import { Badge } from "../atoms/Badge";
import { Select, Textarea } from "../atoms/Field";

const blankCard: ICardInput = { studyDomainId: "", front: "", back: "", approach: "definicao" };
export function CardBoard() {
  const { selectedDomainId, sourceType, approach, setSourceType, setApproach } = useFiltersStore();
  const cardsQuery = useCards({ studyDomainId: selectedDomainId, sourceType, approach });
  const domainsQuery = useDomains();
  const create = useCreateCard();
  const update = useUpdateCard();
  const remove = useDeleteCard();
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const [form, setForm] = useState<ICardInput>(blankCard);
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
  return (
    <section className="cards-area">
      <header className="section-header">
        <div>
          <p className="eyebrow">Revisão</p>
          <h1>Seus flashcards</h1>
          <p className="muted">Crie, filtre e revise sua base de estudos.</p>
        </div>
        <Button
          onClick={() => {
            setEditingId(undefined);
            setForm({ ...blankCard, studyDomainId: selectedDomainId ?? "" });
            setFormOpen(true);
          }}
        >
          <Plus size={17} /> Novo card
        </Button>
      </header>
      <div className="filters">
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
      {isFormOpen && (
        <form className="card-form" onSubmit={submit}>
          <div className="form-title">
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
            minLength={3}
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
      <div className="card-grid">
        {cards.map((card) => (
          <article className="study-card" key={card.id}>
            <div className="card-top">
              <Badge>{card.sourceType === "manual" ? "Manual" : "IA"}</Badge>
              <div>
                <button
                  className="icon-button"
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
                  className="icon-button danger"
                  onClick={() => {
                    if (confirm("Excluir este card?")) remove.mutate(card.id);
                  }}
                  aria-label="Excluir card"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <p className="card-label">Frente</p>
            <h3>{card.front}</h3>
            <div className="card-answer">
              <p className="card-label">Verso</p>
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
