/* Flor de Lis — Calendario mensual de ocupaciones */

function Calendario(props) {
  var cabanas = props.cabanas,reservas = props.reservas;
  var now = new Date();
  var st = React.useState({ y: now.getFullYear(), m: now.getMonth() });
  var view = st[0],setView = st[1];
  var sel = React.useState(null);
  var detalle = sel[0],setDetalle = sel[1];
  var filt = React.useState({});
  var ocultas = filt[0],setOcultas = filt[1];

  function nav(d) {var m = view.m + d,y = view.y;if (m < 0) {m = 11;y--;}if (m > 11) {m = 0;y++;}setView({ y: y, m: m });}
  function toggleCab(id) {setOcultas(function (p) {var n = Object.assign({}, p);n[id] = !n[id];return n;});}

  var grid = buildMonthGrid(view.y, view.m);
  var weeks = [];
  for (var i = 0; i < grid.length; i += 7) weeks.push(grid.slice(i, i + 7));
  var hoyIso = FDL.todayIso();

  var laneOf = {};
  cabanas.forEach(function (c, i) {laneOf[c.id] = i;});
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

  var laneH = 26,headH = 26,cellPad = 6;
  var cellMinH = headH + laneCount * (laneH + 3) + cellPad * 2;

  // resumen del mes
  var resMes = reservas.filter(function (r) {
    var d = FDL.parseIso(r.inicioEstadia);
    return d && d.getFullYear() === view.y && d.getMonth() === view.m;
  });
  var paxMes = resMes.reduce(function (a, r) {return a + FDL.pax(r);}, 0);

  return (/*#__PURE__*/
    React.createElement("div", { className: "page" }, /*#__PURE__*/
    React.createElement("div", { className: "page-head" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h1", null, "Calendario de ocupaci\xF3n"), /*#__PURE__*/
    React.createElement("p", { className: "sub" }, "Vista mensual de las reservas por caba\xF1a. Toc\xE1 una franja para ver el detalle.")
    ), /*#__PURE__*/
    React.createElement("div", { className: "cal-toolbar" }, /*#__PURE__*/
    React.createElement("button", { className: "cal-nav lg", onClick: function () {nav(-1);} }, /*#__PURE__*/React.createElement(Icon.chevL, { size: 18 })), /*#__PURE__*/
    React.createElement("div", { className: "cal-month" }, FDL.MESES[view.m], " ", /*#__PURE__*/React.createElement("span", null, view.y)), /*#__PURE__*/
    React.createElement("button", { className: "cal-nav lg", onClick: function () {nav(1);} }, /*#__PURE__*/React.createElement(Icon.chevR, { size: 18 })), /*#__PURE__*/
    React.createElement("button", { className: "btn-soft", onClick: function () {setView({ y: now.getFullYear(), m: now.getMonth() });} }, "Hoy")
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "cal-legend" },
    cabanas.map(function (c) {
      var col = FDL.CABANA_COLORS[c.color];
      var off = ocultas[c.id];
      return (/*#__PURE__*/
        React.createElement("button", { key: c.id, className: "leg-item" + (off ? " off" : ""), onClick: function () {toggleCab(c.id);} }, /*#__PURE__*/
        React.createElement("span", { style: { width: 12, height: 12, borderRadius: 4, background: off ? "var(--line-strong)" : col.strong } }),
        c.nombre, /*#__PURE__*/
        React.createElement("span", { className: "leg-max" }, "m\xE1x ", c.maxPersonas)
        ));

    }), /*#__PURE__*/
    React.createElement("div", { className: "cal-summary" }, /*#__PURE__*/
    React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, resMes.length), " reservas"), /*#__PURE__*/
    React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, paxMes), " personas")
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "cal-grid-head" },
    FDL.DIAS.map(function (d) {return /*#__PURE__*/React.createElement("div", { key: d }, d);})
    ), /*#__PURE__*/

    React.createElement("div", { className: "cal-weeks" },
    weeks.map(function (wk, wi) {
      var weekStart = wk[0].iso;
      var segs = reservasDeSemana(weekStart);
      return (/*#__PURE__*/
        React.createElement("div", { className: "cal-week", key: wi, style: { minHeight: cellMinH } }, /*#__PURE__*/

        React.createElement("div", { className: "cal-week-bg" },
        wk.map(function (c) {
          var isToday = c.iso === hoyIso;
          return (/*#__PURE__*/
            React.createElement("div", { key: c.iso, className: "cal-cell" + (c.inMonth ? "" : " out") + (isToday ? " today" : "") }, /*#__PURE__*/
            React.createElement("span", { className: "cal-daynum" }, c.day)
            ));

        })
        ), /*#__PURE__*/

        React.createElement("div", { className: "cal-bars", style: { top: headH } },
        segs.map(function (s) {
          var c = cabanas.find(function (x) {return x.id === s.r.cabanaId;});
          var col = FDL.CABANA_COLORS[c.color];
          var leftPct = s.colStart / 7 * 100;
          var widPct = s.span / 7 * 100;
          return (/*#__PURE__*/
            React.createElement("button", { key: s.r.id, className: "cal-bar",
              onClick: function () {setDetalle(s.r);},
              style: {
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
              } }, /*#__PURE__*/
            React.createElement("span", { className: "cal-bar-dot", style: { background: col.strong } }), /*#__PURE__*/
            React.createElement("span", { className: "cal-bar-name" }, s.r.nombre), /*#__PURE__*/
            React.createElement("span", { className: "cal-bar-pax" }, /*#__PURE__*/
            React.createElement(Icon.user, { size: 12, w: 2 }), s.r.adultos,
            s.r.menores > 0 && /*#__PURE__*/React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 1, marginLeft: 4 } }, /*#__PURE__*/React.createElement(Icon.child, { size: 11, w: 2 }), s.r.menores)
            )
            ));

        })
        )
        ));

    })
    ),

    detalle && /*#__PURE__*/
    React.createElement(DetalleReserva, { reserva: detalle, cabanas: cabanas,
      onClose: function () {setDetalle(null);},
      onDelete: function () {props.onDelete(detalle.id);setDetalle(null);} })

    ));

}

