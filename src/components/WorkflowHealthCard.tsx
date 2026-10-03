import React from 'react';
import type { WorkflowHealthReport } from '../types';
import { Wrench, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WorkflowHealthCardProps {
  report: WorkflowHealthReport;
  onApplyAllRepairs: () => void;
}

export const WorkflowHealthCard: React.FC<WorkflowHealthCardProps> = ({
  report,
  onApplyAllRepairs,
}) => {
  const isOptimal = report.score >= 90;
  const isCritical = report.score < 60;

  const handleRepairWithCelebration = () => {
    onApplyAllRepairs();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#16a34a', '#0284c7', '#ea580c', '#d97706'],
    });
  };

  const strokeWidth = 8;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (report.score / 100) * circumference;
  const gaugeColor = isOptimal ? '#16a34a' : isCritical ? '#dc2626' : '#d97706';

  return (
    <div
      className="glass-panel"
      style={{
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={15} color="#0284c7" />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
            Workflow Health Score
          </span>
        </div>

        <span
          className={`badge ${isOptimal ? 'badge-healthy' : isCritical ? 'badge-critical' : 'badge-warning'}`}
          style={{ fontSize: '0.62rem' }}
        >
          {isOptimal ? 'OPTIMAL (100% GREEN)' : isCritical ? 'CRITICAL BREACH' : 'AT RISK'}
        </span>
      </div>

      {/* Main Gauge + Breakdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Radial SVG Gauge */}
        <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
          <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={gaugeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
            />
          </svg>

          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
              {report.score}%
            </span>
            <span style={{ fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              Health
            </span>
          </div>
        </div>

        {/* Invariant Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', flex: 1 }}>
          <div
            style={{
              padding: '6px 8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600 }}>Overdue SLAs</span>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: report.overdueTasks > 0 ? '#dc2626' : '#16a34a' }}>
              {report.overdueTasks}
            </span>
          </div>

          <div
            style={{
              padding: '6px 8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600 }}>Unassigned</span>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: report.unassignedTasks > 0 ? '#dc2626' : '#16a34a' }}>
              {report.unassignedTasks}
            </span>
          </div>

          <div
            style={{
              padding: '6px 8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600 }}>Blocked SPOF</span>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: report.blockedTasks > 0 ? '#d97706' : '#16a34a' }}>
              {report.blockedTasks}
            </span>
          </div>

          <div
            style={{
              padding: '6px 8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600 }}>Completed</span>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#16a34a' }}>
              {report.completedTasks}/{report.totalTasks}
            </span>
          </div>
        </div>
      </div>

      {/* Auto-Fix Trigger CTA */}
      {!isOptimal && report.repairCandidates.length > 0 && (
        <button
          onClick={handleRepairWithCelebration}
          className="btn-autofix"
          style={{ width: '100%', padding: '9px', fontSize: '0.78rem' }}
        >
          <Wrench size={13} />
          <span>Apply {report.repairCandidates.length} Auto-Fix Mutations (Self-Heal)</span>
        </button>
      )}
    </div>
  );
};
