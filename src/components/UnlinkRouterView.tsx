/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UnlinkRouter, UserSession } from '../types';
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
  Layers,
  Cpu,
  Monitor,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import UnlinkRouterCarousel from './UnlinkRouterCarousel';

interface Props {
  routers: UnlinkRouter[];
  onAdd: (item: Omit<UnlinkRouter, 'id' | 'addedBy'>) => void;
  onUpdate: (id: string, item: Partial<UnlinkRouter>) => void;
  onDelete?: (id: string) => void;
  currentUser: UserSession;
}

export default function UnlinkRouterView({ routers, onAdd, onUpdate, onDelete, currentUser }: Props) {
  // Form States
  const [date, setDate] = useState(getLocalDateTimeString());
  const [userId, setUserId] = useState('biswajitr_nbn');
  const [zoneCode, setZoneCode] = useState('');
  const [connectionType, setConnectionType] = useState<UnlinkRouter['connectionType']>('IPoE');
  const [macAddress, setMacAddress] = useState('');
  const [requestBy, setRequestBy] = useState<UnlinkRouter['requestBy']>('Field Engineer');
  const [mode, setMode] = useState<UnlinkRouter['mode']>('Whatsapp');
  const [issue, setIssue] = useState('');
  const [routerType, setRouterType] = useState<UnlinkRouter['routerType']>('Digisol');
  const [supplementalLog, setSupplementalLog] = useState('');
  const [requestByContext, setRequestByContext] = useState('');

  // Edit & View States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<UnlinkRouter | null>(null);

  // Filter States
  const [filterDate, setFilterDate] = useState('');
  const [filterConnectionType, setFilterConnectionType] = useState('');
  const [filterRequestBy, setFilterRequestBy] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [filterRouterType, setFilterRouterType] = useState('');
  const [filterAddedBy, setFilterAddedBy] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) return alert('Date & Time is mandatory');
    if (!userId) return alert('User ID is mandatory');
    if (!zoneCode) return alert('Zone Code is mandatory');
    if (!macAddress) return alert('MAC Address is mandatory');
    if (!issue) return alert('Issue description is mandatory');
    if (!requestByContext) return alert('Requestor Context details are mandatory');

    if (connectionType === 'IPoE' && !supplementalLog) {
      return alert('Supplemental Logs are required for IPoE connection types');
    }

    const payload = {
      date,
      userId,
      zoneCode,
      connectionType,
      macAddress,
      requestBy,
      mode,
      issue,
      routerType,
      requestByContext,
      supplementalLog: connectionType === 'IPoE' ? supplementalLog : undefined
    };

    if (editingId) {
      onUpdate(editingId, payload);
      setEditingId(null);
    } else {
      onAdd(payload);
    }

    resetForm();
  };

  const startEdit = (item: UnlinkRouter) => {
    setEditingId(item.id);
    setDate(item.date);
    setUserId(item.userId);
    setZoneCode(item.zoneCode);
    setConnectionType(item.connectionType);
    setMacAddress(item.macAddress);
    setRequestBy(item.requestBy);
    setMode(item.mode);
    setIssue(item.issue);
    setRouterType(item.routerType);
    setSupplementalLog(item.supplementalLog || '');
    setRequestByContext(item.requestByContext || '');
    safeScrollToForm('unlink-form');
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
    setUserId('biswajitr_nbn');
    setZoneCode('');
    setConnectionType('IPoE');
    setMacAddress('');
    setRequestBy('Field Engineer');
    setMode('Whatsapp');
    setIssue('');
    setRouterType('Digisol');
    setSupplementalLog('');
    setRequestByContext('');
  };

  // Filter & Search Logic
  const filteredRouters = routers.filter((item) => {
    if (filterDate && !item.date.startsWith(filterDate)) return false;
    if (filterConnectionType && item.connectionType !== filterConnectionType) return false;
    if (filterRequestBy && item.requestBy !== filterRequestBy) return false;
    if (filterMode && item.mode !== filterMode) return false;
    if (filterRouterType && item.routerType !== filterRouterType) return false;
    if (filterAddedBy && !item.addedBy.toLowerCase().includes(filterAddedBy.toLowerCase())) return false;

    if (globalSearch) {
      const s = globalSearch.toLowerCase();
      const match =
        item.userId.toLowerCase().includes(s) ||
        item.zoneCode.toLowerCase().includes(s) ||
        item.macAddress.toLowerCase().includes(s) ||
        item.issue.toLowerCase().includes(s) ||
        item.requestByContext?.toLowerCase().includes(s);
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    const timeA = a.createdTime ? new Date(a.createdTime).getTime() : new Date(a.date).getTime();
    const timeB = b.createdTime ? new Date(b.createdTime).getTime() : new Date(b.date).getTime();
    return timeB - timeA;
  });

  // Pagination Logic
  const totalItems = filteredRouters.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedRouters = filteredRouters.slice(
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
  const todayIncidents = routers.filter((r) => r.date && r.date.includes(todayStr));
  const digisolCount = routers.filter((r) => r.routerType === 'Digisol').length;
  const ovtCount = routers.filter((r) => r.routerType === 'OVT').length;
  const csyCount = routers.filter((r) => r.routerType === 'CSY').length;

  return (
    <div className="space-y-6" id="unlink-router-view-module">
      {/* 1. Dynamic Interactive Carousel */}
      <UnlinkRouterCarousel routers={routers} />

      {/* 2. Interactive Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="unlink-stats-grid">
        {/* Card 1: Total Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="ul-stat-card-total"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Incidents</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {routers.length}
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold">Logged</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Historical unbind logs
          </p>
        </motion.div>

        {/* Card 2: Today's Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="ul-stat-card-today"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Today's Incidents</span>
            <div className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {todayIncidents.length}
            </span>
            <span className="text-[10px] text-cyan-600 font-semibold">Active</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Registered on current shift
          </p>
        </motion.div>

        {/* Card 3: Total Digisol */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="ul-stat-card-digisol"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Digisol</span>
            <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {digisolCount}
            </span>
            <span className="text-[10px] text-violet-600 font-semibold font-mono">CPE Reset</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Digisol vendor unlinks
          </p>
        </motion.div>

        {/* Card 4: Total OVT */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="ul-stat-card-ovt"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total OVT</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {ovtCount}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold font-mono">ONU Link</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            OVT vendor unlinks
          </p>
        </motion.div>

        {/* Card 5: Total CSY */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden col-span-2 md:col-span-1"
          id="ul-stat-card-csy"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total CSY</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {csyCount}
            </span>
            <span className="text-[10px] text-rose-600 font-semibold font-mono">Terminal</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            CSY brand unlinks
          </p>
        </motion.div>
      </div>

      {/* 3. Add/Edit Form Card (MID ROW) */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200" id="unlink-form-card">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {editingId ? '✏️ Edit Router Unlink Record' : '🔌 Request Router MAC Unlink'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              File MAC unbinding requests for hardware replacement, connection type changes, or diagnostic resets
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

        <form onSubmit={handleSubmit} className="space-y-4 font-sans" id="unlink-form">
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

            {/* Zone Code */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Zone Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. J01KB4831"
                value={zoneCode}
                onChange={(e) => setZoneCode(e.target.value)}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden font-mono"
              />
            </div>

            {/* Connection Type */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Connection Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={connectionType}
                onChange={(e) => setConnectionType(e.target.value as UnlinkRouter['connectionType'])}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="IPoE">IPoE (Dynamic/Static DHCP)</option>
                <option value="PPPoE">PPPoE (User Dial Tunnel)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* MAC Address */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                MAC Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 08:63:32:63:8a:4c"
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden font-mono"
              />
            </div>

            {/* Request By with Contextual adjacent field */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Request By <span className="text-rose-500">*</span>
              </label>
              <select
                value={requestBy}
                onChange={(e) => setRequestBy(e.target.value as UnlinkRouter['requestBy'])}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="Field Engineer">Field Engineer</option>
                <option value="Sales">Sales Team</option>
                <option value="LBO">LBO (Operator)</option>
                <option value="USER">Direct User</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* ADJACENT CONTEXTUAL TEXT FIELD REQUIRED FOR ALL CHOICES */}
            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Requester Name / Contact Details <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="State who authorized this unlink (e.g. FE - Santosh G)"
                value={requestByContext}
                onChange={(e) => setRequestByContext(e.target.value)}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mode */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Mode Received <span className="text-rose-500">*</span>
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as UnlinkRouter['mode'])}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="Whatsapp">Whatsapp Message</option>
                <option value="PRI Call">PRI Call Line</option>
                <option value="Mobile Number">Direct Mobile Call</option>
                <option value="E-mail">Official E-mail</option>
                <option value="Others">Others Mode</option>
              </select>
            </div>

            {/* Router Type */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Router Brand Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={routerType}
                onChange={(e) => setRouterType(e.target.value as UnlinkRouter['routerType'])}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="Digisol">Digisol Router</option>
                <option value="OVT">OVT ONU</option>
                <option value="CSY">CSY Brand</option>
                <option value="Others">Others Brand</option>
              </select>
            </div>

            {/* Issue IP / details */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Issue / Pre Auth IP <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 10.28.34.30 Pre Auth IP"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Conditional IPoE Supplemental Log area */}
          {connectionType === 'IPoE' && (
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100/50 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-1 text-amber-800">
                <Info className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Supplemental IPoE DHCP Leases required</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Because connection is set to **IPoE**, please provide the supplemental server-side DHCP lease status or pre-auth routing logs.
              </p>
              <div className="flex flex-col">
                <textarea
                  rows={2}
                  placeholder="Paste DHCP routing tables, MAC mapping anomalies, or static lease constraints..."
                  value={supplementalLog}
                  onChange={(e) => setSupplementalLog(e.target.value)}
                  required={connectionType === 'IPoE'}
                  className="border border-slate-200 bg-white rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden font-mono"
                />
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              {editingId ? 'Update Router Request' : 'File MAC Unlink Request'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Log View Table (BOTTOM ROW) */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200" id="unlink-log-card">
        {/* Table Header and Search */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
              📋 Router MAC Unlink Requests Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Historical view of unbinding actions performed on client CPE/ONU nodes
            </p>
          </div>

          <div className="w-full lg:w-72 relative">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, MAC, issue..."
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
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 bg-slate-50 p-4 rounded-xl mb-5 border border-slate-100">
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
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Conn Type</label>
            <select
              value={filterConnectionType}
              onChange={(e) => {
                setFilterConnectionType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="">All</option>
              <option value="IPoE">IPoE</option>
              <option value="PPPoE">PPPoE</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Requestor</label>
            <select
              value={filterRequestBy}
              onChange={(e) => {
                setFilterRequestBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="">All</option>
              <option value="Field Engineer">Field Engineer</option>
              <option value="Sales">Sales</option>
              <option value="LBO">LBO</option>
              <option value="USER">USER</option>
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
              <option value="">All</option>
              <option value="Whatsapp">Whatsapp</option>
              <option value="PRI Call">PRI Call</option>
              <option value="Mobile Number">Mobile</option>
              <option value="E-mail">E-mail</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">CPE Brand</label>
            <select
              value={filterRouterType}
              onChange={(e) => {
                setFilterRouterType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="">All</option>
              <option value="Digisol">Digisol</option>
              <option value="OVT">OVT</option>
              <option value="CSY">CSY</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Added By</label>
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

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs" id="unlink-table">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <th className="p-3">Date & Time</th>
                <th className="p-3">User & Zone</th>
                <th className="p-3">Router Type</th>
                <th className="p-3">Conn & MAC Addresses</th>
                <th className="p-3">Issue/IP Details</th>
                <th className="p-3">Authorized By</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRouters.length > 0 ? (
                paginatedRouters.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-medium text-slate-700 whitespace-nowrap">
                      <div>{formatDateTime(item.date)}</div>
                      {item.editedBy && (
                        <div className="text-[9px] text-indigo-600 font-semibold mt-1 bg-indigo-50/70 rounded-md py-0.5 px-1.5 inline-block border border-indigo-100/50" title={`Last updated: ${formatDateTime(item.updatedTime || '')}`}>
                          ✏️ Edited by {item.editedBy}
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-mono">
                      <div className="font-bold text-slate-800">{item.userId}</div>
                      <div className="text-[10px] text-slate-400">Zone: {item.zoneCode}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
                        {item.routerType}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-700">{item.connectionType}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.macAddress}</div>
                    </td>
                    <td className="p-3 text-slate-600 font-mono break-words max-w-xs truncate" title={item.issue}>
                      {item.issue}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{item.requestBy}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]" title={item.requestByContext}>
                        ({item.requestByContext})
                      </div>
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
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400 font-semibold italic">
                    No matching router unlink logs found
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
          idPrefix="unlink-pag"
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Router Unlink Ticket Detail</span>
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
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Log Authorizer</span>
                  <span className="font-bold text-slate-800 font-mono">{viewingItem.addedBy}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">User Code ID</span>
                  <span className="font-bold text-slate-800 font-mono">{viewingItem.userId}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Zone Code Code</span>
                  <span className="font-bold text-slate-800 font-mono">{viewingItem.zoneCode}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Connection Type</span>
                  <span className="font-bold text-slate-800">{viewingItem.connectionType}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">MAC Addresses</span>
                  <span className="font-bold text-slate-800 font-mono">{viewingItem.macAddress}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Requested By</span>
                  <span className="font-bold text-slate-800">{viewingItem.requestBy}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Communications Channel</span>
                  <span className="font-bold text-slate-800">{viewingItem.mode}</span>
                </div>
              </div>

              {/* Request By details contextual block */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold mb-1">Requester Session & Authorization Details</span>
                <span className="text-slate-800 font-bold">{viewingItem.requestByContext}</span>
              </div>

              {/* DHCP Leases and IPoE supplemental logs */}
              {viewingItem.supplementalLog && (
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
                  <span className="text-amber-800 block text-[9px] uppercase tracking-wider font-bold mb-1">DHCP Static Leases / Routing Logs</span>
                  <p className="text-slate-700 font-semibold font-mono leading-relaxed break-words whitespace-pre-wrap">
                    {viewingItem.supplementalLog}
                  </p>
                </div>
              )}

              {/* Preauth IP / Issue details */}
              <div>
                <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Reported Pre-Auth IP & MAC Binding Issue</span>
                <p className="bg-slate-50 p-3 rounded-lg text-slate-700 leading-relaxed font-mono font-semibold border border-slate-100">
                  {viewingItem.issue}
                </p>
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
