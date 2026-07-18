/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FeedbackCall, UserSession } from '../types';
import { getLocalDateTimeString, formatDateTime } from '../utils';
import TablePagination from './TablePagination';
import {
  Plus,
  Edit3,
  Eye,
  Search,
  Info,
  X,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Clock,
  PhoneCall,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import FeedbackCallCarousel from './FeedbackCallCarousel';

interface Props {
  feedbacks: FeedbackCall[];
  onAdd: (item: Omit<FeedbackCall, 'id' | 'addedBy'>) => void;
  onUpdate: (id: string, item: Partial<FeedbackCall>) => void;
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
  
  // Try matching hh:mm:ss AM/PM first
  const fullMatch = timeStr.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})\s*(AM|PM|am|pm)?$/i);
  if (fullMatch) {
    let hr = parseInt(fullMatch[1], 10);
    const min = String(parseInt(fullMatch[2], 10)).padStart(2, '0');
    const sec = String(parseInt(fullMatch[3], 10)).padStart(2, '0');
    let meridian = (fullMatch[4] || 'AM').toUpperCase();
    
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

export default function FeedbackCallView({ feedbacks, onAdd, onUpdate, onDelete, currentUser }: Props) {
  // Form States
  const [date, setDate] = useState(getLocalDateTimeString());
  const [phoneNo, setPhoneNo] = useState('');
  const [userId, setUserId] = useState('biswajitr_nbn');
  const [reason, setReason] = useState<FeedbackCall['reason']>('DISRUPTION IN INTERNET SERVICE');
  const [referFrom, setReferFrom] = useState('');
  const [referTo, setReferTo] = useState('');
  const [feedbackCallTime, setFeedbackCallTime] = useState(getCurrentTimeFormatted());
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState<FeedbackCall['status']>('Pending');
  const [dependentLog, setDependentLog] = useState('');

  // Hour, Minute, Second, Meridian states for Feedback Call Time dropdowns
  const [fbHour, setFbHour] = useState('12');
  const [fbMinute, setFbMinute] = useState('00');
  const [fbSecond, setFbSecond] = useState('00');
  const [fbMeridian, setFbMeridian] = useState('AM');

  // Synchronize dropdowns with feedbackCallTime string changes
  useEffect(() => {
    const { hour, minute, second, meridian } = parseTimeComponents(feedbackCallTime);
    setFbHour(hour);
    setFbMinute(minute);
    setFbSecond(second);
    setFbMeridian(meridian);
  }, [feedbackCallTime]);

  // Helper to update feedbackCallTime state from parts
  const handleFeedbackCallTimeChange = (h: string, m: string, s: string, mer: string) => {
    setFeedbackCallTime(`${h}:${m}:${s} ${mer}`);
  };

  // Edit & View States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<FeedbackCall | null>(null);

  // Filter States
  const [filterDate, setFilterDate] = useState('');
  const [filterReason, setFilterReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAddedBy, setFilterAddedBy] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Check if current reason mandates the extra dependent log block
  const showDependentLog =
    reason === 'DISRUPTION IN INTERNET SERVICE' ||
    reason === 'CONFIGURATION RELATED' ||
    reason === 'VALUE ADDED SERVICE';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) return alert('Date & Time is mandatory');
    if (!phoneNo) return alert('Phone No is mandatory');
    if (!userId) return alert('User ID is mandatory');
    if (!referFrom) return alert('Refer From is mandatory');
    if (!referTo) return alert('Refer To is mandatory');

    if (showDependentLog && !dependentLog) {
      return alert(`Additional Context Logs are required for "${reason}"`);
    }

    const payload = {
      date,
      phoneNo,
      userId,
      reason,
      referFrom,
      referTo,
      feedbackCallTime: feedbackCallTime || undefined,
      remarks: remarks || undefined,
      status,
      dependentLog: showDependentLog ? dependentLog : undefined
    };

    if (editingId) {
      onUpdate(editingId, payload);
      setEditingId(null);
    } else {
      onAdd(payload);
    }

    resetForm();
  };

  const startEdit = (item: FeedbackCall) => {
    setEditingId(item.id);
    setDate(item.date);
    setPhoneNo(item.phoneNo);
    setUserId(item.userId);
    setReason(item.reason);
    setReferFrom(item.referFrom);
    setReferTo(item.referTo);
    setFeedbackCallTime(item.feedbackCallTime || '');
    setRemarks(item.remarks || '');
    setStatus(item.status);
    setDependentLog(item.dependentLog || '');
    safeScrollToForm('feedback-form');
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

  const resetForm = () => {
    setEditingId(null);
    setDate(getLocalDateTimeString());
    setPhoneNo('');
    setUserId('biswajitr_nbn');
    setReason('DISRUPTION IN INTERNET SERVICE');
    setReferFrom('');
    setReferTo('');
    setFeedbackCallTime(getCurrentTimeFormatted());
    setRemarks('');
    setStatus('Pending');
    setDependentLog('');
  };

  // Filtering
  const filteredFeedbacks = feedbacks.filter((item) => {
    if (filterDate && !item.date.startsWith(filterDate)) return false;
    if (filterReason && item.reason !== filterReason) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    if (filterAddedBy && !item.addedBy.toLowerCase().includes(filterAddedBy.toLowerCase())) return false;

    if (globalSearch) {
      const s = globalSearch.toLowerCase();
      const match =
        item.phoneNo.toLowerCase().includes(s) ||
        item.userId.toLowerCase().includes(s) ||
        item.reason.toLowerCase().includes(s) ||
        item.referFrom.toLowerCase().includes(s) ||
        item.referTo.toLowerCase().includes(s) ||
        (item.remarks && item.remarks.toLowerCase().includes(s)) ||
        (item.dependentLog && item.dependentLog.toLowerCase().includes(s));
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    const timeA = a.createdTime ? new Date(a.createdTime).getTime() : new Date(a.date).getTime();
    const timeB = b.createdTime ? new Date(b.createdTime).getTime() : new Date(b.date).getTime();
    return timeB - timeA;
  });

  // Pagination
  const totalItems = filteredFeedbacks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedFeedbacks = filteredFeedbacks.slice(
    (activePage - 1) * rowsPerPage,
    activePage * rowsPerPage
  );

  // Sync state if out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalItems, rowsPerPage, totalPages, currentPage]);

  // Statistics Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayIncidents = feedbacks.filter((f) => f.date && f.date.includes(todayStr));
  const pendingCallsCount = feedbacks.filter((f) => f.status === 'Pending').length;
  const solvedCallsCount = feedbacks.filter((f) => f.status === 'Solved').length;

  return (
    <div className="space-y-6" id="feedback-call-view-module">
      {/* 1. Dynamic Interactive Carousel */}
      <FeedbackCallCarousel feedbacks={feedbacks} />

      {/* 2. Interactive Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="feedback-stats-grid">
        {/* Card 1: Total Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="fb-stat-card-total"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Incidents</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {feedbacks.length}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Logged</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Historical feedback tickets
          </p>
        </motion.div>

        {/* Card 2: Today's Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="fb-stat-card-today"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Incidents</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {todayIncidents.length}
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold">Active</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Registered on current shift
          </p>
        </motion.div>

        {/* Card 3: Total Pending */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="fb-stat-card-pending"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pending</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {pendingCallsCount}
            </span>
            <span className="text-[10px] text-rose-600 font-semibold">Awaiting</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Pending customer validation
          </p>
        </motion.div>

        {/* Card 4: Total Solved */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="fb-stat-card-solved"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Solved</span>
            <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {solvedCallsCount}
            </span>
            <span className="text-[10px] text-violet-600 font-semibold">Resolved</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Successfully closed tickets
          </p>
        </motion.div>
      </div>

      {/* 3. Add/Edit Form Card (MID ROW) */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200" id="feedback-form-card">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {editingId ? '✏️ Edit Feedback Call Details' : '📞 Log Customer Feedback Call'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Log incoming feedback queries, quality verification calls, and customer satisfaction levels
            </p>
          </div>
          {editingId && (
            <button
              onClick={resetForm}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans" id="feedback-form">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date & Time */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Phone No */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Phone No <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 7501516900"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden font-mono"
              />
            </div>

            {/* User ID */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                User ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. biswajitr_nbn"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden font-mono"
              />
            </div>

            {/* Feedback Call Time */}
            <div className="flex flex-col relative" id="field-feedback-time">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Feedback Call Time</label>
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackCallTime(getCurrentTimeFormatted());
                  }}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider cursor-pointer"
                >
                  ⚡ Now
                </button>
              </div>
              
              {/* Dropdowns row */}
              <div className="flex gap-1 items-center mb-1.5">
                {/* Hours select */}
                <div className="flex-1 flex flex-col min-w-0">
                  <select
                    value={fbHour}
                    onChange={(e) => handleFeedbackCallTimeChange(e.target.value, fbMinute, fbSecond, fbMeridian)}
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors text-center font-mono cursor-pointer w-full"
                    id="input-fb-hour"
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
                    value={fbMinute}
                    onChange={(e) => handleFeedbackCallTimeChange(fbHour, e.target.value, fbSecond, fbMeridian)}
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors text-center font-mono cursor-pointer w-full"
                    id="input-fb-minute"
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
                    value={fbSecond}
                    onChange={(e) => handleFeedbackCallTimeChange(fbHour, fbMinute, e.target.value, fbMeridian)}
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors text-center font-mono cursor-pointer w-full"
                    id="input-fb-second"
                  >
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* AM/PM select */}
                <div className="w-16 flex flex-col ml-1">
                  <select
                    value={fbMeridian}
                    onChange={(e) => handleFeedbackCallTimeChange(fbHour, fbMinute, fbSecond, e.target.value)}
                    className="border border-slate-200 bg-slate-50/50 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors text-center font-bold cursor-pointer w-full"
                    id="input-fb-meridian"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              {/* Manual Editable Input */}
              <input
                type="text"
                placeholder="e.g. 10:45:00 AM"
                value={feedbackCallTime}
                onChange={(e) => setFeedbackCallTime(e.target.value)}
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors font-mono w-full"
                id="input-fb-time-manual"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Reason Dropdown */}
            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Feedback / Query Reason <span className="text-rose-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as FeedbackCall['reason'])}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="DISRUPTION IN INTERNET SERVICE">DISRUPTION IN INTERNET SERVICE</option>
                <option value="CONFIGURATION RELATED">CONFIGURATION RELATED</option>
                <option value="CONNECTION ISSUE">CONNECTION ISSUE</option>
                <option value="OTHERS ISSUE">OTHERS ISSUE</option>
                <option value="SPEED ISSUE">SPEED ISSUE</option>
                <option value="Request Related">Request Related</option>
                <option value="GENERAL QUERY">GENERAL QUERY</option>
                <option value="VALUE ADDED SERVICE">VALUE ADDED SERVICE</option>
                <option value="Zone Down">Zone Down</option>
                <option value="ILL Related">ILL Related</option>
              </select>
            </div>

            {/* Refer From */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Refer From <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Frontdesk Agent"
                value={referFrom}
                onChange={(e) => setReferFrom(e.target.value)}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Refer To */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Refer To <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. NOC Team"
                value={referTo}
                onChange={(e) => setReferTo(e.target.value)}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Conditional Dependent Log Block */}
          {showDependentLog && (
            <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100/50 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-1 text-rose-800">
                <Info className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Contextual Outage Logs required</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Because this ticket is filed under **{reason}**, you must fill out the following system logs to diagnose connection/vlan properties.
              </p>
              <div className="flex flex-col">
                <textarea
                  rows={2}
                  placeholder="Provide precise router connection logs, signal power parameters, or auth failures..."
                  value={dependentLog}
                  onChange={(e) => setDependentLog(e.target.value)}
                  required={showDependentLog}
                  className="border border-slate-200 bg-white rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Remarks */}
            <div className="flex flex-col md:col-span-3">
              <label className="text-xs font-semibold text-slate-700 mb-1">Remarks & Details</label>
              <input
                type="text"
                placeholder="General description of resolution details or customer response..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Status */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FeedbackCall['status'])}
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="Pending">🔴 Pending Verification</option>
                <option value="Solved">🟢 Solved / Closed</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              {editingId ? 'Update Feedback Call' : 'Log Feedback Call'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Log View Table (BOTTOM ROW) */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200" id="feedback-log-card">
        {/* Table Title and Search */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
              📋 Feedback Calls & Escalations log
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Active ledger of registered client complaints and satisfaction calls
            </p>
          </div>

          <div className="w-full lg:w-72 relative">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search phone, userId, remarks..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl mb-5 border border-slate-100">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Filter Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Query Reason</label>
            <select
              value={filterReason}
              onChange={(e) => {
                setFilterReason(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="">All Reasons</option>
              <option value="DISRUPTION IN INTERNET SERVICE">DISRUPTION IN INTERNET SERVICE</option>
              <option value="CONFIGURATION RELATED">CONFIGURATION RELATED</option>
              <option value="CONNECTION ISSUE">CONNECTION ISSUE</option>
              <option value="OTHERS ISSUE">OTHERS ISSUE</option>
              <option value="SPEED ISSUE">SPEED ISSUE</option>
              <option value="Request Related">Request Related</option>
              <option value="GENERAL QUERY">GENERAL QUERY</option>
              <option value="VALUE ADDED SERVICE">VALUE ADDED SERVICE</option>
              <option value="Zone Down">Zone Down</option>
              <option value="ILL Related">ILL Related</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Solved">Solved</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Created By</label>
            <input
              type="text"
              placeholder="Username..."
              value={filterAddedBy}
              onChange={(e) => {
                setFilterAddedBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
            />
          </div>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs" id="feedback-table">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <th className="p-3">Date & Time</th>
                <th className="p-3">User & Contact</th>
                <th className="p-3">Query Category</th>
                <th className="p-3">Referral route</th>
                <th className="p-3 w-1/3">Remarks</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedFeedbacks.length > 0 ? (
                paginatedFeedbacks.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-medium text-slate-700 whitespace-nowrap">
                      <div>{formatDateTime(item.date)}</div>
                      {item.feedbackCallTime && (
                        <div className="text-[10px] text-slate-400 font-medium">Call: {item.feedbackCallTime}</div>
                      )}
                      {item.editedBy && (
                        <div className="text-[9px] text-indigo-600 font-semibold mt-1 bg-indigo-50/70 rounded-md py-0.5 px-1.5 inline-block border border-indigo-100/50" title={`Last updated: ${formatDateTime(item.updatedTime || '')}`}>
                          ✏️ Edited by {item.editedBy}
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-mono">
                      <div className="font-bold text-slate-800">{item.phoneNo}</div>
                      <div className="text-[10px] text-slate-400">UID: {item.userId}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-700 text-[11px] block">{item.reason}</span>
                      {item.dependentLog && (
                        <span className="text-[10px] text-rose-600 font-semibold italic block mt-0.5 truncate max-w-[150px]">
                          [VLAN Log attached]
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 whitespace-nowrap">
                      <div>From: <span className="font-semibold text-slate-700">{item.referFrom}</span></div>
                      <div>To: <span className="font-semibold text-slate-700">{item.referTo}</span></div>
                    </td>
                    <td className="p-3 text-slate-500 max-w-xs truncate" title={item.remarks}>
                      {item.remarks || <span className="text-slate-300 italic">No remarks</span>}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
                          item.status === 'Pending' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Pending' ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600'}`} />
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewingItem(item)}
                          className="p-1 text-slate-500 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1 text-slate-700 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
                          title="Edit Record"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {(currentUser?.role === 'Admin' || item.addedBy === currentUser?.username) && onDelete && (
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
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400 font-semibold italic">
                    No matching feedback call logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & Pagination */}
        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between px-1">
          <span>Supervisor Session log actively recorded. Deletion features restricted.</span>
          <span className="font-mono text-slate-500">Commited By system tracking</span>
        </div>

        <TablePagination
          currentPage={currentPage}
          totalItems={totalItems}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          idPrefix="feedback-pag"
        />
      </div>

      {/* 3. Detailed View Modal */}
      {viewingItem && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setViewingItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Feedback Ticket Detail</span>
                <h3 className="text-base font-bold text-slate-800">
                  ID: {viewingItem.id}
                </h3>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Date Created</span>
                  <span className="font-bold text-slate-800">{formatDateTime(viewingItem.date)}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Assigned Registrar</span>
                  <span className="font-bold text-slate-800 font-mono">{viewingItem.addedBy}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Customer Contact No</span>
                  <span className="font-bold text-slate-800 font-mono">{viewingItem.phoneNo}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">User Code / ID</span>
                  <span className="font-bold text-slate-800 font-mono">{viewingItem.userId}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Referral Source</span>
                  <span className="font-bold text-slate-800">{viewingItem.referFrom}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Escalated Destination</span>
                  <span className="font-bold text-slate-800">{viewingItem.referTo}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Feedback Call Time</span>
                  <span className="font-bold text-slate-800">{viewingItem.feedbackCallTime || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Ticket Status</span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                      viewingItem.status === 'Pending' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {viewingItem.status}
                  </span>
                </div>
              </div>

              {/* Dependent diagnostic logs */}
              {viewingItem.dependentLog && (
                <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100/50">
                  <span className="text-rose-800 block text-[9px] uppercase tracking-wider font-bold mb-1">Outage Signal & VLAN Diagnostics Logs</span>
                  <p className="text-slate-700 font-semibold font-mono leading-relaxed break-words whitespace-pre-wrap">
                    {viewingItem.dependentLog}
                  </p>
                </div>
              )}

              {/* Remarks */}
              <div>
                <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Agent Remarks</span>
                <p className="bg-slate-50 p-3 rounded-lg text-slate-700 leading-relaxed font-semibold border border-slate-100">
                  {viewingItem.remarks || <span className="text-slate-300 italic">No custom remarks reported</span>}
                </p>
              </div>
            </div>

            {/* Close button */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingItem(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Dismiss Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
