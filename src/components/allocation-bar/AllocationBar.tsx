import './allocation-bar.css';

const SEGMENT_COLORS = ['primary', 'secondary', 'tertiary', 'muted', 'success', 'warning', 'danger'];

interface Segment {
  label: string;
  value: number;
  color?: string;
}

interface AllocationBarProps {
  segments: Segment[];
  showLegend?: boolean;
  large?: boolean;
  showValues?: boolean;
}

export function AllocationBar({
  segments,
  showLegend = true,
  large = false,
  showValues = true,
}: AllocationBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className={`allocation-bar${large ? ' allocation-bar--large' : ''}`}>
      <div className="allocation-bar__track">
        {segments.map((seg, i) => {
          const pct = total > 0 ? (seg.value / total * 100) : 0;
          const colorClass = seg.color || SEGMENT_COLORS[i % SEGMENT_COLORS.length];
          return (
            <div
              key={i}
              className={`allocation-bar__segment allocation-bar__segment--${colorClass}`}
              style={{ width: `${pct}%` }}
              title={`${seg.label}: ${pct.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {showLegend && (
        <div className="allocation-bar__legend">
          {segments.map((seg, i) => {
            const pct = total > 0 ? (seg.value / total * 100) : 0;
            const colorClass = seg.color || SEGMENT_COLORS[i % SEGMENT_COLORS.length];
            return (
              <div key={i} className="allocation-bar__legend-item">
                <span
                  className={`allocation-bar__legend-dot allocation-bar__segment--${colorClass}`}
                  style={{ display: 'inline-block' }}
                />
                <span>{seg.label}</span>
                {showValues && (
                  <span className="allocation-bar__legend-value">{pct.toFixed(0)}%</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
