// ============================================================
// dataAnalysis.js – Core statistics and tracking logic
// ============================================================

import { TRACKED_STATUSES } from './constants.js';

/**
 * Extracts occupancy statistics from a Unit List (array of row objects).
 * Filters out ZZ accounts, counts statuses per unit type.
 * @param {Array} rows - Array of objects from PapaParse (header: true)
 * @param {string} facilityId - '1CL' or '4B' (for tracker)
 * @returns {Object} - {
 *   overall: { status: percentage },
 *   overallCounts: { status: count },
 *   perType: { unitType: { status: percentage } },
 *   perTypeTotals: { unitType: total },
 *   perTypeCounts: { unitType: { status: count } },
 *   total: number, // valid (non-ZZ) rows
 *   rawCount: number, // total rows
 *   zzCount: number,
 *   unavailableUnits: [ { unit, type, facility } ]
 * }
 */
export function extractStatsFromUnitList(rows, facilityId) {
  let validRows = rows.filter(r => {
    const customer = r['Customer'] ? r['Customer'].toUpperCase() : '';
    return !customer.includes('ZZ');
  });
  let totalValid = validRows.length;
  let overallCounts = {}, perTypeCounts = {}, perTypeTotals = {};
  validRows.forEach(row => {
    const rawStatus = row['Status'] ? row['Status'].toLowerCase().trim() : '';
    const status = rawStatus.replace(/_/g, ' ');
    const unitType = row['Unit Type'] ? row['Unit Type'].trim() : 'Unknown';
    overallCounts[status] = (overallCounts[status] || 0) + 1;
    if (!perTypeTotals[unitType]) { perTypeTotals[unitType] = 0; perTypeCounts[unitType] = {}; }
    perTypeTotals[unitType]++;
    perTypeCounts[unitType][status] = (perTypeCounts[unitType][status] || 0) + 1;
  });
  let overallPct = {};
  TRACKED_STATUSES.forEach(s => {
    overallPct[s] = totalValid > 0 && overallCounts[s] ? Math.round((overallCounts[s] / totalValid) * 100) : 0;
  });
  let perTypePct = {};
  for (let ut in perTypeTotals) {
    perTypePct[ut] = {};
    TRACKED_STATUSES.forEach(s => {
      perTypePct[ut][s] = perTypeCounts[ut][s] ? Math.round((perTypeCounts[ut][s] / perTypeTotals[ut]) * 100) : 0;
    });
  }
  const unavailableUnits = rows.filter(r => {
    const status = r['Status'] ? r['Status'].toLowerCase().trim().replace(/_/g, ' ') : '';
    return status === 'unavailable';
  }).map(r => ({
    unit: r['Unit'] || 'Unknown',
    type: r['Unit Type'] || 'Unknown',
    facility: facilityId
  }));

  return {
    overall: overallPct,
    overallCounts: overallCounts,
    perType: perTypePct,
    perTypeTotals: perTypeTotals,
    perTypeCounts: perTypeCounts,
    total: totalValid,
    rawCount: rows.length,
    zzCount: rows.length - totalValid,
    unavailableUnits: unavailableUnits
  };
}

/**
 * Updates the unavailable unit tracker based on the latest results.
 * @param {string} facilityId - '1CL' or '4B'
 * @param {Object} results - The results object for that facility (from extractStatsFromUnitList)
 * @param {Object} tracker - The tracker object to mutate (e.g., unavailableTracker)
 * @param {string} today - ISO date string (YYYY-MM-DD)
 */
export function updateUnavailableTracker(facilityId, results, tracker, today) {
  const units = results.unavailableUnits || [];
  units.forEach(u => {
    const key = facilityId + '_' + u.unit;
    if (!tracker[key]) {
      tracker[key] = { reason: 'Pending', startDate: today };
    }
  });
  // Remove units that are no longer unavailable
  const activeKeys = units.map(u => facilityId + '_' + u.unit);
  Object.keys(tracker).forEach(k => {
    if (k.startsWith(facilityId + '_') && !activeKeys.includes(k)) {
      delete tracker[k];
    }
  });
}

/**
 * Helper: calculate days since a date string.
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @returns {number}
 */
export function getDaysSince(dateStr) {
  const start = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

/**
 * Helper: generate a timestamp string.
 * @returns {string}
 */
export function recordTimestamp() {
  const now = new Date();
  return now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
}
