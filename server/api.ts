import cloneDeep from "lodash/cloneDeep.js";
import { v4 as uuid } from "uuid";

export interface CellData {
  id: string;
  text: string;
}

const FAILURE_PERCENT = 0;
const SERVER_DELAY_MS = 200;

let cellData: CellData[] = [
  {
    id: uuid(),
    text: "hello world",
  },
];

export function getCells(): Promise<CellData[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > FAILURE_PERCENT / 100) {
        resolve(cloneDeep(cellData));
      } else {
        reject(new Error("Server error"));
      }
    }, SERVER_DELAY_MS);
  });
}

export function updateCells(newCells: CellData[]): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > FAILURE_PERCENT / 100) {
        cellData = cloneDeep(newCells);
        resolve();
      } else {
        reject(new Error("Server error"));
      }
    }, SERVER_DELAY_MS);
  });
}
