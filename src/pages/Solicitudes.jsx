/* Flor de Lis — Solicitudes de reserva (llegan desde la página pública). */
import React from "react";
import * as FDL from "../lib/fdl";
import { Icon, Badge } from "../components/ui";
import { normalizarCel } from "../lib/whatsapp";

function waCliente(s) {
  const num = normalizarCel(s.telefono);
  if (!num) return null;
  const noches = FDL.diffDays(s.fecha_inicio, s.fecha_fin);
  const msg = "¡Hola " + (s.nombre || "") + "! 🌿 Te escribimos del Complejo Flor de Lis por tu solicitud de reserva del " +
    FDL.fmtFecha(s.fecha_inicio) + " al " + FDL.fmtFecha(s.fecha_fin) + " (" + noches + " noches).";
  return "https://wa.me/" + num + "?text=" + encodeURIComponent(msg);
}

function Tarjeta({ s, onAtender, onDelete }) {
  const noches = s.fecha_inicio && s.fecha_fin ? FDL.diffDays(s.fecha_inicio, s.fecha_fin) : 0;
  const atendida = s.estado === "atendida";
  const wa = waCliente(s);
  const cuando = s.created_at ? new Date(s.created_at).toLocaleDateString("es-AR") : "";
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 11, padding: 18, borderLeft: "3px solid " + (atendida ? "var(--line-strong)" : "var(--gold)") }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        {atendida ? <Badge tone="ok">Atendida</Badge> : <Badge tone="gold">Pendiente</Badge>}
        <span style={{ fontSize: 11.5, color: "var(--ink-faint)", fontWeight: 600 }}>{cuando}</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>{[s.nombre, s.apellido].filter(Boolean).join(" ") || "—"}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--ink-soft)", fontWeight: 600, flexWrap: "wrap" }}>
        <Icon.calendar size={14} /> {FDL.fmtFechaCorta(s.fecha_inicio)} → {FDL.fmtFechaCorta(s.fecha_fin)} · {noches}n
        {s.late_checkin && <Badge tone="warn"><Icon.clock size={11} /> Late check-in</Badge>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--ink-soft)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}><Icon.phone size={14} /> {s.telefono || "—"}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 7, overflow: "hidden", textOverflow: "ellipsis" }}><Icon.mail size={14} /> {s.email || "—"}</span>
      </div>
      {s.comentario && <div style={{ fontSize: 13, color: "var(--ink-soft)", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 10, padding: "8px 11px" }}>“{s.comentario}”</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
        {wa && <a className="btn-soft" href={wa} target="_blank" rel="noreferrer" style={{ height: 36 }}><Icon.whatsapp size={15} /> Contactar</a>}
        <button className="btn-soft" style={{ height: 36 }} onClick={() => onAtender(s.id, atendida ? "pendiente" : "atendida")}>
          {atendida ? "Reabrir" : <><Icon.check size={15} /> Marcar atendida</>}
        </button>
        <button className="row-del" title="Eliminar" style={{ marginLeft: "auto" }} onClick={() => { if (confirm("¿Eliminar esta solicitud?")) onDelete(s.id); }}><Icon.trash size={15} /></button>
      </div>
    </div>
  );
}

export function Solicitudes({ solicitudes, onAtender, onDelete }) {
  const [verTodas, setVerTodas] = React.useState(false);
  const pendientes = solicitudes.filter((s) => s.estado !== "atendida");
  const lista = verTodas ? solicitudes : pendientes;
  return (
    <div className="page wide">
      <div className="page-head">
        <div>
          <h1>Solicitudes</h1>
          <p className="sub">Pedidos de reserva que llegan desde la página pública. {pendientes.length > 0 && <b>{pendientes.length} pendiente{pendientes.length > 1 ? "s" : ""}.</b>}</p>
        </div>
        <button className="btn-soft" onClick={() => setVerTodas((v) => !v)}>{verTodas ? "Ver solo pendientes" : "Ver todas"}</button>
      </div>
      {lista.length === 0 ? (
        <div className="hint-box" style={{ maxWidth: 520 }}>No hay solicitudes {verTodas ? "todavía" : "pendientes"}. 🌿</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {lista.map((s) => <Tarjeta key={s.id} s={s} onAtender={onAtender} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}
