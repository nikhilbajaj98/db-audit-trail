import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { AuditChange, AuditEvent } from '../types/audit-event';

interface AuditLogAttributes {
  id: string;
  table: string;
  entityId: string;
  operation: 'CREATE' | 'UPDATE';
  changes: AuditChange[];
  actorId?: string;
  timestamp: Date;
  metadata?: object;
}

type AuditLogCreationAttributes = Optional<AuditLogAttributes, 'id'>;

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes {
  public id!: string;
  public table!: string;
  public entityId!: string;
  public operation!: 'CREATE' | 'UPDATE';
  public changes!: AuditChange[];
  public actorId?: string;
  public timestamp!: Date;
  public metadata?: object;
}

export function initAuditLogModel(sequelize: Sequelize): typeof AuditLog {
  AuditLog.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      table: { type: DataTypes.STRING, allowNull: false },
      entityId: { type: DataTypes.STRING, allowNull: false },
      operation: { type: DataTypes.ENUM('CREATE', 'UPDATE'), allowNull: false },
      changes: { type: DataTypes.JSONB, allowNull: false },
      actorId: { type: DataTypes.STRING, allowNull: true },
      timestamp: { type: DataTypes.DATE, allowNull: false },
      metadata: { type: DataTypes.JSONB, allowNull: true },
    },
    {
      sequelize,
      tableName: 'audit_logs',
      timestamps: false,
    }
  );

  return AuditLog;
}

export function PostgresStore(sequelize: Sequelize) {
  const AuditModel = initAuditLogModel(sequelize);

  return async function persist(event: AuditEvent) {
    await AuditModel.create({
      table: event.table,
      entityId: String(event.entityId),
      operation: event.operation,
      changes: event.changes,
      actorId: event.actorId?.toString(),
      timestamp: event.timestamp,
      metadata: event.metadata || {},
    });
  };
}