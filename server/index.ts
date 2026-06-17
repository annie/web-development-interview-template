import express from "express";
import { getCells, updateCells } from "./api.js";
import {
  broadcastCellsUpdate,
  registerClient,
  unregisterClient,
} from "./sse.js";

const app = express();
const port = process.env.PORT ?? 3001;

app.use(express.json());

function isCellDataArray(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every((cell) => {
      if (!cell || typeof cell !== "object") {
        return false;
      }

      const candidate = cell as { id?: unknown; text?: unknown };
      return (
        typeof candidate.id === "string" && typeof candidate.text === "string"
      );
    })
  );
}

app.get("/api/cells", async (_req, res) => {
  try {
    const cells = await getCells();
    res.json(cells);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/cells/subscribe", (req, res) => {
  const clientId = req.query.clientId;

  if (typeof clientId !== "string" || clientId.length === 0) {
    res.status(400).json({ error: "Missing clientId query parameter" });
    return;
  }

  registerClient(clientId, res);

  req.on("close", () => {
    unregisterClient(clientId);
  });
});

app.put("/api/cells/update", async (req, res) => {
  if (!isCellDataArray(req.body)) {
    res.status(400).json({ error: "Invalid cells payload" });
    return;
  }

  try {
    await updateCells(req.body);
    const sourceClientId = req.header("X-Client-Id") ?? undefined;
    broadcastCellsUpdate(req.body, sourceClientId);
    res.sendStatus(200);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
