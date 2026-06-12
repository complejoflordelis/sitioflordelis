/* Flor de Lis — Pantalla Registrar Reserva */
import React from "react";
import * as FDL from "../lib/fdl";
import { Icon, Help } from "../components/ui";
import { RangePicker } from "../components/RangePicker";

export function CiudadInput(props) {
  const [open, setOpen] = React.useState(false);
  const [idx, setIdx] = React.useState(0);
  const q = props.value || "";
  const matches = React.useMemo(function () {
    if (!q || q.length < 1) return [];
    const ql = q.toLowerCase();
    return FDL.CIUDADES_AR.filter((c) => c.toLowerCase().indexOf(ql) !== -1).slice(0, 7);
  }, [q]);
  return (
    <div style={{ position: "relative" }}>
      <div className="fld-icon"><Icon.pin size={17} /></div>
      <input
        className="inp has-icon"
        value={q}
        placeholder="Ciudad de origen…"
        onChange={(e) => { props.onChange(e.target.value); setOpen(true); setIdx(0); }}
        onFocus={() => { if (matches.length) setOpen(true); }}
        onBlur={() => { setTimeout(() => setOpen(false), 150); }}
        onKeyDown={(e) => {
          if (!open || !matches.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setIdx(Math.min(idx + 1, matches.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setIdx(Math.max(idx - 1, 0)); }
          else if (e.key === "Enter") { e.preventDefault(); props.onChange(matches[idx]); setOpen(false); }
          else if (e.key === "Escape") { setOpen(false); }
        }}
      />
      {open && matches.length > 0 && (
        <div className="ac-list">
          {matches.map((m, i) => (
            <div key={m} className={"ac-item" + (i === idx ? " hl" : "")}
              onMouseDown={() => { props.onChange(m); setOpen(false); }}
              onMouseEnter={() => setIdx(i)}>
              <Icon.pin size={14} style={{ color: "var(--ink-faint)", flexShrink: 0 }} />
              <span>{m}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Stepper(props) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => props.onChange(Math.max(props.min || 0, props.value - 1))} aria-label="menos">–</button>
      <span>{props.value}</span>
      <button type="button" onClick={() => props.onChange(props.value + 1)} aria-label="más">+</button>
    </div>
  );
}

function Field(props) {
  return (
    <div style={{ marginBottom: props.tight ? 0 : 18 }}>
      <label className="lbl">
        {props.label}
        {props.help && <Help width={props.helpW}>{props.help}</Help>}
      </label>
      {props.children}
    </div>
  );
}

export function ReservaForm(props) {
  const cabanas = props.cabanas, reservas = props.reservas;
  const empty = () => ({
    fechaVenta: FDL.todayIso(), cabanaId: "", inicioEstadia: "", finEstadia: "",
    horaInicio: "14:00", horaFin: "10:00", modoImporte: "total", importeIngresado: "",
    nombre: "", ciudadOrigen: "", celular: "", email: "", adultos: 2, menores: 0,
    anticipo: "", pagadoDepositoA: "", fechaDeposito: "", pagadoSaldoA: "", fechaPagoCliente: "",
    comision: "", comisionPct: 30, notas: "",
  });
  const [f, setF] = React.useState(empty());
  const [saved, setSaved] = React.useState(false);

  function set(k, v) { setF((p) => { const n = Object.assign({}, p); n[k] = v; return n; }); }

  const cabana = cabanas.find((c) => c.id === f.cabanaId) || null;
  const nn = FDL.noches(f);
  const totalCalc = FDL.importeTotal(f);
  const prom = FDL.promedioDia(f);
  const pax = FDL.pax(f);
  const excede = cabana && pax > cabana.maxPersonas;
  const rangoOk = f.inicioEstadia && f.finEstadia && nn > 0;
  const choca = rangoOk && cabana && FDL.rangoOcupado(reservas, cabana.id, f.inicioEstadia, f.finEstadia);

  const puedeGuardar = cabana && rangoOk && !choca && f.nombre.trim() && f.importeIngresado && !excede;

  const anticipoSugerido = totalCalc > 0 ? Math.round(totalCalc / 2) : 0;
  const saldoCalc = Math.max(0, totalCalc - (Number(f.anticipo) || 0));

  // Sugerencia automática del anticipo (50% del total) hasta que se edite a mano.
  const anticipoTouched = React.useRef(false);
  React.useEffect(() => {
    if (!anticipoTouched.current) {
      set("anticipo", totalCalc > 0 ? String(Math.round(totalCalc / 2)) : "");
    }
  }, [totalCalc]);

  // Pre-cargar desde una solicitud del cliente (botón "Crear reserva").
  React.useEffect(() => {
    const p = props.prefill;
    if (!p) return;
    setF(Object.assign(empty(), {
      nombre: p.nombre || "",
      celular: p.celular || "",
      email: p.email || "",
      inicioEstadia: p.inicioEstadia || "",
      finEstadia: p.finEstadia || "",
      adultos: p.adultos != null ? p.adultos : 2,
      menores: p.menores != null ? p.menores : 0,
      notas: p.notas || "",
    }));
    anticipoTouched.current = false;
    if (props.onPrefillConsumed) props.onPrefillConsumed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.prefill]);

  function limpiar() { anticipoTouched.current = false; setF(empty()); }

  function guardar() {
    if (!puedeGuardar) return;
    const r = Object.assign({}, f, { id: FDL.uid(), importeTotal: totalCalc });
    props.onSave(r);
    anticipoTouched.current = false;
    setF(empty());
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Registrar reserva</h1>
          <p className="sub">Cargá una nueva estadía. Los campos de cálculo se completan solos.</p>
        </div>
        {saved && <div className="toast-ok"><Icon.check size={16} /> Reserva guardada</div>}
      </div>

      <div className="form-grid">
        <div className="card">
          <div className="card-title"><Icon.cabin size={18} /> Estadía</div>

          <div className="row-2">
            <Field label="Fecha de registro" help="Fecha en que se carga/concreta la venta. Por defecto es hoy.">
              <input type="date" className="inp" value={f.fechaVenta} onChange={(e) => set("fechaVenta", e.target.value)} />
            </Field>
            <Field label="Cabaña">
              <div style={{ position: "relative" }}>
                {cabana && <div className="fld-icon" style={{ left: 13 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: FDL.CABANA_COLORS[cabana.color].strong, display: "block" }}></span></div>}
                <select className={"inp sel-cab" + (cabana ? " has-icon" : "")}
                  value={f.cabanaId}
                  onChange={(e) => set("cabanaId", e.target.value)}>
                  <option value="">Elegí una cabaña…</option>
                  {cabanas.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre} · hasta {c.maxPersonas} pers.</option>
                  ))}
                </select>
                <div className="fld-icon" style={{ left: "auto", right: 13 }}><Icon.chevD size={16} /></div>
              </div>
            </Field>
          </div>

          <Field label="Fechas de la estadía" help={cabana ? "Tocá el día de ingreso y luego el de egreso. Las fechas ocupadas para esta cabaña aparecen bloqueadas." : "Primero elegí una cabaña para ver su disponibilidad."}>
            {!cabana && <div className="hint-box">Elegí una cabaña arriba para habilitar el calendario.</div>}
            {cabana && (
              <div className="picker-wrap">
                <RangePicker cabana={cabana} reservas={reservas}
                  value={{ ini: f.inicioEstadia, fin: f.finEstadia }}
                  onChange={(v) => { set("inicioEstadia", v.ini); set("finEstadia", v.fin); }} />
              </div>
            )}
            {choca && <div className="err-box"><Icon.x size={15} /> Ese rango se superpone con otra reserva de {cabana.nombre}.</div>}
          </Field>

          <div className="row-2">
            <Field label="Inicio de reserva">
              <div className="inp-readonly">{f.inicioEstadia ? FDL.fmtFecha(f.inicioEstadia) : "—"}</div>
            </Field>
            <Field label="Fin de reserva">
              <div className="inp-readonly">{f.finEstadia ? FDL.fmtFecha(f.finEstadia) : "—"}</div>
            </Field>
          </div>

          <div className="row-2">
            <Field label="Hora de ingreso" help="Check-in sugerido 14:00. Editable.">
              <div style={{ position: "relative" }}>
                <div className="fld-icon"><Icon.clock size={16} /></div>
                <input type="time" className="inp has-icon" value={f.horaInicio} onChange={(e) => set("horaInicio", e.target.value)} />
              </div>
            </Field>
            <Field label="Hora de salida" help="Check-out sugerido 10:00. Editable.">
              <div style={{ position: "relative" }}>
                <div className="fld-icon"><Icon.clock size={16} /></div>
                <input type="time" className="inp has-icon" value={f.horaFin} onChange={(e) => set("horaFin", e.target.value)} />
              </div>
            </Field>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div className="card">
            <div className="card-title"><Icon.money size={18} /> Importe</div>
            <Field label="¿Cómo cargás el importe?" help="El total se calcula automáticamente según las noches.">
              <div className="toggle2">
                <button type="button" className={f.modoImporte === "total" ? "active" : ""} onClick={() => set("modoImporte", "total")}>Importe total</button>
                <button type="button" className={f.modoImporte === "noche" ? "active" : ""} onClick={() => set("modoImporte", "noche")}>Importe por noche</button>
              </div>
            </Field>
            <Field label={f.modoImporte === "total" ? "Importe total de la estadía" : "Importe por noche"} tight>
              <div style={{ position: "relative" }}>
                <div className="fld-icon" style={{ fontWeight: 700, color: "var(--ink-soft)" }}>$</div>
                <input className="inp has-icon" inputMode="numeric" placeholder="0"
                  value={f.importeIngresado}
                  onChange={(e) => set("importeIngresado", e.target.value.replace(/[^\d]/g, ""))} />
              </div>
            </Field>
            <div className="calc-strip">
              <div><span>Noches</span><b>{nn || "—"}</b></div>
              <div><span>Total estadía</span><b>{rangoOk && f.importeIngresado ? FDL.fmtMoney(totalCalc) : "—"}</b></div>
              <div><span>Promedio x día</span><b>{nn && f.importeIngresado ? FDL.fmtMoney(prom) : "—"}</b></div>
            </div>

            <div style={{ marginTop: 18 }}>
              <label className="lbl">
                Anticipo / Seña
                <Help width={230}>Se sugiere el 50% del total automáticamente, pero podés escribir otro monto.</Help>
              </label>
              <div style={{ position: "relative" }}>
                <div className="fld-icon" style={{ fontWeight: 700, color: "var(--ink-soft)" }}>$</div>
                <input className="inp has-icon" inputMode="numeric" placeholder="0"
                  value={f.anticipo}
                  onChange={(e) => { anticipoTouched.current = true; set("anticipo", e.target.value.replace(/[^\d]/g, "")); }} />
              </div>
              {totalCalc > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12.5, color: "var(--ink-faint)", fontWeight: 600 }}>
                  <span>Sugerido 50%: <b style={{ color: "var(--ink-soft)" }}>{FDL.fmtMoney(anticipoSugerido)}</b></span>
                  <span>Saldo restante: <b style={{ color: "var(--ink-soft)" }}>{FDL.fmtMoney(saldoCalc)}</b></span>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-title"><Icon.money size={18} /> Pago del anticipo</div>
            <div className="row-2">
              <Field label="Fecha de pago del anticipo" tight help="¿Cuándo se cobró la seña? (opcional)">
                <div style={{ position: "relative" }}>
                  <div className="fld-icon"><Icon.calendar size={16} /></div>
                  <input type="date" className="inp has-icon" value={f.fechaDeposito} onChange={(e) => set("fechaDeposito", e.target.value)} />
                </div>
              </Field>
              <Field label="Medio de pago" tight>
                <div className="toggle2">
                  <button type="button" className={f.pagadoDepositoA === "Efectivo" ? "active" : ""} onClick={() => set("pagadoDepositoA", f.pagadoDepositoA === "Efectivo" ? "" : "Efectivo")}>Efectivo</button>
                  <button type="button" className={f.pagadoDepositoA === "Transferencia" ? "active" : ""} onClick={() => set("pagadoDepositoA", f.pagadoDepositoA === "Transferencia" ? "" : "Transferencia")}>Transferencia</button>
                </div>
              </Field>
            </div>
          </div>

          <div className="card">
            <div className="card-title"><Icon.user size={18} /> Cliente</div>
            <Field label="Nombre y apellido">
              <div style={{ position: "relative" }}>
                <div className="fld-icon"><Icon.user size={16} /></div>
                <input className="inp has-icon" placeholder="Ej: Familia Gómez" value={f.nombre} onChange={(e) => set("nombre", e.target.value)} />
              </div>
            </Field>
            <Field label="Ciudad de origen" help="Empezá a escribir y elegí de la lista de ciudades de Argentina." helpW={240}>
              <CiudadInput value={f.ciudadOrigen} onChange={(v) => set("ciudadOrigen", v)} />
            </Field>
            <div className="row-2">
              <Field label="Celular">
                <div style={{ position: "relative" }}>
                  <div className="fld-icon"><Icon.phone size={15} /></div>
                  <input className="inp has-icon" placeholder="Ej: 341 555 1234" value={f.celular} onChange={(e) => set("celular", e.target.value)} />
                </div>
              </Field>
              <Field label="Email">
                <div style={{ position: "relative" }}>
                  <div className="fld-icon"><Icon.mail size={15} /></div>
                  <input type="email" className="inp has-icon" placeholder="Ej: persona@email.com" value={f.email} onChange={(e) => set("email", e.target.value)} />
                </div>
              </Field>
            </div>
            <div className="row-3">
              <Field label="Adultos" tight>
                <Stepper value={Number(f.adultos) || 0} min={1} onChange={(v) => set("adultos", v)} />
              </Field>
              <Field label="Menores" tight>
                <Stepper value={Number(f.menores) || 0} min={0} onChange={(v) => set("menores", v)} />
              </Field>
              <Field label="Total personas" tight help="Suma de adultos y menores.">
                <div className={"pax-total" + (excede ? " over" : "")}>
                  <Icon.users size={17} /> {pax}
                </div>
              </Field>
            </div>
            {excede && <div className="err-box"><Icon.x size={15} /> {cabana.nombre} admite hasta {cabana.maxPersonas} personas.</div>}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={limpiar}>Limpiar</button>
        <button type="button" className="btn-primary" disabled={!puedeGuardar} onClick={guardar}>
          <Icon.check size={18} /> Guardar reserva
        </button>
      </div>
    </div>
  );
}
