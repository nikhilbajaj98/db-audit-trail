import { AuditChange } from '../types/audit-event';

export function calculateDiff(
  previous: Record<string, any>,
  current: Record<string, any>,
  redactFields: string[] = []
): AuditChange[] {
  const changes: AuditChange[] = [];

  for (const key of Object.keys(current)) {
    if (redactFields.includes(key)) continue;

    const oldValue = previous[key];
    const newValue = current[key];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({ field: key, oldValue, newValue });
    }
  }

  return changes;
}