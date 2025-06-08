import { registerModelHooks } from './adapters/sequelize';
import { PostgresStore } from './stores/postgres';
import { setAuditContext, getAuditContext } from './context';
import { Sequelize, Model, ModelStatic } from 'sequelize';

interface AuditTrailOptions {
  sequelize: Sequelize;
  models: ModelStatic<Model<any, any>>[];
  getActorId: () => string | number | undefined;
  redactFields?: string[];
  persist?: (event: any) => Promise<void>;
}

export class AuditTrail {
  constructor(private options: AuditTrailOptions) {
    const persistFn =
      options.persist || PostgresStore(options.sequelize);

    for (const model of options.models) {
      registerModelHooks(model, {
        getActorId: options.getActorId,
        redactFields: options.redactFields,
        persist: persistFn,
      });
    }
  }
}

export { PostgresStore, setAuditContext, getAuditContext };