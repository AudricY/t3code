import { create } from "zustand";
import type { WorkLogRawResult } from "../../session-logic";

interface OpenPayload {
  title: string;
  subtitle?: string;
  result: WorkLogRawResult;
}

interface ToolResultDialogState {
  current: OpenPayload | null;
  open: (payload: OpenPayload) => void;
  close: () => void;
}

export const useToolResultDialogStore = create<ToolResultDialogState>((set) => ({
  current: null,
  open: (payload) => set({ current: payload }),
  close: () => set({ current: null }),
}));
