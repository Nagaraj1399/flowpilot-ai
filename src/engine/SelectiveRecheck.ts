import type { TaskNode, WorkflowEdge } from '../types';

export class SelectiveRecheck {
  public static getAffectedSubgraphNodeIds(
    modifiedTaskIds: string[],
    edges: WorkflowEdge[]
  ): Set<string> {
    const affected = new Set<string>(modifiedTaskIds);
    const dependentsMap = new Map<string, string[]>();

    for (const edge of edges) {
      const list = dependentsMap.get(edge.source) || [];
      list.push(edge.target);
      dependentsMap.set(edge.source, list);
    }

    const queue = [...modifiedTaskIds];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      const children = dependentsMap.get(curr) || [];
      for (const child of children) {
        if (!affected.has(child)) {
          affected.add(child);
          queue.push(child);
        }
      }
    }

    return affected;
  }

  public static selectivelyUpdateTasks(
    allTasks: TaskNode[],
    affectedIds: Set<string>,
    evaluateFn: (task: TaskNode) => TaskNode
  ): TaskNode[] {
    return allTasks.map((task) => {
      if (affectedIds.has(task.id)) {
        return evaluateFn(task);
      }
      return task;
    });
  }
}
