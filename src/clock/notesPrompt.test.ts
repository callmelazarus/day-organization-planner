import { describe, expect, test } from 'vitest';
import { buildResearchPrompt } from './notesPrompt';

describe('buildResearchPrompt', () => {
  test('puts the instructions before the notes', () => {
    const result = buildResearchPrompt('what is a monad');
    expect(result).toMatch(/scratch notes/i);
    expect(result.endsWith('what is a monad')).toBe(true);
  });

  test('asks for brief findings and allows follow-ups', () => {
    const result = buildResearchPrompt('x');
    expect(result).toMatch(/brief/i);
    expect(result).toMatch(/follow-up/i);
  });
});
