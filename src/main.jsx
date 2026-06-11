import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { AuthProvider } from "./auth/AuthProvider";
import { App } from "./App";
import { SolicitudPublica } from "./public/SolicitudPublica";

// Ruta pública (sin login) para clientes: /reservar
const path = window.location.pathname.replace(/\/+$/, "");
const esPublico = path === "/reservar";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {esPublico ? (
      <SolicitudPublica />
    ) : (
      <AuthProvider>
        <App />
      </AuthProvider>
    )}
  </React.StrictMode>
);
