import './metric-display.css';
import React from 'react';

interface MetricDisplayProps {
  label: string;
  value: React.ReactNode;
  change?: string | null;
  changeType?: 'positive' | 'negative' | 'neutral';
  variant?: 'hero' | 'compact' | 'inline';
}

export function MetricDisplay({
  label,
  value,
  change,
  changeType = 'neutral',
  variant = 'hero',
}: MetricDisplayProps) {
  return (
    <div className={`metric-display metric-display--${variant}`}>
      <span className="metric-display__label">{label}</span>
      <span className="metric-display__value">{value}</span>
      {change && (
        <span className={`metric-display__change metric-display__change--${changeType}`}>
          {change}
        </span>
      )}
    </div>
  );
}
