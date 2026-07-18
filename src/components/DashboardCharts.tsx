/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  NetworkIncident,
  FEDocket,
  FeedbackCall,
  UnlinkRouter,
  ComplaintManagement,
  WhatsAppReport,
  CyberCrimeReport,
  MailWhatsAppCountReport
} from '../types';

interface ChartsProps {
  incidents: NetworkIncident[];
  dockets: FEDocket[];
  feedbacks: FeedbackCall[];
  routers: UnlinkRouter[];
  complaints: ComplaintManagement[];
  waReports: WhatsAppReport[];
  cyberReports: CyberCrimeReport[];
  mailReports: MailWhatsAppCountReport[];
}

export default function DashboardCharts({
  incidents,
  dockets,
  feedbacks,
  routers,
  complaints,
  waReports,
  cyberReports,
  mailReports
}: ChartsProps) {
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const [activePie, setActivePie] = useState<number | null>(null);

  // 1. Calculate stats for the bar chart
  const barData = [
    { name: 'Incidents', mobileName: 'Inc.', count: incidents.length, color: 'bg-rose-500', fill: '#f43f5e' },
    { name: 'FE Dockets', mobileName: 'Dockets', count: dockets.length, color: 'bg-sky-500', fill: '#0ea5e9' },
    { name: 'Feedback Calls', mobileName: 'Feedback', count: feedbacks.length, color: 'bg-emerald-500', fill: '#10b981' },
    { name: 'Unlink Routers', mobileName: 'Routers', count: routers.length, color: 'bg-amber-500', fill: '#f59e0b' },
    { name: 'Complaints', mobileName: 'Complaints', count: complaints.length, color: 'bg-violet-500', fill: '#8b5cf6' },
    { name: 'WA Reports', mobileName: 'WA', count: waReports.length, color: 'bg-teal-500', fill: '#14b8a6', mobileHidden: true },
    { name: 'Cyber Reports', mobileName: 'Cyber', count: cyberReports.length, color: 'bg-indigo-500', fill: '#6366f1', mobileHidden: true },
    { name: 'Mail Counts', mobileName: 'Mail', count: mailReports.length, color: 'bg-fuchsia-500', fill: '#d946ef', mobileHidden: true }
  ];

  const maxCount = Math.max(...barData.map((d) => d.count), 5); // Fallback max value is 5 for nicer scaling

  // 2. Calculate Incident Types distribution for the Donut/Pie chart
  const incidentTypeCounts = incidents.reduce(
    (acc, inc) => {
      acc[inc.type] = (acc[inc.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const incidentTypes = ['Switch', 'NAS', 'OLT', 'Zone', 'Major Issue'] as const;
  const colors = {
    Switch: '#f43f5e',
    NAS: '#0ea5e9',
    OLT: '#10b981',
    Zone: '#f59e0b',
    'Major Issue': '#8b5cf6'
  };

  const donutData = incidentTypes.map((type) => ({
    name: type,
    count: incidentTypeCounts[type] || 0,
    color: colors[type]
  }));

  const totalIncidents = donutData.reduce((sum, d) => sum + d.count, 0);

  // SVG parameters for donut chart
  const size = 180;
  const radius = 65;
  const strokeWidth = 14;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute accumulated percentages for donut slices
  let accumulatedPercent = 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-charts-container">
      {/* 1. Bar Chart Card */}
      <div
        className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between"
        id="module-distribution-chart-card"
      >
        <div>
          <h3 className="font-semibold text-slate-800 tracking-tight text-lg" id="bar-chart-title">
            Module Distribution
          </h3>
          <p className="text-xs text-slate-500 mt-1" id="bar-chart-subtitle">
            Total active records loaded across all primary modules
          </p>
        </div>

        {/* Bar chart graphics */}
        <div className="mt-8 flex items-end justify-between h-48 px-2 gap-2" id="bar-chart-graphics">
          {barData.map((d, index) => {
            const pct = (d.count / maxCount) * 100;
            const isHovered = activeBar === index;
            return (
              <div
                key={d.name}
                className={`flex-1 flex flex-col items-center group relative cursor-pointer ${d.mobileHidden ? 'hidden md:flex' : 'flex'}`}
                onMouseEnter={() => setActiveBar(index)}
                onMouseLeave={() => setActiveBar(null)}
                id={`bar-item-${index}`}
              >
                {/* Tooltip */}
                <div
                  className={`absolute -top-10 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-md transition-all duration-200 pointer-events-none z-10 font-mono shadow-md ${
                    isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95'
                  }`}
                  id={`bar-tooltip-${index}`}
                >
                  {d.count} records
                </div>

                {/* Animated bar */}
                <div className="w-full bg-slate-50 rounded-md h-36 flex items-end overflow-hidden" id={`bar-track-${index}`}>
                  <div
                    style={{ height: `${pct}%` }}
                    className={`w-full rounded-b-md transition-all duration-500 ease-out ${d.color} ${
                      isHovered ? 'brightness-95 scale-x-105' : ''
                    }`}
                    id={`bar-fill-${index}`}
                  />
                </div>

                <span className="text-[10px] text-slate-400 font-medium truncate w-full text-center mt-2" id={`bar-label-${index}`}>
                  <span className="hidden sm:inline">{d.name}</span>
                  <span className="inline sm:hidden">{d.mobileName}</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Bar chart legend */}
        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 pt-4 border-t border-slate-100 text-xs" id="bar-chart-legend">
          {barData.map((d) => (
            <div key={d.name} className={`items-center gap-1.5 ${d.mobileHidden ? 'hidden md:flex' : 'flex'}`} id={`bar-legend-item-${d.name}`}>
              <div className={`w-2 h-2 rounded-full ${d.color}`} />
              <span className="text-slate-600 font-medium">
                <span className="hidden sm:inline">{d.name}</span>
                <span className="inline sm:hidden">{d.mobileName}</span> ({d.count})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Donut Chart Card */}
      <div
        className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between"
        id="incident-categories-chart-card"
      >
        <div>
          <h3 className="font-semibold text-slate-800 tracking-tight text-lg" id="donut-chart-title">
            Network Incident Categories
          </h3>
          <p className="text-xs text-slate-500 mt-1" id="donut-chart-subtitle">
            Proportional share of different network incident types
          </p>
        </div>

        {/* Donut chart body */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-around gap-6" id="donut-chart-body">
          {/* Donut SVG */}
          <div className="relative w-[180px] h-[180px]" id="donut-svg-wrapper">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90" id="donut-svg">
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
                id="donut-bg-circle"
              />
              {totalIncidents > 0 ? (
                donutData.map((slice, index) => {
                  if (slice.count === 0) return null;
                  const percentage = slice.count / totalIncidents;
                  const strokeDasharray = `${percentage * circumference} ${circumference}`;
                  const strokeDashoffset = -accumulatedPercent * circumference;
                  accumulatedPercent += percentage;

                  const isHovered = activePie === index;

                  return (
                    <circle
                      key={slice.name}
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-300 cursor-pointer origin-center"
                      onMouseEnter={() => setActivePie(index)}
                      onMouseLeave={() => setActivePie(null)}
                      id={`donut-slice-${index}`}
                    />
                  );
                })
              ) : (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke="#cbd5e1"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} 0`}
                  id="donut-empty-slice"
                />
              )}
            </svg>

            {/* Absolute Centered Label */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              id="donut-inner-labels"
            >
              <span className="text-3xl font-bold text-slate-800" id="donut-center-total">
                {totalIncidents}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold" id="donut-center-label">
                Incidents
              </span>
            </div>
          </div>

          {/* Donut Details Legend */}
          <div className="flex-1 flex flex-col gap-2.5 w-full sm:w-auto" id="donut-legend">
            {donutData.map((slice, index) => {
              const isHovered = activePie === index;
              const percentage = totalIncidents > 0 ? Math.round((slice.count / totalIncidents) * 100) : 0;
              const isZero = slice.count === 0;
              return (
                <div
                  key={slice.name}
                  className={`items-center justify-between p-1.5 rounded-lg transition-colors duration-150 cursor-pointer ${
                    isHovered ? 'bg-slate-50' : ''
                  } ${isZero ? 'hidden sm:flex' : 'flex'}`}
                  onMouseEnter={() => setActivePie(index)}
                  onMouseLeave={() => setActivePie(null)}
                  id={`donut-legend-row-${index}`}
                >
                  <div className="flex items-center gap-2" id={`donut-legend-info-${index}`}>
                    <div style={{ backgroundColor: slice.color }} className="w-2.5 h-2.5 rounded-full" />
                    <span className="text-xs font-semibold text-slate-700">{slice.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono" id={`donut-legend-stats-${index}`}>
                    <span className="text-slate-900 font-bold">{slice.count}</span>
                    <span className="text-slate-400">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
