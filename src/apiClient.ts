export interface CellData {
  id: string;
  text: string;
}

export interface ServerApi {
  getCells: () => Promise<CellData[]>;
  updateCells: (newCells: CellData[], clientId: string) => Promise<void>;
  subscribeToCellUpdates: (
    clientId: string,
    onUpdate: (cells: CellData[]) => void
  ) => () => void;
}

async function handleResponse(response: Response): Promise<void> {
  if (!response.ok) {
    throw new Error("Server error");
  }
}

export const SERVER: ServerApi = {
  async getCells() {
    const response = await fetch("/api/cells");
    if (!response.ok) {
      throw new Error("Server error");
    }
    return response.json();
  },

  async updateCells(newCells, clientId) {
    const response = await fetch("/api/cells", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Id": clientId,
      },
      body: JSON.stringify(newCells),
    });
    await handleResponse(response);
  },

  subscribeToCellUpdates(clientId, onUpdate) {
    const eventSource = new EventSource(
      `/api/cells/events?clientId=${encodeURIComponent(clientId)}`
    );

    eventSource.addEventListener("cellsUpdated", (event) => {
      onUpdate(JSON.parse((event as MessageEvent).data));
    });

    return () => {
      eventSource.close();
    };
  },
};
