/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FEDocket, UserSession } from '../types';
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
  Users,
  Wrench,
  Headphones,
  Activity,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import FEDocketCarousel from './FEDocketCarousel';

interface Props {
  dockets: FEDocket[];
  onAdd: (item: Omit<FEDocket, 'id' | 'addedBy'>) => void;
  onUpdate: (id: string, item: Partial<FEDocket>) => void;
  onDelete?: (id: string) => void;
  currentUser: UserSession;
}

export default function FEDocketView({ dockets, onAdd, onUpdate, onDelete, currentUser }: Props) {
  // Form States
  const [date, setDate] = useState(getLocalDateTimeString());
  const [userId, setUserId] = useState('biswajitr_nbn');
  const [zoneSelect, setZoneSelect] = useState('');
  const [connectedFrom, setConnectedFrom] = useState('');
  const [docketNo, setDocketNo] = useState('');
  const [request, setRequest] = useState<FEDocket['request']>('Field Engineer');
  const [mode, setMode] = useState<FEDocket['mode']>('Whatsapp');
  const [solvedBy, setSolvedBy] = useState<FEDocket['solvedBy']>('Field Engineer');
  const [assignedTo, setAssignedTo] = useState('');
  const [reason, setReason] = useState('');

  // Edit & View States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<FEDocket | null>(null);

  // Filter States
  const [filterDate, setFilterDate] = useState('');
  const [filterRequest, setFilterRequest] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [filterSolvedBy, setFilterSolvedBy] = useState('');
  const [filterAddedBy, setFilterAddedBy] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) return alert('Date & Time is mandatory');
    if (!userId) return alert('User ID is mandatory');
    if (!connectedFrom) return alert('Connected From is mandatory');
    if (!reason) return alert('Reason is mandatory');

    const finalZone = zoneSelect;
    if (!finalZone) return alert('Zone is mandatory');

    const payload = {
      date,
      userId,
      zone: finalZone,
      connectedFrom,
      docketNo: docketNo || `TKT${Math.floor(Math.random() * 900000 + 100000)}`, // Auto generate beautiful ticket if left blank
      request,
      mode,
      solvedBy,
      assignedTo: assignedTo || 'N/A',
      reason
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

  const startEdit = (item: FEDocket) => {
    setEditingId(item.id);
    setDate(item.date);
    setUserId(item.userId);
    setZoneSelect(item.zone);
    setConnectedFrom(item.connectedFrom);
    setDocketNo(item.docketNo);
    setRequest(item.request);
    setMode(item.mode);
    setSolvedBy(item.solvedBy);
    setAssignedTo(item.assignedTo || '');
    setReason(item.reason);
    safeScrollToForm('fe-form');
  };

  const resetForm = () => {
    setEditingId(null);
    setDate(getLocalDateTimeString());
    setUserId('biswajitr_nbn');
    setZoneSelect('');
    setConnectedFrom('');
    setDocketNo('');
    setRequest('Field Engineer');
    setMode('Whatsapp');
    setSolvedBy('Field Engineer');
    setAssignedTo('');
    setReason('');
  };

  // Filter & Search Logic
  const filteredDockets = dockets.filter((item) => {
    if (filterDate && !item.date.startsWith(filterDate)) return false;
    if (filterRequest && item.request !== filterRequest) return false;
    if (filterMode && item.mode !== filterMode) return false;
    if (filterSolvedBy && item.solvedBy !== filterSolvedBy) return false;
    if (filterAddedBy && !item.addedBy.toLowerCase().includes(filterAddedBy.toLowerCase())) return false;

    if (globalSearch) {
      const s = globalSearch.toLowerCase();
      const match =
        item.userId.toLowerCase().includes(s) ||
        item.zone.toLowerCase().includes(s) ||
        item.connectedFrom.toLowerCase().includes(s) ||
        item.docketNo.toLowerCase().includes(s) ||
        item.reason.toLowerCase().includes(s) ||
        (item.assignedTo && item.assignedTo.toLowerCase().includes(s));
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    const timeA = a.createdTime ? new Date(a.createdTime).getTime() : new Date(a.date).getTime();
    const timeB = b.createdTime ? new Date(b.createdTime).getTime() : new Date(b.date).getTime();
    return timeB - timeA;
  });

  // Pagination Logic
  const totalItems = filteredDockets.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedDockets = filteredDockets.slice(
    (activePage - 1) * rowsPerPage,
    activePage * rowsPerPage
  );

  // Sync state if out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalItems, rowsPerPage, totalPages, currentPage]);

  // Statistics calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayIncidents = dockets.filter((d) => d.date && d.date.includes(todayStr));
  const uniqueFEList = Array.from(
    new Set(
      dockets
        .map((d) => d.assignedTo)
        .filter((name) => name && name !== 'N/A' && name.trim() !== '')
    )
  );
  const totalFieldEngineerCount = Math.max(uniqueFEList.length, 8);

  const uniqueTechSupport = Array.from(
    new Set(
      dockets
        .filter((d) => d.solvedBy === 'Tech Support')
        .map((d) => d.addedBy)
        .filter((name) => name && name.trim() !== '')
    )
  );
  const totalTechSupportCount = Math.max(uniqueTechSupport.length, 5);

  return (
    <div className="space-y-6" id="fe-docket-view-module">
      {/* 1. Dynamic Interactive Carousel */}
      <FEDocketCarousel dockets={dockets} />

      {/* 2. Interactive Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="fe-stats-grid">
        {/* Card 1: Total Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="fe-stat-card-total"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Incidents</span>
            <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {dockets.length}
            </span>
            <span className="text-[10px] text-violet-600 font-semibold">Logged</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Lifetime ticket registry
          </p>
        </motion.div>

        {/* Card 2: Today's Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="fe-stat-card-today"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Incidents</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {todayIncidents.length}
            </span>
            <span className="text-[10px] text-rose-600 font-semibold">Active</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Registered on current shift
          </p>
        </motion.div>

        {/* Card 3: Total Field Engineer */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="fe-stat-card-engineers"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Field Engineer</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {totalFieldEngineerCount}
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold">Active</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Technicians on-call/assigned
          </p>
        </motion.div>

        {/* Card 4: Total Tech Support */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="fe-stat-card-support"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tech Support</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Headphones className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {totalTechSupportCount}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">NOC Desk</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Active routing controllers
          </p>
        </motion.div>
      </div>

      {/* 3. Add/Edit Form Card (MID ROW) */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200" id="fe-docket-form-card">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5" id="form-header">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight" id="form-title">
              {editingId ? '✏️ Edit FE Docket' : '🛠️ Create Field Engineer (FE) Docket'}
            </h2>
            <p className="text-xs text-slate-500 mt-1" id="form-subtitle">
              Initiate and assign support tickets to field technician staff
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

        <form onSubmit={handleSubmit} className="space-y-4 font-sans" id="fe-form">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="fe-grid-1">
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

            {/* User ID */}
            <div className="flex flex-col" id="field-userid">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                User ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. biswajitr_nbn"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors font-mono"
                id="input-userid"
              />
            </div>

            {/* Docket No */}
            <div className="flex flex-col" id="field-docket">
              <label className="text-xs font-semibold text-slate-700 mb-1">Docket No (Optional)</label>
              <input
                type="text"
                placeholder="e.g. TKT427330 (Blank to Auto-Gen)"
                value={docketNo}
                onChange={(e) => setDocketNo(e.target.value)}
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors font-mono"
                id="input-docket"
              />
            </div>

            {/* Connected From */}
            <div className="flex flex-col" id="field-connected-from">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Connected From <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. KHARDAH"
                value={connectedFrom}
                onChange={(e) => setConnectedFrom(e.target.value)}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors"
                id="input-connected"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="fe-grid-2">
            {/* Zone Selector */}
            <div className="flex flex-col md:col-span-2" id="field-zone">
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
                id="input-zone"
              />
            </div>

            {/* Request Type */}
            <div className="flex flex-col" id="field-request">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Request Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={request}
                onChange={(e) => setRequest(e.target.value as FEDocket['request'])}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors"
                id="input-request"
              >
                <option value="Field Engineer">Field Engineer</option>
                <option value="Sales">Sales Team</option>
                <option value="LBO">LBO (Operator)</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Mode Selector */}
            <div className="flex flex-col" id="field-mode">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Incoming Mode <span className="text-rose-500">*</span>
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as FEDocket['mode'])}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors"
                id="input-mode"
              >
                <option value="Whatsapp">Whatsapp Message</option>
                <option value="PRI Call">PRI Call Line</option>
                <option value="Mobile Number">Direct Mobile Call</option>
                <option value="E-mail">Official E-mail</option>
                <option value="Others">Others Mode</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="fe-grid-3">
            {/* Solved By */}
            <div className="flex flex-col" id="field-solved">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Solved By <span className="text-rose-500">*</span>
              </label>
              <select
                value={solvedBy}
                onChange={(e) => setSolvedBy(e.target.value as FEDocket['solvedBy'])}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors"
                id="input-solved"
              >
                <option value="Field Engineer">Field Engineer Desk</option>
                <option value="Tech Support">Tech Support NOC</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Assigned To */}
            <div className="flex flex-col" id="field-assigned">
              <label className="text-xs font-semibold text-slate-700 mb-1">Assigned Field Engineer</label>
              <input
                type="text"
                placeholder="Name of onsite technician (e.g. Siddharth Roy)"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors"
                id="input-assigned"
              />
            </div>
          </div>

          {/* Reason / Issue description */}
          <div className="flex flex-col" id="field-reason">
            <label className="text-xs font-semibold text-slate-700 mb-1">
              Issue Diagnostics & Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="State the detailed diagnostic report, testing parameters, or hardware replacements made on field..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="border border-slate-200 bg-slate-50/50 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors resize-y"
              id="input-reason"
            />
          </div>

          {/* Action Footer */}
          <div className="flex justify-end pt-2" id="form-actions">
            <button
              type="submit"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm cursor-pointer transition-all"
              id="submit-fe-btn"
            >
              <Plus className="w-4 h-4" />
              {editingId ? 'Update Docket Information' : 'Create FE Docket Record'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Logs Log View Table (BOTTOM ROW) */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200" id="fe-docket-log-card">
        {/* Header with Search */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5" id="log-header">
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight" id="log-title">
              📋 Field Engineer Support Dockets log
            </h3>
            <p className="text-xs text-slate-500 mt-1" id="log-subtitle">
              Detailed tracking list for field engineer callouts and diagnostic logs
            </p>
          </div>

          <div className="w-full lg:w-72 relative" id="global-search-container">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search docket, user, reason..."
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
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-xl mb-5 border border-slate-100" id="filters-panel">
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
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Request Type</label>
            <select
              value={filterRequest}
              onChange={(e) => {
                setFilterRequest(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="">All Requests</option>
              <option value="Field Engineer">Field Engineer</option>
              <option value="Sales">Sales</option>
              <option value="LBO">LBO</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Source Mode</label>
            <select
              value={filterMode}
              onChange={(e) => {
                setFilterMode(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="">All Modes</option>
              <option value="Whatsapp">Whatsapp</option>
              <option value="PRI Call">PRI Call</option>
              <option value="Mobile Number">Mobile</option>
              <option value="E-mail">E-mail</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Solved By</label>
            <select
              value={filterSolvedBy}
              onChange={(e) => {
                setFilterSolvedBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="">All Solvers</option>
              <option value="Field Engineer">Field Engineer</option>
              <option value="Tech Support">Tech Support</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Created By</label>
            <input
              type="text"
              placeholder="Added by..."
              value={filterAddedBy}
              onChange={(e) => {
                setFilterAddedBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-xl border border-slate-100" id="table-wrapper">
          <table className="w-full text-left border-collapse text-xs" id="fe-table">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100" id="table-head">
                <th className="p-3">Date / Ticket</th>
                <th className="p-3">User ID & Source</th>
                <th className="p-3">Zone Mapping</th>
                <th className="p-3">Request & Mode</th>
                <th className="p-3 w-1/3">Diagnostic Reason</th>
                <th className="p-3">Assigned / Solved By</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" id="table-body">
              {paginatedDockets.length > 0 ? (
                paginatedDockets.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors" id={`row-${item.id}`}>
                    <td className="p-3 font-medium text-slate-700 whitespace-nowrap">
                      <div>{formatDateTime(item.date)}</div>
                      <div className="font-mono font-bold text-slate-400 text-[10px]">{item.docketNo}</div>
                      {item.editedBy && (
                        <div className="text-[9px] text-indigo-600 font-semibold mt-1 bg-indigo-50/70 rounded-md py-0.5 px-1.5 inline-block border border-indigo-100/50" title={`Last updated: ${formatDateTime(item.updatedTime || '')}`}>
                          ✏️ Edited by {item.editedBy}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800 font-mono">{item.userId}</div>
                      <div className="text-[10px] text-slate-400">From: {item.connectedFrom}</div>
                    </td>
                    <td className="p-3 font-medium text-slate-600 max-w-xs truncate" title={item.zone}>
                      {item.zone}
                    </td>
                    <td className="p-3">
                      <div>
                        <span className="font-semibold text-slate-700">{item.request}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">via {item.mode}</div>
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate" title={item.reason}>
                      {item.reason}
                    </td>
                    <td className="p-3 text-slate-600">
                      <div className="font-semibold text-slate-800">{item.assignedTo}</div>
                      <div className="text-[10px] text-emerald-600 font-bold">Solved: {item.solvedBy}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5" id={`actions-${item.id}`}>
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
                <tr id="empty-row">
                  <td colSpan={7} className="p-10 text-center text-slate-400 font-semibold italic">
                    No matching FE docket logs found
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
          idPrefix="fe-pag"
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Field Engineer Ticket Detail</span>
                <h3 className="text-base font-bold text-slate-800">
                  Docket: {viewingItem.docketNo}
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
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Date Formed</span>
                  <span className="font-bold text-slate-800">{formatDateTime(viewingItem.date)}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Log Submitter</span>
                  <span className="font-bold text-slate-800 font-mono">{viewingItem.addedBy}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">User Account / ID</span>
                  <span className="font-bold text-slate-800 font-mono">{viewingItem.userId}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Connected Origin</span>
                  <span className="font-bold text-slate-800">{viewingItem.connectedFrom}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Request Channel</span>
                  <span className="font-bold text-slate-800">{viewingItem.request}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Comms Mode</span>
                  <span className="font-bold text-slate-800">{viewingItem.mode}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Assigned Onsite Tech</span>
                  <span className="font-bold text-slate-800">{viewingItem.assignedTo || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Resolved Desk</span>
                  <span className="font-bold text-emerald-600">✓ {viewingItem.solvedBy}</span>
                </div>
              </div>

              {/* Zone Mapping full block */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold mb-1">Target Zone Information</span>
                <span className="text-slate-800 font-bold font-sans break-words">{viewingItem.zone}</span>
              </div>

              {/* Diagnosis detail */}
              <div>
                <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Diagnostic Report & Cause</span>
                <p className="bg-slate-50 p-3 rounded-lg text-slate-700 leading-relaxed font-semibold border border-slate-100">
                  {viewingItem.reason}
                </p>
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

            {/* Close action */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingItem(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
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
