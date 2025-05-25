import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./index.css";
import "maplibre-gl/dist/maplibre-gl.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <>
      <App />
      {/* глобальные уведомления */}
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        newestOnTop
        pauseOnFocusLoss={false}
      />
    </>
  </React.StrictMode>
);