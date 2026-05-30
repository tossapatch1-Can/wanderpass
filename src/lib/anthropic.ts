// Anthropic Claude API client — server-side only.
// Used in /api/itinerary/route.ts to generate Trip Planner itineraries.

import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Model recommendation for the classroom: Haiku 4.5 is fast + cheap.
// Switch to Sonnet 4.6 if you want better reasoning.
export const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
