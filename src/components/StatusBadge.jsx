import React from 'react';
import { getStatusStyle } from '../utils/statusTheme';

export default function StatusBadge({ status = 'online', label, showDot = true, pulse = true, size = 'sm' }) {
  const style = getStatusStyle(status);
  const displayLabel = label || style.label;

  const sizeClasses = size === 'xs' 
    ? 'px-2 py-0.5 text-[10px]' 
    : size === 'md' 
    ? 'px-3 py-1 text-xs' 
    : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses} backdrop-blur-sm select-none`}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.pulse}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`} />
        </span>
      )}
      <span>{displayLabel}</span>
    </span>
  );
}
