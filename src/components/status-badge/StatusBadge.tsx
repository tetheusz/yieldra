import './status-badge.css';

interface StatusBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  live?: boolean;
}

export function StatusBadge({ label, variant = 'neutral', live = false }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${variant}${live ? ' status-badge--live' : ''}`}>
      <span className="status-badge__dot" />
      <span>{label}</span>
    </span>
  );
}
