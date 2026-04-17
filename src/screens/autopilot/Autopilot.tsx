import './autopilot.css';
import { useStore, formatUSD } from '../../state/store';
import { useRightRail } from '../../layouts/AppShell';
import { useEffect, useState, useRef } from 'react';

export function Autopilot() {
  const s = useStore();
  const [lastLogTime, setLastLogTime] = useState(new Date().toLocaleTimeString());
  const logEndRef = useRef<HTMLDivElement>(null);

  useRightRail(<MatrixRail />, []);

  useEffect(() => {
    const int = setInterval(() => {
      setLastLogTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [s.agentLog]);

  return (
    <div className="matrix-terminal animate-fade-in-up">
      {/* Header */}
      <div className="matrix-header">
        <div>
          <div className="matrix-title glitch-text">NEURAL LINK MONITOR</div>
          <div style={{ color: 'rgba(0, 255, 255, 0.5)', fontSize: '10px', marginTop: '4px' }}>
            ID: {s.agentId !== '0' ? `IDENTITY_CORE_${s.agentId}` : 'GUEST_OVERRIDE'} // ARC_PROTOCOL_V3
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="matrix-status-pulse"></div>
          <span style={{ fontSize: '12px', color: 'var(--accent)' }}>NEURAL_LINK_ESTABLISHED</span>
          <div style={{ fontSize: '10px', color: 'rgba(0, 255, 255, 0.5)' }}>SYNC_TS: {lastLogTime}</div>
        </div>
      </div>

      <div className="matrix-grid">
        {/* TOP CARDS */}
        <div className="matrix-card">
          <div className="matrix-card__title">INTELLIGENCE_METRICS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(0, 255, 255, 0.6)' }}>TX_VELOCITY</div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>{s.capitalVelocity.toFixed(2)}x</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(0, 255, 255, 0.6)' }}>NETWORK_LOAD</div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>{s.protocolUtilization.toFixed(1)}%</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(0, 255, 255, 0.6)' }}>ACTIVE_NODES</div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>{s.agentRegistry.length}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(0, 255, 255, 0.6)' }}>YIELD_PPS</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>${(s.protocolRevenue / 1000).toFixed(4)}</div>
            </div>
          </div>
        </div>

        <div className="matrix-card">
          <div className="matrix-card__title">ACTIVE_AGENT_REGISTRY</div>
          <div className="matrix-agent-grid">
            {s.agentRegistry.slice(0, 4).map(agent => (
              <div key={agent.id} className="matrix-agent-card">
                <div style={{ fontWeight: 800 }}>{agent.name.toUpperCase()}</div>
                <div style={{ fontSize: '10px', opacity: 0.7 }}>SCORE: {agent.score}</div>
                <div style={{ fontSize: '10px', color: agent.status === 'active' ? 'var(--accent)' : '#ff4d4d' }}>
                  [{agent.status.toUpperCase()}]
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LOG CONSOLE */}
        <div className="matrix-log-container">
          <div style={{ marginBottom: '12px', borderBottom: '1px solid rgba(0,255,255,0.2)', paddingBottom: '4px', fontSize: '10px', color: 'var(--accent)' }}>
            // LIVE_NEURAL_LOG_STREAM //////////////////////////////////////////////////////
          </div>
          {s.agentLog.map((log, i) => (
            <div key={i} className="matrix-log-line">
              <span className="matrix-log-time">[{log.time}]</span>
              <span style={{ color: 'rgba(0, 255, 255, 0.5)' }}>INFO:</span>
              <span className="matrix-log-action">{log.action.toUpperCase()}</span>
            </div>
          ))}
          {/* FAKE MATRIX NOISE */}
          <div className="matrix-log-line" style={{ opacity: 0.3 }}>
             <span className="matrix-log-time">[{new Date().toLocaleTimeString()}]</span>
             <span style={{ color: 'var(--accent)' }}>SYS_TRC: rebalancing_liquidity_weights_0x4f..._OK</span>
          </div>
          <div ref={logEndRef} />
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: '11px', color: 'rgba(0, 255, 255, 0.3)' }}>
        YIELDRA_OS // KERNEL_8.0.0.4 // PURE_TRUST_PROTOCOL
      </div>
    </div>
  );
}

function MatrixRail() {
  return (
    <div className="matrix-rail animate-fade-in-up stagger-2" style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>
      <div className="section-label" style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)' }}>System Intelligence</div>
      <div style={{ marginTop: '16px', fontSize: '12px' }}>
        <p style={{ marginBottom: '12px' }}>
          {">"} The Neural Link monitors the autonomous decision loops of high-reputation entities.
        </p>
        <p style={{ marginBottom: '12px' }}>
          {">"} Liquidity is routed dynamically between agents based on real-time repayment velocity.
        </p>
        <p style={{ marginBottom: '12px' }}>
          {">"} Any reputation drop below 400 triggers immediate capital retrieval and justice slashing.
        </p>
      </div>
      
      <div className="section-label" style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)', marginTop: '24px' }}>Neural Net Status</div>
      <div style={{ padding: '12px', background: 'rgba(0,255,255,0.05)', marginTop: '8px', border: '1px solid var(--accent)' }}>
         <div style={{ fontSize: '10px' }}>PROBABILITY_OF_DEFAULT: 0.04%</div>
         <div style={{ fontSize: '10px' }}>CAPITAL_UTILIZATION: OPTIMAL</div>
         <div style={{ fontSize: '10px' }}>SYSTEM_SOLVENCY: 142%</div>
      </div>
    </div>
  );
}
