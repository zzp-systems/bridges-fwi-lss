// ============================================================
// storage.js – Persistence helpers (localStorage)
// ============================================================

const BASELINE_KEY = 'fwi_lss_baseline';
const BASELINE_PER_TYPE_KEY = 'fwi_lss_baseline_pertype';
const TRACKER_KEY = 'fwi_lss_unit_tracker';

/**
 * Load the unit tracker from localStorage.
 * @returns {Object} - The tracker object (empty if none)
 */
export function loadTracker() {
  try {
    const raw = localStorage.getItem(TRACKER_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch(e) {
    return {};
  }
}

/**
 * Save the unit tracker to localStorage.
 * @param {Object} tracker
 */
export function saveTracker(tracker) {
  try {
    localStorage.setItem(TRACKER_KEY, JSON.stringify(tracker));
  } catch(e) {}
}

/**
 * Load the baseline (overall percentages) from localStorage.
 * @returns {Object} - { '1CL': {...}, '4B': {...} } or {}
 */
export function loadBaseline() {
  try {
    const raw = localStorage.getItem(BASELINE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch(e) {
    return {};
  }
}

/**
 * Load the per-type baseline from localStorage.
 * @returns {Object} - { '1CL': { unitType: { rented, total } }, ... }
 */
export function loadBaselinePerType() {
  try {
    const raw = localStorage.getItem(BASELINE_PER_TYPE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch(e) {
    return {};
  }
}

/**
 * Save both overall and per-type baselines.
 * @param {Object} baseline - { '1CL': {...}, '4B': {...} }
 * @param {Object} baselinePerType - { '1CL': { unitType: { rented, total } }, ... }
 */
export function saveBaseline(baseline, baselinePerType) {
  try {
    localStorage.setItem(BASELINE_KEY, JSON.stringify(baseline));
    localStorage.setItem(BASELINE_PER_TYPE_KEY, JSON.stringify(baselinePerType));
  } catch(e) {}
}

/**
 * Clear all stored data (baseline and tracker) from localStorage.
 */
export function clearAllStoredData() {
  try {
    localStorage.removeItem(BASELINE_KEY);
    localStorage.removeItem(BASELINE_PER_TYPE_KEY);
    localStorage.removeItem(TRACKER_KEY);
  } catch(e) {}
}
