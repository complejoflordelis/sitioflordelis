/* Flor de Lis — Dashboard de tendencias */

function rangePreset(preset, custom) {
  var now = new Date();
  var y = now.getFullYear(), m = now.getMonth();
  function r(a, b) { return { desde: FDL.iso(a), hasta: FDL.iso(b) }; }
  if (preset === "mes")     return r(new Date(y, m, 1),       new Date(y, m + 1, 0));
  if (preset === "mesAnt")  return r(new Date(y, m - 1, 1),   new Date(y, m, 0));
  if (preset === "anio")    return r(new Date(y, 0, 1),       new Date(y, 11, 31));
  if (preset === "anioAnt") return r(new Date(y - 1, 0, 1),   new Date(y - 1, 11, 31));
  if (preset === "custom")  return { desde: custom.desde, hasta: custom.hasta };
  return { desde: "0000-01-01", hasta: "9999-12-31" }; // histórico
}
function prevRange(preset, custom) {
  var now = new Date();
  var y = now.getFullYear(), m = now.getMonth();
  function r(a, b) { return { desde: FDL.iso(a), hasta: FDL.iso(b) }; }
  if (preset === "mes")     return r(new Date(y, m - 1, 1), new Date(y, m, 0));
  if (preset === "mesAnt")  return r(new Date(y, m - 2, 1), new Date(y, m - 1, 0));
  if (preset === "anio")    return r(new Date(y - 1, 0, 1), new Date(y - 1, 11, 31));
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
    s.importe += FDL.importeTotal(r); s.pax += FDL.pax(r);
    s.noches += FDL.noches(r); s.pendiente += FDL.saldo(r);
  });
  return s;
}

function pctDelta(cur, prev) {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
}

