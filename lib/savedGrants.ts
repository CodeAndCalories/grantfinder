const STORAGE_KEY = "savedGrantIds";

export function getSavedGrantIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGrantId(id: string): void {
  const ids = getSavedGrantIds();
  if (!ids.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, id]));
  }
}

export function unsaveGrantId(id: string): void {
  const ids = getSavedGrantIds().filter((i) => i !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function isGrantSaved(id: string): boolean {
  return getSavedGrantIds().includes(id);
}

export function toggleSavedGrant(id: string): boolean {
  if (isGrantSaved(id)) {
    unsaveGrantId(id);
    return false;
  } else {
    saveGrantId(id);
    return true;
  }
}
