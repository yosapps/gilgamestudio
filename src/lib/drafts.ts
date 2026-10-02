import { richDocument } from './validation';
import type { RichNode } from './types';
export type DraftData = { fields: Record<string, string>; content: RichNode };
export type Draft = {
  version: 1;
  key: string;
  savedAt: number;
  baseUpdatedAt: string;
  data: DraftData;
};
export const draftLifetime = 7 * 24 * 60 * 60 * 1000;
export function parseDraft(
  raw: string | null,
  key: string,
  now = Date.now(),
): Draft | null {
  if (!raw || raw.length > 1_200_000) return null;
  try {
    const value = JSON.parse(raw);
    if (
      value.version !== 1 ||
      value.key !== key ||
      typeof value.savedAt !== 'number' ||
      !Number.isFinite(value.savedAt) ||
      value.savedAt > now + 60_000 ||
      now - value.savedAt > draftLifetime ||
      typeof value.baseUpdatedAt !== 'string'
    )
      return null;
    const data = value.data;
    if (
      !data ||
      !data.fields ||
      typeof data.fields !== 'object' ||
      Array.isArray(data.fields) ||
      !Object.values(data.fields).every((field) => typeof field === 'string') ||
      !richDocument.safeParse(data.content).success
    )
      return null;
    return value as Draft;
  } catch {
    return null;
  }
}
