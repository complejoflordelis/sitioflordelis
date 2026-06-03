/* Flor de Lis — Dashboard de tendencias */

function rangePreset(preset, custom) {
  var now = new Date();
  var y = now.getFullYear(),m = now.getMonth();
  function r(a, b) {return { desde: FDL.iso(a), hasta: FDL.iso(b) };}
  if (preset === "mes") return r(new Date(y, m, 1), new Date(y, m + 1, 0));
  if (preset === "mesAnt") return r(new Date(y, m - 1, 1), new Date(y, m, 0));
  if (preset === "anio") return r(new Date(y, 0, 1), new Date(y, 11, 31));
  if (preset === "anioAnt") return r(new Date(y - 1, 0, 1), new Date(y - 1, 11, 31));
  if (preset === "custom") return { desde: custom.desde, hasta: custom.hasta };
  return { desde: "0000-01-01", hasta: "9999-12-31" }; // histórico
}
function prevRange(preset, custom) {
  var now = new Date();
  var y = now.getFullYear(),m = now.getMonth();
  function r(a, b) {return { desde: FDL.iso(a), hasta: FDL.iso(b) };}
  if (preset === "mes") return r(new Date(y, m - 1, 1), new Date(y, m, 0));
  if (preset === "mesAnt") return r(new Date(y, m - 2, 1), new Date(y, m - 1, 0));
  if (preset === "anio") return r(new Date(y - 1, 0, 1), new Date(y - 1, 11, 31));
  if (preset === "anioAnt") return r(new Date(y - 2, 0, 1), new Date(y - 2, 11, 31));
  if (preset === "custom" && custom.desde && custom.hasta) {
    var len = FDL.diffDays(custom.desde, custom.hasta);
    return r(FDL.parseIso(FDL.addDaysIso(custom.desde, -len - 1)), FDL.parseIso(FDL.addDaysIso(custom.desde, -1)));
  }
  return null;
}

function computeStats(reservas, range) {
  var sub = reservas.filter(function (r) {
    return r.inicioEstadia >= range.desde && r.inicioEstadia <= range.hasta;
  });
  var s = { reservas: sub.length, importe: 0, pax: 0, noches: 0, pendiente: 0, list: sub };
  sub.forEach(function (r) {
    s.importe += FDL.importeTotal(r);s.pax += FDL.pax(r);
    s.noches += FDL.noches(r);s.pendiente += FDL.saldo(r);
  });
  return s;
}

function pctDelta(cur, prev) {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Math.round((cur - prev) / prev * 100);
}

