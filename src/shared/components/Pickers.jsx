import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn';
import { Calendar as CalendarIcon, Clock as ClockIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth, startOfDay, isBefore, getDay } from 'date-fns';

export function DatePicker({ label, value, onChange, className, minDate }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const containerRef = useRef(null);

    const minSelectableDate = minDate ? startOfDay(new Date(minDate)) : null;

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const monthStart = startOfMonth(currentMonth);
    const days = eachDayOfInterval({
        start: monthStart,
        end: endOfMonth(currentMonth),
    });

    const startDayOfWeek = getDay(monthStart);

    const selectedDate = value ? new Date(value) : null;
    const isPrevMonthDisabled = minSelectableDate ? (isSameMonth(currentMonth, minSelectableDate) || isBefore(subMonths(currentMonth, 1), startOfMonth(minSelectableDate))) : false;

    return (
        <div className={cn("relative space-y-1.5", className)} ref={containerRef}>
            {label && <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">{label}</label>}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm flex items-center justify-between hover:border-hyundai-blue transition-all"
            >
                <span className={cn(value ? "text-slate-800 font-bold" : "text-slate-300")}>
                    {value ? format(new Date(value), 'yyyy. MM. dd.') : "날짜 선택"}
                </span>
                <CalendarIcon size={16} className="text-slate-400" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-[999] w-[300px] animate-in fade-in zoom-in-95 duration-200 origin-top">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <span className="font-black text-slate-800">{format(currentMonth, 'yyyy년 MM월')}</span>
                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={() => !isPrevMonthDisabled && setCurrentMonth(subMonths(currentMonth, 1))}
                                className={cn("p-1.5 rounded-lg text-slate-400 transition-colors", isPrevMonthDisabled ? "opacity-20 cursor-not-allowed" : "hover:bg-slate-50")}
                                disabled={isPrevMonthDisabled}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                            <span key={d} className="text-[10px] font-black text-slate-300 text-center uppercase">{d}</span>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: startDayOfWeek }).map((_, i) => (
                            <div key={`pad-${i}`} className="aspect-square" />
                        ))}
                        {days.map(day => {
                            const dateStart = startOfDay(day);
                            const isDisabled = minSelectableDate ? isBefore(dateStart, minSelectableDate) : false;

                            return (
                                <button
                                    key={day.toString()}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => {
                                        onChange(format(day, 'yyyy-MM-dd'));
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "aspect-square text-xs rounded-lg flex items-center justify-center transition-all",
                                        isSameDay(day, selectedDate)
                                            ? "bg-hyundai-navy text-white font-bold"
                                            : isDisabled
                                                ? "text-slate-200 cursor-not-allowed"
                                                : "hover:bg-slate-50 text-slate-600 font-medium"
                                    )}
                                >
                                    {format(day, 'd')}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export function HourPicker({ label, value, onChange, className }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const hours = Array.from({ length: 8 }, (_, i) => i + 10); // 10:00 to 17:00

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className={cn("relative space-y-1.5", className)} ref={containerRef}>
            {label && <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">{label}</label>}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm flex items-center justify-between hover:border-hyundai-blue transition-all"
            >
                <span className={cn(value ? "text-slate-800 font-bold" : "text-slate-300")}>
                    {value ? `${value}:00` : "시간 선택"}
                </span>
                <ClockIcon size={16} className="text-slate-400" />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 p-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-[999] w-[110px] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="space-y-1">
                        {hours.map(hour => (
                            <button
                                key={hour}
                                type="button"
                                onClick={() => {
                                    onChange(hour.toString().padStart(2, '0'));
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full px-4 py-2 text-xs font-bold rounded-lg text-left transition-all",
                                    value === hour.toString().padStart(2, '0')
                                        ? "bg-hyundai-blue text-white"
                                        : "hover:bg-slate-50 text-slate-600"
                                )}
                            >
                                {hour}:00
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
