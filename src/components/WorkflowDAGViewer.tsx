import React, { useState } from 'react';
import type { TaskNode, WorkflowEdge, AutoFixAction } from '../types';
import { Wrench, ZoomIn, ZoomOut, Zap } from 'lucide-react';

interface WorkflowDAGViewerProps {
  tasks: TaskNode[];
  edges: WorkflowEdge[];
  onTriggerAutoFix?: (taskId: string) => void;
  onApplyAllRepairs?: () => void;
  repairCandidates?: AutoFixAction[];
  isDesktop?: boolean;
}

export const WorkflowDAGViewer: React.FC<WorkflowDAGViewerProps> = ({
  tasks,
  edges,
  onTriggerAutoFix,
  onApplyAllRepairs,
  isDesktop = false,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(tasks[0]?.id || null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const taskMap = new Map<string, TaskNode>(tasks.map((t) => [t.id, t]));

  const levels = new Map<string, number>();
  const computeLevel = (taskId: string, visited: Set<string>): number => {
    if (levels.has(taskId)) return levels.get(taskId)!;
    if (visited.has(taskId)) return 0;
    visited.add(taskId);

    const task = taskMap.get(taskId);
    if (!task || !task.dependencies || task.dependencies.length === 0) {
      levels.set(taskId, 0);
      return 0;
    }

    let maxParentLevel = -1;
    for (const depId of task.dependencies) {
      maxParentLevel = Math.max(maxParentLevel, computeLevel(depId, new Set(visited)));
    }
    const level = maxParentLevel + 1;
    levels.set(taskId, level);
    return level;
  };

  tasks.forEach((t) => computeLevel(t.id, new Set()));

  const columns: string[][] = [];
  tasks.forEach((t) => {
    const lvl = levels.get(t.id) || 0;
    if (!columns[lvl]) columns[lvl] = [];
    columns[lvl].push(t.id);
  });

  const nodeWidth = isDesktop ? 220 : 150;
  const nodeHeight = isDesktop ? 100 : 80;
  const colSpacing = isDesktop ? 300 : 200;
  const rowSpacing = isDesktop ? 140 : 110;
  const paddingX = 40;
  const paddingY = 40;

  const nodeCoords = new Map<string, { x: number; y: number }>();
  columns.forEach((colTasks, colIdx) => {
    colTasks.forEach((taskId, rowIdx) => {
      nodeCoords.set(taskId, {
        x: paddingX + colIdx * colSpacing,
        y: paddingY + rowIdx * rowSpacing,
      });
    });
  });

  const totalWidth = Math.max(isDesktop ? 900 : 680, (columns.length + 1) * colSpacing);
  const maxRows = Math.max(...columns.map((c) => c.length), 3);
  const totalHeight = Math.max(isDesktop ? 450 : 360, (maxRows + 1) * rowSpacing);

  const selectedTask = selectedTaskId ? taskMap.get(selectedTaskId) : null;
  const hasViolations = tasks.some((t) => t.healthState === 'critical' || (t.divergenceNotes && t.divergenceNotes.length > 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px', padding: isDesktop ? '16px' : '10px' }}>
      {/* DAG Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: isDesktop ? '0.86rem' : '0.76rem', fontWeight: 800, color: '#0f172a' }}>
            Causal Divergence Graph
          </span>
          <span
            className={`badge ${hasViolations ? 'badge-critical' : 'badge-healthy'}`}
            style={{ fontSize: '0.62rem' }}
          >
            {hasViolations ? '⚡ Invariant Divergence Active' : '✨ All Invariants Satisfied'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {hasViolations && onApplyAllRepairs && (
            <button
              onClick={onApplyAllRepairs}
              className="btn-autofix"
              style={{ padding: '4px 10px', fontSize: '0.68rem', gap: '5px' }}
            >
              <Zap size={12} />
              <span>Self-Healing Auto-Fix</span>
            </button>
          )}

          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
            className="btn-secondary"
            style={{ padding: '3px 6px', fontSize: '0.65rem' }}
            title="Zoom In"
          >
            <ZoomIn size={12} />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
            className="btn-secondary"
            style={{ padding: '3px 6px', fontSize: '0.65rem' }}
            title="Zoom Out"
          >
            <ZoomOut size={12} />
          </button>
        </div>
      </div>

      {/* SVG Canvas Container with Clean Light Grid Background */}
      <div
        style={{
          flex: 1,
          minHeight: isDesktop ? '340px' : '260px',
          background: '#f8fafc',
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${totalWidth * zoomLevel}px`,
            height: `${totalHeight * zoomLevel}px`,
            transformOrigin: '0 0',
            transform: `scale(${zoomLevel})`,
            position: 'relative',
          }}
        >
          <svg width={totalWidth} height={totalHeight} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <defs>
              <linearGradient id="edgeGradNormal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0.8" />
              </linearGradient>

              <linearGradient id="edgeGradBlocked" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#dc2626" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9" />
              </linearGradient>

              <marker id="arrowNormal" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <polygon points="0 0, 8 4, 0 8" fill="#0284c7" />
              </marker>
              <marker id="arrowBlocked" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <polygon points="0 0, 8 4, 0 8" fill="#dc2626" />
              </marker>
            </defs>

            {edges.map((edge) => {
              const srcCoord = nodeCoords.get(edge.source);
              const tgtCoord = nodeCoords.get(edge.target);
              if (!srcCoord || !tgtCoord) return null;

              const srcTask = taskMap.get(edge.source);
              const isSourceBroken = srcTask?.healthState === 'critical' || srcTask?.status === 'blocked';

              const x1 = srcCoord.x + nodeWidth;
              const y1 = srcCoord.y + nodeHeight / 2;
              const x2 = tgtCoord.x;
              const y2 = tgtCoord.y + nodeHeight / 2;

              const dx = (x2 - x1) * 0.5;
              const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              return (
                <g key={edge.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isSourceBroken ? 'url(#edgeGradBlocked)' : 'url(#edgeGradNormal)'}
                    strokeWidth={isSourceBroken ? '2.5' : '1.8'}
                    strokeDasharray={isSourceBroken ? '4 3' : undefined}
                    markerEnd={isSourceBroken ? 'url(#arrowBlocked)' : 'url(#arrowNormal)'}
                  />
                  {edge.label && isDesktop && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 6}
                      fill="#64748b"
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="var(--font-mono)"
                      fontWeight="600"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {tasks.map((task) => {
            const coord = nodeCoords.get(task.id);
            if (!coord) return null;

            const isSelected = selectedTaskId === task.id;
            const isCritical = task.healthState === 'critical';
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className={`glass-panel ${isCritical ? 'animate-pulse-red' : isCompleted ? 'animate-pulse-green' : ''}`}
                style={{
                  position: 'absolute',
                  left: `${coord.x}px`,
                  top: `${coord.y}px`,
                  width: `${nodeWidth}px`,
                  minHeight: `${nodeHeight}px`,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  background: '#ffffff',
                  border: isSelected
                    ? '2px solid #ea580c'
                    : isCritical
                    ? '2px solid #dc2626'
                    : isCompleted
                    ? '1px solid #16a34a'
                    : '1px solid #e2e8f0',
                  boxShadow: isCritical
                    ? '0 0 16px rgba(220, 38, 38, 0.25)'
                    : isSelected
                    ? '0 0 14px rgba(234, 88, 12, 0.25)'
                    : 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease',
                  zIndex: isSelected ? 30 : 10,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: isCritical ? '#dc2626' : '#64748b', fontWeight: 700 }}>
                      {task.id}
                    </span>
                    <span
                      className={`badge ${isCritical ? 'badge-critical' : isCompleted ? 'badge-healthy' : 'badge-medium'}`}
                      style={{ fontSize: '0.55rem', padding: '1px 5px' }}
                    >
                      {isCritical ? 'CRITICAL' : task.status}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: isDesktop ? '0.76rem' : '0.7rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      marginTop: '4px',
                      lineHeight: 1.25,
                    }}
                  >
                    {task.title}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '6px',
                    fontSize: '0.62rem',
                    color: '#64748b',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span>{task.assigneeAvatar || '👤'}</span>
                    <span style={{ color: task.assignee ? '#1e293b' : '#dc2626', fontWeight: 700 }}>
                      {task.assignee ? task.assignee.split(' ')[0] : 'Unassigned'}
                    </span>
                  </div>
                  <span style={{ fontWeight: 600 }}>{task.deadline ? task.deadline.slice(5) : 'No SLA'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Node Inspector Drawer */}
      {selectedTask && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '10px 14px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#0284c7', fontWeight: 800 }}>
                {selectedTask.id}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                {selectedTask.title}
              </span>
              <span className={`badge badge-${selectedTask.healthState}`} style={{ fontSize: '0.6rem' }}>
                {selectedTask.healthState.toUpperCase()}
              </span>
            </div>

            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
              Assignee: <strong style={{ color: '#0f172a' }}>{selectedTask.assignee || 'None'}</strong> • SLA: <strong style={{ color: '#0f172a' }}>{selectedTask.deadline || 'None'}</strong> • Source: <em>{selectedTask.source}</em>
            </div>

            {selectedTask.divergenceNotes && selectedTask.divergenceNotes.length > 0 && (
              <div style={{ fontSize: '0.66rem', color: '#dc2626', fontWeight: 700 }}>
                ⚠️ Invariant breach: {selectedTask.divergenceNotes.join(' | ')}
              </div>
            )}
          </div>

          {selectedTask.healthState === 'critical' && onTriggerAutoFix && (
            <button
              onClick={() => onTriggerAutoFix(selectedTask.id)}
              className="btn-autofix"
              style={{ padding: '6px 12px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
            >
              <Wrench size={12} /> Auto-Fix Node
            </button>
          )}
        </div>
      )}
    </div>
  );
};
