export const BOARD_COLORS = [
  '#D3CCF1',
  '#B8C9E8',
  '#9AAB65',
  '#F6D868',
  '#F5B8DA',
  '#FABE81',
] as const;

export type BoardColor = (typeof BOARD_COLORS)[number];
