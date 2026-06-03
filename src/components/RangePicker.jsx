/* Flor de Lis — helpers de calendario + selector de rango de fechas. */
import React from "react";
import * as FDL from "../lib/fdl";
import { Icon } from "./ui";

// Construye una grilla de mes (semanas de lunes a domingo). Devuelve [{iso, day, inMonth}]
export function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7; // 0 = lunes
  const cells = [];
  for (let i = 0; i < startDow; i++) {
    const d = new Date(year, month, 1 - (startDow - i));
    cells.push({ iso: FDL.iso(d), day: d.getDate(), inMonth: false });
  }
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let dd = 1; dd <= daysInMonth; dd++) {
    const dt = new Date(year, month, dd);
    cells.push({ iso: FDL.iso(dt), day: dd, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = FDL.parseIso(cells[cells.length - 1].iso);
    last.setDate(last.getDate() + 1);
    cells.push({ iso: FDL.iso(last), day: last.getDate(), inMonth: false });
  }
  return cells;
}

// Selector de rango de fechas con bloqueo de noches ocupadas
export function RangePicker(props) {
  const cabana = props.cabana;
  const reservas = props.reservas;
  const value = props.value || { ini: "", fin: "" };
  const onChange = props.onChange;
  const exceptId = props.exceptId;

  const initRef = value.ini ? FDL.parseIso(value.ini) : new Date();
  const [view, setView] = React.useState({ y: initRef.getFullYear(), m: initRef.getMonth() });
  const [hover, setHover] = React.useState(null);

  const ocupadas = React.useMemo(function () {
    if (!cabana) return {};
    return FDL.nochesOcupadas(reservas, cabana.id, exceptId);
  }, [cabana, reservas, exceptId]);

  const grid = buildMonthGrid(view.y, view.m);
  const hoyIso = FDL.todayIso();

  function nav(delta) {
    let m = view.m + delta, y = view.y;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setView({ y: y, m: m });
  }

  function rangoChoca(a, b) {
    let cur = a;
    while (cur < b) {
      if (ocupadas[cur]) return true;
      cur = FDL.addDaysIso(cur, 1);
    }
    return false;
  }

  function clickDay(iso) {
    if (!cabana) return;
    if (!value.ini || (value.ini && value.fin)) {
      if (ocupadas[iso]) return;
      onChange({ ini: iso, fin: "" });
      return;
    }
    if (iso <= value.ini) {
      if (ocupadas[iso]) { return; }
      onChange({ ini: iso, fin: "" });
      return;
    }
    if (rangoChoca(value.ini, iso)) {
      onChange({ ini: iso, fin: "" });
      return;
    }
    onChange({ ini: value.ini, fin: iso });
  }

  function cellState(iso) {
    const ini = value.ini, fin = value.fin || (value.ini && hover && hover > value.ini ? hover : null);
    const isStart = iso === value.ini;
    const isEnd = iso === value.fin;
    const inRange = ini && fin && iso > ini && iso < fin;
    const inHover = ini && !value.fin && hover && iso > ini && iso <= hover && !rangoChoca(ini, hover);
    return { isStart, isEnd, inRange, inHover };
  }

  return (
    <div style={{ userSelect: "none" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button type="button" className="cal-nav" onClick={() => nav(-1)} aria-label="Mes anterior"><Icon.chevL size={18} /></button>
        <div style={{ fontWeight: 600, fontSize: 14.5, color: "var(--ink)", fontFamily: "var(--serif)" }}>
          {FDL.MESES[view.m] + " " + view.y}
        </div>
        <button type="button" className="cal-nav" onClick={() => nav(1)} aria-label="Mes siguiente"><Icon.chevR size={18} /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
        {FDL.DIAS.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, color: "var(--ink-faint)", letterSpacing: ".04em", paddingBottom: 2 }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {grid.map((c) => {
          const occ = ocupadas[c.iso];
          const stt = cellState(c.iso);
          const isToday = c.iso === hoyIso;
          const disabled = !cabana;
          let bg = "transparent", color = c.inMonth ? "var(--ink)" : "var(--ink-faint)";
          const bd = "1px solid transparent";
          let fw = 500;
          if (occ) { bg = "var(--surface-2)"; color = "var(--ink-faint)"; }
          if (stt.inRange || stt.inHover) { bg = "var(--brand-50)"; color = "var(--brand-800)"; }
          if (stt.isStart || stt.isEnd) { bg = "var(--brand-700)"; color = "#fff"; fw = 700; }
          return (
            <button
              key={c.iso}
              type="button"
              disabled={disabled}
              onClick={() => clickDay(c.iso)}
              onMouseEnter={() => setHover(c.iso)}
              title={occ ? "Ocupada" : ""}
              style={{
                position: "relative", aspectRatio: "1 / 1", border: bd, borderRadius: 9,
                background: bg, color, fontSize: 13, fontWeight: fw, cursor: disabled ? "not-allowed" : "pointer",
                opacity: c.inMonth ? (disabled ? 0.5 : 1) : 0.35,
                outline: isToday && !stt.isStart && !stt.isEnd ? "1.5px solid var(--gold)" : "none",
                outlineOffset: -1.5, transition: "background .12s",
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
