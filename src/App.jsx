/* Flor de Lis — App shell + navegación + gate de autenticación */
import React from "react";
import * as FDL from "./lib/fdl";
import { isConfigured } from "./lib/supabaseClient";
import { useAuth } from "./auth/AuthProvider";
import { Login } from "./auth/Login";
import { useData } from "./data/useData";
import { BrandMark, Icon } from "./components/ui";
import { Inicio } from "./pages/Inicio";
import { Solicitudes } from "./pages/Solicitudes";
import { Dashboard } from "./pages/Dashboard";
import { ReservaForm } from "./pages/ReservaForm";
import { Calendario } from "./pages/Calendario";
import { ReservasTable } from "./pages/ReservasTable";
import { Cabanas } from "./pages/Cabanas";
import { Gastos } from "./pages/Gastos";
import { Rendicion } from "./pages/Rendicion";
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
  const [route, setRoute] = React.useState("inicio");
  const [menuOpen, setMenuOpen] = React.useState(false);
  function ir(k) { setRoute(k); setMenuOpen(false); }

  // Pre-cargar el formulario de reserva con los datos de una solicitud.
  const [prefill, setPrefill] = React.useState(null);
  function crearReservaDesde(s) {
    setPrefill({
      _id: s.id,
      nombre: [s.nombre, s.apellido].filter(Boolean).join(" "),
      celular: s.telefono || "",
      email: s.email || "",
      inicioEstadia: s.fecha_inicio || "",
      finEstadia: s.fecha_fin || "",
      adultos: s.adultos != null ? s.adultos : 2,
      menores: s.menores != null ? s.menores : 0,
      notas: (s.late_checkout ? "Cliente pidió late check-out. " : "") + (s.comentario || ""),
    });
    data.atenderSolicitud(s.id, "atendida");
    ir("registrar");
  }

  if (!auth.ready) return <Splash />;
  if (isConfigured && !auth.session) return <Login />;
  if (isConfigured && auth.session && !auth.isActive) return <Bloqueado onSalir={auth.signOut} />;
  if (data.loading) return <Splash texto="Cargando datos…" />;

  // El operador solo accede a estas secciones; el admin ve todo.
  const OPERADOR_ROUTES = ["inicio", "solicitudes", "registrar", "calendario", "gastos"];
  const allItems = [
    { k: "inicio", t: "Inicio", ico: "home" },
    { k: "solicitudes", t: "Solicitudes", ico: "mail" },
    { k: "dashboard", t: "Dashboard", ico: "dashboard" },
    { k: "registrar", t: "Registrar reserva", ico: "plus" },
    { k: "calendario", t: "Calendario", ico: "calendar" },
    { k: "reservas", t: "Reservas", ico: "table" },
    { k: "gastos", t: "Gastos", ico: "receipt" },
    { k: "rendicion", t: "Rendición", ico: "wallet" },
    { k: "cabanas", t: "Cabañas", ico: "cabin" },
    { k: "usuarios", t: "Usuarios", ico: "users" },
  ];
  const items = auth.isAdmin ? allItems : allItems.filter((it) => OPERADOR_ROUTES.includes(it.k));
  // Si el operador quedó en una ruta que no le corresponde, lo mandamos a Inicio.
  const vista = auth.isAdmin || OPERADOR_ROUTES.includes(route) ? route : "inicio";

  const pendientes = data.reservas.filter((r) => FDL.saldo(r) > 0).length;
  const solPendientes = data.solicitudes.filter((s) => s.estado !== "atendida").length;

  const tituloActual = (allItems.find((it) => it.k === vista) || {}).t || "Flor de Lis";

  return (
    <div className={"app" + (menuOpen ? " menu-open" : "")}>
      <header className="topbar">
        <button className="hamb" onClick={() => setMenuOpen(true)} aria-label="Abrir menú"><Icon.menu size={22} /></button>
        <span className="topbar-title">{tituloActual}</span>
        <button className="hamb" onClick={() => ir("registrar")} aria-label="Registrar reserva" style={{ marginLeft: "auto" }}><Icon.plus size={22} /></button>
        {!auth.isLocal && <button className="hamb" onClick={auth.signOut} aria-label="Cerrar sesión"><Icon.logout size={20} /></button>}
      </header>
      <div className="scrim" onClick={() => setMenuOpen(false)} />

      <aside className="sidebar">
        <div className="side-brand" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <BrandMark />
          <button className="hamb only-mobile" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"><Icon.x size={20} /></button>
        </div>
        <nav className="side-nav">
          {items.map((it) => {
            const I = Icon[it.ico];
            const active = vista === it.k;
            return (
              <button key={it.k} className={"nav-item" + (active ? " active" : "")} onClick={() => ir(it.k)}>
                <I size={19} /> <span>{it.t}</span>
                {it.k === "registrar" && <span className="nav-plus">+</span>}
                {it.k === "solicitudes" && solPendientes > 0 && <span className="nav-plus" style={{ background: "var(--gold)", color: "oklch(0.3 0.06 80)" }}>{solPendientes}</span>}
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
        {vista === "inicio" && <Inicio cabanas={data.cabanas} reservas={data.reservas} onPatch={data.patchReserva} onDelete={data.deleteReserva} />}
        {vista === "registrar" && <ReservaForm cabanas={data.cabanas} reservas={data.reservas} prefill={prefill} onPrefillConsumed={() => setPrefill(null)} onSave={(r) => data.addReserva({ ...r, creadoPor: (auth.profile && (auth.profile.nombre || auth.profile.email)) || "" })} />}
        {vista === "calendario" && <Calendario cabanas={data.cabanas} reservas={data.reservas} onDelete={data.deleteReserva} />}
        {vista === "solicitudes" && <Solicitudes solicitudes={data.solicitudes} onAtender={data.atenderSolicitud} onDelete={data.deleteSolicitud} onCrearReserva={crearReservaDesde} />}
        {vista === "dashboard" && auth.isAdmin && <Dashboard cabanas={data.cabanas} reservas={data.reservas} />}
        {vista === "reservas" && auth.isAdmin && <ReservasTable cabanas={data.cabanas} reservas={data.reservas} onUpdate={data.updateReserva} onDelete={data.deleteReserva} />}
        {vista === "cabanas" && auth.isAdmin && <Cabanas cabanas={data.cabanas} reservas={data.reservas} onAdd={data.addCabana} onUpdate={data.updateCabana} onDelete={data.deleteCabana} />}
        {vista === "gastos" && <Gastos cabanas={data.cabanas} gastos={data.gastos} onAdd={data.addGasto} onDelete={data.deleteGasto} uploadFactura={data.uploadFactura} facturaUrl={data.facturaUrl} />}
        {vista === "rendicion" && auth.isAdmin && <Rendicion reservas={data.reservas} cabanas={data.cabanas} onRendir={data.rendirAdministracion} />}
        {vista === "usuarios" && auth.isAdmin && <Usuarios />}
      </main>
    </div>
  );
}
