import type { TaskNode, WorkflowEdge, Divergence, WorkflowHealthReport } from '../types';
import { WorkflowRuleEngine } from './WorkflowRuleEngine';

export class DivergenceDetector {
  public static analyze(
    tasks: TaskNode[],
    edges: WorkflowEdge[],
    currentDate: Date = new Date()
  ): {
    evaluatedTasks: TaskNode[];
    report: WorkflowHealthReport;
  } {
    const taskMap = new Map<string, TaskNode>(tasks.map((t) => [t.id, { ...t, divergenceNotes: [] }]));
    const divergences: Divergence[] = [];

    const dependentsMap = new Map<string, string[]>();
    for (const t of tasks) {
      dependentsMap.set(t.id, []);
    }
    for (const edge of edges) {
      const list = dependentsMap.get(edge.source) || [];
      list.push(edge.target);
      dependentsMap.set(edge.source, list);
    }

    let overdueCount = 0;
    let unassignedCount = 0;
    let blockedCount = 0;
    let completedCount = 0;

    for (const task of taskMap.values()) {
      if (task.status === 'completed') {
        completedCount++;
        task.healthState = 'healthy';
        continue;
      }

      const notes: string[] = [];

      const hasAssignee = WorkflowRuleEngine.checkAssigneeInvariant(task);
      if (!hasAssignee) {
        unassignedCount++;
        notes.push('Missing assigned owner');
        divergences.push({
          id: `DIV_ASSIGNEE_${task.id}`,
          ruleId: 'INV_ASSIGNEE',
          ruleName: 'Governance: Task Ownership Invariant',
          severity: 'critical',
          affectedTaskIds: [task.id],
          rootCauseTaskId: task.id,
          description: `Task "${task.title}" is urgent/active without an assigned owner.`,
          suggestedFixType: 'reassign',
          timestamp: new Date().toISOString(),
        });
      }

      const deadlineValid = WorkflowRuleEngine.checkDeadlineInvariant(task, currentDate);
      if (!deadlineValid) {
        overdueCount++;
        notes.push('SLA deadline breached');
        divergences.push({
          id: `DIV_DEADLINE_${task.id}`,
          ruleId: 'INV_DEADLINE',
          ruleName: 'Timeline: SLA & Deadline Invariant',
          severity: 'critical',
          affectedTaskIds: [task.id],
          rootCauseTaskId: task.id,
          description: `Task "${task.title}" deadline has lapsed (${task.deadline || 'No deadline'}).`,
          suggestedFixType: 'reschedule',
          timestamp: new Date().toISOString(),
        });
      }

      const depCheck = WorkflowRuleEngine.checkDependencyInvariant(task, taskMap);
      if (!depCheck.valid) {
        blockedCount++;
        notes.push(`Prerequisites incomplete: ${depCheck.blockingDependencyIds.join(', ')}`);
        divergences.push({
          id: `DIV_DEP_${task.id}`,
          ruleId: 'INV_DEPENDENCY_ORDER',
          ruleName: 'Causal: Dependency Prerequisite Invariant',
          severity: 'critical',
          affectedTaskIds: [task.id, ...depCheck.blockingDependencyIds],
          rootCauseTaskId: depCheck.blockingDependencyIds[0] || task.id,
          description: `Task "${task.title}" started before dependency tasks completed.`,
          suggestedFixType: 'buffer_dependency',
          timestamp: new Date().toISOString(),
        });
      }

      const downstream = dependentsMap.get(task.id) || [];
      if ((!deadlineValid || task.status === 'blocked') && downstream.length > 0) {
        notes.push(`Bottleneck: Stalling ${downstream.length} downstream deliverable(s)`);
        divergences.push({
          id: `DIV_BOTTLENECK_${task.id}`,
          ruleId: 'INV_BOTTLENECK_CASCADE',
          ruleName: 'Resilience: Single Point of Failure (SPOF)',
          severity: 'warning',
          affectedTaskIds: [task.id, ...downstream],
          rootCauseTaskId: task.id,
          description: `Delays in "${task.title}" propagate to: ${downstream.map((id) => taskMap.get(id)?.title || id).join(', ')}.`,
          suggestedFixType: 'split',
          timestamp: new Date().toISOString(),
        });
      }

      if (notes.length > 0) {
        task.healthState = notes.some((n) => n.includes('SLA') || n.includes('Missing')) ? 'critical' : 'warning';
      } else {
        task.healthState = 'healthy';
      }

      task.divergenceNotes = notes;
    }

    const criticalPath = this.computeCriticalPath(tasks, dependentsMap);

    const totalTasks = tasks.length;
    let score = 100;
    if (totalTasks > 0) {
      const penalty = overdueCount * 25 + unassignedCount * 15 + blockedCount * 20;
      score = Math.max(0, Math.min(100, Math.round(100 - (penalty / totalTasks) * 2.5)));
    }

    const healthStatus: 'optimal' | 'at_risk' | 'critical' =
      score >= 90 ? 'optimal' : score >= 60 ? 'at_risk' : 'critical';

    const evaluatedTasks = Array.from(taskMap.values());

    return {
      evaluatedTasks,
      report: {
        score,
        status: healthStatus,
        totalTasks,
        completedTasks: completedCount,
        overdueTasks: overdueCount,
        blockedTasks: blockedCount,
        unassignedTasks: unassignedCount,
        divergences,
        repairCandidates: [],
        criticalPath,
      },
    };
  }

  private static computeCriticalPath(tasks: TaskNode[], dependentsMap: Map<string, string[]>): string[] {
    const allTargets = new Set<string>();
    for (const targets of dependentsMap.values()) {
      for (const t of targets) allTargets.add(t);
    }
    const rootNodes = tasks.filter((t) => !allTargets.has(t.id));

    let longestPath: string[] = [];
    const dfs = (currentId: string, currentPath: string[]) => {
      const nextPath = [...currentPath, currentId];
      const children = dependentsMap.get(currentId) || [];
      if (children.length === 0) {
        if (nextPath.length > longestPath.length) {
          longestPath = nextPath;
        }
        return;
      }
      for (const childId of children) {
        dfs(childId, nextPath);
      }
    };

    for (const root of rootNodes) {
      dfs(root.id, []);
    }

    return longestPath;
  }
}
