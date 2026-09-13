import { useMutation, useQueryClient } from "@tanstack/react-query";
import { processingService } from "../../../services/processing/processing";
export function useCreateProcessing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: processingService.create.bind(processingService),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cards"] }),
  });
}
