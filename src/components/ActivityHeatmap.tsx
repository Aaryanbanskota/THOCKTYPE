'use client';

import React, { useState, useMemo } from 'react';
import { SavedTestRecord } from '@/lib/profile-storage';
import { Calendar, Flame, CheckCircle, Award } from 'lucide-react';

interface ActivityHeatmapProps {
  tests: SavedTestRecord[];
}

interface DayData {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  displayDate: string; // e.g. "Saturday, Oct 24, 2026"
  count: number;
  level: number; // 0, 1, 2, 3, 4
}

export function ActivityHeatmap({ tests }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  // Map tests to YYYY-MM-DD keys
  const dateCountsMap = useMemo(() => {
    const map = new Map<string, number>();
    tests.forEach((t) => {
      const d = new Date(t.timestamp);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [tests]);

  // Compute 52 weeks of dates ending today
  const { weeks, monthLabels, totalYearTests, currentStreak, longestStreak, activeDaysCount } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Calculate days back to reach exactly 52 weeks (starting on Sunday)
    const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
    const totalDays = 52 * 7 + (dayOfWeek + 1);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);
    startDate.setHours(0, 0, 0, 0);

    const generatedWeeks: DayData[][] = [];
    let currentWeek: DayData[] = [];
    const months: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    let totalTestsInYear = 0;
    let activeDays = 0;

    // Track streaks
    let tempStreak = 0;
    let maxStreak = 0;
    let curStreak = 0;
    let checkingCurrentStreak = true;

    // For streak calculation in reverse (from today back)
    const dayRecords: { dateKey: string; count: number }[] = [];

    const cursor = new Date(startDate);
    let weekIdx = 0;

    while (cursor <= today) {
      const year = cursor.getFullYear();
      const mIdx = cursor.getMonth();
      const month = String(mIdx + 1).padStart(2, '0');
      const day = String(cursor.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const count = dateCountsMap.get(dateKey) || 0;
      totalTestsInYear += count;
      if (count > 0) activeDays++;

      dayRecords.push({ dateKey, count });

      // Calculate contribution level (0 to 4)
      let level = 0;
      if (count === 1) level = 1;
      else if (count >= 2 && count <= 3) level = 2;
      else if (count >= 4 && count <= 6) level = 3;
      else if (count >= 7) level = 4;

      const dayData: DayData = {
        date: new Date(cursor),
        dateStr: dateKey,
        displayDate: cursor.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        count,
        level
      };

      currentWeek.push(dayData);

      // Month label detection at the top row (Sunday)
      if (cursor.getDay() === 0 && mIdx !== lastMonth) {
        lastMonth = mIdx;
        months.push({
          label: cursor.toLocaleDateString(undefined, { month: 'short' }),
          weekIndex: weekIdx
        });
      }

      if (currentWeek.length === 7) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
        weekIdx++;
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      generatedWeeks.push(currentWeek);
    }

    // Calculate streaks from dayRecords
    for (let i = dayRecords.length - 1; i >= 0; i--) {
      const c = dayRecords[i].count;
      if (c > 0) {
        tempStreak++;
        if (checkingCurrentStreak) curStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        if (checkingCurrentStreak) {
          // If today has 0 tests so far, streak could be from yesterday
          if (i === dayRecords.length - 1) {
            // Still give user today to continue streak
          } else {
            checkingCurrentStreak = false;
          }
        }
        tempStreak = 0;
      }
    }

    return {
      weeks: generatedWeeks,
      monthLabels: months,
      totalYearTests: totalTestsInYear,
      currentStreak: curStreak,
      longestStreak: Math.max(curStreak, maxStreak),
      activeDaysCount: activeDays
    };
  }, [dateCountsMap]);

  // Color mapping for squares
  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-950/90 border-emerald-800/70 hover:border-emerald-500';
      case 2:
        return 'bg-emerald-700 border-emerald-600/80 hover:border-emerald-400';
      case 3:
        return 'bg-emerald-500 border-emerald-400 hover:border-emerald-300';
      case 4:
        return 'bg-emerald-300 border-emerald-200 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
      default:
        return 'bg-zinc-900 border-zinc-800/80 hover:border-zinc-700';
    }
  };

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl bg-zinc-900/80 border border-zinc-800/90 p-4 sm:p-6 shadow-xl backdrop-blur-xl mb-6">
      
      {/* Heatmap Header & Streak Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Contribution & Practice Activity
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-zinc-100 tracking-tight mt-0.5">
            {totalYearTests} tests completed in the last year
          </h3>
        </div>

        {/* Streaks Callout Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Current: <strong className="text-amber-400">{currentStreak}</strong> days</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 shadow-sm">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Longest: <strong className="text-emerald-400">{longestStreak}</strong> days</span>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix Display */}
      <div className="mt-4 pt-2">
        <div className="w-full overflow-x-auto scrollbar-none pb-2 touch-pan-x">
          <div className="inline-block min-w-[720px] select-none">
            
            {/* Month Header Labels */}
            <div className="flex text-[10px] font-mono text-zinc-500 mb-1.5 pl-6 relative h-4">
              {monthLabels.map((m, idx) => (
                <span
                  key={idx}
                  className="absolute"
                  style={{ left: `${m.weekIndex * 13.5 + 24}px` }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            {/* Matrix: 7 rows (Days of week) x 53 columns (Weeks) */}
            <div className="flex items-start gap-1">
              {/* Day of Week Labels (Mon, Wed, Fri) */}
              <div className="flex flex-col justify-between text-[9px] font-mono text-zinc-500 pr-1.5 py-0.5 h-[98px]">
                <span>Sun</span>
                <span>Tue</span>
                <span>Thu</span>
                <span>Sat</span>
              </div>

              {/* Grid Columns (Weeks) */}
              <div className="flex gap-1">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1">
                    {week.map((day) => (
                      <div
                        key={day.dateStr}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-3 h-3 rounded-[2.5px] border transition-all cursor-pointer ${getLevelColor(
                          day.level
                        )}`}
                        title={`${day.count} tests on ${day.displayDate}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Tooltip & Legend Bar */}
        <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-zinc-500">
          <div>
            {hoveredDay ? (
              <span className="text-zinc-200">
                <strong className="text-emerald-400">{hoveredDay.count}</strong> tests on {hoveredDay.displayDate}
              </span>
            ) : (
              <span>
                {activeDaysCount} active typing days • Hover or tap squares for daily audit
              </span>
            )}
          </div>

          {/* GitHub-style Legend */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-[2px] bg-zinc-900 border border-zinc-800" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-950 border border-emerald-800/80" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-700 border border-emerald-600" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500 border border-emerald-400" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-300 border border-emerald-200" />
            <span>More</span>
          </div>
        </div>

      </div>

    </div>
  );
}
