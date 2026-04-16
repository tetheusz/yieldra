import './settings.css';
import { useStore, useStoreDispatch } from '../../state/store';
import { useWallet } from '../../state/wallet';
import { useRightRail } from '../../layouts/AppShell';
import { Panel } from '../../components/panel/Panel';
import { useState } from 'react';

export function Settings() {
  const s = useStore();
  const dispatch = useStoreDispatch();
  const { wallet, disconnect } = useWallet();

  useRightRail(<SettingsRail />, []);

  // Local state for interactive controls
  const [config, setConfig] = useState(s.autopilotConfig);
  const [distribution, setDistribution] = useState(s.profitDistribution);

  const updateConfig = (key: string, value: unknown) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    dispatch({ autopilotConfig: updated });
  };

  const updateDistribution = (key: string, value: number) => {
    const updated = { ...distribution, [key]: value };
    setDistribution(updated);
    dispatch({ profitDistribution: updated });
  };

  const toggleAutopilot = () => {
    const next = s.autopilotStatus === 'active' ? 'paused' : 'active';
    dispatch({ autopilotStatus: next, autopilotActive: next === 'active' });
  };

  return (
    <>
      <div className="screen-header animate-fade-in-up stagger-1">
        <h1 className="screen-header__title">Settings</h1>
        <p className="screen-header__subtitle">Engine configuration and account preferences</p>
      </div>

      {/* Wallet */}
      <div className="animate-fade-in-up stagger-2">
        <Panel variant="bordered" title="Connected Wallet">
          {wallet.connected ? (
            <div className="settings-wallet">
              <div className="settings-wallet__avatar">
                {wallet.shortAddress?.slice(2, 4).toUpperCase()}
              </div>
              <div className="settings-wallet__info">
                <div className="settings-wallet__address">{wallet.address}</div>
                <div className="settings-wallet__network">
                  <span style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--status-success)',
                    marginRight: 'var(--space-1)',
                  }} />
                  {wallet.networkName}
                </div>
              </div>
              <button className="settings-wallet__disconnect" onClick={disconnect}>
                Disconnect
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
              No wallet connected
            </div>
          )}
        </Panel>
      </div>

      {/* Autopilot Controls */}
      <div className="settings-grid animate-fade-in-up stagger-3" style={{ marginTop: 'var(--space-6)' }}>
        <Panel variant="bordered" title="Autopilot Engine">
          <div className="setting-toggle">
            <div className="setting-toggle__info">
              <span className="setting-toggle__label">Autopilot Active</span>
              <span className="setting-toggle__desc">Enable autonomous yield management</span>
            </div>
            <button
              className={`setting-toggle__switch setting-toggle__switch--${s.autopilotStatus === 'active' ? 'on' : 'off'}`}
              onClick={toggleAutopilot}
            >
              <div className="setting-toggle__switch-knob" />
            </button>
          </div>

          <div className="setting-toggle">
            <div className="setting-toggle__info">
              <span className="setting-toggle__label">Auto-Repayment</span>
              <span className="setting-toggle__desc">Automatically repay debt from yield</span>
            </div>
            <button
              className={`setting-toggle__switch setting-toggle__switch--${config.autoRepayment ? 'on' : 'off'}`}
              onClick={() => updateConfig('autoRepayment', !config.autoRepayment)}
            >
              <div className="setting-toggle__switch-knob" />
            </button>
          </div>

          <SelectControl
            label="Risk Tolerance"
            options={['conservative', 'moderate', 'aggressive']}
            value={config.riskTolerance}
            onChange={(v) => updateConfig('riskTolerance', v)}
          />
        </Panel>

        <Panel variant="bordered" title="Allocation Limits">
          <SliderControl
            label="Max Single Allocation"
            value={config.maxSingleAllocation}
            min={10}
            max={60}
            unit="%"
            onChange={(v) => updateConfig('maxSingleAllocation', v)}
          />

          <SliderControl
            label="Rebalance Threshold"
            value={config.rebalanceThreshold}
            min={1}
            max={15}
            unit="%"
            onChange={(v) => updateConfig('rebalanceThreshold', v)}
          />

          <SliderControl
            label="Minimum Reserve"
            value={config.minReserve}
            min={5}
            max={40}
            unit="%"
            onChange={(v) => updateConfig('minReserve', v)}
          />
        </Panel>
      </div>

      {/* Profit Distribution */}
      <div className="settings-section animate-fade-in-up stagger-4">
        <Panel variant="bordered" title="Profit Distribution" subtitle="How yield is split between goals">
          <SliderControl
            label="Amortization"
            value={distribution.amortization}
            min={0}
            max={80}
            unit="%"
            onChange={(v) => updateDistribution('amortization', v)}
          />
          <SliderControl
            label="Reinvestment"
            value={distribution.reinvestment}
            min={0}
            max={80}
            unit="%"
            onChange={(v) => updateDistribution('reinvestment', v)}
          />
          <SliderControl
            label="Reserve"
            value={distribution.reserve}
            min={0}
            max={80}
            unit="%"
            onChange={(v) => updateDistribution('reserve', v)}
          />
          <div style={{
            fontSize: 'var(--text-xs)',
            color: distribution.amortization + distribution.reinvestment + distribution.reserve === 100
              ? 'var(--text-tertiary)'
              : 'var(--status-warning)',
            marginTop: 'var(--space-2)',
            fontFamily: 'var(--font-mono)',
          }}>
            Total: {distribution.amortization + distribution.reinvestment + distribution.reserve}%
            {distribution.amortization + distribution.reinvestment + distribution.reserve !== 100 && ' — should be 100%'}
          </div>
        </Panel>
      </div>

      {/* Danger Zone */}
      <div className="animate-fade-in-up stagger-5">
        <div className="settings-danger">
          <div className="settings-danger__title">Danger Zone</div>
          <div className="settings-danger__row">
            <span className="settings-danger__label">Pause all strategies</span>
            <button className="settings-danger__btn">Pause All</button>
          </div>
          <div className="settings-danger__row">
            <span className="settings-danger__label">Emergency withdraw to wallet</span>
            <button className="settings-danger__btn">Emergency Withdraw</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Sub-components ──

function SliderControl({ label, value, min, max, unit, onChange }: {
  label: string; value: number; min: number; max: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="setting-slider">
      <div className="setting-slider__header">
        <span className="setting-slider__label">{label}</span>
        <span className="setting-slider__value">{value}{unit}</span>
      </div>
      <input
        type="range"
        className="setting-slider__input"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function SelectControl({ label, options, value, onChange }: {
  label: string; options: string[]; value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="setting-select">
      <span className="setting-select__label">{label}</span>
      <div className="setting-select__options">
        {options.map(opt => (
          <button
            key={opt}
            className={`setting-select__btn${opt === value ? ' setting-select__btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

function SettingsRail() {
  return (
    <div className="animate-fade-in-up stagger-2">
      <div className="section-label">About Settings</div>
      <div className="rail-info-blocks">
        {[
          { title: 'Real-time', desc: 'Changes to autopilot settings take effect immediately on the next engine tick.' },
          { title: 'Profit Split', desc: 'The distribution should total 100%. Amortization pays debt, reinvestment compounds yield, reserve protects capital.' },
          { title: 'Risk Tolerance', desc: 'Conservative limits APY exposure. Aggressive allows higher-risk strategies.' },
          { title: 'Emergency', desc: 'Emergency withdraw pulls all capital from strategies and returns to wallet.' },
        ].map(item => (
          <div key={item.title}>
            <div className="rail-info-blocks__title">{item.title}</div>
            <div>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
