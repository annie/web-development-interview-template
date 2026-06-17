import { useEffect, useState } from "react";
import type { CellData } from "./apiClient";

type CellProps = {
  cell: CellData;
  index: number;
  onDelete: (cellId: string) => void;
  onSave: (cellId: string, text: string) => void;
};

export function Cell({ cell, index, onDelete, onSave }: CellProps) {
  const [draftText, setDraftText] = useState(cell.text);

  useEffect(() => {
    setDraftText(cell.text);
  }, [cell.text]);

  const hasUnsavedChanges = draftText !== cell.text;

  return (
    <div className="cell">
      <div className="cell-header">
        <div className="cell-label">Cell {index + 1}</div>
        <div className="cell-header-end">
          <div className="cell-controls">
            <button
              className="cell-button"
              type="button"
              disabled={!hasUnsavedChanges}
              onClick={() => onSave(cell.id, draftText)}
            >
              Save
            </button>
            <button
              className="cell-button cell-button-danger"
              type="button"
              onClick={() => onDelete(cell.id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <div className="cell-editor">
        <textarea
          aria-label={`Cell ${index + 1}`}
          className="cell-input"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
