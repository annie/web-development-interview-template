import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Notebook } from "./Notebook.tsx";

ReactDOM.createRoot(document.querySelector('#app')).render(
  <React.StrictMode>
    <Notebook />
  </React.StrictMode>
);
