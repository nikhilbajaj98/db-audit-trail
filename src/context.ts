import { AsyncLocalStorage } from 'async_hooks';

const store = new AsyncLocalStorage<Record<string, any>>();

export function setAuditContext(context: Record<string, any>) {
  store.enterWith(context);
}

export function getAuditContext() {
  return store.getStore() || {};
}