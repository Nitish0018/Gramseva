// Local persistence for crop health analysis history using localStorage
// Keeps data client-side; swap implementations to backend later if needed.

import type { CropHealthAnalysisRecord } from '../types';

const STORAGE_KEY = 'cropHealthAnalysisHistory:v1';

function loadAll(): CropHealthAnalysisRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function saveAll(items: CropHealthAnalysisRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    // Storage may be full or unavailable; ignore silently for now
    // In production, consider surfacing a non-blocking toast
    console.warn('Failed to persist analysis history:', e);
  }
}

export function addRecord(record: CropHealthAnalysisRecord) {
  const items = loadAll();
  items.unshift(record);
  // cap to last 20 entries to avoid unbounded growth
  saveAll(items.slice(0, 20));
}

export function getRecords(): CropHealthAnalysisRecord[] {
  return loadAll();
}

export function clearRecords() {
  saveAll([]);
}
