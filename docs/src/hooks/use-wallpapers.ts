import { useQuery } from "@tanstack/react-query";
import { FALLBACK_CATALOG, fetchCatalog } from "@/lib/catalog";

export function useWallpapers() {
  return useQuery({
    queryKey: ["wallpapers"],
    queryFn: fetchCatalog,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    placeholderData: FALLBACK_CATALOG,
  });
}
