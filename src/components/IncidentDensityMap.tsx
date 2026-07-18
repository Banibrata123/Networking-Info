/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { NetworkIncident } from '../types';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Compass, Globe, MapPin, Activity } from 'lucide-react';

interface IncidentDensityMapProps {
  incidents: NetworkIncident[];
}

interface Region {
  id: string;
  name: string;
  polygon: [number, number][];
  center: [number, number];
}

const REGIONS: Region[] = [
  {
    id: 'north',
    name: 'North Sector (Khardah / Heria)',
    polygon: [[180, 40], [320, 40], [340, 110], [250, 130], [160, 110]],
    center: [250, 75]
  },
  {
    id: 'east',
    name: 'East Tech Hub (Sector V / Salt Lake)',
    polygon: [[340, 110], [440, 100], [460, 220], [360, 210], [250, 130]],
    center: [365, 155]
  },
  {
    id: 'central',
    name: 'Central Core (Kolkata / Metro)',
    polygon: [[250, 130], [360, 210], [250, 210], [140, 210], [160, 110]],
    center: [250, 165]
  },
  {
    id: 'south',
    name: 'South District (Alipore / South Calcutta)',
    polygon: [[140, 210], [250, 210], [360, 210], [310, 290], [190, 290]],
    center: [250, 250]
  },
  {
    id: 'west',
    name: 'West Port Hub (Heria / Port Area)',
    polygon: [[160, 110], [250, 130], [140, 210], [50, 210], [60, 100]],
    center: [135, 155]
  }
];

