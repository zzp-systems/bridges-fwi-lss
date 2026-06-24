// ============================================================
// fileHandlers.js – File parsing, CSV/XLSX ingestion
// ============================================================
// Assumes Papa (PapaParse) and XLSX (SheetJS) are globally available
// via CDN in the host HTML.

/**
 * Processes baseline CSV rows (from PapaParse) and populates a baseline object.
 * @param {Array} rows - Array of row objects from PapaParse
 * @param {Object} baseline - The baseline object to mutate (e.g., datasets.baseline)
 */
export function processBaselineRows(rows, baseline) {
  rows.forEach(r => {
    const facVal = r['Facility'] ? r['Facility'].toUpperCase().trim() : '';
    if (facVal === '1CL' || facVal === '4B') {
      baseline[facVal] = {
        rented: Math.round(Number(r['Rented']) || 0),
        'locked out': Math.round(Number(r['Locked Out']) || 0),
        unavailable: Math.round(Number(r['Unavailable']) || 0),
        'moving out': Math.round(Number(r['Moving Out']) || 0),
        available: Math.round(Number(r['Available']) || 0)
      };
    }
  });
}

/**
 * Parses an Excel baseline sheet (array of rows from XLSX) and populates baseline.
 * @param {Array} rows - 2D array from XLSX.utils.sheet_to_json(..., {header:1})
 * @param {Object} baseline - The baseline object to mutate
 */
export function parseBaselineExcel(rows, baseline) {
  if (!rows || rows.length < 2) return;
  const headers = rows[0].map(h => String(h).trim().toLowerCase());
  const facIdx = headers.indexOf('facility');
  const rentIdx = headers.indexOf('rented');
  const lockIdx = headers.indexOf('locked out');
  const unavailIdx = headers.indexOf('unavailable');
  const moveIdx = headers.indexOf('moving out');
  const availIdx = headers.indexOf('available');
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;
    const facVal = String(r[facIdx]).toUpperCase().trim();
    if (facVal === '1CL' || facVal === '4B') {
      baseline[facVal] = {
        rented: Math.round(Number(r[rentIdx]) || 0),
        'locked out': Math.round(Number(r[lockIdx]) || 0),
        unavailable: Math.round(Number(r[unavailIdx]) || 0),
        'moving out': Math.round(Number(r[moveIdx]) || 0),
        available: Math.round(Number(r[availIdx]) || 0)
      };
    }
  }
}

/**
 * Processes a multi-tab Excel workbook and extracts the relevant sheets.
 * Returns an object with parsed data (no side effects).
 * @param {Object} workbook - The workbook object from XLSX.read()
 * @param {string} fileName - Name of the file (for logging, unused but kept for consistency)
 * @returns {Object} - { foundListCL, foundListBMT, foundStatusCL, foundStatusBMT, foundBaseline,
 *                       clList, bmtList, clStatus, bmtStatus, baselineFile, baselineVals }
 *         where baselineVals is { '1CL': {...}, '4B': {...} } or null
 */
export function processExcelWorkbookHTML(workbook, fileName) {
  let foundListCL = false, foundListBMT = false, foundStatusCL = false, foundStatusBMT = false, foundBaseline = false;
  let clList = "", bmtList = "", clStatus = "", bmtStatus = "", baselineFile = "";
  let baselineVals = null;

  workbook.SheetNames.forEach(sheetName => {
    const cleanName = sheetName.trim().toLowerCase();
    const sheet = workbook.Sheets[sheetName];
    if (cleanName === '1 cl unit list' || cleanName === '1cl unit list') {
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const limitedRows = rows.map(r => { const nr = []; for (let c=0; c<8; c++) nr.push(r[c]===undefined?"":r[c]); return nr; });
      clList = Papa.unparse(limitedRows);
      foundListCL = true;
    } else if (cleanName === '4b unit list') {
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const limitedRows = rows.map(r => { const nr = []; for (let c=0; c<8; c++) nr.push(r[c]===undefined?"":r[c]); return nr; });
      bmtList = Papa.unparse(limitedRows);
      foundListBMT = true;
    } else if (cleanName === '1 cl per unit (status)' || cleanName === '1cl per unit status' || cleanName === '1cl per unit (status)') {
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const limitedRows = [];
      for (let r=0; r<26; r++) {
        const row = rows[r] || [];
        const nr = [];
        for (let c=0; c<14; c++) nr.push(row[c]===undefined?"":row[c]);
        limitedRows.push(nr);
      }
      clStatus = Papa.unparse(limitedRows);
      foundStatusCL = true;
    } else if (cleanName === '4b per unit (status)' || cleanName === '4b per unit status') {
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const limitedRows = [];
      for (let r=0; r<15; r++) {
        const row = rows[r] || [];
        const nr = [];
        for (let c=0; c<14; c++) nr.push(row[c]===undefined?"":row[c]);
        limitedRows.push(nr);
      }
      bmtStatus = Papa.unparse(limitedRows);
      foundStatusBMT = true;
    } else if (cleanName === 'baseline' || cleanName === 'baseline occupancy' || cleanName === 'fwi_lss_baseline') {
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      if (rows.length > 1) {
        const headers = rows[0].map(h => String(h).trim().toLowerCase());
        const facIdx = headers.indexOf('facility');
        const rentIdx = headers.indexOf('rented');
        const lockIdx = headers.indexOf('locked out');
        const unavailIdx = headers.indexOf('unavailable');
        const moveIdx = headers.indexOf('moving out');
        const availIdx = headers.indexOf('available');
        const tempBaseline = {};
        for (let i=1; i<rows.length; i++) {
          const r = rows[i];
          if (!r || r.length === 0) continue;
          const facVal = String(r[facIdx]).toUpperCase().trim();
          if (facVal === '1CL' || facVal === '4B') {
            tempBaseline[facVal] = {
              rented: Math.round(Number(r[rentIdx]) || 0),
              'locked out': Math.round(Number(r[lockIdx]) || 0),
              unavailable: Math.round(Number(r[unavailIdx]) || 0),
              'moving out': Math.round(Number(r[moveIdx]) || 0),
              available: Math.round(Number(r[availIdx]) || 0)
            };
          }
        }
        baselineVals = tempBaseline;
        baselineFile = Papa.unparse(rows);
        foundBaseline = true;
      }
    }
  });

  return {
    foundListCL, foundListBMT, foundStatusCL, foundStatusBMT, foundBaseline,
    clList, bmtList, clStatus, bmtStatus, baselineFile, baselineVals
  };
}
