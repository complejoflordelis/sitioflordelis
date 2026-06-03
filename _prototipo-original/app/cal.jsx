/* Flor de Lis — helpers de calendario + selector de rango de fechas. */

// Construye una grilla de mes (semanas de lunes a domingo). Devuelve [{iso, day, inMonth}]
function buildMonthGrid(year, month) {
  var first = new Date(year, month, 1);
  var startDow = (first.getDay() + 6) % 7; // 0 = lunes
  var cells = [];
  // días del mes anterior para rellenar
  for (var i = 0; i < startDow; i++) {
    var d = new Date(year, month, 1 - (startDow - i));
    cells.push({ iso: FDL.iso(d), day: d.getDate(), inMonth: false });
  }
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  for (var dd = 1; dd <= daysInMonth; dd++) {
    var dt = new Date(year, month, dd);
    cells.push({ iso: FDL.iso(dt), day: dd, inMonth: true });
  }
  // completar última semana
  while (cells.length % 7 !== 0) {
    var last = FDL.parseIso(cells[cells.length - 1].iso);
    last.setDate(last.getDate() + 1);
    cells.push({ iso: FDL.iso(last), day: last.getDate(), inMonth: false });
  }
  return cells;
}

// Selector de rango de fechas con bloqueo de noches ocupadas
function RangePicker(props) {
  var cabana = props.cabana;          // objeto cabaña o null
  var reservas = props.reservas;
  var value = props.value || { ini: "", fin: "" };
  var onChange = props.onChange;
  var exceptId = props.exceptId;

  var initRef = value.ini ? FDL.parseIso(value.ini) : new Date();
  var st = React.useState({ y: initRef.getFullYear(), m: initRef.getMonth() });
  var view = st[0], setView = st[1];
  var hov = React.useState(null);
  var hover = hov[0], setHover = hov[1];

  var ocupadas = React.useMemo(function () {
    if (!cabana) return {};
    return FDL.nochesOcupadas(reservas, cabana.id, exceptId);
  }, [cabana, reservas, exceptId]);

  var grid = buildMonthGrid(view.y, view.m);
  var hoyIso = FDL.todayIso();

  function nav(delta) {
    var m = view.m + delta, y = view.y;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setView({ y: y, m: m });
  }

  // ¿hay alguna noche ocupada entre a (incl) y b (excl)?
  function rangoChoca(a, b) {
    var cur = a;
    while (cur < b) {
      if (ocupadas[cur]) return true;
      cur = FDL.addDaysIso(cur, 1);
    }
    return false;
  }

  function clickDay(iso) {
    if (!cabana) return;
    // seleccionar inicio
    if (!value.ini || (value.ini && value.fin)) {
      // la noche que arranca en 'iso' no debe estar ocupada
      if (ocupadas[iso]) return;
      onChange({ ini: iso, fin: "" });
      return;
    }
    // seleccionar fin
    if (iso <= value.ini) {
      if (ocupadas[iso]) { return; }
      onChange({ ini: iso, fin: "" });
      return;
    }
    // validar que no haya noches ocupadas entre ini y fin
    if (rangoChoca(value.ini, iso)) {
      // rango inválido: reiniciar al nuevo inicio si está libre
      onChange({ ini: iso, fin: "" });
      return;
    }
    onChange({ ini: value.ini, fin: iso });
  }

  function cellState(iso) {
    var ini = value.ini, fin = value.fin || (value.ini && hover && hover > value.ini ? hover : null);
    var isStart = iso === value.ini;
    var isEnd = iso === value.fin;
    var inRange = ini && fin && iso > ini && iso < fin;
    var inHover = ini && !value.fin && hover && iso > ini && iso <= hover && !rangoChoca(ini, hover);
    return { isStart: isStart, isEnd: isEnd, inRange: inRange, inHover: inHover };
  }

  return (
    <div style={{ userSelect: "none" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button type="button" className="cal-nav" onClick={function(){ nav(-1); }} aria-label="Mes anterior"><Icon.chevL size={18} /></button>
        <div style={{ fontWeight: 600, fontSize: 14.5, color: "var(--ink)", fontFamily: "var(--serif)" }}>
          {FDL.MESES[view.m] + " " + view.y}
        </div>
        <button type="button" className="cal-nav" onClick={function(){ nav(1); }} aria-label="Mes siguiente"><Icon.chevR size={18} /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
        {FDL.DIAS.map(function (d) {
          return <div key={d} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, color: "var(--ink-faint)", letterSpacing: ".04em", paddingBottom: 2 }}>{d}</div>;
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {grid.map(function (c) {
          var occ = ocupadas[c.iso];
          var stt = cellState(c.iso);
          var isToday = c.iso === hoyIso;
          var disabled = !cabana;
          var bg = "transparent", color = c.inMonth ? "var(--ink)" : "var(--ink-faint)", bd = "1px solid transparent";
          var fw = 500;
          if (occ) { bg = "var(--surface-2)"; color = "var(--ink-faint)"; }
          if (stt.inRange || stt.inHover) { bg = "var(--brand-50)"; color = "var(--brand-800)"; }
          if (stt.isStart || stt.isEnd) { bg = "var(--brand-700)"; color = "#fff"; fw = 700; }
          return (
            <button
              key={c.iso}
              type="button"
              disabled={disabled}
              onClick={function(){ clickDay(c.iso); }}
              onMouseEnter={function(){ setHover(c.iso); }}
              title={occ ? "Ocupada" : ""}
              style={{
                position: "relative", aspectRatio: "1 / 1", border: bd, borderRadius: 9,
                background: bg, color: color, fontSize: 13, fontWeight: fw, cursor: disabled ? "not-allowed" : "pointer",
                opacity: c.inMonth ? (disabled ? 0.5 : 1) : 0.35,
                outline: isToday && !stt.isStart && !stt.isEnd ? "1.5px solid var(--gold)" : "none",
                outlineOffset: -1.5, transition: "background .12s"
              }}
            >
              {c.day}
              {occ && !stt.isStart && !stt.isEnd && (
                <span style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: 999, background: "oklch(0.6 0.13 25)" }}></span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 11, color: "var(--ink-faint)", flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 11, height: 11, borderRadius: 4, background: "var(--brand-700)" }}></span>Seleccionado</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 11, height: 11, borderRadius: 4, background: "var(--surface-2)", border: "1px solid var(--line)" }}></span>Ocupada</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 11, height: 11, borderRadius: 4, outline: "1.5px solid var(--gold)", outlineOffset: -1.5 }}></span>Hoy</span>
      </div>
    </div>
  );
}

Object.assign(window, { buildMonthGrid: buildMonthGrid, RangePicker: RangePicker });
