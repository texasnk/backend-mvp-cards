import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cardService } from "../../../services/card/card";
export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cardService.create.bind(cardService),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cards"] }),
  });
}
