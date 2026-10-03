export type TaskStatus = 'backlog' | 'in_progress' | 'blocked' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskNode {
  id: string;
  title: string;
  description?: string;
  assignee: string | null;
  assigneeAvatar?: string;
  deadline: string | null; // ISO string or YYYY-MM-DD
  status: TaskStatus;
  priority: TaskPriority;
  source: 'whiteboard_ocr' | 'whisper_voice' | 'clipboard' | 'manual' | 'repair_split';
  sourceSnippet?: string;
  dependencies: string[]; // IDs of tasks this task depends on (must be finished before this starts)
  estimatedHours?: number;
  confidenceScore: number; // 0.0 to 1.0 (from on-device AI)
  tags: string[];
  createdAt: string;
  updatedAt: string;
  healthState: 'healthy' | 'warning' | 'critical';
  divergenceNotes?: string[];
}

export interface WorkflowEdge {
  id: string;
  source: string; // prerequisite task ID
  target: string; // dependent task ID
  label?: string;
  isBottleneck?: boolean;
}

export type InvariantSeverity = 'critical' | 'warning' | 'info';

export interface InvariantRule {
  id: string;
  name: string;
  description: string;
  severity: InvariantSeverity;
  category: 'timeline' | 'governance' | 'dependency' | 'workload';
}

export interface Divergence {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: InvariantSeverity;
  affectedTaskIds: string[];
  rootCauseTaskId: string;
  description: string;
  suggestedFixType: 'reschedule' | 'reassign' | 'split' | 'buffer_dependency';
  timestamp: string;
}

export interface AutoFixAction {
  id: string;
  divergenceId: string;
  title: string;
  explanation: string;
  impactScore: number; // 0-100
  mutations: {
    taskId: string;
    field: keyof TaskNode;
    oldValue: any;
    newValue: any;
  }[];
}

export interface WorkflowHealthReport {
  score: number; // 0 to 100
  status: 'optimal' | 'at_risk' | 'critical';
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  unassignedTasks: number;
  divergences: Divergence[];
  repairCandidates: AutoFixAction[];
  criticalPath: string[];
}

export interface CaptureItem {
  id: string;
  type: 'camera' | 'voice' | 'clipboard';
  timestamp: string;
  rawContent: string;
  thumbnailUrl?: string;
  audioDurationSeconds?: number;
  extractedTaskIds: string[];
  status: 'processing' | 'extracted' | 'failed';
  deviceModel: string;
  npuInferenceTimeMs: number;
}

export interface MeetingSummary {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: string[];
  keyDecisions: string[];
  extractedTasks: TaskNode[];
  rawTranscript: {
    speaker: string;
    timestamp: string;
    text: string;
  }[];
}

export interface OfficeKitState {
  isConnected: boolean;
  deviceName: string;
  ipAddress: string;
  batteryLevel: number;
  activeScreen: 'phone' | 'laptop' | 'split';
  lastSyncedAt: string | null;
  clipboardHistory: {
    id: string;
    sourceDevice: 'iQOO Phone' | 'Laptop Display';
    content: string;
    timestamp: string;
  }[];
  transferredFiles: {
    id: string;
    name: string;
    sizeKb: number;
    type: string;
    timestamp: string;
    downloadUrl?: string;
  }[];
}
