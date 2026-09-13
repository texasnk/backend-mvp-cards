import { FileUp, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { useCreateProcessing } from "../../domains/processing/hooks/useCreateProcessing";
import { useFiltersStore } from "../../store/useFiltersStore";
import { getErrorMessage } from "../../services/http";
import type { IProcessingResult } from "../../services/processing/types";
import { Button } from "../atoms/Button";
import { Input, Textarea } from "../atoms/Field";

export function ProcessingPanel() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File>();
  const [count, setCount] = useState(3);
  const [result, setResult] = useState<IProcessingResult>();
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { selectedDomainId } = useFiltersStore();
  const processing = useCreateProcessing();
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const value = await processing.mutateAsync({
        text,
        file,
        domainId: selectedDomainId,
        cardsCount: count,
      });
      setResult(value);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }
  return (
    <section className="processing">
      <div className="processing-copy">
        <p className="eyebrow">Assistente IA</p>
        <h2>Transforme conteúdo em estudo</h2>
        <p className="muted">
          Envie um PDF, imagem ou cole seu texto. A IA resume e cria flashcards para o domínio
          selecionado.
        </p>
      </div>
      <form onSubmit={submit}>
        <Textarea
          value={text}
          disabled={Boolean(file)}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cole aqui o conteúdo que deseja estudar…"
          rows={5}
        />
        <div className="processing-actions">
          <input
            ref={fileRef}
            className="sr-only"
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0])}
          />
          <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
            <FileUp size={16} />
            {file ? file.name : "PDF ou imagem"}
          </Button>
          <label>
            Cards{" "}
            <Input
              type="number"
              min="1"
              max="10"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </label>
          <Button type="submit" disabled={processing.isPending || (!text.trim() && !file)}>
            <Sparkles size={16} />
            {processing.isPending ? "Processando…" : "Gerar"}
          </Button>
        </div>
      </form>
      {error && <p className="error">{error}</p>}
      {result && (
        <div className="result">
          <div>
            <p className="card-label">Resumo gerado</p>
            <p>{result.summary}</p>
          </div>
          <div className="result-meta">
            {result.domain
              ? `Salvo em ${result.domain.name}`
              : result.suggestedDomain
                ? `Sugestão: ${result.suggestedDomain.name}`
                : "Sem domínio associado"}{" "}
            · {result.cards.length} cards criados
          </div>
        </div>
      )}
    </section>
  );
}
