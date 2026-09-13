export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(date));
export const approachLabel = (value: string | null) =>
  value?.replaceAll("_", " ") ?? "Sem abordagem";
