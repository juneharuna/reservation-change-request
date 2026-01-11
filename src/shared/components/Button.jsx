import React from 'react';
import { cn } from '../utils/cn';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
        primary: 'bg-hyundai-navy text-white hover:bg-slate-800 shadow-md',
        secondary: 'bg-hyundai-blue text-white hover:bg-hyundai-blue/90',
        outline: 'border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700',
        ghost: 'hover:bg-slate-100 text-slate-600',
        danger: 'bg-red-500 text-white hover:bg-red-600',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs font-medium',
        md: 'px-6 py-2.5 text-sm font-semibold',
        lg: 'px-8 py-3.5 text-base font-bold',
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
});

Button.displayName = 'Button';
