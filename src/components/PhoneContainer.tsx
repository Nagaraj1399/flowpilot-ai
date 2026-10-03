import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
  Radio,
  Layers,
  Compass,
  Mic,
  Share2,
  CheckCircle2,
  Plus,
  Camera,
  Clipboard,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import type { TaskNode, TaskPriority } from '../types';

interface PhoneContainerProps {
  children: React.ReactNode;
  activeTab: 'capture' | 'tasks' | 'dag' | 'meetings';
  onTabChange: (tab: 'capture' | 'tasks' | 'dag' | 'meetings') => void;
  healthScore: number;
  onPushToOfficeKit?: () => void;
  divergenceCount?: number;
  onAddTask?: (task: TaskNode) => void;
  onQuickCaptureMode?: (mode: 'camera' | 'voice' | 'clipboard') => void;
  isFrameless?: boolean;
  onToggleFrameless?: () => void;
}

export const PhoneContainer: React.FC<PhoneContainerProps> = ({
  children,
  activeTab,
  onTabChange,
  healthScore,
  onPushToOfficeKit,
  divergenceCount = 0,
  onAddTask,
  onQuickCaptureMode,
  isFrameless = false,
  onToggleFrameless,
}) => {
  const [currentTime, setCurrentTime] = useState('14:32');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState<'Sarah' | 'Alex' | 'David'>('Sarah');
  const [newPriority, setNewPriority] = useState<TaskPriority>('high');
  const [newEstimatedHours, setNewEstimatedHours] = useState(2);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setCurrentTime(
        `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      );
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + 2);
    const deadlineStr = deadlineDate.toISOString().split('T')[0];

    const newTask: TaskNode = {
      id: `TASK_${Date.now().toString().slice(-4)}`,
      title: newTitle.trim(),
      assignee: newAssignee,
      status: 'in_progress',
      priority: newPriority,
      deadline: deadlineStr,
      estimatedHours: Number(newEstimatedHours) || 2,
      confidenceScore: 0.98,
      source: 'manual',
      dependencies: [],
      tags: ['mobile-quick', 'iqoo'],
      healthState: 'healthy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onAddTask) {
      onAddTask(newTask);
    }
    setNewTitle('');
    setIsNewTaskOpen(false);
    setIsFabOpen(false);
    onTabChange('tasks');
  };

  return (
    <div className={`phone-outer-frame ${isFrameless ? 'frameless' : ''}`}>
      {/* Front camera punchhole (hidden in frameless) */}
      <div className="phone-punchhole" title="16MP Front Sensor" />

      <div className="phone-screen">
        {/* Status Bar */}
        <div className="phone-statusbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#0f172a', fontWeight: 800 }}>{currentTime}</span>
            <span
              style={{
                fontSize: '0.6rem',
                background: 'linear-gradient(135deg, #ea580c, #dc2626)',
                color: '#fff',
                padding: '1px 5px',
                borderRadius: '4px',
                fontWeight: 800,
                letterSpacing: '0.5px',
              }}
            >
              5G+
            </span>
          </div>

          {/* Dynamic Island Status Pill */}
          <div
            title="Snapdragon 8 Gen 3 On-Device NPU Autopilot"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: '#0f172a',
              color: '#ffffff',
              padding: '2px 10px',
              borderRadius: '999px',
              fontSize: '0.64rem',
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.25)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 6px #22c55e',
                display: 'inline-block',
              }}
            />
            <span>NPU INT4</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wifi size={13} color="#475569" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ fontSize: '0.68rem', color: '#0f172a', fontWeight: 700 }}>98%</span>
              <Battery size={13} color="#16a34a" />
            </div>
          </div>
        </div>

        {/* Top Mini Header with Brand & Controls */}
        <div
          style={{
            padding: '6px 14px 8px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e2e8f0',
            background: '#ffffff',
            position: 'relative',
            zIndex: 60,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #ea580c, #f97316)',
                color: '#fff',
                fontSize: '0.62rem',
                fontWeight: 900,
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.5px',
              }}
            >
              iQOO
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
              FlowPilot <span style={{ color: '#0284c7' }}>AI</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Health Score Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                background: healthScore >= 90 ? '#f0fdf4' : '#fef2f2',
                color: healthScore >= 90 ? '#16a34a' : '#dc2626',
                border: `1px solid ${healthScore >= 90 ? '#bbf7d0' : '#fecaca'}`,
              }}
              title={`Workflow Invariant Health: ${healthScore}%`}
            >
              {healthScore >= 90 ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
              <span>{healthScore}%</span>
            </div>

            {/* Frameless Mobile View Toggle */}
            {onToggleFrameless && (
              <button
                onClick={onToggleFrameless}
                className="btn-secondary"
                style={{ padding: '4px 6px', fontSize: '0.68rem' }}
                title={isFrameless ? 'Switch to Hardware Bezel Frame' : 'Switch to Fullscreen Edge-to-Edge App'}
              >
                {isFrameless ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </button>
            )}

            {/* Push to Laptop Button */}
            {onPushToOfficeKit && (
              <button
                onClick={onPushToOfficeKit}
                className="btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.68rem', gap: '4px' }}
                title="Office Kit: Push current view to Laptop"
              >
                <Share2 size={11} color="#0284c7" />
                <span>Laptop</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Brand Color Accent Strip */}
        <div className="iqoo-gradient-strip" />

        {/* Main Phone Viewport Container */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
            background: '#f8fafc',
          }}
        >
          {children}

          {/* Floating Action Button (FAB) Speed Dial Overlay */}
          {isFabOpen && (
            <>
              {/* Backdrop */}
              <div
                onClick={() => setIsFabOpen(false)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(15, 23, 42, 0.4)',
                  backdropFilter: 'blur(3px)',
                  zIndex: 110,
                }}
              />

              {/* Speed Dial Action Items */}
              <div className="mobile-fab-speeddial">
                <div
                  className="mobile-fab-action"
                  onClick={() => {
                    setIsFabOpen(false);
                    if (onQuickCaptureMode) onQuickCaptureMode('camera');
                    onTabChange('capture');
                  }}
                >
                  <span className="mobile-fab-action-label">Scan Whiteboard (OCR)</span>
                  <button className="mobile-fab-action-btn" title="Scan Whiteboard">
                    <Camera size={18} color="#ea580c" />
                  </button>
                </div>

                <div
                  className="mobile-fab-action"
                  onClick={() => {
                    setIsFabOpen(false);
                    if (onQuickCaptureMode) onQuickCaptureMode('voice');
                    onTabChange('capture');
                  }}
                >
                  <span className="mobile-fab-action-label">Record Voice (Whisper)</span>
                  <button className="mobile-fab-action-btn" title="Record Voice">
                    <Mic size={18} color="#0284c7" />
                  </button>
                </div>

                <div
                  className="mobile-fab-action"
                  onClick={() => {
                    setIsFabOpen(false);
                    if (onQuickCaptureMode) onQuickCaptureMode('clipboard');
                    onTabChange('capture');
                  }}
                >
                  <span className="mobile-fab-action-label">Paste Smart Clipboard</span>
                  <button className="mobile-fab-action-btn" title="Paste Clipboard">
                    <Clipboard size={18} color="#16a34a" />
                  </button>
                </div>

                <div
                  className="mobile-fab-action"
                  onClick={() => {
                    setIsFabOpen(false);
                    setIsNewTaskOpen(true);
                  }}
                >
                  <span className="mobile-fab-action-label">Quick New Task</span>
                  <button
                    className="mobile-fab-action-btn"
                    style={{ background: '#0f172a', color: '#ffffff' }}
                    title="Add Manual Task"
                  >
                    <Plus size={18} color="#ffffff" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Primary Floating Action Button (FAB) */}
          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            className="mobile-fab-btn"
            title="Quick Capture Menu"
            aria-label="Quick capture"
          >
            {isFabOpen ? <X size={22} /> : <Plus size={24} />}
          </button>
        </div>

        {/* Quick Add Task Modal Sheet */}
        {isNewTaskOpen && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 300,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: '0 -10px 30px rgba(15, 23, 42, 0.2)',
                animation: 'fabMenuReveal 0.25s ease-out',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#ea580c" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                    Quick Task Creation
                  </span>
                </div>
                <button
                  onClick={() => setIsNewTaskOpen(false)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: '4px',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Task Title & Goal
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Benchmark INT4 on Adreno NPU"
                    className="input-search"
                    style={{ width: '100%', fontSize: '0.78rem', padding: '10px 12px' }}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Assignee
                    </label>
                    <select
                      value={newAssignee}
                      onChange={(e) => setNewAssignee(e.target.value as any)}
                      className="input-search"
                      style={{ width: '100%', fontSize: '0.75rem', padding: '8px 10px', height: '38px' }}
                    >
                      <option value="Sarah">Sarah (Lead)</option>
                      <option value="Alex">Alex (Engineer)</option>
                      <option value="David">David (Systems)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Priority
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="input-search"
                      style={{ width: '100%', fontSize: '0.75rem', padding: '8px 10px', height: '38px' }}
                    >
                      <option value="urgent">Urgent 🔥</option>
                      <option value="high">High ⚡</option>
                      <option value="medium">Medium 📋</option>
                      <option value="low">Low ☕</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIsNewTaskOpen(false)}
                    className="btn-secondary"
                    style={{ flex: 1, height: '42px', fontSize: '0.75rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 2, height: '42px', fontSize: '0.75rem', justifyContent: 'center' }}
                  >
                    <Plus size={14} /> Add to Flow
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bottom Tab Navigation Bar */}
        <div className="phone-bottom-nav">
          <div
            className={`phone-nav-item ${activeTab === 'capture' ? 'active' : ''}`}
            onClick={() => onTabChange('capture')}
            style={{ position: 'relative' }}
          >
            <Mic size={18} />
            <span>Capture</span>
          </div>

          <div
            className={`phone-nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => onTabChange('tasks')}
            style={{ position: 'relative' }}
          >
            <Layers size={18} />
            <span>Tasks</span>
            {divergenceCount > 0 && <span className="nav-badge-dot" />}
          </div>

          <div
            className={`phone-nav-item ${activeTab === 'dag' ? 'active' : ''}`}
            onClick={() => onTabChange('dag')}
            style={{ position: 'relative' }}
          >
            <Compass size={18} />
            <span>Causal DAG</span>
            {divergenceCount > 0 && <span className="nav-badge-dot" />}
          </div>

          <div
            className={`phone-nav-item ${activeTab === 'meetings' ? 'active' : ''}`}
            onClick={() => onTabChange('meetings')}
            style={{ position: 'relative' }}
          >
            <CheckCircle2 size={18} />
            <span>Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};

