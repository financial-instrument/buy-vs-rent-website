"use client";
import { create } from "zustand";
import type { CountryInputs } from "@/lib/calc/core/types";

interface CalcStore {
  inputs: CountryInputs | null;
  setInputs: (inputs: CountryInputs) => void;
  patch: (partial: Partial<CountryInputs>) => void;
}

export const useCalcStore = create<CalcStore>((set) => ({
  inputs: null,
  setInputs: (inputs) => set({ inputs }),
  patch: (partial) =>
    set((state) =>
      state.inputs
        ? { inputs: { ...state.inputs, ...partial } as CountryInputs }
        : state,
    ),
}));
