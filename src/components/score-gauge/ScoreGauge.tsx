import './score-gauge.css';

interface ScoreGaugeProps {
  score: number;
  max?: number;
  grade?: string;
  variant?: 'large' | 'small';
  label?: string;
}

function getGradeKey(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.85) return 'excellent';
  if (pct >= 0.7) return 'good';
  if (pct >= 0.5) return 'fair';
  return 'poor';
}

function getGradeLabel(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.85) return 'Excellent';
  if (pct >= 0.7) return 'Good';
  if (pct >= 0.5) return 'Fair';
  return 'Poor';
}

export function ScoreGauge({
  score,
  max = 850,
  grade,
  variant = 'large',
  label,
}: ScoreGaugeProps) {
  const size = variant === 'large' ? 180 : 100;
  const strokeWidth = variant === 'large' ? 10 : 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / max, 1);
  const offset = circumference - (progress * circumference * 0.75);
  const gradeKey = grade?.toLowerCase() || getGradeKey(score, max);

  return (
    <div className={`score-gauge score-gauge--${variant}`}>
      <div className="score-gauge__ring">
        <svg className="score-gauge__svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            className="score-gauge__track"
            cx={size / 2} cy={size / 2} r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          />
          <circle
            className={`score-gauge__fill score-gauge__fill--${gradeKey}`}
            cx={size / 2} cy={size / 2} r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="score-gauge__center">
          <span className="score-gauge__value">{score}</span>
          <span className={`score-gauge__grade score-gauge__grade--${gradeKey}`}>
            {grade || getGradeLabel(score, max)}
          </span>
        </div>
      </div>
      {label && <span className="score-gauge__label">{label}</span>}
    </div>
  );
}
