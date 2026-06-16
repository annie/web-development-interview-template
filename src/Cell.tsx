import { useEffect, useRef, useState } from "react";
import type { CellData, CellSyncState } from "./apiClient";

type CellProps = {
  cell: CellData;
  index: number;
  syncState: CellSyncState;
  onDelete: (cellId: string) => void;
  onSave: (cellId: string, text: string) => void;
};

export function Cell({
  cell,
  index,
  syncState,
  onDelete,
  onSave,
}: CellProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
          {syncState === "saving" ? (
            <div className="cell-status" role="status">
              <span className="cell-spinner" aria-hidden="true" />
              Saving
            </div>
          ) : syncState === "error" ? (
            <div className="cell-status cell-status-error" role="alert">
              Save failed
            </div>
          ) : null}
          <div className="cell-controls">
            <button
              className="cell-button"
              type="button"
              disabled={!hasUnsavedChanges || syncState === "saving"}
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
          ref={textareaRef}
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
