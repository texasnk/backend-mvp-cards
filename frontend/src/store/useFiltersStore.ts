import { create } from "zustand";
import type { TCardApproach, TCardSource } from "../services/card/types";

interface IFiltersStore {
  selectedDomainId?: string;
  sourceType?: TCardSource;
  approach?: TCardApproach;
  setSelectedDomainId: (id?: string) => void;
  setSourceType: (source?: TCardSource) => void;
  setApproach: (approach?: TCardApproach) => void;
}
export const useFiltersStore = create<IFiltersStore>((set) => ({
  selectedDomainId: undefined,
  sourceType: undefined,
  approach: undefined,
  setSelectedDomainId: (selectedDomainId) => set({ selectedDomainId }),
  setSourceType: (sourceType) => set({ sourceType }),
  setApproach: (approach) => set({ approach }),
}));
