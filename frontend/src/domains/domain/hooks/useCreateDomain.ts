import { useMutation, useQueryClient } from "@tanstack/react-query";
import { domainService } from "../../../services/domain/domain";
export function useCreateDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: domainService.create.bind(domainService),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["domains"] }),
  });
}