function DetalleReserva(props) {
  var r = props.reserva;
  var c = props.cabanas.find(function (x) {return x.id === r.cabanaId;});
  return (/*#__PURE__*/
    React.createElement("div", { className: "modal-bg", onClick: props.onClose }, /*#__PURE__*/
    React.createElement("div", { className: "modal", onClick: function (e) {e.stopPropagation();} }, /*#__PURE__*/
    React.createElement("div", { className: "modal-head" }, /*#__PURE__*/
    React.createElement(CabanaTag, { cabana: c }), /*#__PURE__*/
    React.createElement("button", { className: "icon-btn", onClick: props.onClose }, /*#__PURE__*/React.createElement(Icon.x, { size: 18 }))
    ), /*#__PURE__*/
    React.createElement("h3", { className: "modal-title" }, r.nombre), /*#__PURE__*/
    React.createElement("div", { className: "modal-rows" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon.calendar, { size: 15 }), " Estad\xEDa"), /*#__PURE__*/React.createElement("b", null, FDL.fmtFecha(r.inicioEstadia), " \u2192 ", FDL.fmtFecha(r.finEstadia))), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon.clock, { size: 15 }), " Horarios"), /*#__PURE__*/React.createElement("b", null, r.horaInicio, " / ", r.horaFin)), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon.bed, { size: 15 }), " Noches"), /*#__PURE__*/React.createElement("b", null, FDL.noches(r))), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon.users, { size: 15 }), " Personas"), /*#__PURE__*/React.createElement("b", null, /*#__PURE__*/React.createElement(PaxMini, { adultos: r.adultos, menores: r.menores }))), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon.pin, { size: 15 }), " Origen"), /*#__PURE__*/React.createElement("b", null, r.ciudadOrigen || "—")), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon.phone, { size: 15 }), " Celular"), /*#__PURE__*/React.createElement("b", null, r.celular || "—")), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon.money, { size: 15 }), " Total"), /*#__PURE__*/React.createElement("b", null, FDL.fmtMoney(FDL.importeTotal(r)))), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Saldo pendiente"), /*#__PURE__*/React.createElement("b", null, FDL.fmtMoney(FDL.saldo(r))))
    ), /*#__PURE__*/
    React.createElement("div", { className: "modal-actions" }, /*#__PURE__*/
    React.createElement("button", { className: "btn-danger-ghost", onClick: props.onDelete }, /*#__PURE__*/React.createElement(Icon.trash, { size: 16 }), " Eliminar")
    )
    )
    ));

}

Object.assign(window, { Calendario: Calendario, DetalleReserva: DetalleReserva });