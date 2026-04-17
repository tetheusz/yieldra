import './landing.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { formatUSD } from '../../state/store';
import { useWallet } from '../../state/wallet';

// Asset from Generation (moved to public)
const HERO_IMAGE_URL = './hero.png';

const BENTO_CARDS = [
  {
    id: 'score',
    tag: 'REPUTATION_CORE',
    title: 'Agent Trust Score (ERC-8004)',
    desc: 'Proprietary on-chain scoring that analyzes thousands of data points — from settlement latency to repayment velocity. The gold standard for machine credit.',
    size: 'large',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    )
  },
  {
    id: 'credit',
    tag: 'LIQUIDITY_LAYER',
    title: 'Direct Machine Credit',
    desc: 'Unsecured, trust-based credit lines for high-reputation agents. Real-time liquidity without the drag of over-collateralization.',
    size: 'small',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    )
  },
  {
    id: 'laas',
    tag: 'TREASURY_OS',
    title: 'Liquidity-as-a-Service',
    desc: 'Yieldra provides the capital layer that powers autonomous arbs, liquidators, and market makers across the Arc ecosystem.',
    size: 'small',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    )
  },
  {
    id: 'autopilot',
    tag: 'EXECUTION_ENGINE',
    title: 'Autonomous Settlement',
    desc: 'Every transaction is settled instantly in USDC, with zero-latency repayment loops handled by our proprietary autopilot agents.',
    size: 'large',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    )
  }
];

export function Landing() {
  const navigate = useNavigate();
  const { wallet, connect } = useWallet();
  const sectionsRef = useRef<HTMLElement[]>([]);

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

  const addRef = (el: HTMLElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  const enterWorkspace = () => navigate('/overview');

  return (
    <div className="landing">
      {/* Premium Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav__brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
           <svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 14L9 3L14 14H4Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="9" cy="11" r="1.5" fill="var(--accent-cyan)" />
           </svg>
           <span className="landing-nav__name">YIELDRA</span>
        </div>
        <div className="landing-nav__links">
          <button className="landing-nav__link">INFRASTRUCTURE</button>
          <button className="landing-nav__link">AGENT API</button>
          <button className="landing-nav__link">METRICS</button>
          <button className="landing-cta" onClick={wallet.connected ? enterWorkspace : connect}>
            {wallet.connected ? 'LAUNCH CONSOLE' : 'CONNECT SYSTEM'}
          </button>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="landing-hero" ref={addRef}>
        <div className="landing-hero__content">
           <div className="landing-hero__left">
              <div className="landing-hero__badge">
                <span className="pulse-dot" />
                POWERING THE AGENTIC ECONOMY
              </div>
              <h1 className="landing-hero__headline">
                The Liquidity<br />
                <span className="landing-hero__accent">Engine for AI.</span>
              </h1>
              <p className="landing-hero__sub">
                A reputation-based credit layer for autonomous agents.
                Provide liquidity, back trusted machine entities, and earn yield from nanopayment turnover.
              </p>
              <div className="landing-hero__actions">
                 <button className="landing-cta landing-cta--large" onClick={wallet.connected ? enterWorkspace : connect}>
                   GET STARTED FREE
                 </button>
                 <button className="landing-cta landing-cta--large landing-cta--outline">
                   READ WHITEPAPER
                 </button>
              </div>
           </div>
           
           <div className="landing-hero__right">
              <div className="hero-visual-container">
                <img src={HERO_IMAGE_URL} alt="Yieldra Core" className="hero-image" />
                <div className="hero-overlay-tag">YILD_PROD_04_SYNC</div>
              </div>
           </div>
        </div>
      </section>

      {/* ═══════ BENTO FEATURES ═══════ */}
      <section className="landing-features landing-reveal" ref={addRef}>
        <div className="landing-section-tag">THE SYSTEM CORE</div>
        <h2 className="landing-section-title">Four Engines.<br />One Protocol.</h2>
        
        <div className="bento-grid">
           {BENTO_CARDS.map(card => (
             <div key={card.id} className={`bento-card bento-card--${card.size}`}>
                <div className="bento-card__top">
                  <div className="bento-card__icon">{card.icon}</div>
                  <span className="bento-card__badge">{card.tag}</span>
                </div>
                <div>
                  <h3 className="bento-card__title">{card.title}</h3>
                  <p className="bento-card__desc">{card.desc}</p>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* ═══════ METRICS ═══════ */}
      <section className="landing-metrics landing-reveal" ref={addRef}>
        <div className="metrics-grid">
           <div className="metric-item">
             <div className="metric-item__val">$147.8M</div>
             <div className="metric-item__label">AGENT_USDC_TVL</div>
           </div>
           <div className="metric-item">
             <div className="metric-item__val">0.001s</div>
             <div className="metric-item__label">MEAN_SETTLEMENT</div>
           </div>
           <div className="metric-item">
             <div className="metric-item__val">25.4x</div>
             <div className="metric-item__label">CAPITAL_VELOCITY</div>
           </div>
           <div className="metric-item">
             <div className="metric-item__val">99.8%</div>
             <div className="metric-item__label">REPAYMENT_RATE</div>
           </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <section className="landing-footer landing-reveal" ref={addRef}>
         <h2 className="footer-headline">Capital at the speed of thought.</h2>
         <p className="footer-sub">Join the foundational layer for autonomous finance on Arc.</p>
         <button className="landing-cta landing-cta--large landing-cta--glow" onClick={wallet.connected ? enterWorkspace : connect}>
           INITIALIZE YIELDRA OS
         </button>
      </section>
    </div>
  );
}
