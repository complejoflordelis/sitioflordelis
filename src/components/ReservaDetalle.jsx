/* Flor de Lis — Detalle de reserva con gestiones (saldar saldo, distribución, etc.) */
import React from "react";
import * as FDL from "../lib/fdl";
import { Icon, CabanaTag, Badge, PaxMini } from "./ui";
import { waLink } from "../lib/whatsapp";

export function ReservaDetalle({ reserva, cabanas, onClose, onPatch, onDelete }) {
  const r = reserva;
  const cab = cabanas.find((x) => x.id === r.cabanaId) || null;
  const estado = FDL.estadoReserva(r);
  const total = FDL.importeTotal(r);
  const ant = Number(r.anticipo) || 0;
  const saldoPend = FDL.saldoPendiente(r);

  const [medio, setMedio] = React.useState(r.pagadoSaldoA || "Efectivo");
  const [destino, setDestino] = React.useState(r.saldoDestino || "Administración");
  const [fecha, setFecha] = React.useState(r.fechaPagoCliente || FDL.todayIso());
  const [pct, setPct] = React.useState(String(FDL.comisionPct(r)));

  const link = waLink(r, cab);
  const pctNum = Number(pct) || 0;
  const montoAdmin = Math.round(total * pctNum / 100);
  const montoProp = total - montoAdmin;

  function saldar() {
    onPatch(r.id, { saldoPagado: true, pagadoSaldoA: medio, saldoDestino: destino, fechaPagoCliente: fecha });
  }
  function revertir() { onPatch(r.id, { saldoPagado: false }); }
  function guardarPct() { onPatch(r.id, { comisionPct: pctNum }); }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ width: 470, maxHeight: "92vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <CabanaTag cabana={cab} />
          <button className="icon-btn" onClick={onClose}><Icon.x size={18} /></button>
        </div>
        <h3 className="modal-title" style={{ marginBottom: 8 }}>{r.nombre || "—"}</h3>
        <div style={{ marginBottom: 14 }}>
          <Badge tone={FDL.ESTADO_TONE[estado]}>{FDL.ESTADO_LABEL[estado]}</Badge>
        </div>

        <div className="modal-rows">
          <div><span><Icon.calendar size={15} /> Estadía</span><b>{FDL.fmtFecha(r.inicioEstadia)} → {FDL.fmtFecha(r.finEstadia)}</b></div>
          <div><span><Icon.clock size={15} /> Horarios</span><b>{r.horaInicio || "14:00"} / {r.horaFin || "10:00"}</b></div>
          <div><span><Icon.bed size={15} /> Noches</span><b>{FDL.noches(r)}</b></div>
          <div><span><Icon.users size={15} /> Personas</span><b><PaxMini adultos={r.adultos} menores={r.menores} /></b></div>
          <div><span><Icon.pin size={15} /> Origen</span><b>{r.ciudadOrigen || "—"}</b></div>
          <div><span><Icon.phone size={15} /> Celular</span><b>{r.celular || "—"}</b></div>
          <div><span><Icon.mail size={15} /> Email</span><b>{r.email || "—"}</b></div>
          <div><span><Icon.money size={15} /> Total</span><b>{FDL.fmtMoney(total)}</b></div>
          <div><span>Anticipo / seña</span><b>{ant > 0 ? FDL.fmtMoney(ant) + (r.pagadoDepositoA ? " · " + r.pagadoDepositoA : "") : "—"}</b></div>
          <div><span>Saldo pendiente</span><b style={{ color: saldoPend > 0 ? "oklch(0.55 0.12 40)" : "var(--ink)" }}>{FDL.fmtMoney(saldoPend)}</b></div>
        </div>

        {saldoPend > 0 ? (
          <div className="card" style={{ marginTop: 16, boxShadow: "none" }}>
            <div className="card-title" style={{ marginBottom: 14 }}><Icon.money size={16} /> Saldar saldo pendiente</div>
            <div style={{ marginBottom: 12 }}>
              <label className="lbl">Medio de pago</label>
              <div className="toggle2">
                <button type="button" className={medio === "Efectivo" ? "active" : ""} onClick={() => setMedio("Efectivo")}>Efectivo</button>
                <button type="button" className={medio === "Transferencia" ? "active" : ""} onClick={() => setMedio("Transferencia")}>Transferencia</button>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="lbl">¿A dónde va el cobro?</label>
              <div className="toggle2">
                <button type="button" className={destino === "Administración" ? "active" : ""} onClick={() => setDestino("Administración")}>Administración</button>
                <button type="button" className={destino === "Propietario" ? "active" : ""} onClick={() => setDestino("Propietario")}>Propietario</button>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="lbl">Fecha de cancelación del saldo</label>
              <input type="date" className="inp" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={saldar}>
              <Icon.check size={18} /> Registrar pago de {FDL.fmtMoney(saldoPend)}
            </button>
          </div>
        ) : estado === "saldado" ? (
          <div className="toast-ok" style={{ marginTop: 16, alignItems: "center" }}>
            <Icon.check size={16} /> Saldado{r.pagadoSaldoA ? " · " + r.pagadoSaldoA : ""}{r.saldoDestino ? " → " + r.saldoDestino : ""}{r.fechaPagoCliente ? " · " + FDL.fmtFecha(r.fechaPagoCliente) : ""}
            <button className="btn-soft" style={{ marginLeft: "auto", height: 30 }} onClick={revertir}>Revertir</button>
          </div>
        ) : null}

        <div className="card" style={{ marginTop: 16, boxShadow: "none" }}>
          <div className="card-title" style={{ marginBottom: 14 }}><Icon.wallet size={16} /> Distribución del importe</div>
          <div style={{ marginBottom: 12 }}>
            <label className="lbl">Comisión Administración (%)</label>
            <input className="inp" inputMode="numeric" value={pct}
              onChange={(e) => setPct(e.target.value.replace(/[^\d]/g, ""))} onBlur={guardarPct} />
          </div>
          <div className="calc-strip">
            <div><span>Administración ({pctNum}%)</span><b>{FDL.fmtMoney(montoAdmin)}</b></div>
            <div><span>Propietario ({Math.max(0, 100 - pctNum)}%)</span><b>{FDL.fmtMoney(montoProp)}</b></div>
            <div><span>Total</span><b>{FDL.fmtMoney(total)}</b></div>
          </div>
        </div>

        <div className="modal-actions" style={{ justifyContent: "space-between", marginTop: 18 }}>
          {link ? (
            <a className="btn-soft" href={link} target="_blank" rel="noreferrer"><Icon.whatsapp size={16} /> Recordatorio</a>
          ) : <span />}
          <button className="btn-danger-ghost" onClick={() => onDelete(r.id)}><Icon.trash size={16} /> Eliminar</button>
        </div>
      </div>
    </div>
  );
}
