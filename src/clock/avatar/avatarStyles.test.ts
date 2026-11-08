import { describe, expect, test } from 'vitest';
import { AVATAR_STYLES, DEFAULT_AVATAR_ID, getAvatarStyle, isAvatarId } from './avatarStyles';

describe('avatar styles', () => {
  test('offers guy, gal and ninja', () => {
    expect(AVATAR_STYLES.map((s) => s.id)).toEqual(['guy', 'gal', 'ninja']);
  });

  test('the default is the original guy', () => {
    expect(DEFAULT_AVATAR_ID).toBe('guy');
  });

  test('isAvatarId accepts known ids only', () => {
    expect(isAvatarId('ninja')).toBe(true);
    expect(isAvatarId('wizard')).toBe(false);
    expect(isAvatarId(null)).toBe(false);
  });

  test('getAvatarStyle returns the style for an id', () => {
    expect(getAvatarStyle('gal').label).toBe('Gal');
  });
});
