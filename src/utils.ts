/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper to get local date-time string for input fields (YYYY-MM-DDTHH:MM)
export function getLocalDateTimeString(dateObj: Date = new Date()): string {
  const tzoffset = dateObj.getTimezoneOffset() * 60000; // offset in milliseconds
  const localISOTime = new Date(dateObj.getTime() - tzoffset).toISOString().slice(0, 16);
  return localISOTime;
}

// Helper to format date string into human-readable format
export function formatDateTime(isoString: string): string {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return isoString;
  }
}

// Parser for Zone String (e.g. "J01KB2655 - LOKENATH CABLE TV NETWORK-J01KB2655")
// Extracts zone code like "J01KB2655"
export function extractZoneCode(zoneString: string): string {
  if (!zoneString) return '';
  const match = zoneString.match(/J\d+KB\d+/i) || zoneString.match(/[A-Z0-9]+/i);
  return match ? match[0].toUpperCase() : zoneString.split('-')[0].trim();
}

// LocalStorage helpers with type safety
export function loadState<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved) as T;
    }
  } catch (err) {
    console.error(`Error loading localStorage key "${key}":`, err);
  }
  return defaultValue;
}

export function saveState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving localStorage key "${key}":`, err);
  }
}

// Shared List of sample zones for realistic dropdown auto-populations
export const SAMPLE_ZONES = [
  'J01KB2655 - LOKENATH CABLE TV NETWORK-J01KB2655',
  'J01KB803 - MONORANJAN CABLE-R. KAMALAKAR RAO-J01KB803',
  'J01KB4831 - RAHUL BROADBAND SERVICES-J01KB4831',
  'J01KB2526 - ASMI CABLE & BROADBAND SERVICE-J01KB2526',
  'J01KB1055 - NEW ALIPORE NETWORKS-J01KB1055',
  'J01KB1202 - SOUTH CALCUTTA OPERATORS-J01KB1202',
  'J01KB9904 - METRO FIBER LINK-J01KB9904'
];

// Identifiers placeholders and suggestions for Network Incidents
export const SWITCH_SUGGESTIONS = ['172.16.52.15ROBSWSAATMILE', '172.16.88.20KHARDAHSW01', '172.16.12.99SECVSW05'];
export const OLT_SUGGESTIONS = [
  '10.27.137.254ROBOLTKRUSHNACHANDRAPANIGRAHI-J01BB1377',
  '10.27.140.25OBLTSALTLAKE-J01BB1400',
  '10.27.99.1ROBOLTKOLKATA-J01BB0099'
];
export const NAS_SUGGESTIONS = ['NAS HERIA-172.31.12.241', 'NAS SECTORV-172.31.50.2', 'NAS SOUTH-172.31.20.10'];

// Simple lightweight Client-side Toast notification system
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
