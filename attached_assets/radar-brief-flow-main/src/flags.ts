export const flags = {
  phase5: true,
  phase6: false,
  uiV2: true,
} as const;

export type Flags = typeof flags;
