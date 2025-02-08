export const boardColors = {
  blue: '#0066FF', // Jasny niebieski
  purple: '#6B4EFF', // Fioletowy
  pink: '#FF4E8C', // Różowy
  orange: '#FF8A4E', // Pomarańczowy
  green: '#4ECB71', // Zielony
  teal: '#4ECBFF', // Turkusowy
  indigo: '#4E55FF', // Indygo
  red: '#FF4E4E', // Czerwony
} as const;

export type BoardColor = (typeof boardColors)[keyof typeof boardColors];
