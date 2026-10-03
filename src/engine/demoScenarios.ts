import type { TaskNode, WorkflowEdge, MeetingSummary } from '../types';

export const INITIAL_TASKS: TaskNode[] = [
  {
    id: 'TASK-101',
    title: 'Optimize Whisper NPU quantization on iQOO 12',
    description: 'Compile Whisper.cpp model with 4-bit INT4 quantization for Snapdragon NPU inference under 200ms.',
    assignee: 'Sarah Lin',
    assigneeAvatar: '👩‍💻',
    deadline: '2026-09-08',
    status: 'completed',
    priority: 'urgent',
    source: 'whiteboard_ocr',
    sourceSnippet: '[X] Sarah: Whisper NPU quantize by Sep 8',
    dependencies: [],
    estimatedHours: 6,
    confidenceScore: 0.98,
    tags: ['AI/NPU', 'Hardware'],
    createdAt: '2026-09-05T09:00:00Z',
    updatedAt: '2026-09-06T10:00:00Z',
    healthState: 'healthy',
  },
  {
    id: 'TASK-102',
    title: 'Finalize Causal DAG visualization component',
    description: 'Implement SVG edge routing with bottleneck pulse animation for blocked tasks.',
    assignee: 'Alex Chen',
    assigneeAvatar: '👨‍🎨',
    deadline: '2026-09-07',
    status: 'in_progress',
    priority: 'high',
    source: 'whiteboard_ocr',
    sourceSnippet: 'Alex: DAG GraphViewer UI delivery Sep 7',
    dependencies: ['TASK-101'],
    estimatedHours: 8,
    confidenceScore: 0.95,
    tags: ['UI/UX', 'Frontend'],
    createdAt: '2026-09-05T10:30:00Z',
    updatedAt: '2026-09-06T11:00:00Z',
    healthState: 'healthy',
  },
  {
    id: 'TASK-103',
    title: 'Port SyncShield invariant rules to TypeScript',
    description: 'Compile SLA deadline and assignee invariant checks into on-device evaluator.',
    assignee: 'David Kumar',
    assigneeAvatar: '👨‍💼',
    deadline: '2026-09-07',
    status: 'in_progress',
    priority: 'high',
    source: 'clipboard',
    sourceSnippet: 'David: Invariant compiler port to TS',
    dependencies: ['TASK-101'],
    estimatedHours: 5,
    confidenceScore: 0.92,
    tags: ['Engine', 'Backend'],
    createdAt: '2026-09-05T11:00:00Z',
    updatedAt: '2026-09-06T11:30:00Z',
    healthState: 'healthy',
  },
  {
    id: 'TASK-104',
    title: 'Implement Office Kit P2P sync bridge',
    description: 'Establish Wi-Fi Direct / BLE transport handshake for live phone ↔ laptop mirroring.',
    assignee: 'David Kumar',
    assigneeAvatar: '👨‍💼',
    deadline: '2026-09-09',
    status: 'backlog',
    priority: 'medium',
    source: 'whiteboard_ocr',
    sourceSnippet: 'Office Kit bridge integration David Sep 9',
    dependencies: ['TASK-103'],
    estimatedHours: 10,
    confidenceScore: 0.94,
    tags: ['OfficeKit', 'Sync'],
    createdAt: '2026-09-05T14:00:00Z',
    updatedAt: '2026-09-06T12:00:00Z',
    healthState: 'healthy',
  },
  {
    id: 'TASK-105',
    title: 'E2E Demo rehearsal & Pitch Deck polish',
    description: 'Full 3-minute flow: Whiteboard scan -> Voice audio -> Auto-fix -> Office Kit push.',
    assignee: 'Elena Rostova',
    assigneeAvatar: '👩‍🔬',
    deadline: '2026-09-10',
    status: 'backlog',
    priority: 'urgent',
    source: 'manual',
    sourceSnippet: 'Pitch rehearsal & deck readiness Elena',
    dependencies: ['TASK-102', 'TASK-104'],
    estimatedHours: 4,
    confidenceScore: 0.96,
    tags: ['QA/Demo', 'Pitch'],
    createdAt: '2026-09-05T16:00:00Z',
    updatedAt: '2026-09-06T12:00:00Z',
    healthState: 'healthy',
  },
];

