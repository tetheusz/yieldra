import './alert-item.css';
import React from 'react';

const SEVERITY_ICONS: Record<string, React.ReactNode> = {
  critical: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 6h2v5H9V6zm0 7h2v2H9v-2z"/>
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2L1 18h18L10 2zm-1 6h2v5H9V8zm0 7h2v2H9v-2z"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <circle cx="10" cy="10" r="8"/>
      <text x="10" y="14" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">i</text>
    </svg>
  ),
};

interface AlertItemProps {
  severity: 'critical' | 'warning' | 'info';
  message: string;
  time: string;
  read?: boolean;
}

export function AlertItem({ severity, message, time, read = false }: AlertItemProps) {
  return (
    <div className={`alert-item alert-item--${severity}${!read ? ' alert-item--unread' : ''}`}>
      <div className="alert-item__icon">{SEVERITY_ICONS[severity] || SEVERITY_ICONS.info}</div>
      <div className="alert-item__content">
        <div className="alert-item__message">{message}</div>
        <div className="alert-item__time">{time}</div>
      </div>
    </div>
  );
}
