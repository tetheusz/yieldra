import './panel.css';
import React from 'react';

interface PanelProps {
  variant?: 'bordered' | 'elevated' | 'transparent' | 'muted' | 'accent' | 'compact';
  title?: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  interactive?: boolean;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Panel({
  variant = 'bordered',
  title,
  subtitle,
  action,
  onAction,
  interactive = false,
  className = '',
  children,
  style,
}: PanelProps) {
  const cls = `panel panel--${variant}${interactive ? ' panel--interactive' : ''} ${className}`.trim();

  return (
    <div className={cls} style={style}>
      {title && (
        <div className="panel__header">
          <div>
            <div className="panel__title">{title}</div>
            {subtitle && <div className="panel__subtitle">{subtitle}</div>}
          </div>
          {action && (
            <button className="panel__action" onClick={onAction}>{action}</button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
