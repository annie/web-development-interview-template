import { useRef } from "react";
import type { CellData, CellSyncState } from "./apiClient";

type CellProps = {
  cell: CellData;
  index: number;
  syncState: CellSyncState;
  onDelete: (cellId: string) => void;
  onTextChange: (cellId: string, text: string) => void;
};

export function Cell({
  cell,
  index,
  syncState,
  onDelete,
  onTextChange,
}: CellProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
          value={cell.text}
          onChange={(e) => onTextChange(cell.id, e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
