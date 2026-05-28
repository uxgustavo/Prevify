import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, getLocalTodayString } from '../lib/utils';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  className?: string;
}

export function CustomDatePicker({ value, onChange, className }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial state from string
  const [currentYear, setCurrentYear] = useState<number>(() => {
    const parts = value.split('-');
    return parts.length >= 1 ? parseInt(parts[0], 10) : new Date().getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    const parts = value.split('-');
    return parts.length >= 2 ? parseInt(parts[1], 10) - 1 : new Date().getMonth();
  });

  const [tempSelectedDate, setTempSelectedDate] = useState<string>(value);

  // Keep internal selection synced when overlay opens/closes or prop changes
  useEffect(() => {
    if (isOpen) {
      setTempSelectedDate(value);
      const parts = value.split('-');
      if (parts.length >= 3) {
        setCurrentYear(parseInt(parts[0], 10));
        setCurrentMonth(parseInt(parts[1], 10) - 1);
      }
    }
  }, [isOpen, value]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Names of months in Portuguese
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean; formatted: string; dayNumber: number }[] = [];
    
    // First day of current month (Sunday = 0, Monday = 1, etc.)
    const realFirstDay = new Date(currentYear, currentMonth, 1).getDay();
    // Convert to Monday start index (0 = Mon, 1 = Tue, ... 6 = Sun)
    const firstDayIndex = (realFirstDay + 6) % 7;
    
    // Days in current & previous months
    const currentMonthDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthDays = new Date(prevMonthYear, prevMonthIdx + 1, 0).getDate();

    // 1. Backfill previous month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const d = new Date(prevMonthYear, prevMonthIdx, day, 12, 0, 0);
      days.push({
        date: d,
        isCurrentMonth: false,
        dayNumber: day,
        formatted: `${prevMonthYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      });
    }

    // 2. Current month days
    for (let day = 1; day <= currentMonthDays; day++) {
      const d = new Date(currentYear, currentMonth, day, 12, 0, 0);
      days.push({
        date: d,
        isCurrentMonth: true,
        dayNumber: day,
        formatted: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      });
    }

    // 3. Next month pad days (align to multiple of 7 to make clean grid, max 42 slots style)
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
    
    // Total slots to build a perfect grid is 35 or 42
    const totalSlots = days.length > 35 ? 42 : 35;
    const remainingSlots = totalSlots - days.length;
    
    for (let day = 1; day <= remainingSlots; day++) {
      const d = new Date(nextMonthYear, nextMonthIdx, day, 12, 0, 0);
      days.push({
        date: d,
        isCurrentMonth: false,
        dayNumber: day,
        formatted: `${nextMonthYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleDateClick = (formattedDate: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTempSelectedDate(formattedDate);
  };

  const handleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(tempSelectedDate);
    setIsOpen(false);
  };

  const todayStr = getLocalTodayString();

  // Format the selected date beautifully for display
  const displayFormattedDate = useMemo(() => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length < 3) return value;
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }, [value]);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Date Trigger Field resembling the input but styled beautifully */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between bg-transparent border-none p-0 text-[16px] font-semibold text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-left focus:outline-none focus:ring-0 cursor-pointer",
          className
        )}
      >
        <span>{displayFormattedDate}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for click-to-close (escapes stacking issues on both mobile and desktop) */}
            <div 
              className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px] z-[140]" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Calendar Popover container positioned relative to viewport or modal */}
            <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="pointer-events-auto w-[310px] bg-white dark:bg-[#1C262E] border border-gray-200 dark:border-gray-800/80 rounded-3xl p-5 shadow-2xl select-none"
              >
                {/* Header: Chevrons + Month Year */}
                <div className="flex items-center justify-between mb-4 mt-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="w-8 h-8 rounded-full border border-gray-100 dark:border-gray-800/80 flex items-center justify-center bg-gray-50/60 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:scale-105 active:scale-95 transition-all text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                  </button>

                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                    {monthNames[currentMonth]} {currentYear}
                  </h3>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="w-8 h-8 rounded-full border border-gray-100 dark:border-gray-800/80 flex items-center justify-center bg-gray-50/60 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:scale-105 active:scale-95 transition-all text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>

                {/* Divider Line */}
                <div className="h-px bg-gray-150 dark:bg-gray-800/60 mb-3" />

                {/* Days of the week row */}
                <div className="grid grid-cols-7 gap-y-1 text-center mb-1">
                  {weekDays.map((day) => (
                    <span
                      key={day}
                      className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
                    >
                      {day}
                    </span>
                  ))}
                </div>

                {/* Calendar Days Matrix */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((cell) => {
                    const isToday = cell.formatted === todayStr;
                    const isSelected = cell.formatted === tempSelectedDate;

                    return (
                      <button
                        key={cell.formatted}
                        type="button"
                        onClick={(e) => handleDateClick(cell.formatted, e)}
                        className={cn(
                          "aspect-square rounded-full text-xs font-semibold flex items-center justify-center tracking-tight transition-all relative cursor-pointer",
                          // Normal styling based on active month
                          cell.isCurrentMonth
                            ? "text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-850"
                            : "text-gray-300 dark:text-gray-600 font-normal hover:bg-gray-50/20 dark:hover:bg-gray-800/10",
                          // Today outline ring helper
                          isToday && !isSelected && "border border-[#FF5722] text-[#FF5722] dark:text-[#FF5722] font-semibold",
                          // Selected highlighted solid style
                          isSelected && "bg-[#FF5722] hover:bg-[#FF5722] text-white dark:bg-[#FF5722] dark:text-white scale-102 shadow-md shadow-orange-100/20 dark:shadow-none font-bold"
                        )}
                      >
                        {cell.dayNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Footer Actions Area: Clean localized Confirmar */}
                <div className="flex items-center justify-end mt-5 pt-3 border-t border-gray-100 dark:border-gray-800/60">
                  <button
                    type="button"
                    onClick={handleDone}
                    className="bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-[11px] py-2 px-5 rounded-xl shadow-lg shadow-orange-100/40 dark:shadow-none active:scale-98 transition-all cursor-pointer uppercase tracking-tight"
                  >
                    Confirmar
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
