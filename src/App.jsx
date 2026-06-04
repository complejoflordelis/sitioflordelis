/* Flor de Lis — App shell + navegación + gate de autenticación */
import React from "react";
import * as FDL from "./lib/fdl";
import { isConfigured } from "./lib/supabaseClient";
import { useAuth } from "./auth/AuthProvider";
import { Login } from "./auth/Login";
import { useData } from "./data/useData";
import { BrandMark, Icon } from "./components/ui";
import { Dashboard } from "./pages/Dashboard";
import { ReservaForm } from "./pages/ReservaForm";
import { Calendario } from "./pages/Calendario";
import { ReservasTable } from "./pages/ReservasTable";
import { Cabanas } from "./pages/Cabanas";
import { Usuarios } from "./pages/Usuarios";

function Splash({ texto }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "var(--ink-faint)" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <BrandMark compact />
        <div>{texto || "Cargando…"}</div>
      </div>
    </div>
  );
}

function Bloqueado({ onSalir }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div className="card" style={{ maxWidth: 420, textAlign: "center", padding: 30 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><Icon.shield size={34} color="var(--gold-ink)" /></div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 22, margin: "0 0 8px" }}>Cuenta sin acceso</h1>
        <p className="sub" style={{ color: "var(--ink-faint)", marginBottom: 18 }}>
          Tu cuenta todavía no fue habilitada por el administrador. Escribíle para que active tu acceso.
        </p>
        <button className="btn-ghost" onClick={onSalir}>Cerrar sesión</button>
      </div>
    </div>
  );
}

export function App() {
  const auth = useAuth();
  const data = useData(auth);
  const [route, setRoute] = React.useState("dashboard");

  if (!auth.ready) return <Splash />;
  if (isConfigured && !auth.session) return <Login />;
  if (isConfigured && auth.session && !auth.isActive) return <Bloqueado onSalir={auth.signOut} />;
  if (data.loading) return <Splash texto="Cargando datos…" />;

  const items = [
    { k: "dashboard", t: "Dashboard", ico: "dashboard" },
    { k: "registrar", t: "Registrar reserva", ico: "plus" },
    { k: "calendario", t: "Calendario", ico: "calendar" },
    { k: "reservas", t: "Reservas", ico: "table" },
    { k: "cabanas", t: "Cabañas", ico: "cabin" },
  ];
  if (auth.isAdmin) items.push({ k: "usuarios", t: "Usuarios", ico: "users" });

  const pendientes = data.reservas.filter((r) => FDL.saldo(r) > 0).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="side-brand"><BrandMark /></div>
        <nav className="side-nav">
          {items.map((it) => {
            const I = Icon[it.ico];
            const active = route === it.k;
            return (
              <button key={it.k} className={"nav-item" + (active ? " active" : "")} onClick={() => setRoute(it.k)}>
                <I size={19} /> <span>{it.t}</span>
                {it.k === "registrar" && <span className="nav-plus">+</span>}
              </button>
            );
          })}
        </nav>
        <div className="side-foot">
          <div className="side-stat">
            <div><b>{data.reservas.length}</b><span>reservas</span></div>
            <div><b>{data.cabanas.length}</b><span>cabañas</span></div>
          </div>
          {pendientes > 0 && <div className="side-pend"><Icon.clock size={14} /> {pendientes} con saldo pendiente</div>}

          {auth.isLocal ? (
            <div className="side-pend" style={{ background: "oklch(0.95 0.04 250)", borderColor: "oklch(0.85 0.06 250)", color: "oklch(0.4 0.1 255)" }}>
              <Icon.info size={14} /> Modo local (sin nube)
            </div>
          ) : (
            <div className="user-foot">
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-soft)", fontWeight: 600, marginBottom: 8, minWidth: 0 }}>
                {auth.isAdmin ? <Icon.shield size={15} color="var(--gold-ink)" /> : <Icon.user size={15} />}
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{auth.profile.nombre || auth.profile.email}</span>
              </div>
              <button className="reset-btn" onClick={auth.signOut} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                <Icon.logout size={14} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="main">
        {data.error && (
          <div className="page" style={{ paddingBottom: 0 }}>
            <div className="err-box"><Icon.x size={15} /> Error de conexión: {data.error}</div>
          </div>
        )}
        {route === "dashboard" && <Dashboard cabanas={data.cabanas} reservas={data.reservas} />}
        {route === "registrar" && <ReservaForm cabanas={data.cabanas} reservas={data.reservas} onSave={data.addReserva} />}
        {route === "calendario" && <Calendario cabanas={data.cabanas} reservas={data.reservas} onDelete={data.deleteReserva} />}
        {route === "reservas" && <ReservasTable cabanas={data.cabanas} reservas={data.reservas} onUpdate={data.updateReserva} onDelete={data.deleteReserva} />}
        {route === "cabanas" && <Cabanas cabanas={data.cabanas} reservas={data.reservas} onAdd={data.addCabana} onUpdate={data.updateCabana} onDelete={data.deleteCabana} />}
        {route === "usuarios" && auth.isAdmin && <Usuarios />}
      </main>
    </div>
  );
}
