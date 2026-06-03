/* Flor de Lis — Calendario mensual de ocupaciones */
import React from "react";
import * as FDL from "../lib/fdl";
import { Icon, CabanaTag, PaxMini } from "../components/ui";
import { buildMonthGrid } from "../components/RangePicker";
import { waLink } from "../lib/whatsapp";

export function Calendario(props) {
  const cabanas = props.cabanas, reservas = props.reservas;
  const now = new Date();
  const [view, setView] = React.useState({ y: now.getFullYear(), m: now.getMonth() });
  const [detalle, setDetalle] = React.useState(null);
  const [ocultas, setOcultas] = React.useState({});

  function nav(d) { let m = view.m + d, y = view.y; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } setView({ y, m }); }
  function toggleCab(id) { setOcultas((p) => { const n = Object.assign({}, p); n[id] = !n[id]; return n; }); }

  const grid = buildMonthGrid(view.y, view.m);
  const weeks = [];
  for (let i = 0; i < grid.length; i += 7) weeks.push(grid.slice(i, i + 7));
  const hoyIso = FDL.todayIso();

  const laneOf = {};
  cabanas.forEach((c, i) => { laneOf[c.id] = i; });
  const laneCount = cabanas.length;

  function reservasDeSemana(weekStartIso) {
    const weekEndExcl = FDL.addDaysIso(weekStartIso, 7);
    const segs = [];
    reservas.forEach((r) => {
      if (ocultas[r.cabanaId]) return;
      const segStart = r.inicioEstadia > weekStartIso ? r.inicioEstadia : weekStartIso;
      const segEndExcl = r.finEstadia < weekEndExcl ? r.finEstadia : weekEndExcl;
      if (segStart >= segEndExcl) return;
      segs.push({
        r,
        colStart: FDL.diffDays(weekStartIso, segStart),
        span: FDL.diffDays(segStart, segEndExcl),
        contL: r.inicioEstadia < weekStartIso,
        contR: r.finEstadia > weekEndExcl,
        lane: laneOf[r.cabanaId],
      });
    });
    return segs;
  }

  const laneH = 26, headH = 26, cellPad = 6;
  const cellMinH = headH + laneCount * (laneH + 3) + cellPad * 2;

  const resMes = reservas.filter((r) => {
    const d = FDL.parseIso(r.inicioEstadia);
    return d && d.getFullYear() === view.y && d.getMonth() === view.m;
  });
  const paxMes = resMes.reduce((a, r) => a + FDL.pax(r), 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Calendario de ocupación</h1>
          <p className="sub">Vista mensual de las reservas por cabaña. Tocá una franja para ver el detalle.</p>
        </div>
        <div className="cal-toolbar">
          <button className="cal-nav lg" onClick={() => nav(-1)}><Icon.chevL size={18} /></button>
          <div className="cal-month">{FDL.MESES[view.m]} <span>{view.y}</span></div>
          <button className="cal-nav lg" onClick={() => nav(1)}><Icon.chevR size={18} /></button>
          <button className="btn-soft" onClick={() => setView({ y: now.getFullYear(), m: now.getMonth() })}>Hoy</button>
        </div>
      </div>

      <div className="cal-legend">
        {cabanas.map((c) => {
          const col = FDL.CABANA_COLORS[c.color];
          const off = ocultas[c.id];
          return (
            <button key={c.id} className={"leg-item" + (off ? " off" : "")} onClick={() => toggleCab(c.id)}>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: off ? "var(--line-strong)" : col.strong }}></span>
              {c.nombre}
              <span className="leg-max">máx {c.maxPersonas}</span>
            </button>
          );
        })}
        <div className="cal-summary">
          <span><b>{resMes.length}</b> reservas</span>
          <span><b>{paxMes}</b> personas</span>
        </div>
      </div>

      <div className="cal-grid-head">
        {FDL.DIAS.map((d) => <div key={d}>{d}</div>)}
      </div>

      <div className="cal-weeks">
        {weeks.map((wk, wi) => {
          const weekStart = wk[0].iso;
          const segs = reservasDeSemana(weekStart);
          return (
            <div className="cal-week" key={wi} style={{ minHeight: cellMinH }}>
              <div className="cal-week-bg">
                {wk.map((c) => {
                  const isToday = c.iso === hoyIso;
                  return (
                    <div key={c.iso} className={"cal-cell" + (c.inMonth ? "" : " out") + (isToday ? " today" : "")}>
                      <span className="cal-daynum">{c.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="cal-bars" style={{ top: headH }}>
                {segs.map((s) => {
                  const c = cabanas.find((x) => x.id === s.r.cabanaId);
                  const col = FDL.CABANA_COLORS[c.color];
                  const leftPct = (s.colStart / 7) * 100;
                  const widPct = (s.span / 7) * 100;
                  return (
                    <button key={s.r.id} className="cal-bar"
                      onClick={() => setDetalle(s.r)}
                      style={{
                        left: "calc(" + leftPct + "% + 3px)",
                        width: "calc(" + widPct + "% - 6px)",
                        top: s.lane * (laneH + 3),
                        height: laneH,
                        background: col.soft,
                        borderColor: col.mid,
                        color: col.ink,
                        borderTopLeftRadius: s.contL ? 0 : 7, borderBottomLeftRadius: s.contL ? 0 : 7,
                        borderTopRightRadius: s.contR ? 0 : 7, borderBottomRightRadius: s.contR ? 0 : 7,
                        borderLeftWidth: s.contL ? 0 : 1, borderRightWidth: s.contR ? 0 : 1,
                      }}>
                      <span className="cal-bar-dot" style={{ background: col.strong }}></span>
                      <span className="cal-bar-name">{s.r.nombre}</span>
                      <span className="cal-bar-pax">
                        <Icon.user size={12} w={2} />{s.r.adultos}
                        {s.r.menores > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 1, marginLeft: 4 }}><Icon.child size={11} w={2} />{s.r.menores}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {detalle && (
        <DetalleReserva reserva={detalle} cabanas={cabanas}
          onClose={() => setDetalle(null)}
          onDelete={() => { props.onDelete(detalle.id); setDetalle(null); }} />
      )}
    </div>
  );
}

export function DetalleReserva(props) {
  const r = props.reserva;
  const c = props.cabanas.find((x) => x.id === r.cabanaId);
  const wa = waLink(r, c);
  return (
    <div className="modal-bg" onClick={props.onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <CabanaTag cabana={c} />
          <button className="icon-btn" onClick={props.onClose}><Icon.x size={18} /></button>
        </div>
        <h3 className="modal-title">{r.nombre}</h3>
        <div className="modal-rows">
          <div><span><Icon.calendar size={15} /> Estadía</span><b>{FDL.fmtFecha(r.inicioEstadia)} → {FDL.fmtFecha(r.finEstadia)}</b></div>
          <div><span><Icon.clock size={15} /> Horarios</span><b>{r.horaInicio} / {r.horaFin}</b></div>
          <div><span><Icon.bed size={15} /> Noches</span><b>{FDL.noches(r)}</b></div>
          <div><span><Icon.users size={15} /> Personas</span><b><PaxMini adultos={r.adultos} menores={r.menores} /></b></div>
          <div><span><Icon.pin size={15} /> Origen</span><b>{r.ciudadOrigen || "—"}</b></div>
          <div><span><Icon.phone size={15} /> Celular</span><b>{r.celular || "—"}</b></div>
          <div><span><Icon.money size={15} /> Total</span><b>{FDL.fmtMoney(FDL.importeTotal(r))}</b></div>
          <div><span>Saldo pendiente</span><b>{FDL.fmtMoney(FDL.saldo(r))}</b></div>
        </div>
        <div className="modal-actions" style={{ justifyContent: "space-between" }}>
          {wa
            ? <a className="btn-soft" href={wa} target="_blank" rel="noreferrer"><Icon.whatsapp size={16} /> WhatsApp</a>
            : <span />}
          <button className="btn-danger-ghost" onClick={props.onDelete}><Icon.trash size={16} /> Eliminar</button>
        </div>
      </div>
    </div>
  );
}
