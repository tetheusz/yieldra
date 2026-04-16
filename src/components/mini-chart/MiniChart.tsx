import './mini-chart.css';
import { useMemo } from 'react';

// ── Area / Sparkline Chart ──

interface MiniChartProps {
  data: { day: number; value: number }[];
  color?: 'accent' | 'success';
  variant?: 'area' | 'sparkline';
  height?: number;
}

export function MiniChart({ data, color = 'accent', variant = 'area', height = 200 }: MiniChartProps) {
  const gradientId = useMemo(() => `chart-gradient-${color}-${Math.random().toString(36).slice(2, 8)}`, [color]);

  if (!data || data.length === 0) {
    return (
      <div className={`mini-chart mini-chart--${variant}`} style={{ height }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
          No data
        </div>
      </div>
    );
  }

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 600;
  const padding = 2;

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: padding + (1 - (d.value - min) / range) * (height - padding * 2),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = linePath + ` L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

  const strokeColor = color === 'accent' ? 'var(--accent)' : 'var(--status-success)';
  const stopColor = color === 'accent' ? '#2D5A7B' : '#0F766E';

  return (
    <div className={`mini-chart mini-chart--${variant}`} style={{ height }}>
      <svg className="mini-chart__svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stopColor} stopOpacity={0.15} />
            <stop offset="100%" stopColor={stopColor} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <path className="mini-chart__area" d={areaPath} fill={`url(#${gradientId})`} />
        <path className="mini-chart__line" d={linePath} stroke={strokeColor} fill="none" strokeWidth="2" />
      </svg>
    </div>
  );
}

// ── Simple Progress Bar ──

interface ProgressBarProps {
  value: number;
  color?: 'accent' | 'success' | 'warning' | 'danger';
  height?: number;
  style?: React.CSSProperties;
}

const COLOR_MAP: Record<string, string> = {
  accent: 'var(--accent)',
  success: 'var(--status-success)',
  warning: 'var(--status-warning)',
  danger: 'var(--status-danger)',
};

export function ProgressBar({ value, color = 'accent', height = 8, style }: ProgressBarProps) {
  return (
    <div
      style={{
        width: '100%',
        height,
        backgroundColor: 'var(--surface-muted)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          width: `${Math.min(value, 100)}%`,
          height: '100%',
          backgroundColor: COLOR_MAP[color] || COLOR_MAP.accent,
          borderRadius: 'var(--radius-full)',
          transition: 'width var(--duration-slow) var(--ease-out)',
        }}
      />
    </div>
  );
}
