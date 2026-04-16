import './progress-ring.css';

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'accent' | 'success' | 'warning' | 'danger';
  displayValue?: string;
  label?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  color = 'accent',
  displayValue,
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference - (progress * circumference);
  const fontSize = size >= 80 ? 'var(--text-xl)' : 'var(--text-sm)';

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg className="progress-ring__svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="progress-ring__track"
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className={`progress-ring__fill progress-ring__fill--${color}`}
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="progress-ring__center">
        <span className="progress-ring__value" style={{ fontSize }}>
          {displayValue ?? `${Math.round(progress * 100)}%`}
        </span>
        {label && <span className="progress-ring__label">{label}</span>}
      </div>
    </div>
  );
}
