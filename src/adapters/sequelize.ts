import { calculateDiff } from '../core/diff';
import { AuditEvent } from '../types/audit-event';
import { getAuditContext } from '../context';
import { Model, ModelStatic } from 'sequelize';

export function registerModelHooks<T extends Model>(
  model: ModelStatic<T>,
  options: {
    getActorId: () => string | number | undefined;
    persist: (event: AuditEvent) => Promise<void>;
    redactFields?: string[];
  }
) {
  const { getActorId, persist, redactFields = [] } = options;

  model.addHook('afterCreate', async (instance: T) => {
    const context = getAuditContext();
    const event: AuditEvent = {
      table: model.tableName,
      entityId: instance.get('id') as string | number,
      operation: 'CREATE',
      changes: Object.keys(instance.dataValues)
        .filter(k => !redactFields.includes(k))
        .map(k => ({
          field: k,
          oldValue: null,
          newValue: instance.get(k),
        })),
      actorId: getActorId() || context.actorId,
      timestamp: new Date(),
      metadata: context.metadata,
    };
    await persist(event);
  });

  model.addHook('beforeUpdate', async (instance: T) => {
    const previous = (instance as any)._previousDataValues;
    const current = instance.dataValues;
    const changes = calculateDiff(previous, current, redactFields);
    if (changes.length === 0) return;

    const context = getAuditContext();
    const event: AuditEvent = {
      table: model.tableName,
      entityId: instance.get('id') as string | number,
      operation: 'UPDATE',
      changes,
      actorId: getActorId() || context.actorId,
      timestamp: new Date(),
      metadata: context.metadata,
    };
    await persist(event);
  });
}