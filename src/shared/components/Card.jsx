import React from 'react';
import { cn } from '../utils/cn';

export const Card = ({ children, className, ...props }) => {
    return (
        <div className={cn('glass rounded-2xl p-6 overflow-visible', className)} {...props}>
            {children}
        </div>
    );
};
