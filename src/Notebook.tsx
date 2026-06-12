import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SERVER, type CellData, type CellSyncState } from "./apiClient";
import { Cell } from "./Cell";
import { v4 as uuid } from "uuid";

type LoadState = "loading" | "ready" | "error";

function createCell(): CellData {
  return {
    id: uuid(),
    text: "",
  };
}

export function Notebook() {
  const clientId = useRef(uuid());
  const [cells, setCells] = useState<CellData[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [cellSyncStates, setCellSyncStates] = useState<
    Record<string, CellSyncState>
  >({});
  const [error, setError] = useState<string | null>(null);

  const loadCells = useCallback(async () => {
    setLoadState("loading");
    setError(null);

    try {
      const loadedCells = await SERVER.getCells();
      setCells(loadedCells);
      setCellSyncStates(
        Object.fromEntries(loadedCells.map((cell) => [cell.id, "idle"]))
      );
      setLoadState("ready");
    } catch {
      setLoadState("error");
      setError("Failed to load notebook cells.");
    }
  }, []);

  useEffect(() => {
    void loadCells();
  }, [loadCells]);

  const updateCellState = useCallback(
    (cellId: string, state: CellSyncState) => {
      setCellSyncStates((currentStates) => {
        const nextStates = { ...currentStates };
        nextStates[cellId] = state;
        return nextStates;
      });
    },
    []
  );

  const saveCells = useCallback(
    async (newCells: CellData[], updatingCellId: string) => {
      updateCellState(updatingCellId, "saving");

      try {
        await SERVER.updateCells(newCells, clientId.current);
        updateCellState(updatingCellId, "idle");
      } catch (e) {
        console.error(`Failed to save cells: ${e}`);
        updateCellState(updatingCellId, "error");
      }
    },
    [updateCellState]
  );

  const saveCellsDebounced = useMemo(
    () => debounce(saveCells, 500),
    [saveCells]
  );

  const applyRemoteCells = useCallback(
    (remoteCells: CellData[]) => {
      saveCellsDebounced.cancel();
      setCells(remoteCells);
      setCellSyncStates((currentStates) => {
        const nextStates = { ...currentStates };

        for (const id of Object.keys(nextStates)) {
          if (!remoteCells.some((cell) => cell.id === id)) {
            delete nextStates[id];
          }
        }

        for (const cell of remoteCells) {
          if (!nextStates[cell.id]) {
            nextStates[cell.id] = "idle";
          }
        }

        return nextStates;
      });
    },
    [saveCellsDebounced]
  );

  useEffect(() => {
    if (loadState !== "ready") {
      return;
    }

    return SERVER.subscribeToCellUpdates(clientId.current, applyRemoteCells);
  }, [loadState, applyRemoteCells]);

  const addCell = useCallback(() => {
    const newCell = createCell();

    setCells((cells) => {
      const newCells = [...cells, newCell];
      void saveCells(newCells, newCell.id);
      return newCells;
    });
  }, [saveCells]);

  const updateCellText = useCallback(
    (cellId: string, text: string) => {
      updateCellState(cellId, "saving");
      setCells((cells) => {
        const newCells = cells.map((cell) =>
          cell.id === cellId ? { ...cell, text } : cell
        );
        saveCellsDebounced(newCells, cellId);
        return newCells;
      });
      updateCellState(cellId, "idle");
    },
    [saveCellsDebounced]
  );

  const deleteCell = useCallback(
    (cellId: string) => {
      setCells((cells) => {
        const newCells = cells.filter((cell) => cell.id !== cellId);
        void saveCells(newCells, cellId);
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
        {loadState === "loading" ? (
          <div className="notebook-placeholder">Loading…</div>
        ) : loadState === "error" ? (
          <div className="notebook-placeholder notebook-placeholder-error">
            {error}
          </div>
        ) : loadState === "ready" ? (
          <>
            {cells.length === 0 ? (
              <div className="notebook-placeholder">No cells</div>
            ) : (
              cells.map((cell, index) => (
                <Cell
                  key={cell.id}
                  cell={cell}
                  index={index}
                  syncState={cellSyncStates[cell.id] ?? "idle"}
                  onDelete={deleteCell}
                  onTextChange={updateCellText}
                />
              ))
            )}
            <div className="notebook-add-cell">
              <button
                className="notebook-button"
                type="button"
                onClick={addCell}
              >
                Add cell
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
