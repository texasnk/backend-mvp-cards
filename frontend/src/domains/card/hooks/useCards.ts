import { useInfiniteQuery } from "@tanstack/react-query";
import { cardService } from "../../../services/card/card";
import type { ICardFilters } from "../../../services/card/types";
export function useCards(filters: Omit<ICardFilters, "page" | "pageSize">) {
  return useInfiniteQuery({
    queryKey: ["cards", filters],
    queryFn: ({ pageParam }) => cardService.list({ ...filters, page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.pageSize < last.total ? last.page + 1 : undefined,
  });
}
