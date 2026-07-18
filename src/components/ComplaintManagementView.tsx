/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ComplaintManagement, UserSession } from '../types';
import { getLocalDateTimeString, formatDateTime, SAMPLE_ZONES } from '../utils';
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
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import ComplaintManagementCarousel from './ComplaintManagementCarousel';

interface Props {
  complaints: ComplaintManagement[];
  onAdd: (item: Omit<ComplaintManagement, 'id' | 'addedBy'>) => void;
  onUpdate: (id: string, item: Partial<ComplaintManagement>) => void;
  onDelete?: (id: string) => void;
  currentUser: UserSession;
}

export default function ComplaintManagementView({ complaints, onAdd, onUpdate, onDelete, currentUser }: Props) {
  // Form States
  const [date, setDate] = useState(getLocalDateTimeString());
  const [userId, setUserId] = useState('biswajitr_nbn');
  const [zoneSelect, setZoneSelect] = useState('');
  const [reference, setReference] = useState<ComplaintManagement['reference']>('Docket');
  const [reason, setReason] = useState('');
  const [referTo, setReferTo] = useState('');
  const [resolutionFromOurEnd, setResolutionFromOurEnd] = useState('');
  const [status, setStatus] = useState<ComplaintManagement['status']>('Pending');
  const [trackingNo, setTrackingNo] = useState('');

  // Edit & View States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<ComplaintManagement | null>(null);

  // Filter States
  const [filterDate, setFilterDate] = useState('');
  const [filterReason, setFilterReason] = useState('');
  const [filterReference, setFilterReference] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAddedBy, setFilterAddedBy] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Conditional logic checker
  const showTrackingNo = reference === 'Docket' || reference === 'Others';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) return alert('Date & Time is mandatory');
    if (!userId) return alert('User ID is mandatory');
    if (!reason) return alert('Reason is mandatory');
    if (!referTo) return alert('Refer To is mandatory');

    if (showTrackingNo && !trackingNo) {
      return alert(`Tracking reference ticket number is required for reference type "${reference}"`);
    }

    const finalZone = zoneSelect;
    if (!finalZone) return alert('Zone selection is mandatory');

    const payload = {
      date,
      userId,
      zone: finalZone,
      reference,
      reason,
      referTo,
      resolutionFromOurEnd: resolutionFromOurEnd || undefined,
      status,
      trackingNo: showTrackingNo ? trackingNo : undefined
    };

    if (editingId) {
      onUpdate(editingId, payload);
      setEditingId(null);
    } else {
      onAdd(payload);
    }

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

  const startEdit = (item: ComplaintManagement) => {
    setEditingId(item.id);
    setDate(item.date);
    setUserId(item.userId);
    setZoneSelect(item.zone);
    setReference(item.reference);
    setReason(item.reason);
    setReferTo(item.referTo);
    setResolutionFromOurEnd(item.resolutionFromOurEnd || '');
    setStatus(item.status);
    setTrackingNo(item.trackingNo || '');
    safeScrollToForm('complaint-form');
  };

  const resetForm = () => {
    setEditingId(null);
    setDate(getLocalDateTimeString());
    setUserId('biswajitr_nbn');
    setZoneSelect('');
    setReference('Docket');
    setReason('');
    setReferTo('');
    setResolutionFromOurEnd('');
    setStatus('Pending');
    setTrackingNo('');
  };

  // Filter & Search Logic
  const filteredComplaints = complaints.filter((item) => {
    if (filterDate && !item.date.startsWith(filterDate)) return false;
    if (filterReason && !item.reason.toLowerCase().includes(filterReason.toLowerCase())) return false;
    if (filterReference && item.reference !== filterReference) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    if (filterAddedBy && !item.addedBy.toLowerCase().includes(filterAddedBy.toLowerCase())) return false;

    if (globalSearch) {
      const s = globalSearch.toLowerCase();
      const match =
        item.userId.toLowerCase().includes(s) ||
        item.zone.toLowerCase().includes(s) ||
        item.reason.toLowerCase().includes(s) ||
        item.referTo.toLowerCase().includes(s) ||
        (item.trackingNo && item.trackingNo.toLowerCase().includes(s)) ||
        (item.resolutionFromOurEnd && item.resolutionFromOurEnd.toLowerCase().includes(s));
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    const timeA = a.createdTime ? new Date(a.createdTime).getTime() : new Date(a.date).getTime();
    const timeB = b.createdTime ? new Date(b.createdTime).getTime() : new Date(b.date).getTime();
    return timeB - timeA;
  });

  // Pagination Logic
  const totalItems = filteredComplaints.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedComplaints = filteredComplaints.slice(
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
  const todayIncidentsCount = complaints.filter((c) => c.date && c.date.includes(todayStr)).length;
  const totalPendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const totalSolvedCount = complaints.filter((c) => c.status === 'Solved').length;

  return (
    <div className="space-y-6" id="complaint-view-module">
      {/* 1. Dynamic Animate Carousel */}
      <ComplaintManagementCarousel complaints={complaints} />

      {/* 2. Animated Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="complaint-stats-grid">
        {/* Card 1: Total Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="co-stat-card-total"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Incidents</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {complaints.length}
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold font-mono">Tickets</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Historical logged escalations
          </p>
        </motion.div>

        {/* Card 2: Today's Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="co-stat-card-today"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Today's Incidents</span>
            <div className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {todayIncidentsCount}
            </span>
            <span className="text-[10px] text-cyan-600 font-semibold font-mono">Active</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Registered on current date
          </p>
        </motion.div>

        {/* Card 3: Total Pending */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="co-stat-card-pending"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Pending</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {totalPendingCount}
            </span>
            <span className="text-[10px] text-rose-600 font-semibold font-mono">Unsolved</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Awaiting NOC review
          </p>
        </motion.div>

        {/* Card 4: Total Solved */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="co-stat-card-solved"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Solved</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {totalSolvedCount}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold font-mono">Resolved</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Successfully closed tickets
          </p>
        </motion.div>
      </div>

      {/* 3. Add/Edit Form Card (MID ROW) */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200" id="complaint-form-card">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {editingId ? '✏️ Edit Complaint Record' : '📂 Log/Track Customer Complaint'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              File complex client escalations, LBO partner disputes, and track formal resolutions
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

        <form onSubmit={handleSubmit} className="space-y-4 font-sans" id="complaint-form">
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

            {/* Reference */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Reference Source <span className="text-rose-500">*</span>
              </label>
              <select
                value={reference}
                onChange={(e) => setReference(e.target.value as ComplaintManagement['reference'])}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="Mail">Official Mail</option>
                <option value="Docket">Helpdesk Docket</option>
                <option value="Phone No">Phone Call Helpline</option>
                <option value="Whatsapp">Whatsapp Business</option>
                <option value="Others">Others Channel</option>
              </select>
            </div>

            {/* Refer To */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Refer To <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sub-regional Partner Head"
                value={referTo}
                onChange={(e) => setReferTo(e.target.value)}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Zone Selection */}
            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Network Zone Selection <span className="text-rose-500">*</span>
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

            {/* Conditional Tracking No */}
            {showTrackingNo && (
              <div className="flex flex-col animate-fadeIn">
                <label className="text-xs font-semibold text-slate-700 mb-1">
                  Reference/Tracking No <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. TKT559123 or Reference ID"
                  value={trackingNo}
                  onChange={(e) => setTrackingNo(e.target.value)}
                  required={showTrackingNo}
                  className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden font-mono"
                />
              </div>
            )}

            {/* Status */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ComplaintManagement['status'])}
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="Pending">🔴 Pending Redressal</option>
                <option value="Solved">🟢 Resolved / Closed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reason / Complaint Description */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Reason / Complaint Statement <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="State the detailed issue description, physical topology concerns, or SLA breach threats..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-hidden resize-y"
              />
            </div>

            {/* Resolution From Our End */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">Resolution Details</label>
              <textarea
                rows={3}
                placeholder="Provide official NOC/management resolution summary and action steps performed to close this complaint..."
                value={resolutionFromOurEnd}
                onChange={(e) => setResolutionFromOurEnd(e.target.value)}
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-hidden resize-y"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              {editingId ? 'Update Complaint' : 'Register Complaint Log'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Log View Table (BOTTOM ROW) */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200" id="complaints-log-card">
        {/* Header with Search */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
              📋 Registered Complaint Management Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Active ledger of registered partner escalations with official management resolution status
            </p>
          </div>

          <div className="w-full lg:w-72 relative">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, zone, reason..."
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
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-xl mb-5 border border-slate-100">
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
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Reference</label>
            <select
              value={filterReference}
              onChange={(e) => {
                setFilterReference(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="">All</option>
              <option value="Mail">Mail</option>
              <option value="Docket">Docket</option>
              <option value="Phone No">Phone No</option>
              <option value="Whatsapp">Whatsapp</option>
              <option value="Others">Others</option>
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
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Filter Reason</label>
            <input
              type="text"
              placeholder="Reason contains..."
              value={filterReason}
              onChange={(e) => {
                setFilterReason(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Registrar</label>
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

        {/* Responsive Table & Card Layout */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100" id="table-wrapper">
          <table className="w-full text-left border-collapse text-xs" id="complaint-table">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <th className="p-3">Date & Time</th>
                <th className="p-3">User & Zone</th>
                <th className="p-3">Reference Source</th>
                <th className="p-3">Escalated To</th>
                <th className="p-3 w-1/3">Complaint Reason</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedComplaints.length > 0 ? (
                paginatedComplaints.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-medium text-slate-700 whitespace-nowrap">
                      <div>{formatDateTime(item.date)}</div>
                      {item.editedBy && (
                        <div className="text-[9px] text-indigo-600 font-semibold mt-1 bg-indigo-50/70 rounded-md py-0.5 px-1.5 inline-block border border-indigo-100/50" title={`Last updated: ${formatDateTime(item.updatedTime || '')}`}>
                          ✏️ Edited by {item.editedBy}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800 font-mono">{item.userId}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]" title={item.zone}>{item.zone}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-700">{item.reference}</div>
                      {item.trackingNo && (
                        <div className="font-mono text-[10px] text-slate-400 font-bold">Ref: {item.trackingNo}</div>
                      )}
                    </td>
                    <td className="p-3 text-slate-700 font-semibold whitespace-nowrap">
                      {item.referTo}
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate" title={item.reason}>
                      {item.reason}
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
                    No matching registered complaint files found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="block md:hidden space-y-4" id="mobile-cards-wrapper">
          {paginatedComplaints.length > 0 ? (
            paginatedComplaints.map((item) => (
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
                      item.status === 'Pending' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Pending' ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600'}`} />
                    {item.status}
                  </span>
                </div>

                {/* Subheader: User ID and Zone */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">User ID:</span>
                    <span className="font-mono text-xs font-bold text-slate-800">{item.userId}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Zone:</span>
                    <div className="font-semibold text-slate-700 break-words line-clamp-2" title={item.zone}>{item.zone}</div>
                  </div>
                </div>

                {/* Source & Assigned Mediator */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase text-[9px] tracking-wider">Reference Source</span>
                    <div className="font-bold text-slate-700">{item.reference}</div>
                    {item.trackingNo && (
                      <div className="font-mono text-[9px] text-slate-400 font-bold">Ref: {item.trackingNo}</div>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase text-[9px] tracking-wider">Escalated To</span>
                    <span className="font-bold text-slate-700">{item.referTo}</span>
                  </div>
                </div>

                {/* Complaint Reason */}
                <div className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/50">
                  <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider mb-0.5">Complaint Reason</span>
                  <p className="line-clamp-3 leading-relaxed">{item.reason}</p>
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

                  {(currentUser?.role === 'Admin' || item.addedBy === currentUser?.username) && onDelete && (
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
              No matching registered complaint files found
            </div>
          )}
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
          idPrefix="complaint-pag"
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Formal Escalation File</span>
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
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Date Lodged</span>
                  <span className="font-bold text-slate-800">{formatDateTime(viewingItem.date)}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Registrar</span>
                  <span className="font-bold text-slate-800 font-mono">{viewingItem.addedBy}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Affected Account ID</span>
                  <span className="font-bold text-slate-800 font-mono">{viewingItem.userId}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Reference Medium</span>
                  <span className="font-bold text-slate-800">{viewingItem.reference}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Tracking No</span>
                  <span className="font-bold text-slate-800 font-mono">{viewingItem.trackingNo || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Assigned Mediator</span>
                  <span className="font-bold text-slate-800">{viewingItem.referTo}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Escalation Status</span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                      viewingItem.status === 'Pending' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {viewingItem.status}
                  </span>
                </div>
              </div>

              {/* Zone Mapping */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold mb-1">Target Account Zone</span>
                <span className="text-slate-800 font-bold font-sans break-words">{viewingItem.zone}</span>
              </div>

              {/* Complaint Statement */}
              <div>
                <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Complaint & Issue Statement</span>
                <p className="bg-slate-50 p-3 rounded-lg text-slate-700 leading-relaxed font-semibold border border-slate-100">
                  {viewingItem.reason}
                </p>
              </div>

              {/* Resolution details */}
              <div>
                <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Official Resolution & NOC Remediation</span>
                <p className="bg-slate-50 p-3 rounded-lg text-slate-700 leading-relaxed font-semibold border border-slate-100">
                  {viewingItem.resolutionFromOurEnd || (
                    <span className="text-slate-400 italic">No official resolution has been logged yet (Pending remediation)</span>
                  )}
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
                                ? history.status === 'Pending'
                                  ? 'bg-rose-600 ring-rose-50'
                                  : 'bg-emerald-600 ring-emerald-50'
                                : 'bg-slate-300'
                            }`} 
                          />
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                history.status === 'Pending'
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
            </div>

            {/* Modal actions */}
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
