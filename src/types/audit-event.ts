export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface AuditEvent {
  table: string;
  entityId: string | number;
  operation: 'CREATE' | 'UPDATE';
  changes: AuditChange[];
  actorId?: string | number;
  timestamp: Date;
  metadata?: Record<string, any>;
}