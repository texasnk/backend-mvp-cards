import { useMutation, useQueryClient } from "@tanstack/react-query";
import { domainService } from "../../../services/domain/domain";
export function useUpdateDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => domainService.update(id, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["domains"] }),
  });
}
