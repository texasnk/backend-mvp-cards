import { useMutation, useQueryClient } from "@tanstack/react-query";
import { domainService } from "../../../services/domain/domain";
export function useDeleteDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: domainService.remove.bind(domainService),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["domains"] }),
  });
}
