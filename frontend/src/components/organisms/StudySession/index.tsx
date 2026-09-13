import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Brain, Eye, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { useDomains } from "../../../domains/domain/hooks/useDomains";
import { cardService } from "../../../services/card/card";
import type { ICard, TReviewRating } from "../../../services/card/types";
import { useFiltersStore } from "../../../store/useFiltersStore";
import { Button } from "../../atoms/Button";
import { Select } from "../../atoms/Field";
import "./styles.css";

const labels: Record<TReviewRating, string> = {
  again: "Errei",
  hard: "Difícil",
  good: "Bom",
  easy: "Fácil",
};

/** Área de estudo que seleciona um domínio e conduz uma revisão por vez. */
export function StudySession() {
  const { selectedDomainId, setSelectedDomainId } = useFiltersStore();
  const domainsQuery = useDomains();
  const domains = domainsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const cardsQuery = useQuery({
    queryKey: ["study-cards", selectedDomainId],
    queryFn: () => cardService.list({ studyDomainId: selectedDomainId, page: 1, pageSize: 100 }),
    enabled: Boolean(selectedDomainId),
  });
  const queryClient = useQueryClient();
  const [showAnswer, setShowAnswer] = useState(false);
  const dueCards = useMemo(
    () =>
      (cardsQuery.data?.items ?? []).filter((card) => new Date(card.dueAt).getTime() <= Date.now()),
    [cardsQuery.data],
  );
  const current = dueCards[0];
  const optionsQuery = useQuery({
    queryKey: ["review-options", current?.id],
    queryFn: () => cardService.reviewOptions(current!.id),
    enabled: Boolean(current),
  });
  const review = useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: TReviewRating }) =>
      cardService.review(id, rating),
    onSuccess: () => {
      setShowAnswer(false);
      void queryClient.invalidateQueries({ queryKey: ["study-cards", selectedDomainId] });
    },
  });

  /** Formata o intervalo mostrado ao lado de cada alternativa. */
  function interval(card: ICard | undefined, rating: TReviewRating): string {
    const option = optionsQuery.data?.find((item) => item.rating === rating);
    if (!option) return "…";
    if (option.intervalDays > 0) return `${option.intervalDays}d`;
    const minutes = Math.max(
      1,
      Math.round((new Date(option.dueAt).getTime() - Date.now()) / 60_000),
    );
    return `${minutes}m`;
  }

  return (
    <section className="study_session">
      <header className="study_heading">
        <div>
          <p className="eyebrow">Estudo</p>
          <h1>Revisar</h1>
        </div>
        <Brain size={30} />
      </header>
      <Select
        value={selectedDomainId ?? ""}
        onChange={(event) => setSelectedDomainId(event.target.value || undefined)}
        aria-label="Domínio para estudar"
      >
        <option value="">Selecione o domínio para estudar</option>
        {domains.map((domain) => (
          <option key={domain.id} value={domain.id}>
            {domain.name}
          </option>
        ))}
      </Select>
      {!selectedDomainId && <div className="study_empty">Escolha um domínio à esquerda.</div>}
      {selectedDomainId && !cardsQuery.isLoading && !current && (
        <div className="study_empty">Nenhum card para revisar agora neste domínio.</div>
      )}
      {current && (
        <article className="review_card">
          <span className="review_state">{current.state}</span>
          <p className="card_label">Pergunta</p>
          <h2>{current.front}</h2>
          {showAnswer ? (
            <div className="review_answer">
              <p className="card_label">Resposta</p>
              <p>{current.back}</p>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setShowAnswer(true)}>
              <Eye size={16} /> Mostrar resposta
            </Button>
          )}
          {showAnswer && (
            <div className="rating_actions">
              {(["again", "hard", "good", "easy"] as TReviewRating[]).map((rating) => (
                <Button
                  key={rating}
                  variant={
                    rating === "again" ? "danger" : rating === "good" ? "primary" : "secondary"
                  }
                  disabled={review.isPending}
                  onClick={() => review.mutate({ id: current.id, rating })}
                >
                  {labels[rating]} <small>{interval(current, rating)}</small>
                </Button>
              ))}
            </div>
          )}
        </article>
      )}
      {review.isError && (
        <p className="error">Não foi possível registrar a revisão. Tente novamente.</p>
      )}
      {selectedDomainId && (
        <p className="study_count">
          <RotateCcw size={14} /> {dueCards.length} card(s) disponível(is) agora
        </p>
      )}
    </section>
  );
}