function Dashboard(props) {
  var cabanas = props.cabanas,reservas = props.reservas;
  var hoyIso = FDL.todayIso();

  var per = React.useState({ preset: "anio" });
  var period = per[0],setPeriod = per[1];
  var cst = React.useState(function () {
    var n = new Date();
    return { desde: FDL.iso(new Date(n.getFullYear(), n.getMonth(), 1)), hasta: FDL.todayIso() };
  });
  var custom = cst[0],setCustom = cst[1];

  var range = rangePreset(period.preset, custom);
  var prev = prevRange(period.preset, custom);

  var cur = React.useMemo(function () {return computeStats(reservas, range);}, [reservas, range.desde, range.hasta]);
  var pre = React.useMemo(function () {return prev ? computeStats(reservas, prev) : null;}, [reservas, prev && prev.desde, prev && prev.hasta]);

  // indicadores rápidos (siempre visibles, independientes del filtro)
  var ind = React.useMemo(function () {
    return {
      mes: computeStats(reservas, rangePreset("mes")),
      mesAnt: computeStats(reservas, rangePreset("mesAnt")),
      anio: computeStats(reservas, rangePreset("anio")),
      anioAnt: computeStats(reservas, rangePreset("anioAnt"))
    };
  }, [reservas]);

  // detalle por cabaña / ciudad / meses sobre el set filtrado
  var detalle = React.useMemo(function () {
    var sub = cur.list;
    var porCab = {};cabanas.forEach(function (c) {porCab[c.id] = { cab: c, reservas: 0, noches: 0, pax: 0, importe: 0 };});
    var porCiudad = {},porMes = {};
    sub.forEach(function (r) {
      var imp = FDL.importeTotal(r),nn = FDL.noches(r),px = FDL.pax(r);
      if (porCab[r.cabanaId]) {var pc = porCab[r.cabanaId];pc.reservas++;pc.noches += nn;pc.pax += px;pc.importe += imp;}
      var ciu = (r.ciudadOrigen || "—").split(",")[0].trim();
      if (!porCiudad[ciu]) porCiudad[ciu] = { ciudad: ciu, reservas: 0, pax: 0 };
      porCiudad[ciu].reservas++;porCiudad[ciu].pax += px;
    });
    // trend mensual (todo el histórico, para contexto)
    reservas.forEach(function (r) {
      var d = FDL.parseIso(r.inicioEstadia);if (!d) return;
      var key = d.getFullYear() + "-" + FDL.pad(d.getMonth() + 1);
      if (!porMes[key]) porMes[key] = { key: key, y: d.getFullYear(), m: d.getMonth(), reservas: 0, importe: 0, pax: 0 };
      porMes[key].reservas++;porMes[key].importe += FDL.importeTotal(r);porMes[key].pax += FDL.pax(r);
    });
    var cabList = Object.keys(porCab).map(function (k) {return porCab[k];});
    var ciudades = Object.keys(porCiudad).map(function (k) {return porCiudad[k];}).sort(function (a, b) {return b.reservas - a.reservas;});
    var meses = Object.keys(porMes).map(function (k) {return porMes[k];}).sort(function (a, b) {return a.key < b.key ? -1 : 1;});
    function topBy(arr, f) {return arr.slice().sort(function (a, b) {return f(b) - f(a);})[0];}
    var hoyKey = hoyIso.slice(0, 7);
    var pasados = meses.filter(function (mm) {return mm.y + "-" + FDL.pad(mm.m + 1) <= hoyKey;});
    var futuros = meses.filter(function (mm) {return mm.y + "-" + FDL.pad(mm.m + 1) >= hoyKey;});
    return {
      cabList: cabList, ciudades: ciudades, meses: meses,
      masAlquilada: topBy(cabList, function (x) {return x.noches;}),
      masReservas: topBy(cabList, function (x) {return x.reservas;}),
      masPax: topBy(cabList, function (x) {return x.pax;}),
      masFacturada: topBy(cabList, function (x) {return x.importe;}),
      picoPasado: topBy(pasados, function (x) {return x.reservas;}),
      picoFuturo: topBy(futuros, function (x) {return x.reservas;})
    };
  }, [cabanas, reservas, cur.list]);

  var maxMesRes = Math.max.apply(null, detalle.meses.map(function (m) {return m.reservas;}).concat([1]));
  var maxCiudad = Math.max.apply(null, detalle.ciudades.map(function (c) {return c.reservas;}).concat([1]));
  var maxCabImp = Math.max.apply(null, detalle.cabList.map(function (c) {return c.importe;}).concat([1]));
  var hoyKey = hoyIso.slice(0, 7);
  function cabName(s) {return s && s.cab && s.reservas > 0 ? s.cab.nombre : "—";}

  var presets = [
  { k: "mes", t: "Mes en curso", d: ind.mes },
  { k: "mesAnt", t: "Mes anterior", d: ind.mesAnt },
  { k: "anio", t: "Año en curso", d: ind.anio },
  { k: "anioAnt", t: "Año anterior", d: ind.anioAnt }];


  return (/*#__PURE__*/
    React.createElement("div", { className: "page wide" }, /*#__PURE__*/
    React.createElement("div", { className: "page-head" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h1", null, "Dashboard"), /*#__PURE__*/
    React.createElement("p", { className: "sub" }, "Tendencias de ocupaci\xF3n, facturaci\xF3n y origen de tus hu\xE9spedes.")
    ), /*#__PURE__*/
    React.createElement("div", { className: "period-extra" }, /*#__PURE__*/
    React.createElement("button", { className: "btn-soft" + (period.preset === "todo" ? " on" : ""), onClick: function () {setPeriod({ preset: "todo" });} }, "Hist\xF3rico"), /*#__PURE__*/
    React.createElement("div", { className: "custom-range" + (period.preset === "custom" ? " on" : "") }, /*#__PURE__*/
    React.createElement(Icon.calendar, { size: 15 }), /*#__PURE__*/
    React.createElement("input", { type: "date", value: custom.desde, onChange: function (e) {var v = { desde: e.target.value, hasta: custom.hasta };setCustom(v);setPeriod({ preset: "custom" });} }), /*#__PURE__*/
    React.createElement("span", null, "\u2192"), /*#__PURE__*/
    React.createElement("input", { type: "date", value: custom.hasta, onChange: function (e) {var v = { desde: custom.desde, hasta: e.target.value };setCustom(v);setPeriod({ preset: "custom" });} })
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "ind-row" },
    presets.map(function (p) {
      var active = period.preset === p.k;
      return (/*#__PURE__*/
        React.createElement("button", { key: p.k, className: "ind-card" + (active ? " active" : ""), onClick: function () {setPeriod({ preset: p.k });} }, /*#__PURE__*/
        React.createElement("div", { className: "ind-lbl" }, p.t), /*#__PURE__*/
        React.createElement("div", { className: "ind-num" }, p.d.reservas, /*#__PURE__*/React.createElement("span", null, " reservas")), /*#__PURE__*/
        React.createElement("div", { className: "ind-sub" }, FDL.fmtMoney(p.d.importe))
        ));

    })
    ), /*#__PURE__*/


    React.createElement("div", { className: "kpi-row" }, /*#__PURE__*/
    React.createElement(KpiCard, { ico: "table", bg: "var(--brand-50)", fg: "var(--brand-700)", num: cur.reservas, lbl: "Reservas", delta: pre ? pctDelta(cur.reservas, pre.reservas) : null }), /*#__PURE__*/
    React.createElement(KpiCard, { ico: "money", bg: "oklch(0.95 0.05 85)", fg: "var(--gold-ink)", num: FDL.fmtMoney(cur.importe), lbl: "Facturaci\xF3n", delta: pre ? pctDelta(cur.importe, pre.importe) : null }), /*#__PURE__*/
    React.createElement(KpiCard, { ico: "users", bg: "oklch(0.94 0.04 220)", fg: "oklch(0.5 0.1 224)", num: cur.pax, lbl: "Personas", delta: pre ? pctDelta(cur.pax, pre.pax) : null }), /*#__PURE__*/
    React.createElement(KpiCard, { ico: "bed", bg: "oklch(0.95 0.05 150)", fg: "oklch(0.45 0.1 150)", num: cur.noches, lbl: "Noches vendidas", delta: pre ? pctDelta(cur.noches, pre.noches) : null }), /*#__PURE__*/
    React.createElement(KpiCard, { ico: "clock", bg: "oklch(0.95 0.06 60)", fg: "oklch(0.5 0.12 50)", num: FDL.fmtMoney(cur.pendiente), lbl: "Saldo pendiente", delta: null })
    ),
    pre && /*#__PURE__*/React.createElement("div", { className: "period-note" }, /*#__PURE__*/React.createElement(Icon.info, { size: 13 }), " Variaci\xF3n (%) comparada con el per\xEDodo anterior equivalente."), /*#__PURE__*/


    React.createElement("div", { className: "lead-row" }, /*#__PURE__*/
    React.createElement(LeaderCard, { icon: "trophy", tone: "gold", label: "Caba\xF1a m\xE1s alquilada", value: cabName(detalle.masAlquilada), sub: detalle.masAlquilada && detalle.masAlquilada.reservas > 0 ? detalle.masAlquilada.noches + " noches" : "sin datos" }), /*#__PURE__*/
    React.createElement(LeaderCard, { icon: "table", tone: "brand", label: "M\xE1s reservas", value: cabName(detalle.masReservas), sub: detalle.masReservas && detalle.masReservas.reservas > 0 ? detalle.masReservas.reservas + " reservas" : "sin datos" }), /*#__PURE__*/
    React.createElement(LeaderCard, { icon: "users", tone: "blue", label: "M\xE1s personas alojadas", value: cabName(detalle.masPax), sub: detalle.masPax && detalle.masPax.reservas > 0 ? detalle.masPax.pax + " personas" : "sin datos" }), /*#__PURE__*/
    React.createElement(LeaderCard, { icon: "money", tone: "green", label: "Mayor facturaci\xF3n", value: cabName(detalle.masFacturada), sub: detalle.masFacturada && detalle.masFacturada.reservas > 0 ? FDL.fmtMoney(detalle.masFacturada.importe) : "sin datos" })
    ), /*#__PURE__*/

    React.createElement("div", { className: "dash-grid" }, /*#__PURE__*/
    React.createElement("div", { className: "card chart-card span2" }, /*#__PURE__*/
    React.createElement("div", { className: "card-title" }, /*#__PURE__*/React.createElement(Icon.trend, { size: 18 }), " Reservas por mes ", /*#__PURE__*/React.createElement("span", { className: "card-tag" }, "hist\xF3rico completo"), /*#__PURE__*/
    React.createElement("span", { className: "card-note" }, "Pico pasado: ", /*#__PURE__*/React.createElement("b", null, detalle.picoPasado ? FDL.MESES_ABR[detalle.picoPasado.m] + " " + detalle.picoPasado.y : "—"), " \xB7 Pico futuro: ", /*#__PURE__*/React.createElement("b", null, detalle.picoFuturo ? FDL.MESES_ABR[detalle.picoFuturo.m] + " " + detalle.picoFuturo.y : "—"))
    ), /*#__PURE__*/
    React.createElement("div", { className: "bars" },
    detalle.meses.map(function (mm) {
      var mk = mm.y + "-" + FDL.pad(mm.m + 1);
      var fut = mk > hoyKey,isNow = mk === hoyKey;
      var inRange = mm.y + "-" + FDL.pad(mm.m + 1) >= range.desde.slice(0, 7) && mm.y + "-" + FDL.pad(mm.m + 1) <= range.hasta.slice(0, 7);
      var pico = detalle.picoPasado && mm.key === detalle.picoPasado.key || detalle.picoFuturo && mm.key === detalle.picoFuturo.key;
      return (/*#__PURE__*/
        React.createElement("div", { className: "bar-col", key: mm.key, title: mm.reservas + " reservas · " + mm.pax + " personas · " + FDL.fmtMoney(mm.importe) }, /*#__PURE__*/
        React.createElement("div", { className: "bar-track" }, /*#__PURE__*/
        React.createElement("div", { className: "bar-fill", style: {
            height: mm.reservas / maxMesRes * 100 + "%",
            background: pico ? "var(--gold)" : fut ? "var(--brand-300)" : "var(--brand-600)",
            opacity: inRange ? 1 : 0.35
          } }, /*#__PURE__*/React.createElement("span", { className: "bar-val" }, mm.reservas))
        ), /*#__PURE__*/
        React.createElement("div", { className: "bar-x" + (isNow ? " now" : "") }, FDL.MESES_ABR[mm.m], /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", null, String(mm.y).slice(2)))
        ));

    })
    ), /*#__PURE__*/
    React.createElement("div", { className: "chart-legend" }, /*#__PURE__*/
    React.createElement("span", null, /*#__PURE__*/React.createElement("i", { style: { background: "var(--brand-600)" } }), " Pasado"), /*#__PURE__*/
    React.createElement("span", null, /*#__PURE__*/React.createElement("i", { style: { background: "var(--brand-300)" } }), " Futuro"), /*#__PURE__*/
    React.createElement("span", null, /*#__PURE__*/React.createElement("i", { style: { background: "var(--gold)" } }), " Pico"), /*#__PURE__*/
    React.createElement("span", { style: { marginLeft: "auto" } }, "Resaltado = per\xEDodo elegido")
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "card chart-card" }, /*#__PURE__*/
    React.createElement("div", { className: "card-title" }, /*#__PURE__*/React.createElement(Icon.pin, { size: 18 }), " Ciudad de origen"), /*#__PURE__*/
    React.createElement("div", { className: "hbars" },
    detalle.ciudades.slice(0, 6).map(function (c) {
      return (/*#__PURE__*/
        React.createElement("div", { className: "hbar", key: c.ciudad }, /*#__PURE__*/
        React.createElement("div", { className: "hbar-lbl" }, c.ciudad), /*#__PURE__*/
        React.createElement("div", { className: "hbar-track" }, /*#__PURE__*/React.createElement("div", { className: "hbar-fill", style: { width: c.reservas / maxCiudad * 100 + "%" } })), /*#__PURE__*/
        React.createElement("div", { className: "hbar-val" }, c.reservas)
        ));

    }),
    detalle.ciudades.length === 0 && /*#__PURE__*/React.createElement("div", { className: "muted" }, "Sin datos en este per\xEDodo.")
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "card chart-card" }, /*#__PURE__*/
    React.createElement("div", { className: "card-title" }, /*#__PURE__*/React.createElement(Icon.cabin, { size: 18 }), " Facturaci\xF3n por caba\xF1a"), /*#__PURE__*/
    React.createElement("div", { className: "hbars" },
    detalle.cabList.slice().sort(function (a, b) {return b.importe - a.importe;}).map(function (c) {
      var col = FDL.CABANA_COLORS[c.cab.color];
      return (/*#__PURE__*/
        React.createElement("div", { className: "hbar", key: c.cab.id }, /*#__PURE__*/
        React.createElement("div", { className: "hbar-lbl" }, c.cab.nombre), /*#__PURE__*/
        React.createElement("div", { className: "hbar-track" }, /*#__PURE__*/React.createElement("div", { className: "hbar-fill", style: { width: c.importe / maxCabImp * 100 + "%", background: col.strong } })), /*#__PURE__*/
        React.createElement("div", { className: "hbar-val" }, FDL.fmtMoneyShort(c.importe))
        ));

    })
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "card chart-card span2" }, /*#__PURE__*/
    React.createElement("div", { className: "card-title" }, /*#__PURE__*/React.createElement(Icon.bed, { size: 18 }), " Ocupaci\xF3n por caba\xF1a (noches)"), /*#__PURE__*/
    React.createElement("div", { className: "occ-rows" },
    detalle.cabList.map(function (c) {
      var col = FDL.CABANA_COLORS[c.cab.color];
      var maxN = Math.max.apply(null, detalle.cabList.map(function (x) {return x.noches;}).concat([1]));
      return (/*#__PURE__*/
        React.createElement("div", { className: "occ-row", key: c.cab.id }, /*#__PURE__*/
        React.createElement("div", { className: "occ-name" }, /*#__PURE__*/React.createElement("span", { style: { width: 10, height: 10, borderRadius: 3, background: col.strong } }), c.cab.nombre), /*#__PURE__*/
        React.createElement("div", { className: "occ-track" }, /*#__PURE__*/React.createElement("div", { className: "occ-fill", style: { width: c.noches / maxN * 100 + "%", background: col.strong } })), /*#__PURE__*/
        React.createElement("div", { className: "occ-stats" }, c.noches, " noches \xB7 ", c.reservas, " res \xB7 ", c.pax, " pax")
        ));

    })
    )
    )
    )
    ));

}

function KpiCard(props) {
  var d = props.delta;
  return (/*#__PURE__*/
    React.createElement("div", { className: "kpi" }, /*#__PURE__*/
    React.createElement("div", { className: "kpi-ico", style: { background: props.bg, color: props.fg } }, React.createElement(Icon[props.ico], { size: 20 })), /*#__PURE__*/
    React.createElement("div", { style: { minWidth: 0 } }, /*#__PURE__*/
    React.createElement("div", { className: "kpi-num" }, props.num), /*#__PURE__*/
    React.createElement("div", { className: "kpi-lbl" }, props.lbl),
    d !== null && d !== undefined && /*#__PURE__*/
    React.createElement("div", { className: "kpi-delta " + (d > 0 ? "up" : d < 0 ? "down" : "flat") },
    d > 0 ? "▲" : d < 0 ? "▼" : "—", " ", Math.abs(d), "%"
    )

    )
    ));

}

function LeaderCard(props) {
  var tones = {
    gold: { bg: "oklch(0.95 0.05 85)", fg: "var(--gold-ink)" },
    brand: { bg: "var(--brand-50)", fg: "var(--brand-700)" },
    blue: { bg: "oklch(0.94 0.04 220)", fg: "oklch(0.5 0.1 224)" },
    green: { bg: "oklch(0.95 0.05 150)", fg: "oklch(0.45 0.1 150)" }
  };
  var t = tones[props.tone];
  var I = Icon[props.icon];
  return (/*#__PURE__*/
    React.createElement("div", { className: "lead-card" }, /*#__PURE__*/
    React.createElement("div", { className: "lead-ico", style: { background: t.bg, color: t.fg } }, /*#__PURE__*/React.createElement(I, { size: 18 })), /*#__PURE__*/
    React.createElement("div", { className: "lead-lbl" }, props.label), /*#__PURE__*/
    React.createElement("div", { className: "lead-val" }, props.value), /*#__PURE__*/
    React.createElement("div", { className: "lead-sub" }, props.sub)
    ));

}

Object.assign(window, { Dashboard: Dashboard, LeaderCard: LeaderCard, KpiCard: KpiCard });