export default function IncidentDensityMap({ incidents }: IncidentDensityMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [hoveredIncidentId, setHoveredIncidentId] = useState<string | null>(null);

  // 1. Helper to classify an incident into a geographic region
  const getIncidentRegionId = (incident: NetworkIncident): string => {
    const text = `${incident.zoneCode || ''} ${incident.pop || ''} ${incident.identifier || ''} ${incident.problem || ''}`.toLowerCase();
    
    if (text.includes('khardah') || text.includes('j01kb1055') || text.includes('j01kb803') || text.includes('north')) {
      return 'north';
    }
    if (text.includes('sector') || text.includes('j01kb4831') || text.includes('secv') || text.includes('east') || text.includes('saltlake') || text.includes('salt lake')) {
      return 'east';
    }
    if (text.includes('south') || text.includes('j01kb1202') || text.includes('j01kb2526') || text.includes('alipore')) {
      return 'south';
    }
    if (text.includes('heria') || text.includes('krushna') || text.includes('west') || text.includes('port')) {
      return 'west';
    }
    return 'central';
  };

  // 2. Compute Incident Density metrics for all regions
  const regionMetrics = useMemo(() => {
    const counts: Record<string, number> = { north: 0, east: 0, central: 0, south: 0, west: 0 };
    const openCounts: Record<string, number> = { north: 0, east: 0, central: 0, south: 0, west: 0 };
    
    incidents.forEach((inc) => {
      const regId = getIncidentRegionId(inc);
      if (regId in counts) {
        counts[regId]++;
        if (inc.status === 'Open') {
          openCounts[regId]++;
        }
      }
    });

    const maxCount = Math.max(...Object.values(counts), 1);
    
    // Create D3 color scale (representing Slate to warning Amber/Red gradient)
    const colorScale = d3.scaleLinear<string>()
      .domain([0, maxCount * 0.3, maxCount])
      .range(['rgba(148, 163, 184, 0.08)', 'rgba(245, 158, 11, 0.22)', 'rgba(239, 68, 68, 0.38)']);

    return { counts, openCounts, maxCount, colorScale };
  }, [incidents]);

  // 3. Extract last 5 incidents and map them with coordinate offsets
  const lastFiveIncidents = useMemo(() => {
    const sorted = [...incidents]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Keep track of region placement count to spread offsets deterministically
    const placements: Record<string, number> = {};

    return sorted.map((inc) => {
      const regId = getIncidentRegionId(inc);
      const region = REGIONS.find((r) => r.id === regId) || REGIONS[2]; // fallback central
      
      const count = placements[regId] || 0;
      placements[regId] = count + 1;

      // Deterministic angle & radius dispersion based on placement index
      const angle = (count * 2 * Math.PI) / 4 + 0.5;
      const radius = 22;
      const x = region.center[0] + Math.cos(angle) * radius;
      const y = region.center[1] + Math.sin(angle) * radius;

      return {
        ...inc,
        coords: [x, y] as [number, number],
        regionName: region.name,
        regionId: regId
      };
    });
  }, [incidents]);

  // D3 Organic Curve Path Generator for region boundaries
  const d3Path = useMemo(() => {
    return d3.line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveCardinalClosed.tension(0.2));
  }, []);

  // Generate lightweight cyber-grid points
  const gridPoints = useMemo(() => {
    const points = [];
    for (let x = 15; x < 500; x += 25) {
      for (let y = 15; y < 320; y += 25) {
        points.push({ x, y });
      }
    }
    return points;
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 shadow-xs" id="density-map-module">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Regional Incident Density Map
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic D3 geographic visualization representing live outage concentrations and the last 5 logged locations
          </p>
        </div>
        
        {/* Top Mini Stats */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Total: {incidents.length}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 dark:bg-rose-950/30 rounded text-rose-600 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Active: {incidents.filter(i => i.status === 'Open').length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* D3 SVG Visualization Column */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-100 dark:border-slate-800/60 relative overflow-hidden min-h-[340px]">
          {/* Cyber Technical Grid Pattern overlay */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id="grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" className="fill-slate-300 dark:fill-slate-700" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-dots)" />
            </svg>
          </div>

          {/* Compass & Tech Indicators */}
          <div className="absolute top-3 right-3 text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1 bg-white/60 dark:bg-slate-900/60 px-2 py-1 rounded border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-xs pointer-events-none">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            <span>METRO_TWIN_v1.2</span>
          </div>

          <div className="absolute top-3 left-3 text-[10px] text-slate-400 dark:text-slate-500 font-mono bg-white/60 dark:bg-slate-900/60 px-2 py-1 rounded border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-xs pointer-events-none">
            <span>MAP_COORDS: [22.5726° N, 88.3639° E]</span>
          </div>

          {/* Main Map SVG */}
          <svg
            viewBox="0 0 500 320"
            className="w-full h-auto max-h-[300px] relative z-10 select-none"
            id="d3-geographic-twin-svg"
          >
            {/* Latitude/Longitude Border markings */}
            <g className="opacity-40 text-[8px] font-mono fill-slate-400 dark:fill-slate-500 pointer-events-none">
              <text x="5" y="15">88.30°E</text>
              <text x="455" y="15">88.45°E</text>
              <text x="455" y="310">22.50°N</text>
              <text x="5" y="310">22.65°N</text>
            </g>

            {/* Stylized region paths */}
            <g id="map-regions-group">
              {REGIONS.map((region) => {
                const count = regionMetrics.counts[region.id] || 0;
                const openCount = regionMetrics.openCounts[region.id] || 0;
                const fillCol = regionMetrics.colorScale(count);
                const isHovered = hoveredRegion === region.id;
                
                return (
                  <g key={region.id}>
                    <path
                      d={d3Path(region.polygon) || undefined}
                      fill={fillCol}
                      stroke={isHovered ? 'rgba(239, 68, 68, 0.8)' : 'rgba(148, 163, 184, 0.3)'}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="cursor-pointer transition-all duration-300 ease-out hover:brightness-105"
                      onMouseEnter={() => setHoveredRegion(region.id)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      id={`region-path-${region.id}`}
                    />
                    
                    {/* Region Label at centroid */}
                    <text
                      x={region.center[0]}
                      y={region.center[1] - 8}
                      textAnchor="middle"
                      className={`text-[9px] font-bold tracking-tight pointer-events-none transition-colors duration-200 ${
                        isHovered 
                          ? 'fill-rose-600 dark:fill-rose-400' 
                          : 'fill-slate-700 dark:fill-slate-300 font-medium'
                      }`}
                    >
                      {region.id.toUpperCase()}
                    </text>
                    
                    {/* Tiny Density Tag */}
                    <text
                      x={region.center[0]}
                      y={region.center[1] + 4}
                      textAnchor="middle"
                      className="text-[8px] font-mono fill-slate-400 dark:fill-slate-500 pointer-events-none"
                    >
                      ({count} Inc / {openCount} Op)
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Glowing Interactive Pulse nodes for the Last 5 logged incidents */}
            <g id="map-nodes-group">
              {lastFiveIncidents.map((inc, index) => {
                const [x, y] = inc.coords;
                const isNodeHovered = hoveredIncidentId === inc.id || hoveredRegion === inc.regionId;
                const isDirectlyHovered = hoveredIncidentId === inc.id;

                return (
                  <g
                    key={inc.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIncidentId(inc.id)}
                    onMouseLeave={() => setHoveredIncidentId(null)}
                    id={`incident-node-${inc.id}`}
                  >
                    {/* Outer glowing ripple ring (D3 styling simulation) */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isNodeHovered ? 14 : 8}
                      className={`fill-none transition-all duration-500 ease-out ${
                        inc.status === 'Open'
                          ? 'stroke-rose-500/40 dark:stroke-rose-400/50'
                          : 'stroke-emerald-500/40 dark:stroke-emerald-400/50'
                      }`}
                      strokeWidth={1.5}
                    >
                      {inc.status === 'Open' && (
                        <animate
                          attributeName="r"
                          values="6;16;6"
                          dur={`${1.8 + index * 0.4}s`}
                          repeatCount="indefinite"
                        />
                      )}
                    </circle>

                    {/* Secondary expansion aura */}
                    {isDirectlyHovered && (
                      <circle
                        cx={x}
                        cy={y}
                        r={22}
                        className="fill-none stroke-amber-400/40 animate-pulse"
                        strokeWidth={1}
                        strokeDasharray="2,2"
                      />
                    )}

                    {/* Central solid marker */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isNodeHovered ? 5.5 : 4.5}
                      className={`transition-all duration-300 ${
                        inc.status === 'Open'
                          ? 'fill-rose-500 dark:fill-rose-400 shadow-md'
                          : 'fill-emerald-500 dark:fill-emerald-400'
                      }`}
                    />

                    {/* Miniature Index Label inside node hover */}
                    {isNodeHovered && (
                      <g className="pointer-events-none">
                        <rect
                          x={x + 10}
                          y={y - 12}
                          width={95}
                          height={24}
                          rx={4}
                          className="fill-slate-900/90 dark:fill-slate-800/95 stroke-slate-700/50"
                          strokeWidth={0.5}
                        />
                        <text
                          x={x + 15}
                          y={y + 3}
                          className="fill-white text-[8px] font-semibold font-mono"
                        >
                          {inc.type.toUpperCase()}: {inc.id.slice(0, 4)}...
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Color Scale Legend */}
          <div className="absolute bottom-3 left-3 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-xs text-[9px] font-mono pointer-events-none flex flex-col gap-1 z-20">
            <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[7px]">Density Color Spectrum</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">0 Inc</span>
              <div className="w-20 h-2 bg-gradient-to-r from-slate-200/30 via-amber-400/30 to-rose-500/40 dark:from-slate-800/40 dark:via-amber-400/30 dark:to-rose-500/50 rounded"></div>
              <span className="text-rose-600 dark:text-rose-400 font-bold">{regionMetrics.maxCount} Max</span>
            </div>
          </div>
        </div>

        {/* Detailed Side Panel Column - Interactive List */}
        <div className="lg:col-span-5 flex flex-col justify-between" id="density-map-list-side">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              <span>Last 5 Plotted Outages</span>
            </h4>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1" id="plotted-incidents-scroller">
              {lastFiveIncidents.map((inc) => {
                const isSelected = hoveredIncidentId === inc.id;
                return (
                  <div
                    key={inc.id}
                    onMouseEnter={() => {
                      setHoveredIncidentId(inc.id);
                      setHoveredRegion(inc.regionId);
                    }}
                    onMouseLeave={() => {
                      setHoveredIncidentId(null);
                      setHoveredRegion(null);
                    }}
                    className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="pt-0.5">
                      <span className={`w-2 h-2 rounded-full block ${inc.status === 'Open' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {inc.type === 'Zone' ? `Zone: ${inc.zoneCode}` : `${inc.type} Incident`}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                          {inc.downtime}
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {inc.problem}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono">
                        <span className="text-slate-400 dark:text-slate-500 uppercase">
                          {inc.regionId.toUpperCase()} SECTOR
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <span className={`px-1.5 py-0.2 rounded font-semibold ${
                          inc.status === 'Open' 
                            ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300' 
                            : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {inc.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {lastFiveIncidents.length === 0 && (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                  No incidents logged to display on map.
                </div>
              )}
            </div>
          </div>

          {/* Interactive Legend Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-500 animate-bounce" />
              <span>Plotted markers represent active telemetry</span>
            </span>
            <span className="hidden sm:inline">PROJECTION: Web Mercator</span>
          </div>
        </div>
      </div>
    </div>
  );
}
