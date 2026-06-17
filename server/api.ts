import cloneDeep from "lodash/cloneDeep.js";
import { v4 as uuid } from "uuid";

export interface CellData {
  id: string;
  text: string;
}

const SERVER_DELAY_MS = 200;

let cellData: CellData[] = [
  {
    id: uuid(),
    text: "hello world",
  },
];

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
