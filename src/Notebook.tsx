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

  const saveCells = useCallback(async (newCells: CellData[]) => {
    try {
      await SERVER.updateCells(newCells, clientId.current);
    } catch (e) {
      console.error(`Failed to save cells: ${e}`);
    }
  }, []);

  const applyRemoteCells = useCallback((remoteCells: CellData[]) => {
    setCells(remoteCells);
  }, []);

  useEffect(() => {
    return SERVER.subscribeToCellUpdates(clientId.current, applyRemoteCells);
  }, [applyRemoteCells]);

  const addCell = useCallback(() => {
    const newCell = createCell();

    setCells((cells) => {
      const newCells = [...cells, newCell];
      void saveCells(newCells);
      return newCells;
    });
  }, [saveCells]);

  const saveCellText = useCallback(
    (cellId: string, text: string) => {
      setCells((cells) => {
        const newCells = cells.map((cell) =>
          cell.id === cellId ? { ...cell, text } : cell
        );
        void saveCells(newCells);
        return newCells;
      });
    },
    [saveCells]
  );

  const deleteCell = useCallback(
    (cellId: string) => {
      setCells((cells) => {
        const newCells = cells.filter((cell) => cell.id !== cellId);
        void saveCells(newCells);
        return newCells;
      });
    },
    [saveCells]
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
              onSave={saveCellText}
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
