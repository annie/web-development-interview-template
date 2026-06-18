import { useCallback, useEffect, useRef, useState } from "react";
import { SERVER, type CellData } from "./apiClient";
import { Cell } from "./Cell";
import { v4 as uuid } from "uuid";

function createCell(): CellData {
  return {
    id: uuid(),
    text: "",
  };
}

export function Notebook() {
  const clientId = useRef(uuid());
  const [cells, setCells] = useState<CellData[]>([]);

  const loadCells = useCallback(async () => {
    try {
      const loadedCells = await SERVER.getCells();
      setCells(loadedCells);
    } catch (e) {
      console.error(`Failed to load cells: ${e}`);
    }
  }, []);

  useEffect(() => {
    void loadCells();
  }, [loadCells]);

  useEffect(() => {
    return SERVER.subscribeToCellUpdates(clientId.current, (cellsFromServer) => setCells(cellsFromServer));
  }, [setCells]);

  const saveCells = useCallback(async (newCells: CellData[]) => {
    try {
      setCells(newCells);
      await SERVER.updateCells(newCells, clientId.current);
    } catch (e) {
      console.error(`Failed to save cells: ${e}`);
    }
  }, []);

  const addCell = useCallback(() => {
    const newCells = [...cells, createCell()];
    void saveCells(newCells);
  }, [cells, saveCells]);

  const updateCellText = useCallback(
    (cellId: string, text: string) => {
      const newCells = cells.map((cell) =>
        cell.id === cellId ? { ...cell, text } : cell
      );
      void saveCells(newCells);
    },
    [cells, saveCells]
  );

  const deleteCell = useCallback(
    (cellId: string) => {
      const newCells = cells.filter((cell) => cell.id !== cellId);
      void saveCells(newCells);
    },
    [cells, saveCells]
  );

  return (
    <div className="notebook">
      <header className="notebook-header">
        <h1 className="notebook-title">Notebook</h1>
      </header>

      <div className="notebook-body">
        {cells.length === 0 ? (
          <div className="notebook-placeholder">No cells</div>
        ) : (
          cells.map((cell, index) => (
            <Cell
              key={cell.id}
              cell={cell}
              index={index}
              onDelete={deleteCell}
              onSave={updateCellText}
            />
          ))
        )}
        <div className="notebook-add-cell">
          <button className="notebook-button" type="button" onClick={addCell}>
            Add cell
          </button>
        </div>
      </div>
    </div>
  );
}
