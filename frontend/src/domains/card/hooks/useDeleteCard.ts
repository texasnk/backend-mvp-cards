import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cardService } from "../../../services/card/card";
export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cardService.remove.bind(cardService),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cards"] }),
  });
}
