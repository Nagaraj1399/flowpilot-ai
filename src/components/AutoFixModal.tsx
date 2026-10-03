import React from 'react';
import type { AutoFixAction, TaskNode } from '../types';
import * as Dialog from '@radix-ui/react-dialog';
import * as Separator from '@radix-ui/react-separator';
import { Wrench, X, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AutoFixModalProps {
  action: AutoFixAction | null;
  task: TaskNode | null;
  onClose: () => void;
  onConfirm: (action: AutoFixAction) => void;
}

export const AutoFixModal: React.FC<AutoFixModalProps> = ({
  action,
  task,
  onClose,
  onConfirm,
}) => {
  const isOpen = Boolean(action && task);

  const handleApply = () => {
    if (!action) return;
    onConfirm(action);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#16a34a', '#0284c7', '#ea580c'],
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          {action && task && (
            <>
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      background: '#f0fdf4',
                      color: '#16a34a',
                      padding: '8px',
                      borderRadius: '10px',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    <Wrench size={18} />
                  </div>
                  <div>
                    <Dialog.Title style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      Self-Healing Invariant Repair
                    </Dialog.Title>
                    <Dialog.Description style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      SyncShield Minimal Mutation Synthesis Engine
                    </Dialog.Description>
                  </div>
                </div>

                <Dialog.Close asChild>
                  <button
                    onClick={onClose}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px',
                      color: '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={16} />
                  </button>
                </Dialog.Close>
              </div>

              <div style={{ margin: '14px 0' }}>
                <Separator.Root className="SeparatorRoot" />
              </div>

              {/* Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Target Task Warning Card */}
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '0.74rem', fontWeight: 700 }}>
                    <AlertTriangle size={13} />
                    <span>Target Node: {task.id} — {task.title}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#b91c1c', marginTop: '3px' }}>
                    Divergence: {task.divergenceNotes?.join('; ') || 'SLA timeline breach'}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                    {action.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
                    {action.explanation}
                  </div>
                </div>

                {/* Synthesized Mutations Table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>
                    Synthesized Mutations:
                  </span>
                  {action.mutations.map((mut, mIdx) => (
                    <div
                      key={mIdx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                      }}
                    >
                      <span style={{ color: '#64748b', textTransform: 'capitalize' }}>
                        {mut.field}:
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#dc2626', textDecoration: 'line-through' }}>
                          {String(mut.oldValue || 'None')}
                        </span>
                        <ArrowRight size={12} color="#94a3b8" />
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>
                          {String(mut.newValue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ margin: '16px 0 14px 0' }}>
                <Separator.Root className="SeparatorRoot" />
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={onClose} className="btn-secondary" style={{ padding: '7px 14px' }}>
                  Cancel
                </button>
                <button onClick={handleApply} className="btn-autofix" style={{ padding: '7px 16px' }}>
                  <Sparkles size={13} />
                  <span>Apply Repair (+{action.impactScore}% Health)</span>
                </button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
