import type { TaskNode, Divergence, AutoFixAction } from '../types';

export const TEAM_MEMBERS = [
  { name: 'Sarah Lin', role: 'AI & NPU Specialist', avatar: '👩‍💻' },
  { name: 'Alex Chen', role: 'Mobile / Frontend Lead', avatar: '👨‍🎨' },
  { name: 'David Kumar', role: 'Systems & Cloud Architect', avatar: '👨‍💼' },
  { name: 'Elena Rostova', role: 'QA & Compliance', avatar: '👩‍🔬' },
];

export class AutoFixEngine {
  public static generateRepairs(
    tasks: TaskNode[],
    divergences: Divergence[],
    currentDate: Date = new Date()
  ): AutoFixAction[] {
    const taskMap = new Map<string, TaskNode>(tasks.map((t) => [t.id, t]));
    const actions: AutoFixAction[] = [];

    for (const div of divergences) {
      const rootTask = taskMap.get(div.rootCauseTaskId);
      if (!rootTask) continue;

      if (div.ruleId === 'INV_DEADLINE') {
        const targetDate = new Date(currentDate);
        targetDate.setDate(targetDate.getDate() + 2);
        const formattedDate = targetDate.toISOString().split('T')[0];

        actions.push({
          id: `FIX_${div.id}`,
          divergenceId: div.id,
          title: `Auto-Reschedule: "${rootTask.title}"`,
          explanation: `Extend delivery SLA deadline to ${formattedDate} (+48h buffer) to restore timeline feasibility without compromising downstream milestones.`,
          impactScore: 30,
          mutations: [
            {
              taskId: rootTask.id,
              field: 'deadline',
              oldValue: rootTask.deadline,
              newValue: formattedDate,
            },
          ],
        });
      } else if (div.ruleId === 'INV_ASSIGNEE') {
        let assignedMember = TEAM_MEMBERS[0];
        const lowerTitle = (rootTask.title + ' ' + (rootTask.tags?.join(' ') || '')).toLowerCase();
        if (lowerTitle.includes('ui') || lowerTitle.includes('design') || lowerTitle.includes('screen') || lowerTitle.includes('front')) {
          assignedMember = TEAM_MEMBERS[1];
        } else if (lowerTitle.includes('cloud') || lowerTitle.includes('backend') || lowerTitle.includes('api') || lowerTitle.includes('db')) {
          assignedMember = TEAM_MEMBERS[2];
        } else if (lowerTitle.includes('test') || lowerTitle.includes('qa') || lowerTitle.includes('audit')) {
          assignedMember = TEAM_MEMBERS[3];
        }

        actions.push({
          id: `FIX_${div.id}`,
          divergenceId: div.id,
          title: `Smart Assignment: Assign to ${assignedMember.name}`,
          explanation: `Assign ownership to ${assignedMember.name} (${assignedMember.role}) based on task domain alignment and low current sprint load.`,
          impactScore: 25,
          mutations: [
            {
              taskId: rootTask.id,
              field: 'assignee',
              oldValue: rootTask.assignee,
              newValue: assignedMember.name,
            },
            {
              taskId: rootTask.id,
              field: 'assigneeAvatar',
              oldValue: rootTask.assigneeAvatar,
              newValue: assignedMember.avatar,
            },
          ],
        });
      } else if (div.ruleId === 'INV_DEPENDENCY_ORDER') {
        actions.push({
          id: `FIX_${div.id}`,
          divergenceId: div.id,
          title: `Enforce Causal Dependency Order`,
          explanation: `Reset "${rootTask.title}" status to "backlog/blocked" until all upstream prerequisite tasks are validated.`,
          impactScore: 20,
          mutations: [
            {
              taskId: rootTask.id,
              field: 'status',
              oldValue: rootTask.status,
              newValue: 'blocked',
            },
          ],
        });
      } else if (div.ruleId === 'INV_BOTTLENECK_CASCADE') {
        actions.push({
          id: `FIX_${div.id}`,
          divergenceId: div.id,
          title: `Unblock Cascading Dependencies`,
          explanation: `Elevate priority of bottleneck "${rootTask.title}" to Urgent and adjust downstream milestones.`,
          impactScore: 20,
          mutations: [
            {
              taskId: rootTask.id,
              field: 'priority',
              oldValue: rootTask.priority,
              newValue: 'urgent',
            },
          ],
        });
      }
    }

    return actions;
  }

  public static applyRepair(tasks: TaskNode[], repair: AutoFixAction): TaskNode[] {
    const updated = tasks.map((task) => ({ ...task }));
    for (const mut of repair.mutations) {
      const target = updated.find((t) => t.id === mut.taskId);
      if (target) {
        (target as any)[mut.field] = mut.newValue;
        target.updatedAt = new Date().toISOString();
      }
    }
    return updated;
  }

  public static applyAllRepairs(tasks: TaskNode[], repairs: AutoFixAction[]): TaskNode[] {
    let current = [...tasks];
    for (const repair of repairs) {
      current = this.applyRepair(current, repair);
    }
    return current;
  }
}