export const INITIAL_EDGES: WorkflowEdge[] = [
  { id: 'E-101-102', source: 'TASK-101', target: 'TASK-102', label: 'Quantized NPU weights' },
  { id: 'E-101-103', source: 'TASK-101', target: 'TASK-103', label: 'Inference runtime' },
  { id: 'E-103-104', source: 'TASK-103', target: 'TASK-104', label: 'Engine telemetry' },
  { id: 'E-102-105', source: 'TASK-102', target: 'TASK-105', label: 'Visual UI' },
  { id: 'E-104-105', source: 'TASK-104', target: 'TASK-105', label: 'Laptop Bridge' },
];

export const SAMPLE_WHITEBOARD_SNIPPET = `
[ ] Benchmark OCR latency on Snapdragon 8 Gen 3 NPU @Sarah due:2026-09-09 high
[ ] Build CameraCapture view with live bounding boxes @Alex due:2026-09-08 urgent
[ ] Draft executive pitch slide deck for jury presentation @Elena due:2026-09-09 medium
[ ] Configure background selective revalidation daemon @David due:2026-09-10 high
`.trim();

export const SAMPLE_MEETING_AUDIO: MeetingSummary = {
  id: 'MTG-301',
  title: 'Sprint Sync: Track 04 Pitch & Hardware Testing',
  date: 'Today, 2:30 PM',
  duration: '14 min 20 sec',
  participants: ['Sarah Lin (AI)', 'Alex Chen (Mobile)', 'David Kumar (Arch)', 'Elena Rostova (QA)'],
  keyDecisions: [
    'Lock INT4 precision for on-device Whisper to guarantee < 300ms processing',
    'Demonstrate Office Kit clipboard sync live with laptop browser URL pasting',
    'Highlight zero cloud dependency as core differentiator against chatbot wrappers',
  ],
  extractedTasks: [
    {
      id: 'TASK-201',
      title: 'Package Whisper base model into on-device asset bundle',
      assignee: 'Sarah Lin',
      assigneeAvatar: '👩‍💻',
      deadline: '2026-09-09',
      status: 'in_progress',
      priority: 'urgent',
      source: 'whisper_voice',
      sourceSnippet: 'Sarah: "I will bundle the Whisper base weights directly by tomorrow evening."',
      dependencies: ['TASK-101'],
      confidenceScore: 0.97,
      tags: ['AI/NPU', 'Whisper'],
      createdAt: '2026-09-06T14:30:00Z',
      updatedAt: '2026-09-06T14:30:00Z',
      healthState: 'healthy',
    },
    {
      id: 'TASK-202',
      title: 'Record 60-second backup video of live whiteboard scanning',
      assignee: 'Elena Rostova',
      assigneeAvatar: '👩‍🔬',
      deadline: '2026-09-09',
      status: 'backlog',
      priority: 'medium',
      source: 'whisper_voice',
      sourceSnippet: 'Elena: "Let me record a backup 60-second video of the camera OCR just in case."',
      dependencies: [],
      confidenceScore: 0.94,
      tags: ['QA/Demo'],
      createdAt: '2026-09-06T14:30:00Z',
      updatedAt: '2026-09-06T14:30:00Z',
      healthState: 'healthy',
    },
  ],
  rawTranscript: [
    {
      speaker: 'Alex Chen',
      timestamp: '00:12',
      text: 'Our DAG viewer is looking sharp. When tasks break, they glow crimson and show the entire blocked cascade.',
    },
    {
      speaker: 'Sarah Lin',
      timestamp: '01:45',
      text: 'Whisper inference on the iQOO NPU is clocked at 210ms. No cloud tokens, zero latency.',
    },
    {
      speaker: 'David Kumar',
      timestamp: '03:10',
      text: 'Office Kit bridge is ready. The moment you copy a URL on laptop, phone toasts and links it to active tasks.',
    },
  ],
};

export const BROKEN_DEMO_SCENARIO_TASKS: TaskNode[] = [
  ...INITIAL_TASKS.map((t) => {
    if (t.id === 'TASK-103') {
      return {
        ...t,
        deadline: '2026-09-01',
        assignee: null,
        assigneeAvatar: undefined,
        status: 'blocked' as const,
        priority: 'urgent' as const,
        divergenceNotes: ['SLA deadline breached (-5 days)', 'Missing assigned owner', 'Bottleneck: Stalling 2 deliverables'],
      };
    }
    if (t.id === 'TASK-104') {
      return {
        ...t,
        status: 'blocked' as const,
        divergenceNotes: ['Prerequisite TASK-103 is overdue & blocked'],
      };
    }
    if (t.id === 'TASK-105') {
      return {
        ...t,
        divergenceNotes: ['Cascading delay: Final demo blocked by TASK-104 & TASK-103'],
      };
    }
    return t;
  }),
];
