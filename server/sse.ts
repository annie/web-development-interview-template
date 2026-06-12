import type { Response } from "express";
import type { CellData } from "./api.js";

const clients = new Map<string, Response>();

export function registerClient(clientId: string, res: Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.write(": connected\n\n");
  clients.set(clientId, res);
}

export function unregisterClient(clientId: string): void {
  clients.delete(clientId);
}

export function broadcastCellsUpdate(
  cells: CellData[],
  excludeClientId?: string
): void {
  const data = JSON.stringify(cells);

  for (const [clientId, res] of clients) {
    if (clientId === excludeClientId) {
      continue;
    }

    res.write("event: cellsUpdated\n");
    res.write(`data: ${data}\n\n`);
  }
}
