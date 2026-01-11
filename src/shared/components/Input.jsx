import React from 'react';
import { cn } from '../utils/cn';

export const Input = React.forwardRef(({ className, label, error, ...props }, ref) => {
    return (
        <div className="w-full space-y-1.5">
            {label && <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">{label}</label>}
            <input
                ref={ref}
                className={cn(
                    'w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hyundai-blue/20 focus:border-hyundai-blue transition-all placeholder:text-slate-300',
                    error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';
