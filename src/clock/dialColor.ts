import { darkenHex } from './color';
import type { DialType } from './types';

export const DIAL_ACCENT_COLOR: Record<DialType, string> = {
  daytime: '#f5b942',
  nighttime: '#6c63ff',
};

const OUTLINE_DARKEN_FACTOR = 0.5;

export const DIAL_OUTLINE_COLOR: Record<DialType, string> = {
  daytime: darkenHex(DIAL_ACCENT_COLOR.daytime, OUTLINE_DARKEN_FACTOR),
  nighttime: darkenHex(DIAL_ACCENT_COLOR.nighttime, OUTLINE_DARKEN_FACTOR),
};
