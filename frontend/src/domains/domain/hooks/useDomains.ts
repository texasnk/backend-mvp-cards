import { useInfiniteQuery } from "@tanstack/react-query";
import { domainService } from "../../../services/domain/domain";
export function useDomains(search = "") {
  return useInfiniteQuery({
    queryKey: ["domains", search],
    queryFn: ({ pageParam }) => domainService.list({ search, page: pageParam, pageSize: 30 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.pageSize < last.total ? last.page + 1 : undefined,
  });
}
