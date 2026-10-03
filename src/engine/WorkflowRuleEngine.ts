import type { TaskNode, InvariantRule } from '../types';

export const WORKFLOW_INVARIANTS: InvariantRule[] = [
  {
    id: 'INV_ASSIGNEE',
    name: 'Governance: Task Ownership Invariant',
    description: 'Every active or urgent task must have a verified assignee to prevent orphan handoffs.',
    severity: 'critical',
    category: 'governance',
  },
  {
    id: 'INV_DEADLINE',
    name: 'Timeline: SLA & Deadline Invariant',
    description: 'Tasks must possess a reachable deadline; overdue tasks violate delivery SLAs.',
    severity: 'critical',
    category: 'timeline',
  },
  {
    id: 'INV_DEPENDENCY_ORDER',
    name: 'Causal: Dependency Prerequisite Invariant',
    description: 'A task cannot be in progress or completed if any prerequisite dependency is incomplete or blocked.',
    severity: 'critical',
    category: 'dependency',
  },
  {
    id: 'INV_BOTTLENECK_CASCADE',
    name: 'Resilience: Single Point of Failure (SPOF) Invariant',
    description: 'Tasks with >= 2 downstream dependents must maintain active progress to prevent cascading blockages.',
    severity: 'warning',
    category: 'dependency',
  },
  {
    id: 'INV_WORKLOAD_LIMIT',
    name: 'Resource: Capacity & Load Invariant',
    description: 'No single team member should be assigned > 4 concurrent in-progress items within the same sprint window.',
    severity: 'warning',
    category: 'workload',
  },
];

export class WorkflowRuleEngine {
  public static getInvariants(): InvariantRule[] {
    return WORKFLOW_INVARIANTS;
  }

  public static checkAssigneeInvariant(task: TaskNode): boolean {
    if (task.status === 'completed') return true;
    if (task.priority === 'urgent' || task.priority === 'high' || task.status === 'in_progress') {
      return Boolean(task.assignee && task.assignee.trim().length > 0);
    }
    return true;
  }

  public static checkDeadlineInvariant(task: TaskNode, currentDate: Date = new Date()): boolean {
    if (task.status === 'completed') return true;
    if (!task.deadline) return false;

    const taskDate = new Date(task.deadline);
    taskDate.setHours(23, 59, 59, 999);
    return taskDate.getTime() >= currentDate.getTime();
  }

  public static checkDependencyInvariant(
    task: TaskNode,
    allTasksMap: Map<string, TaskNode>
  ): { valid: boolean; blockingDependencyIds: string[] } {
    if (!task.dependencies || task.dependencies.length === 0) {
      return { valid: true, blockingDependencyIds: [] };
    }

    const blocking: string[] = [];
    for (const depId of task.dependencies) {
      const depTask = allTasksMap.get(depId);
      if (!depTask || depTask.status !== 'completed') {
        blocking.push(depId);
      }
    }

    const isViolated = (task.status === 'in_progress' || task.status === 'completed') && blocking.length > 0;
    return {
      valid: !isViolated,
      blockingDependencyIds: blocking,
    };
  }
}