function Dashboard(props) {
  var cabanas = props.cabanas, reservas = props.reservas;
  var hoyIso = FDL.todayIso();

  var per = React.useState({ preset: "anio" });
  var period = per[0], setPeriod = per[1];
  var cst = React.useState(function () {
    var n = new Date();
    return { desde: FDL.iso(new Date(n.getFullYear(), n.getMonth(), 1)), hasta: FDL.todayIso() };
  });
  var custom = cst[0], setCustom = cst[1];

  var range = rangePreset(period.preset, custom);
  var prev = prevRange(period.preset, custom);

  var cur = React.useMemo(function () { return computeStats(reservas, range); }, [reservas, range.desde, range.hasta]);
  var pre = React.useMemo(function () { return prev ? computeStats(reservas, prev) : null; }, [reservas, prev && prev.desde, prev && prev.hasta]);

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
    var porCab = {}; cabanas.forEach(function (c) { porCab[c.id] = { cab: c, reservas: 0, noches: 0, pax: 0, importe: 0 }; });
    var porCiudad = {}, porMes = {};
    sub.forEach(function (r) {
      var imp = FDL.importeTotal(r), nn = FDL.noches(r), px = FDL.pax(r);
      if (porCab[r.cabanaId]) { var pc = porCab[r.cabanaId]; pc.reservas++; pc.noches += nn; pc.pax += px; pc.importe += imp; }
      var ciu = (r.ciudadOrigen || "—").split(",")[0].trim();
      if (!porCiudad[ciu]) porCiudad[ciu] = { ciudad: ciu, reservas: 0, pax: 0 };
      porCiudad[ciu].reservas++; porCiudad[ciu].pax += px;
    });
    // trend mensual (todo el histórico, para contexto)
    reservas.forEach(function (r) {
      var d = FDL.parseIso(r.inicioEstadia); if (!d) return;
      var key = d.getFullYear() + "-" + FDL.pad(d.getMonth() + 1);
      if (!porMes[key]) porMes[key] = { key: key, y: d.getFullYear(), m: d.getMonth(), reservas: 0, importe: 0, pax: 0 };
      porMes[key].reservas++; porMes[key].importe += FDL.importeTotal(r); porMes[key].pax += FDL.pax(r);
    });
    var cabList = Object.keys(porCab).map(function (k){ return porCab[k]; });
    var ciudades = Object.keys(porCiudad).map(function (k){ return porCiudad[k]; }).sort(function (a,b){ return b.reservas - a.reservas; });
    var meses = Object.keys(porMes).map(function (k){ return porMes[k]; }).sort(function (a,b){ return a.key < b.key ? -1 : 1; });
    function topBy(arr, f) { return arr.slice().sort(function (a,b){ return f(b) - f(a); })[0]; }
    var hoyKey = hoyIso.slice(0,7);
    var pasados = meses.filter(function (mm){ return (mm.y + "-" + FDL.pad(mm.m+1)) <= hoyKey; });
    var futuros = meses.filter(function (mm){ return (mm.y + "-" + FDL.pad(mm.m+1)) >= hoyKey; });
    return {
      cabList: cabList, ciudades: ciudades, meses: meses,
      masAlquilada: topBy(cabList, function(x){ return x.noches; }),
      masReservas: topBy(cabList, function(x){ return x.reservas; }),
      masPax: topBy(cabList, function(x){ return x.pax; }),
      masFacturada: topBy(cabList, function(x){ return x.importe; }),
      picoPasado: topBy(pasados, function(x){ return x.reservas; }),
      picoFuturo: topBy(futuros, function(x){ return x.reservas; })
    };
  }, [cabanas, reservas, cur.list]);

  var maxMesRes = Math.max.apply(null, detalle.meses.map(function(m){ return m.reservas; }).concat([1]));
  var maxCiudad = Math.max.apply(null, detalle.ciudades.map(function(c){ return c.reservas; }).concat([1]));
  var maxCabImp = Math.max.apply(null, detalle.cabList.map(function(c){ return c.importe; }).concat([1]));
  var hoyKey = hoyIso.slice(0, 7);
  function cabName(s) { return s && s.cab && s.reservas > 0 ? s.cab.nombre : "—"; }

  var presets = [
    { k: "mes", t: "Mes en curso", d: ind.mes },
    { k: "mesAnt", t: "Mes anterior", d: ind.mesAnt },
    { k: "anio", t: "Año en curso", d: ind.anio },
    { k: "anioAnt", t: "Año anterior", d: ind.anioAnt }
  ];

  return (
    <div className="page wide">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="sub">Tendencias de ocupación, facturación y origen de tus huéspedes.</p>
        </div>
        <div className="period-extra">
          <button className={"btn-soft" + (period.preset === "todo" ? " on" : "")} onClick={function(){ setPeriod({ preset: "todo" }); }}>Histórico</button>
          <div className={"custom-range" + (period.preset === "custom" ? " on" : "")}>
            <Icon.calendar size={15} />
            <input type="date" value={custom.desde} onChange={function(e){ var v={desde:e.target.value,hasta:custom.hasta}; setCustom(v); setPeriod({preset:"custom"}); }} />
            <span>→</span>
            <input type="date" value={custom.hasta} onChange={function(e){ var v={desde:custom.desde,hasta:e.target.value}; setCustom(v); setPeriod({preset:"custom"}); }} />
          </div>
        </div>
      </div>

      {/* Indicadores / selector de período */}
      <div className="ind-row">
        {presets.map(function (p) {
          var active = period.preset === p.k;
          return (
            <button key={p.k} className={"ind-card" + (active ? " active" : "")} onClick={function(){ setPeriod({ preset: p.k }); }}>
              <div className="ind-lbl">{p.t}</div>
              <div className="ind-num">{p.d.reservas}<span> reservas</span></div>
              <div className="ind-sub">{FDL.fmtMoney(p.d.importe)}</div>
            </button>
          );
        })}
      </div>

      {/* KPIs del período seleccionado con comparación */}
      <div className="kpi-row">
        <KpiCard ico="table" bg="var(--brand-50)" fg="var(--brand-700)" num={cur.reservas} lbl="Reservas" delta={pre ? pctDelta(cur.reservas, pre.reservas) : null} />
        <KpiCard ico="money" bg="oklch(0.95 0.05 85)" fg="var(--gold-ink)" num={FDL.fmtMoney(cur.importe)} lbl="Facturación" delta={pre ? pctDelta(cur.importe, pre.importe) : null} />
        <KpiCard ico="users" bg="oklch(0.94 0.04 220)" fg="oklch(0.5 0.1 224)" num={cur.pax} lbl="Personas" delta={pre ? pctDelta(cur.pax, pre.pax) : null} />
        <KpiCard ico="bed" bg="oklch(0.95 0.05 150)" fg="oklch(0.45 0.1 150)" num={cur.noches} lbl="Noches vendidas" delta={pre ? pctDelta(cur.noches, pre.noches) : null} />
        <KpiCard ico="clock" bg="oklch(0.95 0.06 60)" fg="oklch(0.5 0.12 50)" num={FDL.fmtMoney(cur.pendiente)} lbl="Saldo pendiente" delta={null} />
      </div>
      {pre && <div className="period-note"><Icon.info size={13} /> Variación (%) comparada con el período anterior equivalente.</div>}

      {/* Líderes */}
      <div className="lead-row">
        <LeaderCard icon="trophy" tone="gold" label="Cabaña más alquilada" value={cabName(detalle.masAlquilada)} sub={detalle.masAlquilada && detalle.masAlquilada.reservas>0 ? detalle.masAlquilada.noches + " noches" : "sin datos"} />
        <LeaderCard icon="table" tone="brand" label="Más reservas" value={cabName(detalle.masReservas)} sub={detalle.masReservas && detalle.masReservas.reservas>0 ? detalle.masReservas.reservas + " reservas" : "sin datos"} />
        <LeaderCard icon="users" tone="blue" label="Más personas alojadas" value={cabName(detalle.masPax)} sub={detalle.masPax && detalle.masPax.reservas>0 ? detalle.masPax.pax + " personas" : "sin datos"} />
        <LeaderCard icon="money" tone="green" label="Mayor facturación" value={cabName(detalle.masFacturada)} sub={detalle.masFacturada && detalle.masFacturada.reservas>0 ? FDL.fmtMoney(detalle.masFacturada.importe) : "sin datos"} />
      </div>

      <div className="dash-grid">
        <div className="card chart-card span2">
          <div className="card-title"><Icon.trend size={18} /> Reservas por mes <span className="card-tag">histórico completo</span>
            <span className="card-note">Pico pasado: <b>{detalle.picoPasado ? FDL.MESES_ABR[detalle.picoPasado.m] + " " + detalle.picoPasado.y : "—"}</b> · Pico futuro: <b>{detalle.picoFuturo ? FDL.MESES_ABR[detalle.picoFuturo.m] + " " + detalle.picoFuturo.y : "—"}</b></span>
          </div>
          <div className="bars">
            {detalle.meses.map(function (mm) {
              var mk = mm.y + "-" + FDL.pad(mm.m+1);
              var fut = mk > hoyKey, isNow = mk === hoyKey;
              var inRange = (mm.y + "-" + FDL.pad(mm.m+1)) >= range.desde.slice(0,7) && (mm.y + "-" + FDL.pad(mm.m+1)) <= range.hasta.slice(0,7);
              var pico = (detalle.picoPasado && mm.key === detalle.picoPasado.key) || (detalle.picoFuturo && mm.key === detalle.picoFuturo.key);
              return (
                <div className="bar-col" key={mm.key} title={mm.reservas + " reservas · " + mm.pax + " personas · " + FDL.fmtMoney(mm.importe)}>
                  <div className="bar-track">
                    <div className="bar-fill" style={{
                      height: (mm.reservas / maxMesRes * 100) + "%",
                      background: pico ? "var(--gold)" : (fut ? "var(--brand-300)" : "var(--brand-600)"),
                      opacity: inRange ? 1 : 0.35
                    }}><span className="bar-val">{mm.reservas}</span></div>
                  </div>
                  <div className={"bar-x" + (isNow ? " now" : "")}>{FDL.MESES_ABR[mm.m]}<br/><span>{String(mm.y).slice(2)}</span></div>
                </div>
              );
            })}
          </div>
          <div className="chart-legend">
            <span><i style={{ background: "var(--brand-600)" }}></i> Pasado</span>
            <span><i style={{ background: "var(--brand-300)" }}></i> Futuro</span>
            <span><i style={{ background: "var(--gold)" }}></i> Pico</span>
            <span style={{ marginLeft: "auto" }}>Resaltado = período elegido</span>
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-title"><Icon.pin size={18} /> Ciudad de origen</div>
          <div className="hbars">
            {detalle.ciudades.slice(0, 6).map(function (c) {
              return (
                <div className="hbar" key={c.ciudad}>
                  <div className="hbar-lbl">{c.ciudad}</div>
                  <div className="hbar-track"><div className="hbar-fill" style={{ width: (c.reservas / maxCiudad * 100) + "%" }}></div></div>
                  <div className="hbar-val">{c.reservas}</div>
                </div>
              );
            })}
            {detalle.ciudades.length === 0 && <div className="muted">Sin datos en este período.</div>}
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-title"><Icon.cabin size={18} /> Facturación por cabaña</div>
          <div className="hbars">
            {detalle.cabList.slice().sort(function(a,b){ return b.importe - a.importe; }).map(function (c) {
              var col = FDL.CABANA_COLORS[c.cab.color];
              return (
                <div className="hbar" key={c.cab.id}>
                  <div className="hbar-lbl">{c.cab.nombre}</div>
                  <div className="hbar-track"><div className="hbar-fill" style={{ width: (c.importe / maxCabImp * 100) + "%", background: col.strong }}></div></div>
                  <div className="hbar-val">{FDL.fmtMoneyShort(c.importe)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card chart-card span2">
          <div className="card-title"><Icon.bed size={18} /> Ocupación por cabaña (noches)</div>
          <div className="occ-rows">
            {detalle.cabList.map(function (c) {
              var col = FDL.CABANA_COLORS[c.cab.color];
              var maxN = Math.max.apply(null, detalle.cabList.map(function(x){return x.noches;}).concat([1]));
              return (
                <div className="occ-row" key={c.cab.id}>
                  <div className="occ-name"><span style={{ width:10,height:10,borderRadius:3,background:col.strong }}></span>{c.cab.nombre}</div>
                  <div className="occ-track"><div className="occ-fill" style={{ width: (c.noches/maxN*100)+"%", background: col.strong }}></div></div>
                  <div className="occ-stats">{c.noches} noches · {c.reservas} res · {c.pax} pax</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard(props) {
  var d = props.delta;
  return (
    <div className="kpi">
      <div className="kpi-ico" style={{ background: props.bg, color: props.fg }}>{React.createElement(Icon[props.ico], { size: 20 })}</div>
      <div style={{ minWidth: 0 }}>
        <div className="kpi-num">{props.num}</div>
        <div className="kpi-lbl">{props.lbl}</div>
        {d !== null && d !== undefined && (
          <div className={"kpi-delta " + (d > 0 ? "up" : d < 0 ? "down" : "flat")}>
            {d > 0 ? "▲" : d < 0 ? "▼" : "—"} {Math.abs(d)}%
          </div>
        )}
      </div>
    </div>
  );
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
  return (
    <div className="lead-card">
      <div className="lead-ico" style={{ background: t.bg, color: t.fg }}><I size={18} /></div>
      <div className="lead-lbl">{props.label}</div>
      <div className="lead-val">{props.value}</div>
      <div className="lead-sub">{props.sub}</div>
    </div>
  );
}

Object.assign(window, { Dashboard: Dashboard, LeaderCard: LeaderCard, KpiCard: KpiCard });
