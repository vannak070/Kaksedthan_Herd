import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  AlertTriangle,
  Baby,
  Stethoscope,
  Clock,
  CheckCircle2,
  Bell,
  MapPin,
  User,
  Info,
  ChevronDown
} from 'lucide-react';
import { BreedingRecord, PregnancyStatus } from '@/types/breeding.types';

interface GestationCalendarSubTabProps {
  breedingRecords: BreedingRecord[];
  onOpenDetailView?: (type: 'breeding', record: BreedingRecord) => void;
  onOpenCalvingModal?: (record: BreedingRecord) => void;
}

export interface CalendarEvent {
  id: string;
  type: 'calving_window' | 'checkup_30' | 'checkup_60' | 'heat_return' | 'calved';
  dateStr: string; // YYYY-MM-DD
  title: string;
  damName: string;
  damId: string;
  sireName?: string;
  breederName?: string;
  farmLocation?: string;
  record: BreedingRecord;
  windowStatus?: 'pre_calving' | 'due_today' | 'post_due' | 'calved';
  daysDiff?: number; // Days relative to expected date
}

export default function GestationCalendarSubTab({
  breedingRecords,
  onOpenDetailView,
  onOpenCalvingModal
}: GestationCalendarSubTabProps) {
  // Calendar View State: Month & Year
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 1)); // Default August 2026
  const [activeTab, setActiveTab] = useState<'grid' | 'alerts' | 'checkups'>('alerts');
  const [searchTerm, setSearchTerm] = useState('');
  const [farmFilter, setFarmFilter] = useState('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ dateStr: string; events: CalendarEvent[] } | null>(null);

  // Today reference date (2026-08-07)
  const todayStr = '2026-08-07';
  const todayDate = new Date(2026, 7, 7);

  // Helper to add days to date string
  const addDays = (dateStr: string, days: number): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Extract unique farm locations for filter
  const farmLocations = useMemo(() => {
    const set = new Set<string>();
    breedingRecords.forEach(r => {
      if (r.farmLocation) set.add(r.farmLocation);
      if (r.cowOwner) set.add(r.cowOwner);
    });
    return Array.from(set).filter(Boolean);
  }, [breedingRecords]);

  // Compute all Calendar Events from Breeding Records
  const allEvents = useMemo<CalendarEvent[]>(() => {
    const events: CalendarEvent[] = [];

    breedingRecords.forEach(record => {
      const damName = record.damName || record.damId || 'Dam Cow';
      const sireName = record.sireName || record.bullName || 'Sire Bull';
      const breeder = record.breederName || record.technician || 'Technician';
      const farm = record.farmLocation || record.cowOwner || 'SNR Farm';

      // 1. Calculate Expected Calving Date (Mating Date + 283 days if not set)
      const matingDate = record.matingDate;
      const expCalvingStr = record.expectedCalvingDate || record.expectedBirthdate || (matingDate ? addDays(matingDate, 283) : '');

      if (expCalvingStr) {
        const expDate = new Date(expCalvingStr);
        const diffTime = todayDate.getTime() - expDate.getTime();
        const daysDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // negative = future, positive = past due

        let windowStatus: 'pre_calving' | 'due_today' | 'post_due' | 'calved' = 'pre_calving';
        if (record.pregnancyStatus === 'Calved') {
          windowStatus = 'calved';
        } else if (daysDiff === 0) {
          windowStatus = 'due_today';
        } else if (daysDiff > 0) {
          windowStatus = 'post_due';
        } else {
          windowStatus = 'pre_calving';
        }

        // Calving Event (-15 to +15 days window event)
        events.push({
          id: `calving-${record.id}`,
          type: record.pregnancyStatus === 'Calved' ? 'calved' : 'calving_window',
          dateStr: expCalvingStr,
          title: record.pregnancyStatus === 'Calved'
            ? `🟢 Calved: ${damName}`
            : daysDiff === 0
            ? `🔴 DUE TODAY Calving: ${damName}`
            : daysDiff > 0
            ? `🟠 Overdue (+${daysDiff}d): ${damName}`
            : `🟡 Pre-Calving (T${daysDiff}d): ${damName}`,
          damName,
          damId: record.damId,
          sireName,
          breederName: breeder,
          farmLocation: farm,
          record,
          windowStatus,
          daysDiff
        });
      }

      // 2. Check-up Events (30-Day Preg Check & 60-Day Preg Re-Check)
      if (matingDate && record.pregnancyStatus !== 'Calved' && record.pregnancyStatus !== 'Cancelled') {
        const check30Str = record.checkupDate || record.pregnancyCheckDate || addDays(matingDate, 30);
        events.push({
          id: `check30-${record.id}`,
          type: 'checkup_30',
          dateStr: check30Str,
          title: `🔬 30-Day Preg Check: ${damName}`,
          damName,
          damId: record.damId,
          sireName,
          breederName: breeder,
          farmLocation: farm,
          record
        });

        const check60Str = addDays(matingDate, 60);
        events.push({
          id: `check60-${record.id}`,
          type: 'checkup_60',
          dateStr: check60Str,
          title: `🩺 60-Day Confirmation Check: ${damName}`,
          damName,
          damId: record.damId,
          sireName,
          breederName: breeder,
          farmLocation: farm,
          record
        });

        const heat21Str = addDays(matingDate, 21);
        events.push({
          id: `heat21-${record.id}`,
          type: 'heat_return',
          dateStr: heat21Str,
          title: `⚡ 21-Day Heat Return Check: ${damName}`,
          damName,
          damId: record.damId,
          sireName,
          breederName: breeder,
          farmLocation: farm,
          record
        });
      }
    });

    return events;
  }, [breedingRecords]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return allEvents.filter(ev => {
      const matchesSearch =
        !searchTerm ||
        ev.damName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.damId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.sireName && ev.sireName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ev.breederName && ev.breederName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFarm = farmFilter === 'ALL' || ev.farmLocation === farmFilter;

      let matchesType = true;
      if (eventTypeFilter === 'calving') {
        matchesType = ev.type === 'calving_window' || ev.type === 'calved';
      } else if (eventTypeFilter === 'checkup') {
        matchesType = ev.type === 'checkup_30' || ev.type === 'checkup_60';
      } else if (eventTypeFilter === 'heat') {
        matchesType = ev.type === 'heat_return';
      }

      return matchesSearch && matchesFarm && matchesType;
    });
  }, [allEvents, searchTerm, farmFilter, eventTypeFilter]);

  // URGENT CALVING ALERTS (-15 DAYS TO +15 DAYS WINDOW)
  const calvingWindowAlerts = useMemo(() => {
    return filteredEvents.filter(ev => {
      if (ev.type !== 'calving_window' && ev.type !== 'calved') return false;
      const days = ev.daysDiff ?? 0;
      // Window is -15 to +15 days
      return days >= -15 && days <= 15;
    }).sort((a, b) => (a.daysDiff ?? 0) - (b.daysDiff ?? 0));
  }, [filteredEvents]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentDate(new Date(2026, 7, 1));
  };

  // Month grid helper
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{ dayNumber: number | null; dateStr: string | null }> = [];
    // Pad previous month days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: null, dateStr: null });
    }
    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      days.push({ dayNumber: d, dateStr: `${year}-${mm}-${dd}` });
    }
    return days;
  }, [currentDate]);

  const monthYearHeader = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto pb-12 font-sans text-slate-900">
      
      {/* ── TOP HEADER & ALERT STATS ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center text-2xl font-bold">
            📅
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-900">Breeding & Gestation Tracking Calendar</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold border border-emerald-300">
                -15d / +15d Birth Window
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Automated notifications for farm managers & breeders to track 30/60-day checkups and calving windows.
            </p>
          </div>
        </div>

        {/* Tab View Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'alerts'
                ? 'bg-[#0B6B3A] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" /> 15-Day Calving Window ({calvingWindowAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('grid')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'grid'
                ? 'bg-[#0B6B3A] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" /> Month Calendar Grid
          </button>
          <button
            onClick={() => setActiveTab('checkups')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'checkups'
                ? 'bg-[#0B6B3A] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> All Scheduled Checkups
          </button>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Dam, Sire, Breeder..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B6B3A]"
          />
        </div>

        {/* Farm Filter */}
        <div>
          <select
            value={farmFilter}
            onChange={e => setFarmFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B6B3A]"
          >
            <option value="ALL">🏢 All Farms / Locations</option>
            {farmLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Event Type Filter */}
        <div>
          <select
            value={eventTypeFilter}
            onChange={e => setEventTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B6B3A]"
          >
            <option value="ALL">📌 All Event Types</option>
            <option value="calving">🍼 Calving Windows (-15d / +15d)</option>
            <option value="checkup">🩺 30/60-Day Preg Checkups</option>
            <option value="heat">⚡ 21-Day Heat Return Checks</option>
          </select>
        </div>

        {/* Legend Summary */}
        <div className="flex items-center justify-around bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-bold">
          <span className="flex items-center gap-1 text-amber-700">🟡 Pre-Calv</span>
          <span className="flex items-center gap-1 text-red-600">🔴 Due</span>
          <span className="flex items-center gap-1 text-orange-700">🟠 Post-Due</span>
          <span className="flex items-center gap-1 text-emerald-700">🟢 Calved</span>
        </div>
      </div>

      {/* ── TAB 1: 15-DAY CALVING WINDOW ALERT CENTER ── */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
              🔔
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-extrabold text-amber-900">
                Active Calving Window Tracker (-15 Days Before to +15 Days After Expected Date)
              </h3>
              <p className="text-xs text-amber-800 font-medium mt-1 leading-relaxed">
                Farm workers and breeders must closely monitor these pregnant dams. Prepare clean calving pens, maternity kits, and veterinary assistance for overdue or active deliveries.
              </p>
            </div>
          </div>

          {calvingWindowAlerts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-base font-bold text-slate-800">No Calving Events in the Active 30-Day Window (-15d / +15d)</p>
              <p className="text-xs text-slate-400 mt-1">All registered dams are outside the active delivery monitoring window.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {calvingWindowAlerts.map(ev => {
                const days = ev.daysDiff ?? 0;
                let badgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
                let badgeLabel = `🟡 Pre-Calving (T-${Math.abs(days)} days)`;
                let borderTheme = 'border-amber-300 bg-amber-50/30';

                if (ev.windowStatus === 'calved') {
                  badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  badgeLabel = '🟢 Calved — Calf Registered';
                  borderTheme = 'border-emerald-300 bg-emerald-50/20';
                } else if (days === 0) {
                  badgeBg = 'bg-red-600 text-white border-red-700 animate-pulse';
                  badgeLabel = '🔴 DUE TODAY — Expected Calving!';
                  borderTheme = 'border-red-400 bg-red-50/50';
                } else if (days > 0) {
                  badgeBg = 'bg-orange-100 text-orange-900 border-orange-300';
                  badgeLabel = `🟠 Overdue (+${days} days post-due)`;
                  borderTheme = 'border-orange-300 bg-orange-50/30';
                }

                return (
                  <div
                    key={ev.id}
                    className={`bg-white rounded-2xl border ${borderTheme} p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4`}
                  >
                    <div>
                      {/* Top Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${badgeBg}`}>
                          {badgeLabel}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 font-bold">
                          {ev.dateStr}
                        </span>
                      </div>

                      {/* Cow & Lineage Title */}
                      <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                        🐄 {ev.damName}
                        <span className="text-xs font-mono text-slate-500 font-bold">({ev.damId})</span>
                      </h4>

                      <div className="mt-3 space-y-2 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Sire Bull:</span>
                          <span className="font-bold text-slate-800">🐂 {ev.sireName || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Breeder / Tech:</span>
                          <span className="font-bold text-slate-800">🧑‍🌾 {ev.breederName || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Farm Facility:</span>
                          <span className="font-bold text-emerald-700">📍 {ev.farmLocation || 'SNR Farm'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Pregnancy Status:</span>
                          <span className="font-extrabold text-purple-700">{ev.record.pregnancyStatus}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {ev.record.pregnancyStatus !== 'Calved' && onOpenCalvingModal && (
                        <button
                          onClick={() => onOpenCalvingModal(ev.record)}
                          className="w-full py-2 bg-[#0B6B3A] hover:bg-[#08522c] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Baby className="w-4 h-4" /> Register Birth / Calving
                        </button>
                      )}
                      {ev.record.pregnancyStatus === 'Calved' && (
                        <span className="w-full py-2 bg-emerald-50 text-emerald-800 text-center text-xs font-bold rounded-xl border border-emerald-200">
                          ✓ Birth Registered
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: MONTH CALENDAR GRID VIEW ── */}
      {activeTab === 'grid' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-black text-slate-900 w-48 text-center">
                {monthYearHeader}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleCurrentMonth}
              className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors"
            >
              Today (Aug 2026)
            </button>
          </div>

          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 text-center font-extrabold text-xs text-slate-400 border-b border-slate-100 pb-2">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((dObj, idx) => {
              if (!dObj.dayNumber || !dObj.dateStr) {
                return <div key={`empty-${idx}`} className="h-28 bg-slate-50/50 rounded-xl" />;
              }

              const dayEvents = filteredEvents.filter(ev => ev.dateStr === dObj.dateStr);
              const isToday = dObj.dateStr === todayStr;

              return (
                <div
                  key={dObj.dateStr}
                  onClick={() => dayEvents.length > 0 && setSelectedDayEvents({ dateStr: dObj.dateStr!, events: dayEvents })}
                  className={`h-28 border rounded-xl p-2 flex flex-col justify-between transition-all cursor-pointer ${
                    isToday
                      ? 'border-[#0B6B3A] bg-emerald-50/40 ring-2 ring-[#0B6B3A]/20'
                      : dayEvents.length > 0
                      ? 'border-slate-300 bg-white hover:border-[#0B6B3A] hover:shadow-md'
                      : 'border-slate-100 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                      isToday ? 'bg-[#0B6B3A] text-white' : 'text-slate-800'
                    }`}>
                      {dObj.dayNumber}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-slate-900 text-white">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events Pills */}
                  <div className="space-y-1 overflow-y-auto max-h-16 scrollbar-none">
                    {dayEvents.slice(0, 2).map(ev => {
                      let pillBg = 'bg-blue-100 text-blue-900';
                      if (ev.type === 'calving_window' || ev.type === 'calved') {
                        pillBg = ev.windowStatus === 'calved'
                          ? 'bg-emerald-100 text-emerald-900'
                          : ev.windowStatus === 'due_today'
                          ? 'bg-red-600 text-white font-black'
                          : 'bg-amber-100 text-amber-900';
                      }
                      return (
                        <div
                          key={ev.id}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded truncate ${pillBg}`}
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <p className="text-[9px] font-extrabold text-slate-400 text-center">
                        +{dayEvents.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ── TAB 3: SCHEDULED CHECKUPS & HEAT RETURNS LIST ── */}
      {activeTab === 'checkups' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            🩺 Scheduled Breeding & Health Checkups ({filteredEvents.filter(e => e.type !== 'calving_window' && e.type !== 'calved').length})
          </h3>

          <div className="divide-y divide-slate-100">
            {filteredEvents
              .filter(e => e.type !== 'calving_window' && e.type !== 'calved')
              .map(ev => (
                <div key={ev.id} className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-3 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      {ev.type === 'heat_return' ? '⚡' : '🔬'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{ev.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Dam: <strong className="text-slate-800">{ev.damName}</strong> ({ev.damId}) • Sire: {ev.sireName || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-900 block">{ev.dateStr}</span>
                      <span className="text-[10px] text-emerald-700 font-bold block">📍 {ev.farmLocation}</span>
                    </div>

                    {onOpenDetailView && (
                      <button
                        onClick={() => onOpenDetailView('breeding', ev.record)}
                        className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
                      >
                        Details
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── DAY EVENTS POPUP MODAL ── */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Scheduled Events on {selectedDayEvents.dateStr}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedDayEvents.events.length} event(s) logged for this date
                </p>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {selectedDayEvents.events.map(ev => (
                <div key={ev.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{ev.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {ev.farmLocation}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Dam: <strong>{ev.damName}</strong> ({ev.damId}) • Sire: <strong>{ev.sireName}</strong>
                  </p>
                  <p className="text-xs text-slate-600">
                    Breeder / Technician: <strong>{ev.breederName}</strong>
                  </p>

                  {ev.record.pregnancyStatus !== 'Calved' && onOpenCalvingModal && (
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setSelectedDayEvents(null);
                          onOpenCalvingModal(ev.record);
                        }}
                        className="w-full py-2 bg-[#0B6B3A] hover:bg-[#08522c] text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        🍼 Register Birth / Calving Event
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
