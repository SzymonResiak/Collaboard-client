export const ThemeColors = {
  purple: '#D3CCF1',
  blue: '#B8C9E8',
  green: '#9AAB65',
  yellow: '#F6D868',
  pink: '#F5B8DA',
  orange: '#FABE81',
} as const;

export type ThemeColor = (typeof ThemeColors)[keyof typeof ThemeColors];
