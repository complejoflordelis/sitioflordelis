/* Flor de Lis — Rendición a Administración: comisión acumulada para transferir. */
import React from "react";
import * as FDL from "../lib/fdl";
import { Icon } from "../components/ui";

export function Rendicion({ reservas, cabanas, onRendir }) {
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState(null);

  const pendientes = reservas
    .filter((r) => !r.fechaRendicion && FDL.montoAdministracion(r) > 0)
    .sort((a, b) => (a.inicioEstadia < b.inicioEstadia ? -1 : 1));
  const totalPendiente = pendientes.reduce((a, r) => a + FDL.montoAdministracion(r), 0);

  // Historial: reservas ya rendidas, agrupadas por fecha de rendición.
  const porFecha = {};
  reservas.forEach((r) => {
    if (!r.fechaRendicion || FDL.montoAdministracion(r) <= 0) return;
    const k = r.fechaRendicion;
    if (!porFecha[k]) porFecha[k] = { fecha: k, total: 0, count: 0 };
    porFecha[k].total += FDL.montoAdministracion(r);
    porFecha[k].count++;
  });
  const historial = Object.keys(porFecha).map((k) => porFecha[k]).sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const totalRendidoHistorico = historial.reduce((a, h) => a + h.total, 0);

  async function rendir() {
    if (pendientes.length === 0) return;
    if (!window.confirm(
      "Vas a registrar la rendición de " + FDL.fmtMoney(totalPendiente) + " (" + pendientes.length + " reserva(s)).\n\n" +
      "Confirmá que ya transferiste ese monto a la cuenta de Administración. Las reservas quedarán con fecha de rendición de hoy y su saldo a Administración pasará a $0."
    )) return;
    setBusy(true);
    const res = await onRendir(FDL.todayIso());
    setBusy(false);
    setMsg("Rendición registrada: " + FDL.fmtMoney(res.total) + " · " + res.count + " reserva(s).");
    setTimeout(() => setMsg(null), 6000);
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Rendición a Administración</h1>
          <p className="sub">Comisión acumulada de las reservas, lista para transferir a la cuenta de Administración.</p>
        </div>
      </div>

      {msg && <div className="toast-ok" style={{ marginBottom: 18 }}><Icon.check size={16} /> {msg}</div>}

      <div className="card" style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div className="ind-lbl">Pendiente de rendir</div>
            <div style={{ fontFamily: "var(--sans)", fontSize: 38, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1, marginTop: 4 }}>{FDL.fmtMoney(totalPendiente)}</div>
            <div className="muted" style={{ marginTop: 4 }}>{pendientes.length} reserva(s) con comisión sin rendir</div>
          </div>
          <button className="btn-primary" disabled={busy || pendientes.length === 0} onClick={rendir} style={{ height: 54, fontSize: 16, padding: "0 28px" }}>
            <Icon.wallet size={20} /> {busy ? "Registrando…" : "Registrar rendición"}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <div className="card-title"><Icon.table size={18} /> Detalle pendiente</div>
        {pendientes.length === 0 ? (
          <div className="hint-box">No hay comisión pendiente de rendir. 🎉</div>
        ) : (
          <div className="modal-rows">
            {pendientes.map((r) => {
              const c = cabanas.find((x) => x.id === r.cabanaId) || {};
              return (
                <div key={r.id} style={{ alignItems: "center" }}>
                  <span style={{ flexDirection: "column", alignItems: "flex-start", gap: 3 }}>
                    <b style={{ color: "var(--ink)" }}>{r.nombre || "—"}</b>
                    <span style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 500 }}>
                      {(c.nombre || "—") + " · " + FDL.fmtFechaCorta(r.inicioEstadia) + " · comisión " + FDL.comisionPct(r) + "% de " + FDL.fmtMoney(FDL.importeTotal(r))}
                    </span>
                  </span>
                  <b style={{ fontVariantNumeric: "tabular-nums" }}>{FDL.fmtMoney(FDL.montoAdministracion(r))}</b>
                </div>
              );
            })}
            <div style={{ alignItems: "center", borderTop: "2px solid var(--line-strong)" }}>
              <span style={{ fontWeight: 700, color: "var(--ink)" }}>Total a rendir</span>
              <b style={{ fontSize: 16, color: "var(--brand-800)" }}>{FDL.fmtMoney(totalPendiente)}</b>
            </div>
          </div>
        )}
      </div>

      {historial.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ justifyContent: "space-between" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}><Icon.check size={18} /> Rendiciones anteriores</span>
            <span className="card-tag">Total histórico: {FDL.fmtMoney(totalRendidoHistorico)}</span>
          </div>
          <div className="modal-rows">
            {historial.map((h) => (
              <div key={h.fecha} style={{ alignItems: "center" }}>
                <span><Icon.calendar size={15} /> {FDL.fmtFecha(h.fecha)} · {h.count} reserva(s)</span>
                <b style={{ fontVariantNumeric: "tabular-nums" }}>{FDL.fmtMoney(h.total)}</b>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
