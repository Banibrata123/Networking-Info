/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NetworkIncident, UserSession } from '../types';
import {
  getLocalDateTimeString,
  formatDateTime,
  extractZoneCode,
  SAMPLE_ZONES,
  SWITCH_SUGGESTIONS,
  OLT_SUGGESTIONS,
  NAS_SUGGESTIONS
} from '../utils';
import TablePagination from './TablePagination';
import {
  Plus,
  Edit3,
  Eye,
  Search,
  AlertCircle,
  Info,
  X,
  Check,
  Activity,
  Wifi,
  Server,
  Cpu,
  Radio,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import NetworkIncidentCarousel from './NetworkIncidentCarousel';
import IncidentDensityMap from './IncidentDensityMap';

interface Props {
  incidents: NetworkIncident[];
  onAdd: (item: Omit<NetworkIncident, 'id' | 'addedBy'>) => void;
  onUpdate: (id: string, item: Partial<NetworkIncident>) => void;
  onDelete?: (id: string) => void;
  currentUser: UserSession;
}

function getCurrentTimeFormatted(): string {
  const now = new Date();
  let hr = now.getHours();
  const min = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');
  const meridian = hr >= 12 ? 'PM' : 'AM';
  hr = hr % 12;
  hr = hr ? hr : 12; // the hour '0' should be '12'
  const hrStr = String(hr).padStart(2, '0');
  return `${hrStr}:${min}:${sec} ${meridian}`;
}

function parseTimeComponents(timeStr: string) {
  if (!timeStr) {
    return { hour: '12', minute: '00', second: '00', meridian: 'AM' };
  }
  
  // Try matching hh:mm:ss AM/PM first (with or without spaces before AM/PM)
  const fullMatch = timeStr.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})\s*(AM|PM|am|pm)?$/i);
  if (fullMatch) {
    let hr = parseInt(fullMatch[1], 10);
    const min = String(parseInt(fullMatch[2], 10)).padStart(2, '0');
    const sec = String(parseInt(fullMatch[3], 10)).padStart(2, '0');
    let meridian = (fullMatch[4] || 'AM').toUpperCase();
    
    // Normalize hour
    if (hr > 12) {
      hr = hr - 12;
      meridian = 'PM';
    } else if (hr === 0) {
      hr = 12;
      meridian = 'AM';
    }
    const hrStr = String(hr).padStart(2, '0');
    return { hour: hrStr, minute: min, second: sec, meridian };
  }
  
  // Try matching hh:mm AM/PM or 24-hour hh:mm
  const shortMatch = timeStr.match(/^(\d{1,2}):(\d{1,2})\s*(AM|PM|am|pm)?$/i);
  if (shortMatch) {
    let hr = parseInt(shortMatch[1], 10);
    const min = String(parseInt(shortMatch[2], 10)).padStart(2, '0');
    const sec = '00';
    let meridian = (shortMatch[3] || '').toUpperCase();
    
    if (meridian) {
      const hrStr = String(hr).padStart(2, '0');
      return { hour: hrStr, minute: min, second: sec, meridian };
    } else {
      // 24-hour format
      if (hr >= 12) {
        meridian = 'PM';
        hr = hr > 12 ? hr - 12 : hr;
      } else {
        meridian = 'AM';
        hr = hr === 0 ? 12 : hr;
      }
      const hrStr = String(hr).padStart(2, '0');
      return { hour: hrStr, minute: min, second: sec, meridian };
    }
  }
  
  return { hour: '12', minute: '00', second: '00', meridian: 'AM' };
}

