import React, { useState } from 'react';
import './activity.css';
import { useStore } from '../../state/store';
import { useRightRail } from '../../layouts/AppShell';
import { DataTable } from '../../components/data-table/DataTable';
import { AgentLogEntry } from '../../state/store';

const ACTIVITY_ICONS: Record<string, string> = {
  rebalance: '⟲',
  payment: '✓',
  harvest: '↗',
  check: '◉',
  snapshot: '◻',
  allocation: '→',
};

const FILTERS = ['All', 'Yield', 'Repayment', 'System'];

export function Activity() {
  const { agentLog } = useStore();
  const [filter, setFilter] = useState('All');

  useRightRail(<ActivityRail />, []);

  // Filter logic
  const filteredData = agentLog.filter(log => {
    if (filter === 'All') return true;
    if (filter === 'Yield') return log.type === 'harvest';
    if (filter === 'Repayment') return log.type === 'payment';
    if (filter === 'System') return log.type === 'check' || log.type === 'snapshot' || log.type === 'rebalance' || log.type === 'allocation';
    return true;
  });

  const columns = [
    {
      key: 'type',
      header: 'Type',
      render: (row: AgentLogEntry) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className={`activity-icon activity-icon--${row.type}`}>
            {ACTIVITY_ICONS[row.type] || '•'}
          </span>
          <span style={{ textTransform: 'capitalize', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 'var(--font-medium)' }}>
            {row.type}
          </span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (row: AgentLogEntry) => <div className="activity-row-action">{row.action}</div>,
    },
    {
      key: 'time',
      header: 'Time',
      align: 'right' as const,
      render: (row: AgentLogEntry) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          {row.time}
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Transaction Hash',
      align: 'left' as const,
      render: (row: AgentLogEntry) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--border-strong)', textDecoration: 'underline', cursor: 'pointer' }}>
          {row.action.includes('mock') ? '0x...' : '0x' + Math.random().toString(16).substr(2, 8) + '...' + Math.random().toString(16).substr(2, 4)}
        </span>
      ),
    }
  ];

  return (
    <>
      {/* Header */}
      <div className="screen-header animate-fade-in-up stagger-1">
        <h1 className="screen-header__title">Activity Log</h1>
        <p className="screen-header__subtitle">Auditable record of all autonomous agent actions</p>
      </div>

      <div className="animate-fade-in-up stagger-2">
        {/* Filters */}
        <div className="activity-filters">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`activity-filter-btn ${filter === f ? 'is-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredData}
          columns={columns}
          keyExtractor={(row) => `${row.time}-${row.action}`}
          emptyMessage="No activity found for this filter."
        />
      </div>
    </>
  );
}

function ActivityRail() {
  const s = useStore();
  
  return (
    <div className="animate-fade-in-up stagger-3">
      <div className="section-label">Session Summary</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', marginBottom: 'var(--space-1)' }}>Total Logs</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>{s.agentLog.length}</div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', marginBottom: 'var(--space-1)' }}>Keeper Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="autopilot-mini__indicator" style={{ width: 8, height: 8 }} />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 'var(--font-medium)' }}>Active & Syncing</span>
          </div>
        </div>
      </div>
      
      <div className="section-label" style={{ marginTop: 'var(--space-8)' }}>Export</div>
      <button className="landing-cta landing-cta--outline" style={{ width: '100%', justifyContent: 'center' }}>
        Download CSV
      </button>
    </div>
  );
}
