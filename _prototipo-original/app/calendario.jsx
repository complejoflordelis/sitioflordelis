/* Flor de Lis — Calendario mensual de ocupaciones */

function Calendario(props) {
  var cabanas = props.cabanas, reservas = props.reservas;
  var now = new Date();
  var st = React.useState({ y: now.getFullYear(), m: now.getMonth() });
  var view = st[0], setView = st[1];
  var sel = React.useState(null);
  var detalle = sel[0], setDetalle = sel[1];
  var filt = React.useState({});
  var ocultas = filt[0], setOcultas = filt[1];

  function nav(d) { var m = view.m + d, y = view.y; if (m < 0){m=11;y--;} if (m>11){m=0;y++;} setView({ y: y, m: m }); }
  function toggleCab(id) { setOcultas(function(p){ var n = Object.assign({}, p); n[id] = !n[id]; return n; }); }

  var grid = buildMonthGrid(view.y, view.m);
  var weeks = [];
  for (var i = 0; i < grid.length; i += 7) weeks.push(grid.slice(i, i + 7));
  var hoyIso = FDL.todayIso();

  var laneOf = {};
  cabanas.forEach(function (c, i) { laneOf[c.id] = i; });
  var laneCount = cabanas.length;

  function reservasDeSemana(weekStartIso) {
    var weekEndExcl = FDL.addDaysIso(weekStartIso, 7);
    var segs = [];
    reservas.forEach(function (r) {
      if (ocultas[r.cabanaId]) return;
      var segStart = r.inicioEstadia > weekStartIso ? r.inicioEstadia : weekStartIso;
      var segEndExcl = r.finEstadia < weekEndExcl ? r.finEstadia : weekEndExcl;
      if (segStart >= segEndExcl) return;
      segs.push({
        r: r,
        colStart: FDL.diffDays(weekStartIso, segStart),
        span: FDL.diffDays(segStart, segEndExcl),
        contL: r.inicioEstadia < weekStartIso,
        contR: r.finEstadia > weekEndExcl,
        lane: laneOf[r.cabanaId]
      });
    });
    return segs;
  }

  var laneH = 26, headH = 26, cellPad = 6;
  var cellMinH = headH + laneCount * (laneH + 3) + cellPad * 2;

  // resumen del mes
  var resMes = reservas.filter(function (r) {
    var d = FDL.parseIso(r.inicioEstadia);
    return d && d.getFullYear() === view.y && d.getMonth() === view.m;
  });
  var paxMes = resMes.reduce(function (a, r) { return a + FDL.pax(r); }, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Calendario de ocupación</h1>
          <p className="sub">Vista mensual de las reservas por cabaña. Tocá una franja para ver el detalle.</p>
        </div>
        <div className="cal-toolbar">
          <button className="cal-nav lg" onClick={function(){ nav(-1); }}><Icon.chevL size={18} /></button>
          <div className="cal-month">{FDL.MESES[view.m]} <span>{view.y}</span></div>
          <button className="cal-nav lg" onClick={function(){ nav(1); }}><Icon.chevR size={18} /></button>
          <button className="btn-soft" onClick={function(){ setView({ y: now.getFullYear(), m: now.getMonth() }); }}>Hoy</button>
        </div>
      </div>

      <div className="cal-legend">
        {cabanas.map(function (c) {
          var col = FDL.CABANA_COLORS[c.color];
          var off = ocultas[c.id];
          return (
            <button key={c.id} className={"leg-item" + (off ? " off" : "")} onClick={function(){ toggleCab(c.id); }}>
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
        {FDL.DIAS.map(function (d) { return <div key={d}>{d}</div>; })}
      </div>

      <div className="cal-weeks">
        {weeks.map(function (wk, wi) {
          var weekStart = wk[0].iso;
          var segs = reservasDeSemana(weekStart);
          return (
            <div className="cal-week" key={wi} style={{ minHeight: cellMinH }}>
              {/* fondo: 7 celdas */}
              <div className="cal-week-bg">
                {wk.map(function (c) {
                  var isToday = c.iso === hoyIso;
                  return (
                    <div key={c.iso} className={"cal-cell" + (c.inMonth ? "" : " out") + (isToday ? " today" : "")}>
                      <span className="cal-daynum">{c.day}</span>
                    </div>
                  );
                })}
              </div>
              {/* barras de reservas */}
              <div className="cal-bars" style={{ top: headH }}>
                {segs.map(function (s) {
                  var c = cabanas.find(function (x){ return x.id === s.r.cabanaId; });
                  var col = FDL.CABANA_COLORS[c.color];
                  var leftPct = (s.colStart / 7) * 100;
                  var widPct = (s.span / 7) * 100;
                  return (
                    <button key={s.r.id} className="cal-bar"
                      onClick={function(){ setDetalle(s.r); }}
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
                        borderLeftWidth: s.contL ? 0 : 1, borderRightWidth: s.contR ? 0 : 1
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
          onClose={function(){ setDetalle(null); }}
          onDelete={function(){ props.onDelete(detalle.id); setDetalle(null); }} />
      )}
    </div>
  );
}

function DetalleReserva(props) {
  var r = props.reserva;
  var c = props.cabanas.find(function (x){ return x.id === r.cabanaId; });
  return (
    <div className="modal-bg" onClick={props.onClose}>
      <div className="modal" onClick={function(e){ e.stopPropagation(); }}>
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
        <div className="modal-actions">
          <button className="btn-danger-ghost" onClick={props.onDelete}><Icon.trash size={16} /> Eliminar</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Calendario: Calendario, DetalleReserva: DetalleReserva });
