import cloneDeep from "lodash/cloneDeep.js";

export interface CellData {
  id: string;
  text: string;
}

const SERVER_DELAY_MS = 200;

let cellData: CellData[] = [];

export function getCells(): Promise<CellData[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(cloneDeep(cellData));
    }, SERVER_DELAY_MS);
  });
}

export function updateCells(newCells: CellData[]): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      cellData = cloneDeep(newCells);
      resolve();
    }, SERVER_DELAY_MS);
  });
}
