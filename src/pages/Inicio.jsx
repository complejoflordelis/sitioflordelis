/* Flor de Lis — Inicio: galería de reservas vigentes y próximas. */
import React from "react";
import * as FDL from "../lib/fdl";
import { Icon, CabanaTag, Badge, PaxMini } from "../components/ui";
import { ReservaDetalle } from "../components/ReservaDetalle";

function relativoIngreso(diasIni) {
  if (diasIni === 0) return "Ingresa hoy";
  if (diasIni === 1) return "Ingresa mañana";
  return "Ingresa en " + diasIni + " días";
}
function relativoEgreso(diasFin) {
  if (diasFin <= 0) return "Se va hoy";
  if (diasFin === 1) return "Se va mañana";
  return "Se va en " + diasFin + " días";
}

function ReservaCard({ r, cabanas, hoy, onOpen }) {
  const cab = cabanas.find((c) => c.id === r.cabanaId) || null;
  const estado = FDL.estadoReserva(r);
  const enCurso = FDL.estadiaEstado(r, hoy) === "curso";
  const saldoPend = FDL.saldoPendiente(r);
  const rel = enCurso ? relativoEgreso(FDL.diffDays(hoy, r.finEstadia)) : relativoIngreso(FDL.diffDays(hoy, r.inicioEstadia));
  return (
    <button className="card" onClick={() => onOpen(r)}
      style={{ textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 11, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <CabanaTag cabana={cab} size={12} />
        <Badge tone={FDL.ESTADO_TONE[estado]}>{FDL.ESTADO_LABEL[estado]}</Badge>
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)", lineHeight: 1.2 }}>
        {r.numero != null && <span style={{ color: "var(--ink-faint)", fontWeight: 800 }}>N°{r.numero} · </span>}{r.nombre || "—"}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--ink-soft)", fontSize: 13, fontWeight: 600 }}>
        <Icon.calendar size={14} /> {FDL.fmtFechaCorta(r.inicioEstadia)} → {FDL.fmtFechaCorta(r.finEstadia)} · {FDL.noches(r)}n
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <PaxMini adultos={r.adultos} menores={r.menores} />
        <span style={{ fontSize: 12, fontWeight: 600, color: enCurso ? "var(--brand-700)" : "var(--ink-faint)" }}>{rel}</span>
      </div>
      <div className="calc-strip" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 2 }}>
        <div><span>Total</span><b>{FDL.fmtMoney(FDL.importeTotal(r))}</b></div>
        <div><span>Saldo</span><b style={{ color: saldoPend > 0 ? "oklch(0.55 0.12 40)" : "oklch(0.45 0.1 150)" }}>{saldoPend > 0 ? FDL.fmtMoney(saldoPend) : "Saldado"}</b></div>
      </div>
    </button>
  );
}

function Galeria({ titulo, icono, reservas, cabanas, hoy, onOpen, vacio }) {
  const I = icono;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "0 0 14px" }}>
        <I size={18} color="var(--brand-600)" />
        <h2 style={{ fontFamily: "var(--sans)", fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>{titulo}</h2>
        <span style={{ fontSize: 13, color: "var(--ink-faint)", fontWeight: 600 }}>({reservas.length})</span>
      </div>
      {reservas.length === 0 ? (
        <div className="hint-box">{vacio}</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {reservas.map((r) => <ReservaCard key={r.id} r={r} cabanas={cabanas} hoy={hoy} onOpen={onOpen} />)}
        </div>
      )}
    </div>
  );
}

export function Inicio({ cabanas, reservas, onPatch, onDelete }) {
  const hoy = FDL.todayIso();
  const [sel, setSel] = React.useState(null);

  const vigentes = reservas.filter((r) => FDL.estadiaEstado(r, hoy) === "curso")
    .sort((a, b) => (a.finEstadia < b.finEstadia ? -1 : 1));
  const proximas = reservas.filter((r) => FDL.estadiaEstado(r, hoy) === "proxima")
    .sort((a, b) => (a.inicioEstadia < b.inicioEstadia ? -1 : 1));
  const checkinHoy = reservas.filter((r) => r.inicioEstadia === hoy);
  const checkoutHoy = reservas.filter((r) => r.finEstadia === hoy);

  // la reserva seleccionada, siempre tomada del estado más fresco
  const selReserva = sel ? reservas.find((r) => r.id === sel) : null;

  return (
    <div className="page wide">
      <div className="page-head">
        <div>
          <h1>Inicio</h1>
          <p className="sub">Reservas vigentes y próximas. Tocá una tarjeta para ver el detalle y gestionar el saldo.</p>
        </div>
      </div>

      {(checkinHoy.length > 0 || checkoutHoy.length > 0) && (
        <div className="tbl-info" style={{ marginBottom: 22 }}>
          <Icon.calendar size={15} />
          <span>
            <b>Hoy:</b> {checkinHoy.length} check-in{checkinHoy.length !== 1 ? "s" : ""}
            {checkinHoy.length > 0 && " (" + checkinHoy.map((r) => r.nombre).join(", ") + ")"}
            {" · "}{checkoutHoy.length} check-out{checkoutHoy.length !== 1 ? "s" : ""}
            {checkoutHoy.length > 0 && " (" + checkoutHoy.map((r) => r.nombre).join(", ") + ")"}
          </span>
        </div>
      )}

      <Galeria titulo="En curso (alojados hoy)" icono={Icon.bed} reservas={vigentes}
        cabanas={cabanas} hoy={hoy} onOpen={(r) => setSel(r.id)}
        vacio="No hay nadie alojado en este momento." />

      <Galeria titulo="Próximas" icono={Icon.calendar} reservas={proximas}
        cabanas={cabanas} hoy={hoy} onOpen={(r) => setSel(r.id)}
        vacio="No hay reservas próximas cargadas." />

      {selReserva && (
        <ReservaDetalle reserva={selReserva} cabanas={cabanas}
          onClose={() => setSel(null)}
          onPatch={onPatch}
          onDelete={(id) => { onDelete(id); setSel(null); }} />
      )}
    </div>
  );
}
