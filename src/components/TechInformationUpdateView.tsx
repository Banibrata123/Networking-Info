/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TechInformationUpdate, UserSession } from '../types';
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
  AlertTriangle,
  CheckCircle,
  Activity,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import TechInformationUpdateCarousel from './TechInformationUpdateCarousel';

interface Props {
  updates: TechInformationUpdate[];
  onAdd: (item: Omit<TechInformationUpdate, 'id' | 'addedBy'>) => void;
  onUpdate: (id: string, item: Partial<TechInformationUpdate>) => void;
  onDelete?: (id: string) => void;
  currentUser: UserSession;
}

export default function TechInformationUpdateView({ updates, onAdd, onUpdate, onDelete, currentUser }: Props) {
  // Form States
  const [date, setDate] = useState(getLocalDateTimeString());
  const [heading, setHeading] = useState('');
  const [body, setBody] = useState('');

  // Edit & View States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<TechInformationUpdate | null>(null);

  // Filter States
  const [filterDate, setFilterDate] = useState('');
  const [filterHeading, setFilterHeading] = useState('');
  const [filterAddedBy, setFilterAddedBy] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) return alert('Date & Time is mandatory');
    if (!heading) return alert('Paragraph Heading is mandatory');
    if (!body) return alert('Rich Text Body block is mandatory');

    const payload = {
      date,
      heading,
      body
    };

    if (editingId) {
      onUpdate(editingId, payload);
      setEditingId(null);
    } else {
      onAdd(payload);
    }

    resetForm();
  };

  const startEdit = (item: TechInformationUpdate) => {
    setEditingId(item.id);
    setDate(item.date);
    setHeading(item.heading);
    setBody(item.body);
    safeScrollToForm('tech-update-form');
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
    setHeading('');
    setBody('');
  };

  // Filters
  const filteredUpdates = updates.filter((item) => {
    if (filterDate && !item.date.startsWith(filterDate)) return false;
    if (filterHeading && !item.heading.toLowerCase().includes(filterHeading.toLowerCase())) return false;
    if (filterAddedBy && !item.addedBy.toLowerCase().includes(filterAddedBy.toLowerCase())) return false;

    if (globalSearch) {
      const s = globalSearch.toLowerCase();
      const match =
        item.heading.toLowerCase().includes(s) ||
        item.body.toLowerCase().includes(s) ||
        item.addedBy.toLowerCase().includes(s);
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    const timeA = a.createdTime ? new Date(a.createdTime).getTime() : new Date(a.date).getTime();
    const timeB = b.createdTime ? new Date(b.createdTime).getTime() : new Date(b.date).getTime();
    return timeB - timeA;
  });

  // Pagination
  const totalItems = filteredUpdates.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedUpdates = filteredUpdates.slice(
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
  const todayIncidentsCount = updates.filter((u) => u.date && u.date.includes(todayStr)).length;

  return (
    <div className="space-y-6" id="tech-update-view-module">
      {/* 1. Dynamic Animate Carousel */}
      <TechInformationUpdateCarousel updates={updates} />

      {/* 2. Animated Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="tech-update-stats-grid">
        {/* Card 1: Total Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="tech-stat-card-total"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Incidents</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {updates.length}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold font-mono font-bold">Bulletins</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Historical logs broadcasted
          </p>
        </motion.div>

        {/* Card 2: Today's Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="tech-stat-card-today"
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
            <span className="text-[10px] text-cyan-600 font-semibold font-mono font-bold">Active</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Updates logged on current date
          </p>
        </motion.div>

        {/* Card 3: Network VLAN Segments */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="tech-stat-card-vlan"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Active VLAN Cluster</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">
              VLAN 502
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold font-mono font-bold">Core</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Primary routing subnet zone
          </p>
        </motion.div>

        {/* Card 4: RADIUS Compliance */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs relative overflow-hidden"
          id="tech-stat-card-radius"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">RADIUS Sync Rate</span>
            <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">
              99.99%
            </span>
            <span className="text-[10px] text-violet-600 font-semibold font-mono font-bold">Stable</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Database link integrity success
          </p>
        </motion.div>
      </div>

      {/* 3. Add/Edit Form Card (MID ROW) */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200" id="tech-update-form-card">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {editingId ? '✏️ Edit Tech Info Update' : '📢 Broadcast Technical Update'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Publish infrastructure announcements, scheduled maintenance windows, or configuration guidelines to the Dashboard feed
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

        <form onSubmit={handleSubmit} className="space-y-4 font-sans" id="tech-update-form">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date & Time */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Announce Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Paragraph Heading */}
            <div className="flex flex-col md:col-span-3">
              <label className="text-xs font-semibold text-slate-700 mb-1">
                Paragraph Heading <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Core VLAN 502 Maintenance and Routing Optimizations"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                required
                className="border border-slate-200 bg-slate-50/50 rounded-lg p-2 text-sm text-slate-800 focus:outline-hidden font-semibold"
              />
            </div>
          </div>

          {/* Rich text body block */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-700 mb-1">
              Rich Text Announcement Body <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Type the formal message body here. Support teams will view this notification feed immediately on home dashboard load..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              className="border border-slate-200 bg-slate-50/50 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-hidden resize-y font-sans leading-relaxed"
            />
          </div>

          {/* Action Footer */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              {editingId ? 'Update Broadcast Info' : 'Publish Technical Update'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Log View Table (BOTTOM ROW) */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-200" id="tech-updates-log-card">
        {/* Table Header and Search */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
              📋 Broadcasted Tech Updates ledger
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              LED log tracking active technical broadcasts and infrastructure bulletins (No deletion permitted)
            </p>
          </div>

          <div className="w-full lg:w-72 relative">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search headings, content..."
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl mb-5 border border-slate-100">
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
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Filter Heading</label>
            <input
              type="text"
              placeholder="Heading contains..."
              value={filterHeading}
              onChange={(e) => {
                setFilterHeading(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-slate-200 bg-white rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Publisher</label>
            <input
              type="text"
              placeholder="Publisher username..."
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
          <table className="w-full text-left border-collapse text-xs text-slate-600" id="updates-table">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <th className="p-3">Publish Timestamp</th>
                <th className="p-3">Announcement Heading</th>
                <th className="p-3 w-1/2">Technical Body Content</th>
                <th className="p-3">Broadcast Author</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUpdates.length > 0 ? (
                paginatedUpdates.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                      <div>{formatDateTime(item.date)}</div>
                      {item.editedBy && (
                        <div className="text-[9px] text-indigo-600 font-semibold mt-1 bg-indigo-50/70 rounded-md py-0.5 px-1.5 inline-block border border-indigo-100/50" title={`Last updated: ${formatDateTime(item.updatedTime || '')}`}>
                          ✏️ Edited by {item.editedBy}
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-bold text-slate-800 max-w-xs truncate" title={item.heading}>
                      {item.heading}
                    </td>
                    <td className="p-3 text-slate-500 max-w-md truncate" title={item.body}>
                      {item.body}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-400">{item.addedBy}</td>
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
                  <td colSpan={5} className="p-10 text-center text-slate-400 font-semibold italic">
                    No matching technical updates broadcasted
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
          idPrefix="tech-pag"
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Technical Broadcast Bulletin</span>
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
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Date Broadcasted</span>
                  <span className="font-bold text-slate-800">{formatDateTime(viewingItem.date)}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-0.5">Official Publisher</span>
                  <span className="font-bold text-slate-800 font-mono">{viewingItem.addedBy}</span>
                </div>
              </div>

              {/* Title block */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold mb-1">Subject / Heading</span>
                <span className="text-slate-800 font-bold font-sans text-sm">{viewingItem.heading}</span>
              </div>

              {/* Body block */}
              <div>
                <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Broadcast Announcement Details</span>
                <p className="bg-slate-50 p-4 rounded-xl text-slate-700 leading-relaxed font-semibold border border-slate-100 whitespace-pre-wrap font-sans">
                  {viewingItem.body}
                </p>
              </div>
            </div>

            {/* Modal actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingItem(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Dismiss Bulletin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
