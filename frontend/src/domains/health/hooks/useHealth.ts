import { useQuery } from "@tanstack/react-query";
import { healthService } from "../../../services/health/health";
export const useHealth = () =>
  useQuery({
    queryKey: ["health"],
    queryFn: healthService.ready,
    retry: false,
    refetchInterval: 30_000,
  });
