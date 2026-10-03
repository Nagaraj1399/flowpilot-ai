import React, { useState } from 'react';
import type { TaskNode, WorkflowEdge, WorkflowHealthReport } from '../types';
import * as Tabs from '@radix-ui/react-tabs';
import { SmartTaskBoard } from './SmartTaskBoard';
import { WorkflowDAGViewer } from './WorkflowDAGViewer';
import {
  Smartphone,
  Clipboard,
  FileDown,
  Send,
  Battery,
  Layers,
  Compass,
  ArrowRightLeft,
  Download,
} from 'lucide-react';

interface OfficeKitLaptopViewProps {
  tasks: TaskNode[];
  edges: WorkflowEdge[];
  report: WorkflowHealthReport;
  onUpdateTask: (task: TaskNode) => void;
  onApplyAllRepairs: () => void;
  onTriggerAutoFix: (taskId: string) => void;
  onSendClipboardToPhone: (text: string) => void;
  onRemoteNavigatePhone: (tab: 'capture' | 'tasks' | 'dag' | 'meetings') => void;
}

export const OfficeKitLaptopView: React.FC<OfficeKitLaptopViewProps> = ({
  tasks,
  edges,
  report,
  onUpdateTask,
  onApplyAllRepairs,
  onTriggerAutoFix,
  onSendClipboardToPhone,
  onRemoteNavigatePhone,
}) => {
  const [activeTab, setActiveTab] = useState<string>('board');
  const [laptopClipboardText, setLaptopClipboardText] = useState('https://github.com/iqoo-hackathon/flowpilot-ai/releases/v1.0-onnx');
  const [syncedHistory, setSyncedHistory] = useState([
    {
      id: 'CLIP-1',
      device: 'Laptop Display',
      text: 'https://developer.qualcomm.com/software/qualcomm-neural-processing-sdk',
      time: '2 mins ago',
    },
    {
      id: 'CLIP-2',
      device: 'iQOO Phone',
      text: 'Sprint 24 Action Items: Whisper INT4 weights validated on Snapdragon NPU',
      time: '5 mins ago',
    },
  ]);

  const handleSendToPhone = () => {
    if (!laptopClipboardText.trim()) return;
    onSendClipboardToPhone(laptopClipboardText);
    setSyncedHistory([
      {
        id: `CLIP-${Date.now()}`,
        device: 'Laptop Display',
        text: laptopClipboardText,
        time: 'Just now',
      },
      ...syncedHistory,
    ]);
  };

  const handleDownloadReport = () => {
    const reportContent = `
# FlowPilot AI — Executive Sprint & Workflow Audit
Generated via iQOO Office Kit Bridge
Date: ${new Date().toLocaleString()}
Device: iQOO 12 (Snapdragon 8 Gen 3 NPU)

## 1. Workflow Health Metrics
- Overall Health Score: ${report.score}%
- Status: ${report.status.toUpperCase()}
- Total Active Tasks: ${report.totalTasks}
- Completed Deliverables: ${report.completedTasks}
- Overdue SLAs: ${report.overdueTasks}
- Blocked Bottlenecks: ${report.blockedTasks}
- Unassigned Items: ${report.unassignedTasks}

## 2. Task Inventory
${tasks.map((t) => `- [${t.status === 'completed' ? 'X' : ' '}] ${t.id}: ${t.title} (Owner: ${t.assignee || 'UNASSIGNED'}, SLA: ${t.deadline || 'NONE'}, Health: ${t.healthState})`).join('\n')}

## 3. Active Invariant Divergences
${report.divergences.length === 0 ? 'All Invariants Satisfied (100% Green)' : report.divergences.map((d) => `- [${d.severity.toUpperCase()}] ${d.ruleName}: ${d.description}`).join('\n')}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FlowPilot_OfficeKit_Audit_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="laptop-outer-frame">
      {/* Top Window Titlebar */}
      <div className="laptop-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="laptop-window-dots">
            <div className="laptop-dot dot-red" />
            <div className="laptop-dot dot-yellow" />
            <div className="laptop-dot dot-green" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.82rem' }}>
              iQOO Office Kit
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
              P2P Wi-Fi Direct (1.6ms latency)
            </span>
            <span className="badge badge-healthy" style={{ fontSize: '0.58rem' }}>
              LIVE SYNCED
            </span>
          </div>
        </div>

        {/* Connected Device Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#475569' }}>
            <Smartphone size={13} color="#ea580c" />
            <span>iQOO 12 (Snapdragon NPU)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#16a34a' }}>
            <Battery size={13} />
            <span>92%</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="TabsRoot" style={{ height: '100%' }}>
        {/* Navigation Toolbar */}
        <div
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '8px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Tabs.List className="TabsList" style={{ width: 'auto', background: '#f1f5f9' }}>
            <Tabs.Trigger value="board" className="TabsTrigger">
              <Layers size={13} />
              <span>Task Board</span>
            </Tabs.Trigger>
            <Tabs.Trigger value="dag" className="TabsTrigger">
              <Compass size={13} />
              <span>Causal DAG</span>
            </Tabs.Trigger>
            <Tabs.Trigger value="clipboard" className="TabsTrigger">
              <Clipboard size={13} />
              <span>Clipboard Bridge</span>
            </Tabs.Trigger>
            <Tabs.Trigger value="transfers" className="TabsTrigger">
              <FileDown size={13} />
              <span>Transfers</span>
            </Tabs.Trigger>
          </Tabs.List>

          {/* Remote Phone Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Remote Phone Control:</span>
            <button
              onClick={() => onRemoteNavigatePhone('capture')}
              className="btn-secondary"
              style={{ padding: '3px 7px', fontSize: '0.65rem' }}
            >
              Capture
            </button>
            <button
              onClick={() => onRemoteNavigatePhone('tasks')}
              className="btn-secondary"
              style={{ padding: '3px 7px', fontSize: '0.65rem' }}
            >
              Tasks
            </button>
            <button
              onClick={() => onRemoteNavigatePhone('dag')}
              className="btn-secondary"
              style={{ padding: '3px 7px', fontSize: '0.65rem' }}
            >
              DAG
            </button>
          </div>
        </div>

        {/* Tab 1: Task Board */}
        <Tabs.Content value="board" className="TabsContent" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  Mirrored Workstation Kanban
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Full screen high-productivity view synchronized bi-directionally with iQOO phone.
                </p>
              </div>

              <button
                onClick={handleDownloadReport}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.74rem' }}
              >
                <Download size={13} /> Export Markdown Audit
              </button>
            </div>

            <SmartTaskBoard
              tasks={tasks}
              onUpdateTask={onUpdateTask}
              onTriggerAutoFix={onTriggerAutoFix}
            />
          </div>
        </Tabs.Content>

        {/* Tab 2: DAG */}
        <Tabs.Content value="dag" className="TabsContent" style={{ padding: '16px', height: '100%' }}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <WorkflowDAGViewer
              tasks={tasks}
              edges={edges}
              onTriggerAutoFix={onTriggerAutoFix}
              onApplyAllRepairs={onApplyAllRepairs}
              isDesktop={true}
            />
          </div>
        </Tabs.Content>

        {/* Tab 3: Clipboard Bridge */}
        <Tabs.Content value="clipboard" className="TabsContent" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '750px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Cross-Device Clipboard Sync Bridge
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Copy any code snippet, issue link, or document URL on your laptop and instantly beam it to the iQOO phone.
              </p>
            </div>

            <div
              className="glass-panel"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: '#ffffff',
              }}
            >
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                Send to Phone Clipboard:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={laptopClipboardText}
                  onChange={(e) => setLaptopClipboardText(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#0f172a',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)',
                    outline: 'none',
                  }}
                  placeholder="Paste URL or text to beam to phone..."
                />
                <button onClick={handleSendToPhone} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  <Send size={13} />
                  <span>Beam to Phone</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                Recent Clipboard Sync Packets
              </span>
              {syncedHistory.map((item) => (
                <div
                  key={item.id}
                  className="glass-panel-subtle"
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ArrowRightLeft size={14} color="#0284c7" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                        {item.text}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                        Source: <strong>{item.device}</strong> • {item.time}
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-healthy" style={{ fontSize: '0.6rem' }}>
                    Synced
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Tabs.Content>

        {/* Tab 4: Transfers */}
        <Tabs.Content value="transfers" className="TabsContent" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '750px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                P2P Scanned Files & Task Exports
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Documents scanned with the iQOO camera and meeting transcripts are automatically available on your laptop.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                className="glass-panel"
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '8px', background: '#fff7ed', borderRadius: '8px', border: '1px solid #ffedd5' }}>
                    📄
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                      FlowPilot_Sprint_Executive_Summary.md
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      24.8 KB • Invariant audit + Task inventory • Just now
                    </div>
                  </div>
                </div>

                <button onClick={handleDownloadReport} className="btn-secondary" style={{ fontSize: '0.72rem' }}>
                  <Download size={13} /> Save to Laptop
                </button>
              </div>

              <div
                className="glass-panel"
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '8px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                    📷
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                      Whiteboard_Scan_SnapdragonNPU_PaddleOCR.png
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      1.4 MB • High-res camera scan with bounding boxes • 10 mins ago
                    </div>
                  </div>
                </div>

                <button onClick={handleDownloadReport} className="btn-secondary" style={{ fontSize: '0.72rem' }}>
                  <Download size={13} /> Save to Laptop
                </button>
              </div>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};
