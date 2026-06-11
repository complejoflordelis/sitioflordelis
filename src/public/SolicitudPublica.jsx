/* Flor de Lis — Página pública (sin login): solicitud de reserva del cliente. */
import React from "react";
import * as FDL from "../lib/fdl";
import { supabase, isConfigured } from "../lib/supabaseClient";
import { BrandMark, Icon } from "../components/ui";

function buildGrid(y, m) {
  const first = new Date(y, m, 1);
  const startDow = (first.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < startDow; i++) { const d = new Date(y, m, 1 - (startDow - i)); cells.push({ iso: FDL.iso(d), day: d.getDate(), inMonth: false }); }
  const dim = new Date(y, m + 1, 0).getDate();
  for (let dd = 1; dd <= dim; dd++) { const dt = new Date(y, m, dd); cells.push({ iso: FDL.iso(dt), day: dd, inMonth: true }); }
  while (cells.length % 7 !== 0) { const last = FDL.parseIso(cells[cells.length - 1].iso); last.setDate(last.getDate() + 1); cells.push({ iso: FDL.iso(last), day: last.getDate(), inMonth: false }); }
  return cells;
}

function MiniRangePicker({ value, onChange }) {
  const hoy = FDL.todayIso();
  const start = value.ini ? FDL.parseIso(value.ini) : new Date();
  const [view, setView] = React.useState({ y: start.getFullYear(), m: start.getMonth() });
  const [hover, setHover] = React.useState(null);
  const grid = buildGrid(view.y, view.m);

  function nav(d) { let m = view.m + d, y = view.y; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } setView({ y, m }); }
  function click(iso) {
    if (iso < hoy) return;
    if (!value.ini || (value.ini && value.fin)) { onChange({ ini: iso, fin: "" }); return; }
    if (iso <= value.ini) { onChange({ ini: iso, fin: "" }); return; }
    onChange({ ini: value.ini, fin: iso });
  }
  return (
    <div style={{ userSelect: "none" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button type="button" className="cal-nav" onClick={() => nav(-1)}><Icon.chevL size={18} /></button>
        <div style={{ fontWeight: 600, fontSize: 15, fontFamily: "var(--serif)", color: "var(--brand-800)" }}>{FDL.MESES[view.m]} {view.y}</div>
        <button type="button" className="cal-nav" onClick={() => nav(1)}><Icon.chevR size={18} /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
        {FDL.DIAS.map((d) => <div key={d} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, color: "var(--ink-faint)" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {grid.map((c) => {
          const past = c.iso < hoy;
          const isStart = c.iso === value.ini, isEnd = c.iso === value.fin;
          const fin = value.fin || (value.ini && hover && hover > value.ini ? hover : null);
          const inRange = value.ini && fin && c.iso > value.ini && c.iso < fin;
          let bg = "transparent", color = c.inMonth ? "var(--ink)" : "var(--ink-faint)", fw = 500;
          if (inRange) { bg = "var(--brand-50)"; color = "var(--brand-800)"; }
          if (isStart || isEnd) { bg = "var(--brand-700)"; color = "#fff"; fw = 700; }
          return (
            <button key={c.iso} type="button" disabled={past} onMouseEnter={() => setHover(c.iso)} onClick={() => click(c.iso)}
              style={{ aspectRatio: "1/1", border: "none", borderRadius: 9, background: bg, color, fontSize: 13, fontWeight: fw,
                cursor: past ? "not-allowed" : "pointer", opacity: past ? 0.32 : (c.inMonth ? 1 : 0.45), transition: "background .12s" }}>
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="lbl" style={{ color: "var(--brand-800)" }}>{label}</label>
      {children}
    </div>
  );
}

function Stepper({ value, min, onChange }) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(Math.max(min || 0, value - 1))} aria-label="menos">–</button>
      <span>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label="más">+</button>
    </div>
  );
}

export function SolicitudPublica() {
  const [f, setF] = React.useState({ nombre: "", apellido: "", telefono: "", email: "", adultos: 2, menores: 0, late: false, comentario: "" });
  const [rango, setRango] = React.useState({ ini: "", fin: "" });
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [enviado, setEnviado] = React.useState(false);
  function set(k, v) { setF((p) => ({ ...p, [k]: v })); }

  const noches = rango.ini && rango.fin ? FDL.diffDays(rango.ini, rango.fin) : 0;
  const ok = f.nombre.trim() && f.apellido.trim() && f.telefono.trim() && f.email.trim() && rango.ini && rango.fin && noches > 0;

  async function enviar(e) {
    e.preventDefault();
    if (!ok) { setErr("Completá tus datos y elegí las fechas de ingreso y salida."); return; }
    setErr(""); setBusy(true);
    const payload = {
      nombre: f.nombre.trim(), apellido: f.apellido.trim(), telefono: f.telefono.trim(), email: f.email.trim(),
      fecha_inicio: rango.ini, fecha_fin: rango.fin, adultos: Number(f.adultos) || 0, menores: Number(f.menores) || 0,
      late_checkout: f.late, comentario: f.comentario.trim() || null,
    };
    if (!isConfigured) { setBusy(false); setEnviado(true); return; }
    const { error } = await supabase.from("solicitudes").insert(payload);
    if (error) { setBusy(false); setErr("No pudimos enviar la solicitud. Probá de nuevo en un momento."); return; }
    try { await supabase.functions.invoke("notificar-solicitud", { body: payload }); } catch (e2) { /* la solicitud ya quedó guardada */ }
    setBusy(false); setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="pub-bg">
        <div className="pub-card" style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><BrandMark /></div>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: "var(--brand-50)", color: "var(--brand-700)", display: "grid", placeItems: "center", margin: "8px auto 16px" }}>
            <Icon.check size={34} />
          </div>
          <h1 className="pub-h1">¡Gracias, {f.nombre}!</h1>
          <p style={{ color: "var(--ink-soft)", fontSize: 15, lineHeight: 1.6, margin: "8px 0 0" }}>
            Recibimos tu solicitud para el <b>{FDL.fmtFecha(rango.ini)}</b> al <b>{FDL.fmtFecha(rango.fin)}</b>.
            Te vamos a contactar a la brevedad para confirmar la disponibilidad. 🌿
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pub-bg">
      <form className="pub-card" onSubmit={enviar}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><BrandMark /></div>
        <h1 className="pub-h1" style={{ textAlign: "center" }}>Reservá tu estadía</h1>
        <p style={{ textAlign: "center", color: "var(--ink-soft)", margin: "4px 0 22px", fontSize: 14.5 }}>
          Elegí tus fechas y dejanos tus datos. Te contactamos para confirmar.
        </p>

        <Campo label="Fechas de la estadía">
          <div className="pub-picker">
            <MiniRangePicker value={rango} onChange={setRango} />
          </div>
        </Campo>

        <div className="row-2">
          <Campo label="Día de ingreso">
            <div className="inp-readonly">{rango.ini ? FDL.fmtFecha(rango.ini) : "—"}</div>
          </Campo>
          <Campo label="Día de salida">
            <div className="inp-readonly">{rango.fin ? FDL.fmtFecha(rango.fin) : "—"}</div>
          </Campo>
        </div>

        <div className="row-2">
          <Campo label="Adultos">
            <Stepper value={Number(f.adultos) || 0} min={1} onChange={(v) => set("adultos", v)} />
          </Campo>
          <Campo label="Menores">
            <Stepper value={Number(f.menores) || 0} min={0} onChange={(v) => set("menores", v)} />
          </Campo>
        </div>

        <label className="pub-check">
          <input type="checkbox" checked={f.late} onChange={(e) => set("late", e.target.checked)} />
          <span><b>Late check-out</b> — necesito irme más tarde del horario de salida</span>
        </label>

        <div style={{ height: 1, background: "var(--line)", margin: "18px 0" }} />

        <div className="row-2">
          <Campo label="Nombre">
            <input className="inp" placeholder="Tu nombre" value={f.nombre} onChange={(e) => set("nombre", e.target.value)} required />
          </Campo>
          <Campo label="Apellido">
            <input className="inp" placeholder="Tu apellido" value={f.apellido} onChange={(e) => set("apellido", e.target.value)} required />
          </Campo>
        </div>
        <div className="row-2">
          <Campo label="Teléfono">
            <div style={{ position: "relative" }}>
              <div className="fld-icon"><Icon.phone size={15} /></div>
              <input className="inp has-icon" inputMode="tel" placeholder="Ej: 341 555 1234" value={f.telefono} onChange={(e) => set("telefono", e.target.value)} required />
            </div>
          </Campo>
          <Campo label="Mail">
            <div style={{ position: "relative" }}>
              <div className="fld-icon"><Icon.mail size={15} /></div>
              <input className="inp has-icon" type="email" placeholder="tu@email.com" value={f.email} onChange={(e) => set("email", e.target.value)} required />
            </div>
          </Campo>
        </div>
        <Campo label="¿Algo que quieras contarnos? (opcional)">
          <textarea className="inp" style={{ height: 72, padding: "10px 13px", resize: "vertical" }} placeholder="Cantidad de personas, consultas, etc." value={f.comentario} onChange={(e) => set("comentario", e.target.value)} />
        </Campo>

        {err && <div className="err-box" style={{ marginBottom: 14 }}><Icon.x size={15} /> {err}</div>}

        <button className="btn-primary" type="submit" disabled={busy} style={{ width: "100%", justifyContent: "center", height: 52, fontSize: 16 }}>
          {busy ? "Enviando…" : <><Icon.check size={18} /> Enviar solicitud{noches > 0 ? " · " + noches + " noche" + (noches > 1 ? "s" : "") : ""}</>}
        </button>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--ink-faint)", marginTop: 14 }}>Complejo Flor de Lis · Cabañas en el campo</p>
      </form>
    </div>
  );
}
