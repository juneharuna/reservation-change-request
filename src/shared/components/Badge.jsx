import React from 'react';
import { cn } from '../utils/cn';

export const Badge = ({ children, variant = 'gray', className }) => {
    const variants = {
        gray: 'bg-slate-100 text-slate-600',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-emerald-50 text-emerald-600',
        red: 'bg-rose-50 text-rose-600',
        orange: 'bg-amber-50 text-amber-600',
        slate: 'bg-slate-400/10 text-slate-500',
    };

    return (
        <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight', variants[variant], className)}>
            {children}
        </span>
    );
};
