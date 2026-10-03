import React, { useState, useMemo } from 'react';
import type { TaskNode, TaskStatus } from '../types';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  Clock,
  AlertTriangle,
  ArrowRight,
  Wrench,
  ChevronDown,
  Check,
  Search,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface SmartTaskBoardProps {
  tasks: TaskNode[];
  onUpdateTask: (task: TaskNode) => void;
  onSelectTask?: (task: TaskNode) => void;
  onTriggerAutoFix?: (taskId: string) => void;
  onApplyAllRepairs?: () => void;
}

export const SmartTaskBoard: React.FC<SmartTaskBoardProps> = ({
  tasks,
  onUpdateTask,
  onSelectTask,
  onTriggerAutoFix,
  onApplyAllRepairs,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'blocked' | 'urgent'>('all');
  const [selectedColumn, setSelectedColumn] = useState<TaskStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const columns: { id: TaskStatus; label: string; icon: string; count: number }[] = useMemo(
    () => [
      { id: 'in_progress', label: 'In Progress', icon: '⚡', count: tasks.filter((t) => t.status === 'in_progress').length },
      { id: 'blocked', label: 'Blocked', icon: '🛑', count: tasks.filter((t) => t.status === 'blocked').length },
      { id: 'backlog', label: 'Backlog', icon: '📥', count: tasks.filter((t) => t.status === 'backlog').length },
      { id: 'completed', label: 'Done', icon: '✅', count: tasks.filter((t) => t.status === 'completed').length },
    ],
    [tasks]
  );

  // Divergence count
  const criticalTasks = tasks.filter((t) => t.healthState === 'critical' || (t.divergenceNotes && t.divergenceNotes.length > 0));

  const filteredTasks = tasks.filter((t) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchAssignee = t.assignee?.toLowerCase().includes(q);
      const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchAssignee && !matchTag) return false;
    }

    // Active column filter
    if (selectedColumn !== 'all' && t.status !== selectedColumn) {
      return false;
    }

    // Category filter
    if (activeFilter === 'critical') return t.healthState === 'critical';
    if (activeFilter === 'blocked') return t.status === 'blocked' || (t.divergenceNotes && t.divergenceNotes.length > 0);
    if (activeFilter === 'urgent') return t.priority === 'urgent';
    return true;
  });

  const handleAdvanceStatus = (task: TaskNode) => {
    const nextStatusMap: Record<TaskStatus, TaskStatus> = {
      backlog: 'in_progress',
      in_progress: 'completed',
      blocked: 'in_progress',
      completed: 'backlog',
    };
    onUpdateTask({
      ...task,
      status: nextStatusMap[task.status],
      updatedAt: new Date().toISOString(),
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#0284c7';
      default: return '#64748b';
    }
  };

  return (
    <Tooltip.Provider delayDuration={200}>
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Invariant Breach Quick-Fix Banner */}
        {criticalTasks.length > 0 && (
          <div
            style={{
              background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={15} color="#dc2626" />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#991b1b' }}>
                  {criticalTasks.length} Invariant Divergence{criticalTasks.length > 1 ? 's' : ''} Active
                </div>
                <div style={{ fontSize: '0.66rem', color: '#b91c1c' }}>
                  SLA breaches detected by on-device causal engine
                </div>
              </div>
            </div>

            {onApplyAllRepairs && (
              <button
                onClick={onApplyAllRepairs}
                className="btn-primary"
                style={{
                  padding: '5px 10px',
                  fontSize: '0.68rem',
                  height: 'auto',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
                }}
              >
                <Zap size={12} /> Auto-Fix All
              </button>
            )}
          </div>
        )}

        {/* Search Bar & Dropdown */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              size={14}
              color="#94a3b8"
              style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, assignees, tags..."
              className="input-search"
              style={{
                width: '100%',
                paddingLeft: '32px',
                paddingRight: '10px',
                height: '36px',
                fontSize: '0.74rem',
              }}
            />
          </div>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="btn-secondary"
                style={{ height: '36px', padding: '0 10px', fontSize: '0.68rem', gap: '4px' }}
                title="Filter tasks"
              >
                <span>Filter: {activeFilter}</span>
                <ChevronDown size={11} />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content className="DropdownMenuContent" sideOffset={4}>
                <DropdownMenu.Item
                  className="DropdownMenuItem"
                  onClick={() => setActiveFilter('all')}
                >
                  <span>All Tasks</span>
                  {activeFilter === 'all' && <Check size={12} style={{ marginLeft: 'auto' }} />}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="DropdownMenuItem"
                  onClick={() => setActiveFilter('blocked')}
                >
                  <span>Blocked / Divergences</span>
                  {activeFilter === 'blocked' && <Check size={12} style={{ marginLeft: 'auto' }} />}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="DropdownMenuItem"
                  onClick={() => setActiveFilter('critical')}
                >
                  <span>Critical SLA Breaches</span>
                  {activeFilter === 'critical' && <Check size={12} style={{ marginLeft: 'auto' }} />}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="DropdownMenuItem"
                  onClick={() => setActiveFilter('urgent')}
                >
                  <span>Urgent Priority</span>
                  {activeFilter === 'urgent' && <Check size={12} style={{ marginLeft: 'auto' }} />}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* Mobile Horizontal Segmented Column Bar */}
        <div className="mobile-segmented-bar">
          <button
            onClick={() => setSelectedColumn('all')}
            className={`mobile-segment-item ${selectedColumn === 'all' ? 'active' : ''}`}
          >
            <span>All</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>({tasks.length})</span>
          </button>
          {columns.map((col) => (
            <button
              key={col.id}
              onClick={() => setSelectedColumn(col.id)}
              className={`mobile-segment-item ${selectedColumn === col.id ? 'active' : ''}`}
            >
              <span>{col.icon}</span>
              <span>{col.label}</span>
              <span
                style={{
                  fontSize: '0.64rem',
                  padding: '1px 5px',
                  borderRadius: '999px',
                  background: col.id === 'blocked' && col.count > 0 ? '#fee2e2' : '#e2e8f0',
                  color: col.id === 'blocked' && col.count > 0 ? '#dc2626' : '#475569',
                  fontWeight: 800,
                }}
              >
                {col.count}
              </span>
            </button>
          ))}
        </div>

        {/* Task Cards Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {filteredTasks.length === 0 ? (
            <div
              style={{
                padding: '30px 20px',
                textAlign: 'center',
                color: '#94a3b8',
                background: '#ffffff',
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
                fontSize: '0.75rem',
              }}
            >
              No tasks found matching your filter criteria.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isCritical = task.healthState === 'critical';
              const hasDivergence = task.divergenceNotes && task.divergenceNotes.length > 0;
              const priorityBorderColor = getPriorityColor(task.priority);

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask && onSelectTask(task)}
                  className={`mobile-touch-card ${isCritical ? 'animate-pulse-red' : ''}`}
                  style={{
                    background: '#ffffff',
                    border: isCritical ? '1px solid #ef4444' : '1px solid #e2e8f0',
                    borderLeft: `4px solid ${isCritical ? '#dc2626' : priorityBorderColor}`,
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '7px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                  }}
                >
                  {/* Top Row: ID, Source, Priority */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.64rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: '#64748b',
                        }}
                      >
                        {task.id}
                      </span>
                      <span className={`badge badge-${task.priority}`} style={{ fontSize: '0.6rem' }}>
                        {task.priority}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.6rem',
                        color: '#475569',
                        background: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}
                    >
                      {task.source.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Task Title */}
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      lineHeight: 1.35,
                    }}
                  >
                    {task.title}
                  </div>

                  {/* Invariant Divergence Warning Box */}
                  {hasDivergence && (
                    <div
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '7px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: '#dc2626',
                          fontSize: '0.66rem',
                          fontWeight: 800,
                        }}
                      >
                        <AlertTriangle size={12} />
                        <span>Invariant Causal Divergence:</span>
                      </div>
                      {task.divergenceNotes?.map((note, nIdx) => (
                        <div key={nIdx} style={{ fontSize: '0.64rem', color: '#b91c1c' }}>
                          • {note}
                        </div>
                      ))}

                      {onTriggerAutoFix && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTriggerAutoFix(task.id);
                          }}
                          className="btn-autofix"
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.64rem',
                            marginTop: '5px',
                            alignSelf: 'flex-start',
                          }}
                        >
                          <Wrench size={11} /> Auto-Fix Invariant
                        </button>
                      )}
                    </div>
                  )}

                  {/* Bottom Meta Row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '2px',
                      paddingTop: '6px',
                      borderTop: '1px solid #f1f5f9',
                      fontSize: '0.68rem',
                      color: '#64748b',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {task.assignee ? (
                        <>
                          <span style={{ fontSize: '0.78rem' }}>{task.assigneeAvatar || '👤'}</span>
                          <span style={{ color: '#0f172a', fontWeight: 700 }}>{task.assignee}</span>
                        </>
                      ) : (
                        <span style={{ color: '#dc2626', fontWeight: 800 }}>⚠️ Unassigned</span>
                      )}
                      <span>·</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={10} />
                        <span>{task.deadline || 'No SLA'}</span>
                      </div>
                    </div>

                    {/* Quick Advance Status Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdvanceStatus(task);
                      }}
                      className="btn-secondary"
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.65rem',
                        gap: '4px',
                        borderRadius: '6px',
                        color: task.status === 'completed' ? '#16a34a' : '#0284c7',
                      }}
                      title={`Current: ${task.status}. Tap to advance.`}
                    >
                      {task.status === 'completed' ? (
                        <>
                          <CheckCircle2 size={11} /> Done
                        </>
                      ) : (
                        <>
                          <span>Next</span>
                          <ArrowRight size={10} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Tooltip.Provider>
  );
};