export default function NetworkIncidentView({ incidents, onAdd, onUpdate, onDelete, currentUser }: Props) {
  // Form States
  const [date, setDate] = useState(getLocalDateTimeString());
  const [downtime, setDowntime] = useState(getCurrentTimeFormatted());
  const [uptime, setUptime] = useState('');
  const [type, setType] = useState<NetworkIncident['type']>('Zone');
  const [identifier, setIdentifier] = useState('');
  const [zoneSelect, setZoneSelect] = useState('');
  const [zoneCode, setZoneCode] = useState('');
  const [pop, setPop] = useState('');
  const [problem, setProblem] = useState('');
  const [status, setStatus] = useState<NetworkIncident['status']>('Open');

  // Timetable preset helpers
  const [showUptimeTable, setShowUptimeTable] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // View Modal State
  const [viewingItem, setViewingItem] = useState<NetworkIncident | null>(null);

  // Hour, Minute, Second, Meridian states for Downtime dropdowns
  const [dtHour, setDtHour] = useState('12');
  const [dtMinute, setDtMinute] = useState('00');
  const [dtSecond, setDtSecond] = useState('00');
  const [dtMeridian, setDtMeridian] = useState('AM');

  // Synchronize dropdowns with downtime string changes from outside (e.g. edit, preset, "Now")
  useEffect(() => {
    const { hour, minute, second, meridian } = parseTimeComponents(downtime);
    setDtHour(hour);
    setDtMinute(minute);
    setDtSecond(second);
    setDtMeridian(meridian);
  }, [downtime]);

  // Helper to update downtime state from parts
  const handleDowntimeChange = (h: string, m: string, s: string, mer: string) => {
    setDowntime(`${h}:${m}:${s} ${mer}`);
  };

  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAddedBy, setFilterAddedBy] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Auto-populate Zone Code when Type = 'Zone'
  useEffect(() => {
    if (type === 'Zone') {
      if (zoneSelect) {
        setZoneCode(extractZoneCode(zoneSelect));
      }
    } else {
      setZoneCode('');
      setPop('');
    }
  }, [type, zoneSelect]);

  // Set default identifier recommendations when Type changes
  useEffect(() => {
    if (type === 'Switch') setIdentifier(SWITCH_SUGGESTIONS[0]);
    else if (type === 'OLT') setIdentifier(OLT_SUGGESTIONS[0]);
    else if (type === 'NAS') setIdentifier(NAS_SUGGESTIONS[0]);
    else setIdentifier('');
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!date) return alert('Date is mandatory');
    if (!downtime) return alert('Downtime is mandatory');
    if (!problem) return alert('Problem is mandatory');
    if (type === 'Zone') {
      if (!pop) return alert('POP is mandatory for Zone incidents');
    } else if (type !== 'Major Issue') {
      if (!identifier) return alert('Identifier is mandatory for ' + type);
    }

    const payload = {
      date,
      downtime,
      uptime: uptime || 'Pending',
      type,
      identifier: type === 'Zone' || type === 'Major Issue' ? '' : identifier,
      zoneCode: type === 'Zone' ? zoneCode : '',
      pop: type === 'Zone' ? pop : '',
      problem,
      status
    };

    if (editingId) {
      onUpdate(editingId, payload);
      setEditingId(null);
    } else {
      onAdd(payload);
    }

    // Reset Form
    resetForm();
  };

  const safeScrollToForm = (formId: string) => {
    try {
      const formEl = document.getElementById(formId);
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const firstInput = formEl.querySelector('input, select, textarea') as HTMLElement;
        if (firstInput) {
          firstInput.focus();
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      console.warn('Scroll/Focus failed:', e);
      try {
        window.scrollTo(0, 0);
      } catch (err) {}
    }
  };

  const startEdit = (item: NetworkIncident) => {
    setEditingId(item.id);
    setDate(item.date);
    setDowntime(item.downtime);
    setUptime(item.uptime === 'Pending' ? '' : (item.uptime || ''));
    setType(item.type);
    if (item.type === 'Zone') {
      setPop(item.pop || '');
      setZoneCode(item.zoneCode || '');
      const matchingZone = SAMPLE_ZONES.find(z => extractZoneCode(z) === item.zoneCode);
      setZoneSelect(matchingZone || item.zoneCode || '');
    } else {
      setIdentifier(item.identifier || '');
    }
    setProblem(item.problem);
    setStatus(item.status);
    safeScrollToForm('incident-form');
  };

  const resetForm = () => {
    setEditingId(null);
    setDate(getLocalDateTimeString());
    setDowntime(getCurrentTimeFormatted());
    setUptime('');
    setType('Zone');
    setIdentifier('');
    setZoneSelect('');
    setZoneCode('');
    setPop('');
    setProblem('');
    setStatus('Open');
  };

  // Filter & Search Logic
  const filteredIncidents = incidents.filter((item) => {
    if (filterDate && !item.date.startsWith(filterDate)) return false;
    if (filterType && item.type !== filterType) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    if (filterAddedBy && !item.addedBy.toLowerCase().includes(filterAddedBy.toLowerCase())) return false;

    if (globalSearch) {
      const search = globalSearch.toLowerCase();
      const matchSearch =
        item.problem.toLowerCase().includes(search) ||
        item.type.toLowerCase().includes(search) ||
        (item.identifier && item.identifier.toLowerCase().includes(search)) ||
        (item.zoneCode && item.zoneCode.toLowerCase().includes(search)) ||
        (item.pop && item.pop.toLowerCase().includes(search)) ||
        item.addedBy.toLowerCase().includes(search);
      if (!matchSearch) return false;
    }
    return true;
  }).sort((a, b) => {
    const timeA = a.createdTime ? new Date(a.createdTime).getTime() : new Date(a.date).getTime();
    const timeB = b.createdTime ? new Date(b.createdTime).getTime() : new Date(b.date).getTime();
    return timeB - timeA;
  });

  // Pagination Logic
  const totalItems = filteredIncidents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedIncidents = filteredIncidents.slice(
    (activePage - 1) * rowsPerPage,
    activePage * rowsPerPage
  );

  // Sync state if out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalItems, rowsPerPage, totalPages, currentPage]);

  // Dynamic metrics calculations for Statistics cards
  const todayStr = new Date().toISOString().split('T')[0];
  const todayIncidents = incidents.filter((i) => i.date.includes(todayStr));
  const zoneOutages = incidents.filter((i) => i.type === 'Zone');
  const switchOutages = incidents.filter((i) => i.type === 'Switch');
  const nasFailures = incidents.filter((i) => i.type === 'NAS');
  const oltBreakdowns = incidents.filter((i) => i.type === 'OLT');

  return (
    <div className="space-y-6" id="network-incident-view-module">
      {/* 1. Network Interactive Animated Carousel */}
      <NetworkIncidentCarousel incidents={incidents} />

      {/* 2. Dynamic statistics cards, each animating on load */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="incident-stats-grid">
        {/* Card 1: Today's Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="stat-card-today"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Incidents</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {todayIncidents.length}
            </span>
            <span className="text-[10px] text-emerald-500 font-semibold">Logged</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {todayIncidents.filter(i => i.status === 'Open').length} currently active
          </p>
        </motion.div>

        {/* Card 2: Total Zone Outage */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="stat-card-zone"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zone Outages</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {zoneOutages.length}
            </span>
            <span className="text-[10px] text-amber-600 font-semibold">Total</span>
          </div>
          <p className="text-[10px] text-amber-500 font-semibold mt-1">
            {zoneOutages.filter(i => i.status === 'Open').length} currently open
          </p>
        </motion.div>

        {/* Card 3: Total Switch Outage */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="stat-card-switch"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Outages</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {switchOutages.length}
            </span>
            <span className="text-[10px] text-rose-600 font-semibold">Total</span>
          </div>
          <p className="text-[10px] text-rose-500 font-semibold mt-1">
            {switchOutages.filter(i => i.status === 'Open').length} currently open
          </p>
        </motion.div>

        {/* Card 4: Total NAS Failure */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="stat-card-nas"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NAS Failures</span>
            <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {nasFailures.length}
            </span>
            <span className="text-[10px] text-sky-600 font-semibold">Total</span>
          </div>
          <p className="text-[10px] text-sky-500 font-semibold mt-1">
            {nasFailures.filter(i => i.status === 'Open').length} currently open
          </p>
        </motion.div>

        {/* Card 5: Total OLT Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="stat-card-olt"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OLT Breakdowns</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {oltBreakdowns.length}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Total</span>
          </div>
          <p className="text-[10px] text-emerald-500 font-semibold mt-1">
            {oltBreakdowns.filter(i => i.status === 'Open').length} currently open
          </p>
        </motion.div>
      </div>

      {/* 2.5 Regional Incident Density Map Visualization */}
      <IncidentDensityMap incidents={incidents} />

      {/* 3. Add/Edit Form Card (MID ROW) */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200" id="network-incident-form-card">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5" id="form-header">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight" id="form-title">
              {editingId ? '✏️ Edit Network Incident' : '⚡ Log New Network Incident'}
            </h2>
            <p className="text-xs text-slate-500 mt-1" id="form-subtitle">
              Fill out all mandatory information regarding network core or client outages
            </p>
          </div>
          {editingId && (
            <button
              onClick={resetForm}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
              id="cancel-edit-btn"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" id="incident-form">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="form-grid-1">
            {/* Date & Time */}
            <div className="flex flex-col" id="field-date">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors"
                id="input-date"
              />
            </div>

            {/* Downtime */}
            <div className="flex flex-col relative" id="field-downtime">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Downtime <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="flex gap-1 items-center">
                {/* Hours select */}
                <div className="flex-1 flex flex-col min-w-0">
                  <select
                    value={dtHour}
                    onChange={(e) => handleDowntimeChange(e.target.value, dtMinute, dtSecond, dtMeridian)}
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-1.5 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors text-center font-mono cursor-pointer w-full"
                  >
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <span className="text-slate-300 font-bold">:</span>

                {/* Minutes select */}
                <div className="flex-1 flex flex-col min-w-0">
                  <select
                    value={dtMinute}
                    onChange={(e) => handleDowntimeChange(dtHour, e.target.value, dtSecond, dtMeridian)}
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-1.5 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors text-center font-mono cursor-pointer w-full"
                  >
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <span className="text-slate-300 font-bold">:</span>

                {/* Seconds select */}
                <div className="flex-1 flex flex-col min-w-0">
                  <select
                    value={dtSecond}
                    onChange={(e) => handleDowntimeChange(dtHour, dtMinute, e.target.value, dtMeridian)}
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-1.5 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors text-center font-mono cursor-pointer w-full"
                  >
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* AM/PM select */}
                <div className="w-16 flex flex-col ml-1">
                  <select
                    value={dtMeridian}
                    onChange={(e) => handleDowntimeChange(dtHour, dtMinute, dtSecond, e.target.value)}
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-1.5 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors text-center font-bold cursor-pointer w-full"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
              <input
                type="text"
                className="hidden"
                value={downtime}
                onChange={(e) => setDowntime(e.target.value)}
                required
                id="input-downtime"
              />
            </div>

            {/* Uptime */}
            <div className="flex flex-col relative" id="field-uptime">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Uptime</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const hrs = String(now.getHours()).padStart(2, '0');
                      const mins = String(now.getMinutes()).padStart(2, '0');
                      setUptime(`${hrs}:${mins}`);
                    }}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider cursor-pointer"
                  >
                    ⚡ Now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUptimeTable(!showUptimeTable);
                    }}
                    className="text-[10px] text-emerald-600 hover:text-emerald-800 font-bold uppercase tracking-wider cursor-pointer flex items-center gap-0.5"
                  >
                    📅 Timetable
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder="e.g. 11:45 AM or Pending"
                value={uptime}
                onChange={(e) => setUptime(e.target.value)}
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors"
                id="input-uptime"
              />
              {showUptimeTable && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-3 grid grid-cols-4 gap-1.5 animate-fadeIn">
                  <div className="col-span-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 border-b border-slate-100 pb-1">
                    Quick Operational Timetable
                  </div>
                  {['00:00', '02:00', '04:00', '06:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        setUptime(time);
                        setShowUptimeTable(false);
                      }}
                      className="text-xs py-1 px-1 hover:bg-slate-50 hover:text-indigo-600 border border-slate-100 rounded text-slate-700 font-mono text-center hover:border-slate-300 transition-all cursor-pointer"
                    >
                      {time}
                    </button>
                  ))}
                  <div className="col-span-4 flex justify-between items-center mt-1 pt-1.5 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400">Select hour slot</span>
                    <button
                      type="button"
                      onClick={() => setShowUptimeTable(false)}
                      className="text-[10px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="form-grid-2">
            {/* Type */}
            <div className="flex flex-col" id="field-type">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Incident Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NetworkIncident['type'])}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors"
                id="input-type"
              >
                <option value="Zone">Zone Outage</option>
                <option value="Switch">Switch Outage</option>
                <option value="NAS">NAS Failure</option>
                <option value="OLT">OLT Breakdown</option>
                <option value="Major Issue">Major Issue</option>
              </select>
            </div>

            {/* Conditional fields based on type */}
            {type === 'Zone' && (
              <>
                {/* Zone Code Auto-populator (Manual Input) */}
                <div className="flex flex-col" id="field-zone-select">
                  <label className="text-xs font-semibold text-slate-700 mb-1">
                    Zone Name / String <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={zoneSelect}
                    onChange={(e) => setZoneSelect(e.target.value)}
                    placeholder="e.g. J01KB2655 - LOKENATH CABLE TV NETWORK-J01KB2655"
                    required
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors"
                    id="input-zone-select"
                  />
                </div>

                {/* Editable Zone Code */}
                <div className="flex flex-col" id="field-zone-code">
                  <label className="text-xs font-semibold text-slate-700 mb-1">
                    Zone Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={zoneCode}
                    onChange={(e) => setZoneCode(e.target.value)}
                    placeholder="e.g. J01KB1234 (Type or Select above)"
                    required
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 font-mono focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors"
                    id="input-zone-code"
                  />
                </div>

                {/* POP field */}
                <div className="flex flex-col" id="field-pop">
                  <label className="text-xs font-semibold text-slate-700 mb-1">
                    POP Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lokenath Cable POP"
                    value={pop}
                    onChange={(e) => setPop(e.target.value)}
                    required
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors"
                    id="input-pop"
                  />
                </div>
              </>
            )}

            {/* Expose Identifier for Switch, NAS, OLT */}
            {(type === 'Switch' || type === 'NAS' || type === 'OLT') && (
              <div className="flex flex-col md:col-span-2" id="field-identifier">
                <label className="text-xs font-semibold text-slate-700 mb-1">
                  Device Identifier <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={`e.g. ${
                    type === 'Switch'
                      ? '172.16.52.15ROBSWSAATMILE'
                      : type === 'OLT'
                      ? '10.27.137.254ROBOLTKRUSHNACHANDRAPANIGRAHI-J01BB1377'
                      : 'NAS HERIA-172.31.12.241'
                  }`}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 font-mono focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors"
                  id="input-identifier"
                />
                {/* Suggestions Pills */}
                <div className="flex flex-wrap gap-1.5 mt-1.5" id="identifier-suggestions">
                  <span className="text-[10px] text-slate-400 self-center">Suggestions:</span>
                  {(type === 'Switch' ? SWITCH_SUGGESTIONS : type === 'OLT' ? OLT_SUGGESTIONS : NAS_SUGGESTIONS).map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setIdentifier(sug)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono transition-colors"
                    >
                      {sug.length > 25 ? sug.slice(0, 25) + '...' : sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex flex-col" id="field-status">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NetworkIncident['status'])}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors"
                id="input-status"
              >
                <option value="Open">🔴 Open / Active Outage</option>
                <option value="Closed">🟢 Closed / Resolved</option>
              </select>
            </div>
          </div>

          {/* Problem */}
          <div className="flex flex-col" id="field-problem">
            <label className="text-xs font-semibold text-slate-700 mb-1">
              Outage/Problem Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Provide full description of root cause, affected areas, and physical infrastructure status..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              required
              className="border border-slate-200 bg-slate-50/50 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors resize-y"
              id="input-problem"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2" id="form-actions">
            <button
              type="submit"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm cursor-pointer transition-all"
              id="submit-incident-btn"
            >
              {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? 'Update Incident Record' : 'Save Network Incident'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. List Log View & Search (BOTTOM ROW) */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200" id="network-incident-log-card">
        {/* Title and Global search */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5" id="log-header">
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight" id="log-title">
              📋 Network Outage Logs & Analytics
            </h3>
            <p className="text-xs text-slate-500 mt-1" id="log-subtitle">
              Interactive logs of logged incidents with active status tracking (No Deletion Permitted)
            </p>
          </div>

          <div className="w-full lg:w-72 relative" id="global-search-container">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search problem, IP, zone..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-hidden focus:border-slate-400 focus:bg-slate-50/50 transition-colors"
              id="global-search"
            />
          </div>
        </div>

        {/* Filters Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl mb-5 border border-slate-100" id="filters-panel">
          {/* Filter Date */}
          <div className="flex flex-col" id="filter-col-date">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Filter Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
              id="filter-date"
            />
          </div>

          {/* Filter Type */}
          <div className="flex flex-col" id="filter-col-type">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Filter Type</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden cursor-pointer"
              id="filter-type"
            >
              <option value="">All Types</option>
              <option value="Zone">Zone Outage</option>
              <option value="Switch">Switch Outage</option>
              <option value="NAS">NAS Failure</option>
              <option value="OLT">OLT Breakdown</option>
              <option value="Major Issue">Major Issue</option>
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex flex-col" id="filter-col-status">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Filter Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden cursor-pointer"
              id="filter-status"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Filter Added By */}
          <div className="flex flex-col" id="filter-col-added-by">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Logged By</label>
            <input
              type="text"
              placeholder="e.g. biswajitr"
              value={filterAddedBy}
              onChange={(e) => {
                setFilterAddedBy(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
              id="filter-added-by"
            />
          </div>
        </div>

        {/* Responsive Table & Card Layout */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100" id="table-wrapper">
          <table className="w-full text-left border-collapse text-xs" id="incidents-table">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100" id="table-head-row">
                <th className="p-3">Date & Time</th>
                <th className="p-3">Type</th>
                <th className="p-3">Downtime / Uptime</th>
                <th className="p-3">Target Code / Identifier</th>
                <th className="p-3 w-1/3">Problem Statement</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" id="table-body">
              {paginatedIncidents.length > 0 ? (
                paginatedIncidents.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors" id={`row-${item.id}`}>
                    <td className="p-3 font-medium text-slate-700 whitespace-nowrap">
                      <div>{formatDateTime(item.date)}</div>
                      {item.editedBy && (
                        <div className="text-[9px] text-indigo-600 font-semibold mt-1 bg-indigo-50/70 rounded-md py-0.5 px-1.5 inline-block border border-indigo-100/50" title={`Last updated: ${formatDateTime(item.updatedTime || '')}`}>
                          ✏️ Edited by {item.editedBy}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full ${
                          item.type === 'Zone'
                            ? 'bg-amber-50 text-amber-700'
                            : item.type === 'Switch'
                            ? 'bg-rose-50 text-rose-700'
                            : item.type === 'OLT'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.type === 'NAS'
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-violet-50 text-violet-700'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 whitespace-nowrap">
                      <div>
                        <span className="font-semibold text-rose-600">▼ {item.downtime}</span>
                      </div>
                      <div>
                        {item.uptime === 'Pending' ? (
                          <span className="font-semibold text-slate-400">🕒 {item.uptime}</span>
                        ) : (
                          <span className="font-semibold text-emerald-600">▲ {item.uptime}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {item.type === 'Zone' ? (
                        <div>
                          <div className="font-bold text-slate-800">Zone: {item.zoneCode}</div>
                          <div className="text-[10px] text-slate-400">POP: {item.pop}</div>
                        </div>
                      ) : item.type === 'Major Issue' ? (
                        <span className="text-slate-400 italic">No Device Assigned</span>
                      ) : (
                        <span className="font-semibold">{item.identifier}</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate" title={item.problem}>
                      {item.problem}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
                          item.status === 'Open' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Open' ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600'}`} />
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5" id={`actions-${item.id}`}>
                        {/* View Button */}
                        <button
                          onClick={() => setViewingItem(item)}
                          className="p-1 text-slate-500 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
                          title="View Details"
                          id={`btn-view-${item.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1 text-slate-700 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
                          title="Edit Record"
                          id={`btn-edit-${item.id}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        {currentUser?.role === 'Admin' && onDelete && (
                          <div className="flex items-center gap-1" id={`delete-action-container-${item.id}`}>
                            {deletingId === item.id ? (
                              <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-md p-1 animate-fade-in" id={`delete-confirm-box-${item.id}`}>
                                <span className="text-xs text-rose-700 font-semibold px-1" id={`delete-lbl-${item.id}`}>Sure?</span>
                                <button
                                  onClick={() => {
                                    onDelete(item.id);
                                    setDeletingId(null);
                                  }}
                                  className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-2 py-0.5 rounded-sm cursor-pointer transition-colors"
                                  id={`btn-confirm-delete-${item.id}`}
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeletingId(null)}
                                  className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-2 py-0.5 rounded-sm cursor-pointer transition-colors"
                                  id={`btn-cancel-delete-${item.id}`}
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingId(item.id)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                                title="Delete Record"
                                id={`btn-delete-${item.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr id="empty-row">
                  <td colSpan={7} className="p-10 text-center text-slate-400 font-semibold italic">
                    No matching network incident logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="block md:hidden space-y-4" id="mobile-cards-wrapper">
          {paginatedIncidents.length > 0 ? (
            paginatedIncidents.map((item) => (
              <div key={item.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all space-y-3" id={`mobile-card-${item.id}`}>
                {/* Header Row: Date & Status */}
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{formatDateTime(item.date)}</div>
                    {item.editedBy && (
                      <div className="text-[9px] text-indigo-600 font-semibold bg-indigo-50/70 rounded-md py-0.5 px-1.5 border border-indigo-100/50">
                        ✏️ Edited by {item.editedBy}
                      </div>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                      item.status === 'Open' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Open' ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600'}`} />
                    {item.status}
                  </span>
                </div>

                {/* Subheader: Type and Identifier/Zone */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                      item.type === 'Zone'
                        ? 'bg-amber-50 text-amber-700'
                        : item.type === 'Switch'
                        ? 'bg-rose-50 text-rose-700'
                        : item.type === 'OLT'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.type === 'NAS'
                        ? 'bg-sky-50 text-sky-700'
                        : 'bg-violet-50 text-violet-700'
                    }`}
                  >
                    {item.type}
                  </span>
                  
                  <div className="text-xs font-mono text-slate-700">
                    {item.type === 'Zone' ? (
                      <span className="font-bold">Zone: {item.zoneCode} <span className="text-[10px] text-slate-400 normal-case">(POP: {item.pop})</span></span>
                    ) : item.type === 'Major Issue' ? (
                      <span className="text-slate-400 italic">No Device Assigned</span>
                    ) : (
                      <span className="font-semibold">{item.identifier}</span>
                    )}
                  </div>
                </div>

                {/* Downtime/Uptime Info */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase text-[9px] tracking-wider">Downtime</span>
                    <span className="font-bold text-rose-600">▼ {item.downtime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase text-[9px] tracking-wider">Uptime</span>
                    {item.uptime === 'Pending' ? (
                      <span className="font-bold text-slate-400">🕒 {item.uptime}</span>
                    ) : (
                      <span className="font-bold text-emerald-600">▲ {item.uptime}</span>
                    )}
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/50">
                  <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider mb-0.5">Problem Details</span>
                  <p className="line-clamp-3 leading-relaxed">{item.problem}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => setViewingItem(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-all cursor-pointer"
                    id={`btn-view-mob-${item.id}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => startEdit(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition-all cursor-pointer"
                    id={`btn-edit-mob-${item.id}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {currentUser?.role === 'Admin' && onDelete && (
                    <div className="relative" id={`delete-mob-container-${item.id}`}>
                      {deletingId === item.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg p-1 animate-fade-in" id={`delete-mob-confirm-box-${item.id}`}>
                          <span className="text-[10px] text-rose-700 font-bold px-1">Sure?</span>
                          <button
                            onClick={() => {
                              onDelete(item.id);
                              setDeletingId(null);
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2 py-1 rounded-md text-[10px] cursor-pointer transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-2 py-1 rounded-md text-[10px] cursor-pointer transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-medium transition-all cursor-pointer"
                          id={`btn-delete-mob-${item.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center text-slate-400 font-medium italic text-xs">
              No matching network incident logs found
            </div>
          )}
        </div>

        {/* Row Metadata AddedBy Sign-off */}
        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-end gap-1 px-1">
          <Info className="w-3 h-3" />
          <span>All edits automatically register the active supervisor session ID. Standard users cannot delete logs.</span>
        </div>

        {/* Universal Table Pagination Component */}
        <TablePagination
          currentPage={currentPage}
          totalItems={totalItems}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          idPrefix="incident-pag"
        />
      </div>

      {/* 3. View Modal Component */}
      {viewingItem && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
          id="view-modal"
          onClick={() => setViewingItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-slate-100"
            id="view-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50" id="modal-header">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Incident Details</span>
                <h3 className="text-base font-bold text-slate-800" id="modal-title">
                  Incident ID: {viewingItem.id}
                </h3>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                id="close-modal-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs" id="modal-body">
              <div className="grid grid-cols-2 gap-4" id="modal-grid">
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Date Created</span>
                  <span className="font-bold text-slate-800">{formatDateTime(viewingItem.date)}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Log Author (Commited By)</span>
                  <span className="font-bold text-slate-800 font-mono">{viewingItem.addedBy}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Type</span>
                  <span className="font-bold text-slate-800">{viewingItem.type}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Status</span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                      viewingItem.status === 'Open' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {viewingItem.status}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Downtime</span>
                  <span className="font-bold text-rose-600">▼ {viewingItem.downtime}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Uptime</span>
                  <span className="font-bold text-emerald-600">▲ {viewingItem.uptime}</span>
                </div>
              </div>

              {/* Target / Device details */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100" id="modal-hardware-summary">
                <h4 className="font-bold text-slate-700 mb-2 uppercase tracking-wider text-[9px]">Affected Hardware Mapping</h4>
                {viewingItem.type === 'Zone' ? (
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div>
                      <span className="text-slate-400 block text-[9px]">Zone Code</span>
                      <span className="text-slate-800 font-bold">{viewingItem.zoneCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">POP Name</span>
                      <span className="text-slate-800 font-bold">{viewingItem.pop}</span>
                    </div>
                  </div>
                ) : viewingItem.type === 'Major Issue' ? (
                  <span className="text-slate-500 italic font-medium">No hardware mapping assigned (Major Logical/Gateway Issue)</span>
                ) : (
                  <div className="font-mono">
                    <span className="text-slate-400 block text-[9px]">Device Identifier / IP</span>
                    <span className="text-slate-800 font-bold break-all">{viewingItem.identifier}</span>
                  </div>
                )}
              </div>

              {/* Problem statement */}
              <div>
                <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Outage & Problem Statement</span>
                <p className="bg-slate-50 p-3 rounded-lg text-slate-700 leading-relaxed font-semibold border border-slate-100 text-xs">
                  {viewingItem.problem}
                </p>
              </div>

              {/* Status History Timeline */}
              <div className="border-t border-slate-100 pt-4" id="status-history-timeline-section">
                <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-3">
                  Status Change Timeline
                </span>
                {viewingItem.statusHistory && viewingItem.statusHistory.length > 0 ? (
                  <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-4" id="timeline-steps">
                    {viewingItem.statusHistory.map((history, idx) => {
                      const isLatest = idx === (viewingItem.statusHistory?.length || 0) - 1;
                      let formattedTime = 'Invalid Date';
                      try {
                        formattedTime = new Date(history.timestamp).toLocaleString();
                      } catch (e) {}
                      return (
                        <div key={idx} className="relative" id={`timeline-step-${idx}`}>
                          {/* Timeline dot */}
                          <span 
                            className={`absolute -left-[21px] top-1.5 flex h-2 w-2 items-center justify-center rounded-full ring-4 ring-white ${
                              isLatest
                                ? history.status === 'Open'
                                  ? 'bg-rose-600 ring-rose-50'
                                  : 'bg-emerald-600 ring-emerald-50'
                                : 'bg-slate-300'
                            }`} 
                          />
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                history.status === 'Open'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {history.status}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold">
                                by <span className="font-extrabold text-slate-700 font-mono">{history.changedBy}</span>
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-semibold">
                              {formattedTime}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10px] text-slate-500 font-bold">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>No status transitions recorded. Status set to <strong className="text-slate-700">{viewingItem.status}</strong> on creation by {viewingItem.addedBy}.</span>
                  </div>
                )}
              </div>

              {/* Data Tracking logs */}
              {(viewingItem.createdTime || viewingItem.updatedTime || viewingItem.editedBy) && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/50 text-[10px]">
                  {viewingItem.createdTime && (
                    <div>
                      <span className="font-bold text-indigo-500/80 block uppercase tracking-wider text-[8px] mb-0.5">Created Time</span>
                      <span className="font-semibold text-slate-700">{new Date(viewingItem.createdTime).toLocaleString()}</span>
                    </div>
                  )}
                  {viewingItem.updatedTime && (
                    <div>
                      <span className="font-bold text-indigo-500/80 block uppercase tracking-wider text-[8px] mb-0.5">Updated Time</span>
                      <span className="font-semibold text-slate-700">{new Date(viewingItem.updatedTime).toLocaleString()}</span>
                    </div>
                  )}
                  {viewingItem.editedBy && (
                    <div className="col-span-2">
                      <span className="font-bold text-indigo-500/80 block uppercase tracking-wider text-[8px] mb-0.5">Last Edited By</span>
                      <span className="font-bold text-slate-800">{viewingItem.editedBy}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end" id="modal-footer">
              <button
                onClick={() => setViewingItem(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                id="modal-close-action"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
