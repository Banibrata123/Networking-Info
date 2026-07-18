/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WhatsAppReport, CyberCrimeReport, MailWhatsAppCountReport, UserSession } from '../types';
import { getLocalDateTimeString, formatDateTime } from '../utils';
import TablePagination from './TablePagination';
import {
  Plus,
  Edit3,
  Eye,
  Search,
  Info,
  X,
  MessageSquare,
  ShieldAlert,
  Mail,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import MultipleReportCarousel from './MultipleReportCarousel';

interface Props {
  waReports: WhatsAppReport[];
  cyberReports: CyberCrimeReport[];
  mailReports: MailWhatsAppCountReport[];
  onAddWa: (item: Omit<WhatsAppReport, 'id' | 'addedBy'>) => void;
  onUpdateWa: (id: string, item: Partial<WhatsAppReport>) => void;
  onDeleteWa?: (id: string) => void;
  onAddCyber: (item: Omit<CyberCrimeReport, 'id' | 'addedBy'>) => void;
  onUpdateCyber: (id: string, item: Partial<CyberCrimeReport>) => void;
  onDeleteCyber?: (id: string) => void;
  onAddMail: (item: Omit<MailWhatsAppCountReport, 'id' | 'addedBy'>) => void;
  onUpdateMail: (id: string, item: Partial<MailWhatsAppCountReport>) => void;
  onDeleteMail?: (id: string) => void;
  currentUser: UserSession;
}

export default function MultipleReportView({
  waReports,
  cyberReports,
  mailReports,
  onAddWa,
  onUpdateWa,
  onDeleteWa,
  onAddCyber,
  onUpdateCyber,
  onDeleteCyber,
  onAddMail,
  onUpdateMail,
  onDeleteMail,
  currentUser
}: Props) {
  // Tabs for the 3 reports
  const [activeSubTab, setActiveSubTab] = useState<'whatsapp' | 'cyber' | 'mail'>('whatsapp');

  // --- 1. WhatsApp Shift Report States ---
  const [waDate, setWaDate] = useState(getLocalDateTimeString());
  const [waNameDay, setWaNameDay] = useState('');
  const [waNameOptDay, setWaNameOptDay] = useState('');
  const [waNameNight, setWaNameNight] = useState('');
  const [waEditId, setWaEditId] = useState<string | null>(null);
  const [waViewItem, setWaViewItem] = useState<WhatsAppReport | null>(null);
  // Filters
  const [waFilterDate, setWaFilterDate] = useState('');
  const [waFilterNameDay, setWaFilterNameDay] = useState('');
  const [waFilterNameNight, setWaFilterNameNight] = useState('');
  const [waFilterNameOptDay, setWaFilterNameOptDay] = useState('');
  const [waFilterAddedBy, setWaFilterAddedBy] = useState('');
  // Pagination
  const [waPage, setWaPage] = useState(1);
  const [waRows, setWaRows] = useState(10);

  // --- 2. Cyber Crime Report States ---
  const [cyDate, setCyDate] = useState(getLocalDateTimeString());
  const [cyCount, setCyCount] = useState<number>(1);
  const [cyAreaDetails, setCyAreaDetails] = useState('');
  const [cyEditId, setCyEditId] = useState<string | null>(null);
  const [cyViewItem, setCyViewItem] = useState<CyberCrimeReport | null>(null);
  // Filters
  const [cyFilterDate, setCyFilterDate] = useState('');
  const [cyFilterAddedBy, setCyFilterAddedBy] = useState('');
  // Pagination
  const [cyPage, setCyPage] = useState(1);
  const [cyRows, setCyRows] = useState(10);

  // --- 3. Mail & WhatsApp Count Report States ---
  const [maDate, setMaDate] = useState(getLocalDateTimeString());
  const [maTotalMail, setMaTotalMail] = useState<number>(0);
  const [maSentMail, setMaSentMail] = useState<number>(0);
  const [maWhatsAppSent, setMaWhatsAppSent] = useState<number>(0);
  const [maWhatsAppReceived, setMaWhatsAppReceived] = useState<number>(0);
  const [maEditId, setMaEditId] = useState<string | null>(null);
  const [maViewItem, setMaViewItem] = useState<MailWhatsAppCountReport | null>(null);
  // Filters
  const [maFilterDate, setMaFilterDate] = useState('');
  const [maFilterAddedBy, setMaFilterAddedBy] = useState('');
  // Pagination
  const [maPage, setMaPage] = useState(1);
  const [maRows, setMaRows] = useState(10);

  // --- Global text search (applied per active subtab) ---
  const [globalSearch, setGlobalSearch] = useState('');

  const [waDeletingId, setWaDeletingId] = useState<string | null>(null);
  const [cyDeletingId, setCyDeletingId] = useState<string | null>(null);
  const [maDeletingId, setMaDeletingId] = useState<string | null>(null);

  // ----------------------------------------------------
  // WhatsApp Submits & Resets
  // ----------------------------------------------------
  const handleWaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waNameDay) return alert('Name (Day Shift) is mandatory');
    if (!waNameNight) return alert('Name (Night Shift) is mandatory');

    const payload = {
      date: waDate,
      nameDay: waNameDay,
      nameOptDay: waNameOptDay || undefined,
      nameNight: waNameNight
    };

    if (waEditId) {
      onUpdateWa(waEditId, payload);
      setWaEditId(null);
    } else {
      onAddWa(payload);
    }
    resetWaForm();
  };

  const startWaEdit = (item: WhatsAppReport) => {
    setWaEditId(item.id);
    setWaDate(item.date);
    setWaNameDay(item.nameDay);
    setWaNameOptDay(item.nameOptDay || '');
    setWaNameNight(item.nameNight);
    safeScrollToForm('wa-form');
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

  const resetWaForm = () => {
    setWaEditId(null);
    setWaDate(getLocalDateTimeString());
    setWaNameDay('');
    setWaNameOptDay('');
    setWaNameNight('');
  };

  // ----------------------------------------------------
  // Cyber Crime Submits & Resets
  // ----------------------------------------------------
  const handleCySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cyCount === undefined || cyCount < 0) return alert('Incident Count is mandatory');
    if (!cyAreaDetails) return alert('Area Details are mandatory');

    const payload = {
      date: cyDate,
      count: Number(cyCount),
      areaDetails: cyAreaDetails
    };

    if (cyEditId) {
      onUpdateCyber(cyEditId, payload);
      setCyEditId(null);
    } else {
      onAddCyber(payload);
    }
    resetCyForm();
  };

  const startCyEdit = (item: CyberCrimeReport) => {
    setCyEditId(item.id);
    setCyDate(item.date);
    setCyCount(item.count);
    setCyAreaDetails(item.areaDetails);
    safeScrollToForm('cy-form');
  };

  const resetCyForm = () => {
    setCyEditId(null);
    setCyDate(getLocalDateTimeString());
    setCyCount(1);
    setCyAreaDetails('');
  };

  // ----------------------------------------------------
  // Mail & WhatsApp Count Submits & Resets
  // ----------------------------------------------------
  const handleMaSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      date: maDate,
      totalMail: Number(maTotalMail),
      sentMail: Number(maSentMail),
      whatsAppSent: Number(maWhatsAppSent),
      whatsAppReceived: Number(maWhatsAppReceived)
    };

    if (maEditId) {
      onUpdateMail(maEditId, payload);
      setMaEditId(null);
    } else {
      onAddMail(payload);
    }
    resetMaForm();
  };

  const startMaEdit = (item: MailWhatsAppCountReport) => {
    setMaEditId(item.id);
    setMaDate(item.date);
    setMaTotalMail(item.totalMail);
    setMaSentMail(item.sentMail);
    setMaWhatsAppSent(item.whatsAppSent);
    setMaWhatsAppReceived(item.whatsAppReceived);
    safeScrollToForm('ma-form');
  };

  const resetMaForm = () => {
    setMaEditId(null);
    setMaDate(getLocalDateTimeString());
    setMaTotalMail(0);
    setMaSentMail(0);
    setMaWhatsAppSent(0);
    setMaWhatsAppReceived(0);
  };

  // ----------------------------------------------------
  // MATH LOGIC FOR MAIL & WHATSAPP COUNT
  // Sort ascending, and subtract current day counts from tomorrow's counts.
  // ----------------------------------------------------
  const getSortedMailReportsWithDeltas = (): MailWhatsAppCountReport[] => {
    // Sort chronologically ascending
    const sorted = [...mailReports].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return sorted.map((current, idx) => {
      // "Tomorrow" is the next chronological report in the sorted array
      const tomorrow = sorted[idx + 1];

      if (tomorrow) {
        return {
          ...current,
          netSent: tomorrow.whatsAppSent - current.whatsAppSent,
          netReceived: tomorrow.whatsAppReceived - current.whatsAppReceived
        };
      } else {
        // No subsequent report exists yet
        return {
          ...current,
          netSent: undefined,
          netReceived: undefined
        };
      }
    });
  };

  // ----------------------------------------------------
  // Filter & Search Pipelines per Tab
  // ----------------------------------------------------

  // 1. WhatsApp Reports Filtering
  const filteredWaReports = waReports.filter((item) => {
    if (waFilterDate && !item.date.startsWith(waFilterDate)) return false;
    if (waFilterNameDay && !item.nameDay.toLowerCase().includes(waFilterNameDay.toLowerCase())) return false;
    if (waFilterNameNight && !item.nameNight.toLowerCase().includes(waFilterNameNight.toLowerCase())) return false;
    if (waFilterNameOptDay && !item.nameOptDay?.toLowerCase().includes(waFilterNameOptDay.toLowerCase())) return false;
    if (waFilterAddedBy && !item.addedBy.toLowerCase().includes(waFilterAddedBy.toLowerCase())) return false;

    if (globalSearch) {
      const s = globalSearch.toLowerCase();
      const match =
        item.nameDay.toLowerCase().includes(s) ||
        item.nameNight.toLowerCase().includes(s) ||
        (item.nameOptDay && item.nameOptDay.toLowerCase().includes(s)) ||
        item.addedBy.toLowerCase().includes(s);
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    const timeA = a.createdTime ? new Date(a.createdTime).getTime() : new Date(a.date).getTime();
    const timeB = b.createdTime ? new Date(b.createdTime).getTime() : new Date(b.date).getTime();
    return timeB - timeA;
  });

  const waTotalPages = Math.max(1, Math.ceil(filteredWaReports.length / waRows));
  const waActivePage = Math.min(waPage, waTotalPages);
  const waPaginated = filteredWaReports.slice((waActivePage - 1) * waRows, waActivePage * waRows);

  useEffect(() => {
    if (waPage > waTotalPages) {
      setWaPage(waTotalPages);
    }
  }, [filteredWaReports.length, waRows, waTotalPages, waPage]);

  // 2. Cyber Crime Reports Filtering
  const filteredCyberReports = cyberReports.filter((item) => {
    if (cyFilterDate && !item.date.startsWith(cyFilterDate)) return false;
    if (cyFilterAddedBy && !item.addedBy.toLowerCase().includes(cyFilterAddedBy.toLowerCase())) return false;

    if (globalSearch) {
      const s = globalSearch.toLowerCase();
      const match = item.areaDetails.toLowerCase().includes(s) || item.addedBy.toLowerCase().includes(s);
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    const timeA = a.createdTime ? new Date(a.createdTime).getTime() : new Date(a.date).getTime();
    const timeB = b.createdTime ? new Date(b.createdTime).getTime() : new Date(b.date).getTime();
    return timeB - timeA;
  });

  const cyTotalPages = Math.max(1, Math.ceil(filteredCyberReports.length / cyRows));
  const cyActivePage = Math.min(cyPage, cyTotalPages);
  const cyPaginated = filteredCyberReports.slice((cyActivePage - 1) * cyRows, cyActivePage * cyRows);

  useEffect(() => {
    if (cyPage > cyTotalPages) {
      setCyPage(cyTotalPages);
    }
  }, [filteredCyberReports.length, cyRows, cyTotalPages, cyPage]);

  // 3. Mail & WhatsApp Count Reports Filtering
  const processedMailReports = getSortedMailReportsWithDeltas();
  const filteredMailReports = processedMailReports.filter((item) => {
    if (maFilterDate && !item.date.startsWith(maFilterDate)) return false;
    if (maFilterAddedBy && !item.addedBy.toLowerCase().includes(maFilterAddedBy.toLowerCase())) return false;

    if (globalSearch) {
      const s = globalSearch.toLowerCase();
      const match =
        item.totalMail.toString().includes(s) ||
        item.whatsAppSent.toString().includes(s) ||
        item.whatsAppReceived.toString().includes(s) ||
        item.addedBy.toLowerCase().includes(s);
      if (!match) return false;
    }
    return true;
  });

  // Since we want standard reverse chronological log viewing (most recent on top) but sorted ascends for the math:
  // Let's reverse the final filtered list for logging display only!
  const mailDisplayReports = [...filteredMailReports].reverse();
  const maTotalPages = Math.max(1, Math.ceil(mailDisplayReports.length / maRows));
  const maActivePage = Math.min(maPage, maTotalPages);
  const maPaginated = mailDisplayReports.slice((maActivePage - 1) * maRows, maActivePage * maRows);

  useEffect(() => {
    if (maPage > maTotalPages) {
      setMaPage(maTotalPages);
    }
  }, [mailDisplayReports.length, maRows, maTotalPages, maPage]);

  // Statistics Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const totalCyberCrime = cyberReports.reduce((acc, r) => acc + (r.count || 0), 0);
  const todayTotalMail = mailReports
    .filter((r) => r.date && r.date.includes(todayStr))
    .reduce((acc, r) => acc + (r.totalMail || 0), 0);

  const latestWaReport = waReports.length > 0
    ? [...waReports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;
  const showingWaNameDay = latestWaReport ? latestWaReport.nameDay : 'None Loaded';
  const showingWaNameNight = latestWaReport ? latestWaReport.nameNight : 'None Loaded';

  return (
    <div className="space-y-6" id="multiple-reports-view-module">
      {/* 1. Multiple Report Carousel */}
      <MultipleReportCarousel
        waReports={waReports}
        cyberReports={cyberReports}
        mailReports={mailReports}
      />

      {/* 2. Interactive Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="multi-report-stats-grid">
        {/* Card 1: Total Cyber Crime */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="mr-stat-card-cyber"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Cyber Crime</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {totalCyberCrime}
            </span>
            <span className="text-[10px] text-rose-600 font-semibold font-mono">Traces</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Registered IP cell queries
          </p>
        </motion.div>

        {/* Card 2: Today Total Mail */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="mr-stat-card-mail"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Today Total Mail</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {todayTotalMail}
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold font-mono font-bold">Mails</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Mails logged on current date
          </p>
        </motion.div>

        {/* Card 3: WhatsApp Day Duty Staff */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="mr-stat-card-waday"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">WhatsApp Staff (Day)</span>
            <div className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col min-h-[32px] justify-center">
            <span className="text-sm font-black text-slate-800 tracking-tight truncate" title={showingWaNameDay}>
              {showingWaNameDay}
            </span>
            <span className="text-[9px] text-cyan-600 font-bold font-mono uppercase mt-0.5">Active Day Duty</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            Latest logged representative
          </p>
        </motion.div>

        {/* Card 4: WhatsApp Night Duty Staff */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="mr-stat-card-wanight"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">WhatsApp Staff (Night)</span>
            <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col min-h-[32px] justify-center">
            <span className="text-sm font-black text-slate-800 tracking-tight truncate" title={showingWaNameNight}>
              {showingWaNameNight}
            </span>
            <span className="text-[9px] text-violet-600 font-bold font-mono uppercase mt-0.5">Active Night Duty</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            Latest nightshift responder
          </p>
        </motion.div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200/60 bg-white rounded-2xl p-1.5 shadow-sm gap-1" id="subtab-selectors">
        <button
          onClick={() => {
            setActiveSubTab('whatsapp');
            setGlobalSearch('');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'whatsapp'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
          id="btn-subtab-wa"
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Duty Report</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('cyber');
            setGlobalSearch('');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'cyber'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
          id="btn-subtab-cyber"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Cyber Crime Logs</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('mail');
            setGlobalSearch('');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'mail'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
          id="btn-subtab-mail"
        >
          <Mail className="w-4 h-4" />
          <span>Daily Comms Statistics</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. WHATSAPP REPORT SUBMODULE */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'whatsapp' && (
        <div className="space-y-6 animate-fadeIn" id="whatsapp-shift-report">
          {/* Top Form */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800">💬 Log WhatsApp shift Support Staff</h3>
                <p className="text-xs text-slate-500 mt-0.5">Track WhatsApp supervisors, day representatives, and night engineers</p>
              </div>
              {waEditId && (
                <button
                  onClick={resetWaForm}
                  className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleWaSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" id="wa-form">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-700 mb-1">
                  Shift Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={waDate}
                  onChange={(e) => setWaDate(e.target.value)}
                  required
                  className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-700 mb-1">
                  Name (Day Shift) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Biswajit Ray"
                  value={waNameDay}
                  onChange={(e) => setWaNameDay(e.target.value)}
                  required
                  className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-700 mb-1">Name Optional (Day Shift)</label>
                <input
                  type="text"
                  placeholder="e.g. Prakash Das"
                  value={waNameOptDay}
                  onChange={(e) => setWaNameOptDay(e.target.value)}
                  className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-700 mb-1">
                  Name (Night Shift) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sumit Sharma"
                  value={waNameNight}
                  onChange={(e) => setWaNameNight(e.target.value)}
                  required
                  className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {waEditId ? 'Update Duty Shift' : 'Log Shift Representatives'}
                </button>
              </div>
            </form>
          </div>

          {/* Bottom Table Log */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
              <div>
                <h4 className="text-base font-bold text-slate-800">📋 WhatsApp Duty Shift Ledger</h4>
                <p className="text-xs text-slate-500 mt-0.5">Search and view shift allocations (No deletion permitted)</p>
              </div>

              <div className="w-full lg:w-72 relative">
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff, username..."
                  value={globalSearch}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value);
                    setWaPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Sub filters */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl mb-5 border border-slate-100">
              <input
                type="date"
                value={waFilterDate}
                onChange={(e) => { setWaFilterDate(e.target.value); setWaPage(1); }}
                className="border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
                placeholder="Filter Date"
              />
              <input
                type="text"
                value={waFilterNameDay}
                onChange={(e) => { setWaFilterNameDay(e.target.value); setWaPage(1); }}
                className="border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
                placeholder="Filter Day shift"
              />
              <input
                type="text"
                value={waFilterNameOptDay}
                onChange={(e) => { setWaFilterNameOptDay(e.target.value); setWaPage(1); }}
                className="border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
                placeholder="Filter Day (backup)"
              />
              <input
                type="text"
                value={waFilterNameNight}
                onChange={(e) => { setWaFilterNameNight(e.target.value); setWaPage(1); }}
                className="border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
                placeholder="Filter Night Shift"
              />
              <input
                type="text"
                value={waFilterAddedBy}
                onChange={(e) => { setWaFilterAddedBy(e.target.value); setWaPage(1); }}
                className="border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
                placeholder="Logged By"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                    <th className="p-3">Shift Timestamp</th>
                    <th className="p-3">Name (Day Shift)</th>
                    <th className="p-3">Backup / Optional Day</th>
                    <th className="p-3">Name (Night Shift)</th>
                    <th className="p-3">Logged By</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {waPaginated.length > 0 ? (
                    waPaginated.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                          <div>{formatDateTime(item.date)}</div>
                          {item.editedBy && (
                            <div className="text-[9px] text-indigo-600 font-semibold mt-1 bg-indigo-50/70 rounded-md py-0.5 px-1.5 inline-block border border-indigo-100/50" title={`Last updated: ${formatDateTime(item.updatedTime || '')}`}>
                              ✏️ Edited by {item.editedBy}
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{item.nameDay}</td>
                        <td className="p-3 text-slate-500 font-medium">
                          {item.nameOptDay || <span className="text-slate-300 italic">None assigned</span>}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{item.nameNight}</td>
                        <td className="p-3 font-mono font-bold text-slate-400">{item.addedBy}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setWaViewItem(item)}
                              className="p-1 text-slate-500 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => startWaEdit(item)}
                              className="p-1 text-slate-700 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
                              title="Edit Record"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {(currentUser?.role === 'Admin' || item.addedBy === currentUser?.username) && onDeleteWa && (
                              <div className="flex items-center gap-1" id={`delete-wa-container-${item.id}`}>
                                {waDeletingId === item.id ? (
                                  <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-md p-1 animate-fade-in" id={`delete-wa-confirm-box-${item.id}`}>
                                    <span className="text-xs text-rose-700 font-semibold px-1" id={`delete-wa-lbl-${item.id}`}>Sure?</span>
                                    <button
                                      onClick={() => {
                                        onDeleteWa(item.id);
                                        setWaDeletingId(null);
                                      }}
                                      className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-2 py-0.5 rounded-sm cursor-pointer transition-colors"
                                      id={`btn-confirm-delete-wa-${item.id}`}
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => setWaDeletingId(null)}
                                      className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-2 py-0.5 rounded-sm cursor-pointer transition-colors"
                                      id={`btn-cancel-delete-wa-${item.id}`}
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setWaDeletingId(item.id)}
                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                                    title="Delete Record"
                                    id={`btn-delete-wa-${item.id}`}
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
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-slate-400 italic">
                        No shift schedules found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              currentPage={waPage}
              totalItems={filteredWaReports.length}
              rowsPerPage={waRows}
              onPageChange={setWaPage}
              onRowsPerPageChange={setWaRows}
              idPrefix="wa-pag"
            />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. CYBER CRIME REPORT SUBMODULE */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'cyber' && (
        <div className="space-y-6 animate-fadeIn" id="cyber-crime-logs">
          {/* Form */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800">🛡️ Log Cyber Cell / IP Trace Request</h3>
                <p className="text-xs text-slate-500 mt-0.5">Log official queries regarding IP details, port mapping, and customer logs</p>
              </div>
              {cyEditId && (
                <button
                  onClick={resetCyForm}
                  className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleCySubmit} className="space-y-4" id="cy-form">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-700 mb-1">
                    Query Date & Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={cyDate}
                    onChange={(e) => setCyDate(e.target.value)}
                    required
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-700 mb-1">
                    Trace / IP Queries Count <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={cyCount}
                    onChange={(e) => setCyCount(Number(e.target.value))}
                    required
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-700 mb-1">
                  Cell Location & Case Area details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Paste details of police station query, IP addresses trace targets, or MAC mapping logs requested..."
                  value={cyAreaDetails}
                  onChange={(e) => setCyAreaDetails(e.target.value)}
                  required
                  className="border border-slate-200 bg-slate-50/50 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-hidden resize-y"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {cyEditId ? 'Update Trace Record' : 'Register Cyber Cell Query'}
                </button>
              </div>
            </form>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
              <div>
                <h4 className="text-base font-bold text-slate-800">📋 Registered Cyber Crime Cell Enquiries</h4>
                <p className="text-xs text-slate-500 mt-0.5">Enquiry files regarding specific session audits (No deletion permitted)</p>
              </div>

              <div className="w-full lg:w-72 relative">
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search details..."
                  value={globalSearch}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value);
                    setCyPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl mb-5 border border-slate-100">
              <input
                type="date"
                value={cyFilterDate}
                onChange={(e) => { setCyFilterDate(e.target.value); setCyPage(1); }}
                className="border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
                placeholder="Filter Date"
              />
              <input
                type="text"
                value={cyFilterAddedBy}
                onChange={(e) => { setCyFilterAddedBy(e.target.value); setCyPage(1); }}
                className="border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
                placeholder="Logged By"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                    <th className="p-3">Query Timestamp</th>
                    <th className="p-3">Enquiry count</th>
                    <th className="p-3 w-1/2">Requesting Cell & Area details</th>
                    <th className="p-3">Logged By</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cyPaginated.length > 0 ? (
                    cyPaginated.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                          <div>{formatDateTime(item.date)}</div>
                          {item.editedBy && (
                            <div className="text-[9px] text-indigo-600 font-semibold mt-1 bg-indigo-50/70 rounded-md py-0.5 px-1.5 inline-block border border-indigo-100/50" title={`Last updated: ${formatDateTime(item.updatedTime || '')}`}>
                              ✏️ Edited by {item.editedBy}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full font-mono">
                            {item.count} Trace Target
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 max-w-sm truncate" title={item.areaDetails}>
                          {item.areaDetails}
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-400">{item.addedBy}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setCyViewItem(item)}
                              className="p-1 text-slate-500 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => startCyEdit(item)}
                              className="p-1 text-slate-700 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
                              title="Edit Record"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {(currentUser?.role === 'Admin' || item.addedBy === currentUser?.username) && onDeleteCyber && (
                              <div className="flex items-center gap-1" id={`delete-cy-container-${item.id}`}>
                                {cyDeletingId === item.id ? (
                                  <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-md p-1 animate-fade-in" id={`delete-cy-confirm-box-${item.id}`}>
                                    <span className="text-xs text-rose-700 font-semibold px-1" id={`delete-cy-lbl-${item.id}`}>Sure?</span>
                                    <button
                                      onClick={() => {
                                        onDeleteCyber(item.id);
                                        setCyDeletingId(null);
                                      }}
                                      className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-2 py-0.5 rounded-sm cursor-pointer transition-colors"
                                      id={`btn-confirm-delete-cy-${item.id}`}
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => setCyDeletingId(null)}
                                      className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-2 py-0.5 rounded-sm cursor-pointer transition-colors"
                                      id={`btn-cancel-delete-cy-${item.id}`}
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setCyDeletingId(item.id)}
                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                                    title="Delete Record"
                                    id={`btn-delete-cy-${item.id}`}
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
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-slate-400 italic">
                        No cyber cell trace query files registered
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              currentPage={cyPage}
              totalItems={filteredCyberReports.length}
              rowsPerPage={cyRows}
              onPageChange={setCyPage}
              onRowsPerPageChange={setCyRows}
              idPrefix="cy-pag"
            />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. DAILY COMMUNICATONS COUNT SUBMODULE */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'mail' && (
        <div className="space-y-6 animate-fadeIn" id="daily-mail-counts">
          {/* Form */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800">📊 Daily Communications Metrics Ledger</h3>
                <p className="text-xs text-slate-500 mt-0.5">Log total daily corporate emails and bulk WhatsApp message metrics</p>
              </div>
              {maEditId && (
                <button
                  onClick={resetMaForm}
                  className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleMaSubmit} className="space-y-4" id="ma-form">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-700 mb-1">
                    Entry Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={maDate}
                    onChange={(e) => setMaDate(e.target.value)}
                    required
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-700 mb-1">Total Mails Received</label>
                  <input
                    type="number"
                    min={0}
                    value={maTotalMail}
                    onChange={(e) => setMaTotalMail(Number(e.target.value))}
                    required
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-700 mb-1">Total Mails Sent</label>
                  <input
                    type="number"
                    min={0}
                    value={maSentMail}
                    onChange={(e) => setMaSentMail(Number(e.target.value))}
                    required
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-700 mb-1">WhatsApp Sent</label>
                  <input
                    type="number"
                    min={0}
                    value={maWhatsAppSent}
                    onChange={(e) => setMaWhatsAppSent(Number(e.target.value))}
                    required
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-700 mb-1">WhatsApp Received</label>
                  <input
                    type="number"
                    min={0}
                    value={maWhatsAppReceived}
                    onChange={(e) => setMaWhatsAppReceived(Number(e.target.value))}
                    required
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Info banner reminding how Math Delta is computed */}
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2.5 text-indigo-800 text-xs font-medium">
                <Info className="w-4.5 h-4.5 text-indigo-500 flex-shrink-0" />
                <span>
                  <strong>Math Delta Computing:</strong> Delta metrics are evaluated dynamically:
                  <code> Net Sent = Tomorrow Sent - Today Sent</code>. Values are automatically derived as consecutive chronological entries are stored.
                </span>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {maEditId ? 'Update Stats Record' : 'Log Daily Stats Entry'}
                </button>
              </div>
            </form>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
              <div>
                <h4 className="text-base font-bold text-slate-800">📋 Corporate Comms & WhatsApp Metrics ledger</h4>
                <p className="text-xs text-slate-500 mt-0.5">Visual representation with auto-calculated shift metrics and deltas</p>
              </div>

              <div className="w-full lg:w-72 relative">
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search counts..."
                  value={globalSearch}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value);
                    setMaPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl mb-5 border border-slate-100">
              <input
                type="date"
                value={maFilterDate}
                onChange={(e) => { setMaFilterDate(e.target.value); setMaPage(1); }}
                className="border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
                placeholder="Filter Date"
              />
              <input
                type="text"
                value={maFilterAddedBy}
                onChange={(e) => { setMaFilterAddedBy(e.target.value); setMaPage(1); }}
                className="border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
                placeholder="Logged By"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                    <th className="p-3">Log Date</th>
                    <th className="p-3 text-center">Total Mail Received</th>
                    <th className="p-3 text-center">Sent Mail</th>
                    <th className="p-3 text-center">WhatsApp Sent</th>
                    <th className="p-3 text-center">WhatsApp Received</th>
                    <th className="p-3 text-center bg-indigo-50/50 text-indigo-900">
                      Net WhatsApp Sent Delta
                    </th>
                    <th className="p-3 text-center bg-violet-50/50 text-violet-900">
                      Net WhatsApp Recv Delta
                    </th>
                    <th className="p-3">Logged By</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {maPaginated.length > 0 ? (
                    maPaginated.map((item) => {
                      const isNetSentDefined = item.netSent !== undefined;
                      const isNetReceivedDefined = item.netReceived !== undefined;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                            <div>{formatDateTime(item.date)}</div>
                            {item.editedBy && (
                              <div className="text-[9px] text-indigo-600 font-semibold mt-1 bg-indigo-50/70 rounded-md py-0.5 px-1.5 inline-block border border-indigo-100/50" title={`Last updated: ${formatDateTime(item.updatedTime || '')}`}>
                                ✏️ Edited by {item.editedBy}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-slate-800">{item.totalMail}</td>
                          <td className="p-3 text-center font-mono text-slate-600">{item.sentMail}</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-800">{item.whatsAppSent}</td>
                          <td className="p-3 text-center font-mono text-slate-600">{item.whatsAppReceived}</td>

                          {/* Calculated Net Sent Delta */}
                          <td className="p-3 text-center font-mono bg-indigo-50/20 whitespace-nowrap">
                            {isNetSentDefined ? (
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                  item.netSent! >= 0
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {item.netSent! >= 0 ? '+' : ''}
                                {item.netSent}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic bg-slate-100 px-2 py-0.5 rounded-full">
                                Awaiting Tomorrow
                              </span>
                            )}
                          </td>

                          {/* Calculated Net Received Delta */}
                          <td className="p-3 text-center font-mono bg-violet-50/20 whitespace-nowrap">
                            {isNetReceivedDefined ? (
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                  item.netReceived! >= 0
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {item.netReceived! >= 0 ? '+' : ''}
                                {item.netReceived}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic bg-slate-100 px-2 py-0.5 rounded-full">
                                Awaiting Tomorrow
                              </span>
                            )}
                          </td>

                          <td className="p-3 font-mono font-bold text-slate-400">{item.addedBy}</td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setMaViewItem(item)}
                                className="p-1 text-slate-500 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                                <button
                                  onClick={() => startMaEdit(item)}
                                  className="p-1 text-slate-700 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
                                  title="Edit Record"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              {(currentUser?.role === 'Admin' || item.addedBy === currentUser?.username) && onDeleteMail && (
                                <div className="flex items-center gap-1" id={`delete-ma-container-${item.id}`}>
                                  {maDeletingId === item.id ? (
                                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-md p-1 animate-fade-in" id={`delete-ma-confirm-box-${item.id}`}>
                                      <span className="text-xs text-rose-700 font-semibold px-1" id={`delete-ma-lbl-${item.id}`}>Sure?</span>
                                      <button
                                        onClick={() => {
                                          onDeleteMail(item.id);
                                          setMaDeletingId(null);
                                        }}
                                        className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-2 py-0.5 rounded-sm cursor-pointer transition-colors"
                                        id={`btn-confirm-delete-ma-${item.id}`}
                                      >
                                        Yes
                                      </button>
                                      <button
                                        onClick={() => setMaDeletingId(null)}
                                        className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-2 py-0.5 rounded-sm cursor-pointer transition-colors"
                                        id={`btn-cancel-delete-ma-${item.id}`}
                                      >
                                        No
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setMaDeletingId(item.id)}
                                      className="p-1 text-rose-600 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                                      title="Delete Record"
                                      id={`btn-delete-ma-${item.id}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-10 text-center text-slate-400 italic">
                        No Daily communications metrics logged yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              currentPage={maPage}
              totalItems={filteredMailReports.length}
              rowsPerPage={maRows}
              onPageChange={setMaPage}
              onRowsPerPageChange={setMaRows}
              idPrefix="ma-pag"
            />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW MODALS FOR ALL THREE SUBTABS */}
      {/* ---------------------------------------------------- */}

      {/* 1. WhatsApp View Modal */}
      {waViewItem && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setWaViewItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">WhatsApp Shift Allocation ID: {waViewItem.id}</h3>
              <button onClick={() => setWaViewItem(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Shift Date</span>
                <span className="text-slate-800 font-bold">{formatDateTime(waViewItem.date)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Day Representative</span>
                <span className="text-slate-800 font-bold text-sm block mt-0.5">{waViewItem.nameDay}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Day Backup Rep</span>
                <span className="text-slate-800 font-bold text-sm block mt-0.5">
                  {waViewItem.nameOptDay || <em className="text-slate-400 font-medium font-sans">None assigned</em>}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Night Representative</span>
                <span className="text-slate-800 font-bold text-sm block mt-0.5">{waViewItem.nameNight}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Recorded By</span>
                <span className="text-slate-800 font-bold font-mono">{waViewItem.addedBy}</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setWaViewItem(null)}
                className="bg-slate-900 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Cyber View Modal */}
      {cyViewItem && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setCyViewItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Cyber cell query: {cyViewItem.id}</h3>
              <button onClick={() => setCyViewItem(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Date Logged</span>
                  <span className="text-slate-800 font-bold">{formatDateTime(cyViewItem.date)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Query Targets Count</span>
                  <span className="text-rose-600 font-bold font-mono text-sm">{cyViewItem.count} Details</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Logged By</span>
                <span className="text-slate-800 font-bold font-mono">{cyViewItem.addedBy}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold mb-1">Cell & Area enquiry details</span>
                <p className="bg-slate-50 p-3 rounded-lg text-slate-700 leading-relaxed font-mono font-semibold border border-slate-100">
                  {cyViewItem.areaDetails}
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setCyViewItem(null)}
                className="bg-slate-900 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
              >
                Dismiss Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mail View Modal */}
      {maViewItem && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setMaViewItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Mail/WhatsApp statistics ID: {maViewItem.id}</h3>
              <button onClick={() => setMaViewItem(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold font-sans">Date</span>
                  <span className="text-slate-800 font-bold">{formatDateTime(maViewItem.date)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold font-sans">Logged By</span>
                  <span className="text-slate-800 font-bold">{maViewItem.addedBy}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold font-sans">Mails Received</span>
                  <span className="text-slate-800 font-bold text-sm">{maViewItem.totalMail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold font-sans">Mails Sent</span>
                  <span className="text-slate-800 font-bold text-sm">{maViewItem.sentMail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold font-sans">WhatsApp Sent</span>
                  <span className="text-slate-800 font-bold text-sm">{maViewItem.whatsAppSent}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold font-sans">WhatsApp Received</span>
                  <span className="text-slate-800 font-bold text-sm">{maViewItem.whatsAppReceived}</span>
                </div>
              </div>

              {/* Deltas if calculated */}
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
                <span className="text-indigo-900 block text-[9px] uppercase tracking-wider font-bold">Dynamic calculations relative to Tomorrow</span>
                <div className="flex justify-between font-mono font-semibold">
                  <span>Net Sent Delta:</span>
                  <span>{maViewItem.netSent !== undefined ? `${maViewItem.netSent >= 0 ? '+' : ''}${maViewItem.netSent}` : 'Awaiting tomorrow'}</span>
                </div>
                <div className="flex justify-between font-mono font-semibold">
                  <span>Net Received Delta:</span>
                  <span>{maViewItem.netReceived !== undefined ? `${maViewItem.netReceived >= 0 ? '+' : ''}${maViewItem.netReceived}` : 'Awaiting tomorrow'}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setMaViewItem(null)}
                className="bg-slate-900 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
