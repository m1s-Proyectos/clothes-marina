const SESSION_KEY = "cm_rating_session_id";
const VOTES_KEY = "cm_rating_votes";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Persistent anonymous session for rating deduplication (until auth exists). */
export function getRatingSessionId(): string {
  if (!canUseStorage()) return crypto.randomUUID();

  const existing = localStorage.getItem(SESSION_KEY);
  if (existing && existing.length >= 16) return existing;

  const id = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, id);
  return id;
}

function readVoteCache(): Record<string, number> {
  if (!canUseStorage()) return {};
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function getCachedProductRating(productId: string): number | null {
  const rating = readVoteCache()[productId];
  return typeof rating === "number" && rating >= 1 && rating <= 5 ? rating : null;
}

export function cacheProductRating(productId: string, rating: number): void {
  if (!canUseStorage()) return;
  const votes = readVoteCache();
  votes[productId] = rating;
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}
