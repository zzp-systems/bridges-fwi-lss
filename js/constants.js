// ============================================================
// constants.js – Shared constants used across the app
// ============================================================

export const TRACKED_STATUSES = [
  'rented',
  'locked out',
  'unavailable',
  'moving out',
  'available',
  'auction',
  'reserved (marketplace)',
  'reserved'
];

export const KPI_KEYS = ['rented', 'locked out', 'unavailable', 'moving out', 'available'];

export const KPI_LABELS = {
  rented: 'Rented',
  'locked out': 'Locked Out',
  unavailable: 'Unavailable',
  'moving out': 'Moving Out',
  available: 'Available'
};

export const STATUS_DISPLAY = {
  rented: 'Rented',
  'locked out': 'Locked Out',
  unavailable: 'Unavailable',
  'moving out': 'Moving Out',
  available: 'Available',
  auction: 'Auction',
  'reserved (marketplace)': 'Reserved (Marketplace)',
  reserved: 'Reserved'
};
