export class InMemoryMetricsRegistry {
  private readonly counters = new Map<string, number>();
  private readonly durations = new Map<string, number[]>();

  increment(
    name: string,
    labels: Record<string, string> = {},
    value = 1,
  ): void {
    const key = buildKey(name, labels);
    this.counters.set(key, (this.counters.get(key) ?? 0) + value);
  }

  observeDuration(
    name: string,
    durationMs: number,
    labels: Record<string, string> = {},
  ): void {
    const key = buildKey(name, labels);
    const durations = this.durations.get(key) ?? [];
    durations.push(durationMs);
    this.durations.set(key, durations);
  }

  renderPrometheus(): string {
    const lines: string[] = [];

    for (const [key, value] of this.counters.entries()) {
      lines.push(`${key} ${value}`);
    }

    for (const [key, values] of this.durations.entries()) {
      const total = values.reduce((sum, value) => sum + value, 0);
      const average = values.length === 0 ? 0 : total / values.length;
      lines.push(`${key}_count ${values.length}`);
      lines.push(`${key}_sum ${total}`);
      lines.push(`${key}_avg ${average}`);
    }

    return `${lines.join("\n")}\n`;
  }
}

function buildKey(name: string, labels: Record<string, string>): string {
  const entries = Object.entries(labels);

  if (entries.length === 0) {
    return name;
  }

  const renderedLabels = entries
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}="${value}"`)
    .join(",");

  return `${name}{${renderedLabels}}`;
}
