const cellLocks = new Map<string, string>();

export function getLocks(): Record<string, string> {
  return Object.fromEntries(cellLocks);
}

export function acquireLock(cellId: string, clientId: string): boolean {
  const holder = cellLocks.get(cellId);
  if (holder !== undefined && holder !== clientId) {
    return false;
  }

  cellLocks.set(cellId, clientId);
  return true;
}

export function releaseLock(cellId: string, clientId: string): boolean {
  if (cellLocks.get(cellId) !== clientId) {
    return false;
  }

  cellLocks.delete(cellId);
  return true;
}

export function releaseAllLocksForClient(clientId: string): void {
  for (const [cellId, holder] of cellLocks) {
    if (holder === clientId) {
      cellLocks.delete(cellId);
    }
  }
}
