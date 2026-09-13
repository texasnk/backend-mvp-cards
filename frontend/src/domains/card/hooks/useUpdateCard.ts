import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cardService } from "../../../services/card/card";
import type { ICardInput } from "../../../services/card/types";
export function useUpdateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<Omit<ICardInput, "studyDomainId">>;
    }) => cardService.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cards"] }),
  });
}
