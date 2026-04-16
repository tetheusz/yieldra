import './landing.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { formatUSD } from '../../state/store';
import { useWallet } from '../../state/wallet';

// ── Section content (data-driven, reorderable) ──

const FLYWHEEL_STEPS = [
  { icon: '↓', label: 'Income', sub: 'USDC flows in', num: '01' },
  { icon: '◈', label: 'Score', sub: 'Behavior analyzed', num: '02' },
  { icon: '$', label: 'Credit', sub: 'Limit unlocked', num: '03' },
  { icon: '⊞', label: 'Deploy', sub: 'Capital allocated', num: '04' },
  { icon: '↗', label: 'Yield', sub: 'Returns generated', num: '05' },
  { icon: '✓', label: 'Paydown', sub: 'Debt auto-repaid', num: '06' },
];

const FEATURES = [
  {
    title: 'Behavioral Scoring',
    desc: 'Your financial behavior generates a dynamic score that unlocks credit — not collateral. Built-in reputation, not borrowing against yourself.',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 6v8M7 9.5h6M8 13h4" />
      </svg>
    ),
    tag: 'Score Engine',
  },
  {
    title: 'Dynamic Credit',
    desc: 'Credit lines that expand with your track record. No liquidation spirals, no over-collateralization. Your reputation is your collateral.',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="7" width="14" height="10" rx="1.5" />
        <path d="M6 7V5a4 4 0 018 0v2" />
        <circle cx="10" cy="12" r="1.5" />
      </svg>
    ),
    tag: 'Credit Engine',
  },
  {
    title: 'Autonomous Treasury',
    desc: 'Capital works 24/7 across conservative yield strategies. Own capital and borrowed capital managed together, compounding continuously.',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <rect x="3" y="3" width="6" height="6" rx="1.5" />
        <rect x="11" y="3" width="6" height="6" rx="1.5" />
        <rect x="3" y="11" width="6" height="6" rx="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" />
      </svg>
    ),
    tag: 'Treasury Engine',
  },
  {
    title: 'Intelligent Autopilot',
    desc: 'Agents rebalance, harvest yield, repay debt, and protect reserves. Fully autonomous, always auditable, always optimizing.',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 10h2l2-5 3 10 2-7 2 4h3" />
      </svg>
    ),
    tag: 'Autopilot Engine',
  },
];

const SHOWCASE_METRICS = [
  { value: formatUSD(147_832), label: 'Total Capital Managed', detail: 'Own + borrowed capital' },
  { value: '812', label: 'Behavioral Score', detail: 'Excellent rating' },
  { value: '8.7%', label: 'Blended Yield APY', detail: 'Across 4 strategies' },
  { value: formatUSD(12_847), label: 'Yield Accumulated', detail: '14 days active' },
];

const TRUST_ITEMS = [
  'Non-custodial architecture',
  'Conservative-only strategies',
  'Real-time risk monitoring',
  'Fully auditable on-chain',
];

// ── Landing Component ──

