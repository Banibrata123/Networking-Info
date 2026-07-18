/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  idPrefix?: string;
}

export default function TablePagination({
  currentPage,
  totalItems,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  idPrefix = 'pagination'
}: PaginationProps) {
  // Defensive type coercion and validation
  const curPage = Math.max(1, Number(currentPage) || 1);
  const itemsCount = Math.max(0, Number(totalItems) || 0);
  const rPage = Math.max(1, Number(rowsPerPage) || 10);
  const totalPages = Math.max(1, Math.ceil(itemsCount / rPage));

  const handlePrev = () => {
    if (curPage > 1) {
      console.log(`[TablePagination:${idPrefix}] navigating to Prev page:`, curPage - 1);
      onPageChange(curPage - 1);
    }
  };

  const handleNext = () => {
    if (curPage < totalPages) {
      console.log(`[TablePagination:${idPrefix}] navigating to Next page:`, curPage + 1);
      onPageChange(curPage + 1);
    } else {
      console.warn(`[TablePagination:${idPrefix}] handleNext ignored: curPage (${curPage}) >= totalPages (${totalPages})`);
    }
  };

  const handleFirst = () => {
    console.log(`[TablePagination:${idPrefix}] navigating to First page`);
    onPageChange(1);
  };

  const handleLast = () => {
    console.log(`[TablePagination:${idPrefix}] navigating to Last page:`, totalPages);
    onPageChange(totalPages);
  };

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 border-t border-slate-100 text-xs text-slate-500 font-medium"
      id={`${idPrefix}-container`}
    >
      {/* Total Items Tracker */}
      <div className="flex items-center gap-2" id={`${idPrefix}-info`}>
        <span>Showing {itemsCount === 0 ? 0 : (curPage - 1) * rPage + 1} to {Math.min(itemsCount, curPage * rPage)} of {itemsCount} entries</span>
      </div>

      {/* Rows Per Page Selector and Page Tracker */}
      <div className="flex flex-wrap items-center gap-6" id={`${idPrefix}-controls`}>
        <div className="flex items-center gap-2" id={`${idPrefix}-rows-selector`}>
          <span>Rows per page:</span>
          <select
            value={rPage}
            onChange={(e) => {
              const val = Number(e.target.value) || 10;
              console.log(`[TablePagination:${idPrefix}] rowsPerPage changed:`, val);
              onRowsPerPageChange(val);
              onPageChange(1); // Reset to first page
            }}
            className="border border-slate-200 bg-white rounded-md px-2 py-1 text-slate-700 outline-hidden focus:ring-1 focus:ring-slate-500 font-semibold cursor-pointer"
            id={`${idPrefix}-select-rows`}
          >
            {[5, 10, 25, 50, 100].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        {/* Page X of Y Tracking */}
        <div className="text-slate-700 font-semibold" id={`${idPrefix}-page-tracker`}>
          Page {curPage} of {totalPages}
        </div>

        {/* Nav Buttons */}
        <div className="flex items-center gap-1" id={`${idPrefix}-buttons`}>
          <button
            type="button"
            onClick={handleFirst}
            disabled={curPage <= 1}
            className={`p-1.5 rounded-md border border-slate-200 transition-colors ${
              curPage <= 1
                ? 'opacity-40 cursor-not-allowed bg-slate-50'
                : 'hover:bg-slate-50 active:bg-slate-100 text-slate-700'
            }`}
            title="First Page"
            id={`${idPrefix}-btn-first`}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handlePrev}
            disabled={curPage <= 1}
            className={`p-1.5 rounded-md border border-slate-200 transition-colors ${
              curPage <= 1
                ? 'opacity-40 cursor-not-allowed bg-slate-50'
                : 'hover:bg-slate-50 active:bg-slate-100 text-slate-700'
            }`}
            title="Previous Page"
            id={`${idPrefix}-btn-prev`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={curPage >= totalPages}
            className={`p-1.5 rounded-md border border-slate-200 transition-colors ${
              curPage >= totalPages
                ? 'opacity-40 cursor-not-allowed bg-slate-50'
                : 'hover:bg-slate-50 active:bg-slate-100 text-slate-700'
            }`}
            title="Next Page"
            id={`${idPrefix}-btn-next`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleLast}
            disabled={curPage >= totalPages}
            className={`p-1.5 rounded-md border border-slate-200 transition-colors ${
              curPage >= totalPages
                ? 'opacity-40 cursor-not-allowed bg-slate-50'
                : 'hover:bg-slate-50 active:bg-slate-100 text-slate-700'
            }`}
            title="Last Page"
            id={`${idPrefix}-btn-last`}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
