const RESEARCH_PROMPT = `Below are my scratch notes. Please do any research needed to explain anything I'm trying to learn, investigate, or figure out.

Keep your findings simple and brief, and leave room for me to ask follow-up questions.

--- NOTES ---`;

export function buildResearchPrompt(notes: string): string {
  return `${RESEARCH_PROMPT}\n${notes}`;
}
