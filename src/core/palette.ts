/** The whole game is built from one deliberately small palette. */
export const P = {
  // Night exterior
  night0: '#05070f',
  night1: '#0a0f1f',
  night2: '#101733',
  night3: '#182347',
  night4: '#22315e',

  // Warm carriage interior
  amber0: '#3a2a17',
  amber1: '#6b4a1f',
  amber2: '#a2762f',
  amber3: '#d9a441',
  amber4: '#f5d78e',

  // Woodwork and upholstery
  wood0: '#2a1c14',
  wood1: '#4a3021',
  wood2: '#6d4830',
  velvet0: '#3a1f2c',
  velvet1: '#5c2f3f',
  velvet2: '#7d4054',

  // Neutrals
  ink: '#05060c',
  slate0: '#1a2036',
  slate1: '#2c3550',
  slate2: '#48557a',
  slate3: '#7d8ab0',
  paper: '#e8e2d0',
  paperDim: '#b9b2a0',
  white: '#fdfbf4',

  // Signals
  red: '#c8453f',
  redSoft: '#e5726c',
  green: '#5fa860',
  glass: '#31507a',

  // Mind Reconstruction
  indigo0: '#0d0722',
  indigo1: '#1a0f3d',
  indigo2: '#2b1a63',
  violet0: '#4a2a94',
  violet1: '#6f45c4',
  violet2: '#a382e8',
  violet3: '#d6c6ff',
} as const;

export function toInt(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}
