/* Flor de Lis — Pantalla Registrar Reserva */

function CiudadInput(props) {
  var st = React.useState(false);
  var open = st[0], setOpen = st[1];
  var hi = React.useState(0);
  var idx = hi[0], setIdx = hi[1];
  var q = props.value || "";
  var matches = React.useMemo(function () {
    if (!q || q.length < 1) return [];
    var ql = q.toLowerCase();
    return FDL.CIUDADES_AR.filter(function (c) { return c.toLowerCase().indexOf(ql) !== -1; }).slice(0, 7);
  }, [q]);
  return (
    <div style={{ position: "relative" }}>
      <div className="fld-icon"><Icon.pin size={17} /></div>
      <input
        className="inp has-icon"
        value={q}
        placeholder="Ciudad de origen…"
        onChange={function(e){ props.onChange(e.target.value); setOpen(true); setIdx(0); }}
        onFocus={function(){ if (matches.length) setOpen(true); }}
        onBlur={function(){ setTimeout(function(){ setOpen(false); }, 150); }}
        onKeyDown={function(e){
          if (!open || !matches.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setIdx(Math.min(idx + 1, matches.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setIdx(Math.max(idx - 1, 0)); }
          else if (e.key === "Enter") { e.preventDefault(); props.onChange(matches[idx]); setOpen(false); }
          else if (e.key === "Escape") { setOpen(false); }
        }}
      />
      {open && matches.length > 0 && (
        <div className="ac-list">
          {matches.map(function (m, i) {
            return (
              <div key={m} className={"ac-item" + (i === idx ? " hl" : "")}
                onMouseDown={function(){ props.onChange(m); setOpen(false); }}
                onMouseEnter={function(){ setIdx(i); }}>
                <Icon.pin size={14} style={{ color: "var(--ink-faint)", flexShrink: 0 }} />
                <span>{m}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stepper(props) {
  return (
    <div className="stepper">
      <button type="button" onClick={function(){ props.onChange(Math.max(props.min || 0, props.value - 1)); }} aria-label="menos">–</button>
      <span>{props.value}</span>
      <button type="button" onClick={function(){ props.onChange(props.value + 1); }} aria-label="más">+</button>
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

function ReservaForm(props) {
  var cabanas = props.cabanas, reservas = props.reservas;
  var empty = function () {
    return {
      fechaVenta: FDL.todayIso(), cabanaId: "", inicioEstadia: "", finEstadia: "",
      horaInicio: "14:00", horaFin: "10:00", modoImporte: "total", importeIngresado: "",
      nombre: "", ciudadOrigen: "", celular: "", adultos: 2, menores: 0,
      anticipo: "", pagadoDepositoA: "", fechaDeposito: "", pagadoSaldoA: "", fechaPagoCliente: "", comision: "", notas: ""
    };
  };
  var fm = React.useState(empty());
  var f = fm[0], setF = fm[1];
  var okMsg = React.useState(false);
  var saved = okMsg[0], setSaved = okMsg[1];

  function set(k, v) { setF(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); }

  var cabana = cabanas.find(function (c) { return c.id === f.cabanaId; }) || null;
  var nn = FDL.noches(f);
  var totalCalc = FDL.importeTotal(f);
  var prom = FDL.promedioDia(f);
  var pax = FDL.pax(f);
  var excede = cabana && pax > cabana.maxPersonas;
  var rangoOk = f.inicioEstadia && f.finEstadia && nn > 0;
  var choca = rangoOk && cabana && FDL.rangoOcupado(reservas, cabana.id, f.inicioEstadia, f.finEstadia);

  var puedeGuardar = cabana && rangoOk && !choca && f.nombre.trim() && f.importeIngresado && !excede;

  function guardar() {
    if (!puedeGuardar) return;
    var r = Object.assign({}, f, { id: FDL.uid(), importeTotal: totalCalc });
    props.onSave(r);
    setF(empty());
    setSaved(true);
    setTimeout(function(){ setSaved(false); }, 3500);
    if (props.onGoCalendar) { /* opcional */ }
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
        {/* ---------- Columna izquierda: estadía ---------- */}
        <div className="card">
          <div className="card-title"><Icon.cabin size={18} /> Estadía</div>

          <div className="row-2">
            <Field label="Fecha de registro" help="Fecha en que se carga/concreta la venta. Por defecto es hoy.">
              <input type="date" className="inp" value={f.fechaVenta} onChange={function(e){ set("fechaVenta", e.target.value); }} />
            </Field>
            <Field label="Cabaña">
              <div style={{ position: "relative" }}>
                {cabana && <div className="fld-icon" style={{ left: 13 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: FDL.CABANA_COLORS[cabana.color].strong, display: "block" }}></span></div>}
                <select className={"inp sel-cab" + (cabana ? " has-icon" : "")}
                  value={f.cabanaId}
                  onChange={function(e){ set("cabanaId", e.target.value); set("inicioEstadia",""); set("finEstadia",""); }}>
                  <option value="">Elegí una cabaña…</option>
                  {cabanas.map(function (c) {
                    return <option key={c.id} value={c.id}>{c.nombre} · hasta {c.maxPersonas} pers.</option>;
                  })}
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
                  onChange={function(v){ set("inicioEstadia", v.ini); set("finEstadia", v.fin); }} />
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
                <input type="time" className="inp has-icon" value={f.horaInicio} onChange={function(e){ set("horaInicio", e.target.value); }} />
              </div>
            </Field>
            <Field label="Hora de salida" help="Check-out sugerido 10:00. Editable.">
              <div style={{ position: "relative" }}>
                <div className="fld-icon"><Icon.clock size={16} /></div>
                <input type="time" className="inp has-icon" value={f.horaFin} onChange={function(e){ set("horaFin", e.target.value); }} />
              </div>
            </Field>
          </div>
        </div>

        {/* ---------- Columna derecha: importe + cliente ---------- */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div className="card">
            <div className="card-title"><Icon.money size={18} /> Importe</div>
            <Field label="¿Cómo cargás el importe?" help="El total se calcula automáticamente según las noches.">
              <div className="toggle2">
                <button type="button" className={f.modoImporte === "total" ? "active" : ""} onClick={function(){ set("modoImporte","total"); }}>Importe total</button>
                <button type="button" className={f.modoImporte === "noche" ? "active" : ""} onClick={function(){ set("modoImporte","noche"); }}>Importe por noche</button>
              </div>
            </Field>
            <Field label={f.modoImporte === "total" ? "Importe total de la estadía" : "Importe por noche"} tight>
              <div style={{ position: "relative" }}>
                <div className="fld-icon" style={{ fontWeight: 700, color: "var(--ink-soft)" }}>$</div>
                <input className="inp has-icon" inputMode="numeric" placeholder="0"
                  value={f.importeIngresado}
                  onChange={function(e){ set("importeIngresado", e.target.value.replace(/[^\d]/g, "")); }} />
              </div>
            </Field>
            <div className="calc-strip">
              <div><span>Noches</span><b>{nn || "—"}</b></div>
              <div><span>Total estadía</span><b>{rangoOk && f.importeIngresado ? FDL.fmtMoney(totalCalc) : "—"}</b></div>
              <div><span>Promedio x día</span><b>{nn && f.importeIngresado ? FDL.fmtMoney(prom) : "—"}</b></div>
            </div>
          </div>

          <div className="card">
            <div className="card-title"><Icon.user size={18} /> Cliente</div>
            <Field label="Nombre y apellido">
              <div style={{ position: "relative" }}>
                <div className="fld-icon"><Icon.user size={16} /></div>
                <input className="inp has-icon" placeholder="Ej: Familia Gómez" value={f.nombre} onChange={function(e){ set("nombre", e.target.value); }} />
              </div>
            </Field>
            <div className="row-2">
              <Field label="Ciudad de origen" help="Empezá a escribir y elegí de la lista de ciudades de Argentina." helpW={240}>
                <CiudadInput value={f.ciudadOrigen} onChange={function(v){ set("ciudadOrigen", v); }} />
              </Field>
              <Field label="Celular">
                <div style={{ position: "relative" }}>
                  <div className="fld-icon"><Icon.phone size={15} /></div>
                  <input className="inp has-icon" placeholder="Ej: 341 555 1234" value={f.celular} onChange={function(e){ set("celular", e.target.value); }} />
                </div>
              </Field>
            </div>
            <div className="row-3">
              <Field label="Adultos" tight>
                <Stepper value={Number(f.adultos) || 0} min={1} onChange={function(v){ set("adultos", v); }} />
              </Field>
              <Field label="Menores" tight>
                <Stepper value={Number(f.menores) || 0} min={0} onChange={function(v){ set("menores", v); }} />
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
        <button type="button" className="btn-ghost" onClick={function(){ setF(empty()); }}>Limpiar</button>
        <button type="button" className="btn-primary" disabled={!puedeGuardar} onClick={guardar}>
          <Icon.check size={18} /> Guardar reserva
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ReservaForm: ReservaForm, CiudadInput: CiudadInput });
