import { useState, useMemo, useEffect } from 'react';
import type { TaskNode, WorkflowEdge, AutoFixAction, CaptureItem } from './types';
import { INITIAL_TASKS, INITIAL_EDGES, BROKEN_DEMO_SCENARIO_TASKS } from './engine/demoScenarios';
import { DivergenceDetector } from './engine/DivergenceDetector';
import { AutoFixEngine } from './engine/AutoFixEngine';
import { PhoneContainer } from './components/PhoneContainer';
import { CaptureHub } from './components/CaptureHub';
import { SmartTaskBoard } from './components/SmartTaskBoard';
import { WorkflowDAGViewer } from './components/WorkflowDAGViewer';
import { WorkflowHealthCard } from './components/WorkflowHealthCard';
import { MeetingSummaryView } from './components/MeetingSummaryView';
import { OfficeKitLaptopView } from './components/OfficeKitLaptopView';
import { DemoPitchBar } from './components/DemoPitchBar';
import { AutoFixModal } from './components/AutoFixModal';
import { Sparkles, Smartphone, Laptop } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  const [tasks, setTasks] = useState<TaskNode[]>(INITIAL_TASKS);
  const [edges, setEdges] = useState<WorkflowEdge[]>(INITIAL_EDGES);
  const [viewMode, setViewMode] = useState<'phone' | 'split' | 'laptop'>('split');
  const [activePhoneTab, setActivePhoneTab] = useState<'capture' | 'tasks' | 'dag' | 'meetings'>('tasks');
  const [currentDemoStep, setCurrentDemoStep] = useState<number>(1);
  const [isFrameless, setIsFrameless] = useState<boolean>(false);
  const [quickCaptureTab, setQuickCaptureTab] = useState<'camera' | 'voice' | 'clipboard'>('camera');

  // Automatically adapt to native mobile on small screens
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('phone');
      setIsFrameless(true);
    }
  }, []);

  // Auto-Fix Modal State
  const [activeModalAction, setActiveModalAction] = useState<AutoFixAction | null>(null);
  const [activeModalTask, setActiveModalTask] = useState<TaskNode | null>(null);

  // Phone Toast Notification
  const [phoneToast, setPhoneToast] = useState<{ title: string; desc: string } | null>(null);

  // Re-evaluate invariants & divergences dynamically
  const { evaluatedTasks, report } = useMemo(() => {
    const analysis = DivergenceDetector.analyze(tasks, edges);
    const repairs = AutoFixEngine.generateRepairs(analysis.evaluatedTasks, analysis.report.divergences);
    analysis.report.repairCandidates = repairs;
    return {
      evaluatedTasks: analysis.evaluatedTasks,
      report: analysis.report,
    };
  }, [tasks, edges]);

  // Trigger individual auto-fix modal
  const handleTriggerAutoFix = (taskId: string) => {
    const targetTask = evaluatedTasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const repair = report.repairCandidates.find((r) =>
      r.mutations.some((m) => m.taskId === taskId)
    );

    if (repair) {
      setActiveModalAction(repair);
      setActiveModalTask(targetTask);
    } else {
      const fallbackRepair: AutoFixAction = {
        id: `FIX_${taskId}`,
        divergenceId: `DIV_${taskId}`,
        title: `Auto-Remediate: ${targetTask.title}`,
        explanation: 'Apply recommended deadline extension (+48h) and restore invariant compliance.',
        impactScore: 25,
        mutations: [
          {
            taskId,
            field: 'status',
            oldValue: targetTask.status,
            newValue: 'in_progress',
          },
          {
            taskId,
            field: 'deadline',
            oldValue: targetTask.deadline,
            newValue: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          },
        ],
      };
      setActiveModalAction(fallbackRepair);
      setActiveModalTask(targetTask);
    }
  };

  // Confirm and apply a single repair
  const handleConfirmRepair = (action: AutoFixAction) => {
    const updated = AutoFixEngine.applyRepair(tasks, action);
    setTasks(updated);
    setActiveModalAction(null);
    setActiveModalTask(null);

    setPhoneToast({
      title: 'Invariant Repaired',
      desc: action.title,
    });
    setTimeout(() => setPhoneToast(null), 4000);
  };

  // Apply all available repairs (1-Click Self-Healing)
  const handleApplyAllRepairs = () => {
    const updated = AutoFixEngine.applyAllRepairs(tasks, report.repairCandidates);
    const healed = updated.map((t) => ({
      ...t,
      status: t.status === 'blocked' ? ('in_progress' as const) : t.status,
      healthState: 'healthy' as const,
      divergenceNotes: [],
    }));

    setTasks(healed);
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#16a34a', '#0284c7', '#ea580c', '#fbbf24'],
    });

    setPhoneToast({
      title: 'Self-Healing Complete',
      desc: 'All invariants satisfied. Health score restored to 100%.',
    });
    setTimeout(() => setPhoneToast(null), 4500);
  };

  // Extract tasks from Camera/Voice/Clipboard
  const handleTasksExtracted = (newTasks: TaskNode[], capture: CaptureItem) => {
    setTasks((prev) => [...newTasks, ...prev]);

    if (newTasks.length > 0 && tasks.length > 0) {
      const newEdge: WorkflowEdge = {
        id: `EDGE_${Date.now()}`,
        source: newTasks[0].id,
        target: tasks[0].id,
        label: 'Extracted Dependency',
      };
      setEdges((prev) => [...prev, newEdge]);
    }

    setPhoneToast({
      title: `Extracted ${newTasks.length} Tasks`,
      desc: `Processed on Snapdragon NPU in ${capture.npuInferenceTimeMs}ms`,
    });
    setTimeout(() => setPhoneToast(null), 4500);

    setActivePhoneTab('tasks');
  };

  // Merge meeting action items
  const handleMergeMeetingTasks = (meetingTasks: TaskNode[]) => {
    setTasks((prev) => [...meetingTasks, ...prev]);
    setPhoneToast({
      title: 'Meeting Actions Merged',
      desc: `${meetingTasks.length} tasks added to Kanban board`,
    });
    setTimeout(() => setPhoneToast(null), 4000);
    setActivePhoneTab('tasks');
  };

  // Update a single task
  const handleUpdateTask = (updatedTask: TaskNode) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  // Add a task from Mobile Quick Add
  const handleAddTask = (newTask: TaskNode) => {
    setTasks((prev) => [newTask, ...prev]);
    setPhoneToast({
      title: 'Task Added to Flow',
      desc: `${newTask.title} scheduled on-device`,
    });
    setTimeout(() => setPhoneToast(null), 3500);
  };

  // Switch Quick Capture Mode from FAB
  const handleQuickCaptureMode = (mode: 'camera' | 'voice' | 'clipboard') => {
    setQuickCaptureTab(mode);
    setActivePhoneTab('capture');
  };

  // Office Kit: Laptop beams clipboard to phone
  const handleSendClipboardToPhone = (text: string) => {
    setPhoneToast({
      title: 'Office Kit Clipboard Synced',
      desc: text.length > 40 ? text.slice(0, 40) + '...' : text,
    });
    setTimeout(() => setPhoneToast(null), 5000);
  };

  // Office Kit: Laptop controls phone navigation remotely
  const handleRemoteNavigatePhone = (tab: 'capture' | 'tasks' | 'dag' | 'meetings') => {
    setActivePhoneTab(tab);
    setPhoneToast({
      title: 'Remote Navigation',
      desc: `Navigated to ${tab.toUpperCase()} via Office Kit`,
    });
    setTimeout(() => setPhoneToast(null), 3000);
  };

  // 5-Step Demo Script Orchestrator
  const handleSelectDemoStep = (step: number) => {
    setCurrentDemoStep(step);

    if (step === 1) {
      setActivePhoneTab('capture');
      setPhoneToast({
        title: 'Demo Step 1: Whiteboard Scan',
        desc: 'Camera OCR extracts tasks using on-device PaddleOCR & Phi-3',
      });
      setTimeout(() => setPhoneToast(null), 4000);
    } else if (step === 2) {
      setActivePhoneTab('meetings');
      setPhoneToast({
        title: 'Demo Step 2: Voice Whisper',
        desc: 'Real-time on-device speech transcription on Snapdragon NPU',
      });
      setTimeout(() => setPhoneToast(null), 4000);
    } else if (step === 3) {
      setTasks(BROKEN_DEMO_SCENARIO_TASKS);
      setActivePhoneTab('dag');
      setPhoneToast({
        title: 'Demo Step 3: Divergence Triggered',
        desc: 'TASK-103 overdue SLA & unassigned. Causal red warnings active!',
      });
      setTimeout(() => setPhoneToast(null), 4500);
    } else if (step === 4) {
      handleApplyAllRepairs();
      setActivePhoneTab('dag');
    } else if (step === 5) {
      setViewMode('split');
      setPhoneToast({
        title: 'Demo Step 5: Office Kit Bridge',
        desc: 'Live dashboard mirrored to laptop screen. Clipboard bridge active.',
      });
      setTimeout(() => setPhoneToast(null), 4500);
    }
  };

  const handleReset = () => {
    setTasks(INITIAL_TASKS);
    setEdges(INITIAL_EDGES);
    setActivePhoneTab('tasks');
    setCurrentDemoStep(1);
    setPhoneToast({
      title: 'State Reset',
      desc: 'FlowPilot initialized to default sprint state.',
    });
    setTimeout(() => setPhoneToast(null), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Top Demo Presentation Bar */}
      <DemoPitchBar
        currentStep={currentDemoStep}
        onSelectStep={handleSelectDemoStep}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onReset={handleReset}
      />

      {/* Main Multi-Screen Stage */}
      <main
        className="main-stage-container"
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          padding: '18px 24px',
          gap: '24px',
          overflowX: 'auto',
        }}
      >
        {/* PHONE VIEWPORT */}
        {(viewMode === 'phone' || viewMode === 'split') && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
              <Smartphone size={14} color="#ea580c" />
              <span>
                <strong style={{ color: '#0f172a' }}>iQOO 12</strong> · Primary Device (On-Device NPU)
              </span>
            </div>

            <PhoneContainer
              activeTab={activePhoneTab}
              onTabChange={setActivePhoneTab}
              healthScore={report.score}
              onPushToOfficeKit={() => setViewMode('split')}
              divergenceCount={report.divergences.length}
              onAddTask={handleAddTask}
              onQuickCaptureMode={handleQuickCaptureMode}
              isFrameless={isFrameless}
              onToggleFrameless={() => setIsFrameless((prev) => !prev)}
            >
              {/* Phone Toast Notification */}
              {phoneToast && (
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '12px',
                    right: '12px',
                    background: '#ffffff',
                    border: '1px solid #0284c7',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    zIndex: 200,
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <Sparkles size={16} color="#0284c7" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a' }}>
                      {phoneToast.title}
                    </div>
                    <div style={{ fontSize: '0.66rem', color: '#475569' }}>
                      {phoneToast.desc}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 1: Capture Hub */}
              {activePhoneTab === 'capture' && (
                <CaptureHub
                  onTasksExtracted={handleTasksExtracted}
                  defaultTab={quickCaptureTab}
                />
              )}

              {/* Tab 2: Smart Task Board */}
              {activePhoneTab === 'tasks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '16px' }}>
                  <div style={{ padding: '0 12px', paddingTop: '10px' }}>
                    <WorkflowHealthCard
                      report={report}
                      onApplyAllRepairs={handleApplyAllRepairs}
                    />
                  </div>
                  <SmartTaskBoard
                    tasks={evaluatedTasks}
                    onUpdateTask={handleUpdateTask}
                    onTriggerAutoFix={handleTriggerAutoFix}
                    onApplyAllRepairs={handleApplyAllRepairs}
                  />
                </div>
              )}

              {/* Tab 3: Causal DAG */}
              {activePhoneTab === 'dag' && (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '10px 10px 0 10px' }}>
                    <WorkflowHealthCard
                      report={report}
                      onApplyAllRepairs={handleApplyAllRepairs}
                    />
                  </div>
                  <div style={{ flex: 1, minHeight: '380px' }}>
                    <WorkflowDAGViewer
                      tasks={evaluatedTasks}
                      edges={edges}
                      onTriggerAutoFix={handleTriggerAutoFix}
                      onApplyAllRepairs={handleApplyAllRepairs}
                      isDesktop={false}
                    />
                  </div>
                </div>
              )}

              {/* Tab 4: Meeting Summary */}
              {activePhoneTab === 'meetings' && (
                <MeetingSummaryView onMergeMeetingTasks={handleMergeMeetingTasks} />
              )}
            </PhoneContainer>
          </div>
        )}

        {/* LAPTOP OFFICE KIT VIEWPORT */}
        {(viewMode === 'laptop' || viewMode === 'split') && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '580px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
              <Laptop size={14} color="#0284c7" />
              <span>
                <strong style={{ color: '#0f172a' }}>Office Kit Bridge Display</strong> · Secondary Workstation (Live Mirrored)
              </span>
            </div>

            <OfficeKitLaptopView
              tasks={evaluatedTasks}
              edges={edges}
              report={report}
              onUpdateTask={handleUpdateTask}
              onApplyAllRepairs={handleApplyAllRepairs}
              onTriggerAutoFix={handleTriggerAutoFix}
              onSendClipboardToPhone={handleSendClipboardToPhone}
              onRemoteNavigatePhone={handleRemoteNavigatePhone}
            />
          </div>
        )}
      </main>

      {/* Auto-Fix Invariant Mutation Modal using Radix Dialog */}
      <AutoFixModal
        action={activeModalAction}
        task={activeModalTask}
        onClose={() => {
          setActiveModalAction(null);
          setActiveModalTask(null);
        }}
        onConfirm={handleConfirmRepair}
      />
    </div>
  );
}

export default App;