export function Landing() {
  const navigate = useNavigate();
  const { wallet, connect } = useWallet();
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionsRef.current.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addRef = (el: HTMLDivElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  const enterWorkspace = () => navigate('/overview');

  const handlePrimaryCTA = async () => {
    if (wallet.connected) {
      enterWorkspace();
    } else {
      await connect();
      navigate('/overview');
    }
  };

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav__brand">
          <div className="landing-nav__logo">
            <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 14L9 3L14 14H4Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
              <circle cx="9" cy="11" r="1.5" fill="white" />
            </svg>
          </div>
          <span className="landing-nav__name">Yieldra</span>
        </div>
        <div className="landing-nav__links">
          <button className="landing-nav__link" onClick={() => document.getElementById('flywheel')?.scrollIntoView({ behavior: 'smooth' })}>
            How it Works
          </button>
          <button className="landing-nav__link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            Features
          </button>
          <button className="landing-nav__link" onClick={() => document.getElementById('metrics')?.scrollIntoView({ behavior: 'smooth' })}>
            Performance
          </button>
          {wallet.connected ? (
            <button className="landing-cta" onClick={enterWorkspace}>
              Launch Engine →
            </button>
          ) : (
            <button className="landing-cta" onClick={connect} disabled={wallet.connecting}>
              {wallet.connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="landing-hero">
        <div className="landing-hero__content">
          <div className="landing-hero__left">
            <div className="landing-hero__badge animate-fade-in-up stagger-1">
              <span className="landing-hero__badge-dot" />
              Built for the Arc ecosystem
            </div>
            <h1 className="landing-hero__headline animate-fade-in-up stagger-2">
              Your Capital,<br />
              <span className="landing-hero__accent">Autonomous.</span>
            </h1>
            <p className="landing-hero__sub animate-fade-in-up stagger-3">
              A USDC account where agents score your behavior, extend dynamic credit,
              and compound yield — while you focus on building.
            </p>
            <div className="landing-hero__actions animate-fade-in-up stagger-4">
              <button className="landing-cta landing-cta--large" onClick={handlePrimaryCTA} disabled={wallet.connecting}>
                {wallet.connecting ? 'Connecting...' : wallet.connected ? 'Launch Engine →' : 'Connect Wallet'}
              </button>
              <button
                className="landing-cta landing-cta--large landing-cta--outline"
                onClick={() => document.getElementById('flywheel')?.scrollIntoView({ behavior: 'smooth' })}
              >
                How it Works
              </button>
            </div>
            <div className="landing-hero__trust animate-fade-in-up stagger-5">
              {TRUST_ITEMS.map(item => (
                <span key={item} className="landing-hero__trust-item">
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="landing-hero__right animate-fade-in-up stagger-3">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ═══════ FLYWHEEL ═══════ */}
      <section className="landing-flywheel landing-reveal" id="flywheel" ref={addRef}>
        <div className="landing-inner">
          <div className="landing-flywheel__header">
            <div className="landing-section-tag">The Engine</div>
            <h2 className="landing-section-title">One Flywheel.<br />Compounding Capital.</h2>
            <p className="landing-section-desc">
              Each cycle strengthens your score, unlocks more credit,
              and compounds yield. Autonomous, continuous, verifiable.
            </p>
          </div>

          <div className="flywheel-flow">
            {FLYWHEEL_STEPS.map((step, i) => (
              <div key={step.label} className="flywheel-step">
                <div className="flywheel-step__num">{step.num}</div>
                <div className="flywheel-step__circle">
                  <span className="flywheel-step__icon">{step.icon}</span>
                </div>
                <span className="flywheel-step__label">{step.label}</span>
                <span className="flywheel-step__sub">{step.sub}</span>
                {i < FLYWHEEL_STEPS.length - 1 && <div className="flywheel-step__connector" />}
              </div>
            ))}
          </div>

          <div className="flywheel-feedback">
            <span className="flywheel-feedback__arrow">↺</span>
            Each cycle compounds — your position grows stronger every iteration
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section className="landing-features landing-reveal" id="features" ref={addRef}>
        <div className="landing-inner">
          <div className="landing-features__header">
            <div className="landing-section-tag">Core Systems</div>
            <h2 className="landing-section-title">Four Engines.<br />One Account.</h2>
          </div>

          <div className="landing-features__grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-block">
                <div className="feature-block__top">
                  <div className="feature-block__icon">{f.icon}</div>
                  <span className="feature-block__tag">{f.tag}</span>
                </div>
                <div className="feature-block__title">{f.title}</div>
                <div className="feature-block__desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ METRICS ═══════ */}
      <section className="landing-metrics landing-reveal" id="metrics" ref={addRef}>
        <div className="landing-inner">
          <div className="landing-section-tag" style={{ textAlign: 'center' }}>Live Simulation</div>
          <h2 className="landing-section-title" style={{ textAlign: 'center' }}>The Numbers Speak</h2>

          <div className="landing-metrics__grid">
            {SHOWCASE_METRICS.map(m => (
              <div key={m.label} className="landing-metric">
                <div className="landing-metric__value">{m.value}</div>
                <div className="landing-metric__label">{m.label}</div>
                <div className="landing-metric__detail">{m.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER CTA ═══════ */}
      <section className="landing-footer landing-reveal" ref={addRef}>
        <div className="landing-inner">
          <div className="landing-footer__content">
            <h2 className="landing-footer__headline">Ready to make your capital autonomous?</h2>
            <p className="landing-footer__sub">Enter the engine. Watch the flywheel compound.</p>
            <button className="landing-cta landing-cta--large landing-cta--glow" onClick={handlePrimaryCTA} disabled={wallet.connecting}>
              {wallet.connecting ? 'Connecting...' : wallet.connected ? 'Launch Engine →' : 'Connect Wallet'}
            </button>
          </div>
          <div className="landing-footer__bottom">
            <span>Built for the Arc ecosystem</span>
            <span>·</span>
            <span>Non-custodial</span>
            <span>·</span>
            <span>Auditable</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Hero Visual (right side dashboard mockup) ──

function HeroVisual() {
  const [score] = useState(812);

  return (
    <div className="hero-visual">
      {/* Top card — portfolio */}
      <div className="hero-visual__card hero-visual__card--main">
        <div className="hero-visual__card-label">Total Capital</div>
        <div className="hero-visual__card-value">$147,832.50</div>
        <div className="hero-visual__card-change">+3.2% this month</div>
        {/* Mini chart */}
        <svg className="hero-visual__chart" viewBox="0 0 200 60" fill="none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 45 Q20 40 40 38 Q60 32 80 28 Q100 30 120 22 Q140 18 160 15 Q180 12 200 8 V60 H0Z" fill="url(#heroGrad)" />
          <path d="M0 45 Q20 40 40 38 Q60 32 80 28 Q100 30 120 22 Q140 18 160 15 Q180 12 200 8" stroke="var(--accent)" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Score gauge card */}
      <div className="hero-visual__card hero-visual__card--score">
        <div className="hero-visual__score-ring">
          <svg viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" stroke="var(--border-subtle)" strokeWidth="5" fill="none" />
            <circle cx="40" cy="40" r="32" stroke="var(--accent)" strokeWidth="5" fill="none"
              strokeDasharray="201" strokeDashoffset={201 - (201 * score / 1000)}
              strokeLinecap="round" transform="rotate(-90 40 40)" />
          </svg>
          <div className="hero-visual__score-value">{score}</div>
        </div>
        <div>
          <div className="hero-visual__card-label">Behavioral Score</div>
          <div className="hero-visual__score-grade">Excellent</div>
        </div>
      </div>

      {/* Yield card */}
      <div className="hero-visual__card hero-visual__card--yield">
        <div className="hero-visual__card-label">Active Yield</div>
        <div className="hero-visual__yield-value">8.7%<span> APY</span></div>
        <div className="hero-visual__yield-bars">
          <div className="hero-visual__yield-bar" style={{ width: '65%' }}><span>Aave 6.2%</span></div>
          <div className="hero-visual__yield-bar hero-visual__yield-bar--alt" style={{ width: '80%' }}><span>Curve 9.8%</span></div>
          <div className="hero-visual__yield-bar" style={{ width: '48%' }}><span>T-Bill 5.1%</span></div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="hero-visual__badge">
        <span className="hero-visual__badge-dot" />
        Engine Active
      </div>
    </div>
  );
}
