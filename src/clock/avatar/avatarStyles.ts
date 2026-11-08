export type AvatarId = 'guy' | 'gal' | 'ninja';

export interface AvatarStyle {
  id: AvatarId;
  label: string;
  hair: string;
  body: string;
  pants: string;
  band?: string;
  skirt?: string;
  longHair?: boolean;
  /** Hides the lower face behind the hair/hood color, leaving only an eye strip. */
  mask?: boolean;
  /** Draws arms in the body color, with just the hands showing. */
  sleeves?: boolean;
}

export const AVATAR_STYLES: AvatarStyle[] = [
  { id: 'guy', label: 'Guy', hair: 'h', body: 'b', pants: 'p' },
  { id: 'gal', label: 'Gal', hair: '#9a3412', body: '#ec4899', pants: 's', skirt: '#7c3aed', longHair: true },
  { id: 'ninja', label: 'Ninja', hair: 'k', body: 'k', pants: 'k', band: 'r', mask: true, sleeves: true },
];

export const DEFAULT_AVATAR_ID: AvatarId = 'guy';

export function isAvatarId(value: unknown): value is AvatarId {
  return AVATAR_STYLES.some((style) => style.id === value);
}

export function getAvatarStyle(id: AvatarId): AvatarStyle {
  return AVATAR_STYLES.find((style) => style.id === id) ?? AVATAR_STYLES[0];
}
