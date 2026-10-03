import React from 'react';
import { RefreshCcw, Smartphone, Laptop, SplitSquareVertical, Cpu } from 'lucide-react';

interface DemoPitchBarProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  viewMode: 'phone' | 'split' | 'laptop';
  onViewModeChange: (mode: 'phone' | 'split' | 'laptop') => void;
  onReset: () => void;
}

export const DemoPitchBar: React.FC<DemoPitchBarProps> = ({
  currentStep,
  onSelectStep,
  viewMode,
  onViewModeChange,
  onReset,
}) => {
  const steps = [
    { num: 1, label: '📷 1. Whiteboard Scan', desc: 'PaddleOCR + Phi-3 extraction' },
    { num: 2, label: '🎙️ 2. Voice Whisper', desc: 'On-device meeting transcription' },
    { num: 3, label: '🧠 3. Broken Invariant', desc: 'Overdue SLA & bottleneck cascade' },
    { num: 4, label: '✨ 4. Auto-Fix Heal', desc: 'Minimal repair engine (100% Green)' },
    { num: 5, label: '🔗 5. Office Kit Bridge', desc: 'Push to Laptop & Clipboard Sync' },
  ];

  return (
    <div
      className="demo-pitch-bar"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '8px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        zIndex: 1000,
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.05)',
      }}
    >
      {/* Brand & Pitch Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
              color: '#fff',
              fontSize: '0.68rem',
              fontWeight: 900,
              padding: '2px 7px',
              borderRadius: '4px',
              letterSpacing: '0.6px',
            }}
          >
            iQOO 2026
          </span>
          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
            FlowPilot <span style={{ color: '#0284c7' }}>AI</span>
          </span>
        </div>

        <span style={{ color: '#cbd5e1' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Cpu size={12} color="#16a34a" />
          <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
            Snapdragon NPU · Track 04 Pitch
          </span>
        </div>
      </div>

      {/* 5-Step Demo Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
        {steps.map((step) => {
          const isActive = currentStep === step.num;
          return (
            <button
              key={step.num}
              onClick={() => onSelectStep(step.num)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 11px',
                borderRadius: '8px',
                border: isActive ? '1px solid #ea580c' : '1px solid #e2e8f0',
                background: isActive ? '#fff7ed' : '#ffffff',
                color: isActive ? '#ea580c' : '#334155',
                fontSize: '0.72rem',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                boxShadow: isActive ? '0 1px 3px rgba(234, 88, 12, 0.15)' : 'var(--shadow-sm)',
                transition: 'all 0.15s ease',
              }}
              title={step.desc}
            >
              <span>{step.label}</span>
            </button>
          );
        })}

        <button
          onClick={onReset}
          className="btn-secondary"
          style={{ padding: '4px 8px', fontSize: '0.68rem', color: '#64748b' }}
          title="Reset to Initial State"
        >
          <RefreshCcw size={11} />
        </button>
      </div>

      {/* Device Viewport Toggle (Phone / Split / Laptop) */}
      <div
        style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '8px',
          padding: '2px',
          border: '1px solid #e2e8f0',
        }}
      >
        <button
          onClick={() => onViewModeChange('phone')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '6px',
            border: 'none',
            background: viewMode === 'phone' ? '#ffffff' : 'transparent',
            color: viewMode === 'phone' ? '#ea580c' : '#64748b',
            boxShadow: viewMode === 'phone' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
            fontSize: '0.68rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Smartphone size={12} />
          <span>Phone</span>
        </button>

        <button
          onClick={() => onViewModeChange('split')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '6px',
            border: 'none',
            background: viewMode === 'split' ? '#ffffff' : 'transparent',
            color: viewMode === 'split' ? '#ea580c' : '#64748b',
            boxShadow: viewMode === 'split' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
            fontSize: '0.68rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <SplitSquareVertical size={12} />
          <span>Office Kit Split</span>
        </button>

        <button
          onClick={() => onViewModeChange('laptop')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '6px',
            border: 'none',
            background: viewMode === 'laptop' ? '#ffffff' : 'transparent',
            color: viewMode === 'laptop' ? '#ea580c' : '#64748b',
            boxShadow: viewMode === 'laptop' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
            fontSize: '0.68rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Laptop size={12} />
          <span>Laptop</span>
        </button>
      </div>
    </div>
  );
};
