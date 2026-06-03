/* Flor de Lis — Pantalla Registrar Reserva */

function CiudadInput(props) {
  var st = React.useState(false);
  var open = st[0],setOpen = st[1];
  var hi = React.useState(0);
  var idx = hi[0],setIdx = hi[1];
  var q = props.value || "";
  var matches = React.useMemo(function () {
    if (!q || q.length < 1) return [];
    var ql = q.toLowerCase();
    return FDL.CIUDADES_AR.filter(function (c) {return c.toLowerCase().indexOf(ql) !== -1;}).slice(0, 7);
  }, [q]);
  return (/*#__PURE__*/
    React.createElement("div", { style: { position: "relative" } }, /*#__PURE__*/
    React.createElement("div", { className: "fld-icon" }, /*#__PURE__*/React.createElement(Icon.pin, { size: 17 })), /*#__PURE__*/
    React.createElement("input", {
      className: "inp has-icon",
      value: q,
      placeholder: "Ciudad de origen\u2026",
      onChange: function (e) {props.onChange(e.target.value);setOpen(true);setIdx(0);},
      onFocus: function () {if (matches.length) setOpen(true);},
      onBlur: function () {setTimeout(function () {setOpen(false);}, 150);},
      onKeyDown: function (e) {
        if (!open || !matches.length) return;
        if (e.key === "ArrowDown") {e.preventDefault();setIdx(Math.min(idx + 1, matches.length - 1));} else
        if (e.key === "ArrowUp") {e.preventDefault();setIdx(Math.max(idx - 1, 0));} else
        if (e.key === "Enter") {e.preventDefault();props.onChange(matches[idx]);setOpen(false);} else
        if (e.key === "Escape") {setOpen(false);}
      } }
    ),
    open && matches.length > 0 && /*#__PURE__*/
    React.createElement("div", { className: "ac-list" },
    matches.map(function (m, i) {
      return (/*#__PURE__*/
        React.createElement("div", { key: m, className: "ac-item" + (i === idx ? " hl" : ""),
          onMouseDown: function () {props.onChange(m);setOpen(false);},
          onMouseEnter: function () {setIdx(i);} }, /*#__PURE__*/
        React.createElement(Icon.pin, { size: 14, style: { color: "var(--ink-faint)", flexShrink: 0 } }), /*#__PURE__*/
        React.createElement("span", null, m)
        ));

    })
    )

    ));

}

function Stepper(props) {
  return (/*#__PURE__*/
    React.createElement("div", { className: "stepper" }, /*#__PURE__*/
    React.createElement("button", { type: "button", onClick: function () {props.onChange(Math.max(props.min || 0, props.value - 1));}, "aria-label": "menos" }, "\u2013"), /*#__PURE__*/
    React.createElement("span", null, props.value), /*#__PURE__*/
    React.createElement("button", { type: "button", onClick: function () {props.onChange(props.value + 1);}, "aria-label": "m\xE1s" }, "+")
    ));

}

function Field(props) {
  return (/*#__PURE__*/
    React.createElement("div", { style: { marginBottom: props.tight ? 0 : 18 } }, /*#__PURE__*/
    React.createElement("label", { className: "lbl" },
    props.label,
    props.help && /*#__PURE__*/React.createElement(Help, { width: props.helpW }, props.help)
    ),
    props.children
    ));

}

function ReservaForm(props) {
  var cabanas = props.cabanas,reservas = props.reservas;
  var empty = function () {
    return {
      fechaVenta: FDL.todayIso(), cabanaId: "", inicioEstadia: "", finEstadia: "",
      horaInicio: "14:00", horaFin: "10:00", modoImporte: "total", importeIngresado: "",
      nombre: "", ciudadOrigen: "", celular: "", adultos: 2, menores: 0,
      anticipo: "", pagadoDepositoA: "", fechaDeposito: "", pagadoSaldoA: "", fechaPagoCliente: "", comision: "", notas: ""
    };
  };
  var fm = React.useState(empty());
  var f = fm[0],setF = fm[1];
  var okMsg = React.useState(false);
  var saved = okMsg[0],setSaved = okMsg[1];

  function set(k, v) {setF(function (p) {var n = Object.assign({}, p);n[k] = v;return n;});}

  var cabana = cabanas.find(function (c) {return c.id === f.cabanaId;}) || null;
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
    setTimeout(function () {setSaved(false);}, 3500);
    if (props.onGoCalendar) {/* opcional */}
  }

  return (/*#__PURE__*/
    React.createElement("div", { className: "page" }, /*#__PURE__*/
    React.createElement("div", { className: "page-head" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h1", null, "Registrar reserva"), /*#__PURE__*/
    React.createElement("p", { className: "sub" }, "Carg\xE1 una nueva estad\xEDa. Los campos de c\xE1lculo se completan solos.")
    ),
    saved && /*#__PURE__*/React.createElement("div", { className: "toast-ok" }, /*#__PURE__*/React.createElement(Icon.check, { size: 16 }), " Reserva guardada")
    ), /*#__PURE__*/

    React.createElement("div", { className: "form-grid" }, /*#__PURE__*/

    React.createElement("div", { className: "card" }, /*#__PURE__*/
    React.createElement("div", { className: "card-title" }, /*#__PURE__*/React.createElement(Icon.cabin, { size: 18 }), " Estad\xEDa"), /*#__PURE__*/

    React.createElement("div", { className: "row-2" }, /*#__PURE__*/
    React.createElement(Field, { label: "Fecha de registro", help: "Fecha en que se carga/concreta la venta. Por defecto es hoy." }, /*#__PURE__*/
    React.createElement("input", { type: "date", className: "inp", value: f.fechaVenta, onChange: function (e) {set("fechaVenta", e.target.value);} })
    ), /*#__PURE__*/
    React.createElement(Field, { label: "Caba\xF1a" }, /*#__PURE__*/
    React.createElement("div", { style: { position: "relative" } },
    cabana && /*#__PURE__*/React.createElement("div", { className: "fld-icon", style: { left: 13 } }, /*#__PURE__*/React.createElement("span", { style: { width: 11, height: 11, borderRadius: 3, background: FDL.CABANA_COLORS[cabana.color].strong, display: "block" } })), /*#__PURE__*/
    React.createElement("select", { className: "inp sel-cab" + (cabana ? " has-icon" : ""),
      value: f.cabanaId,
      onChange: function (e) {set("cabanaId", e.target.value);set("inicioEstadia", "");set("finEstadia", "");} }, /*#__PURE__*/
    React.createElement("option", { value: "" }, "Eleg\xED una caba\xF1a\u2026"),
    cabanas.map(function (c) {
      return /*#__PURE__*/React.createElement("option", { key: c.id, value: c.id }, c.nombre, " \xB7 hasta ", c.maxPersonas, " pers.");
    })
    ), /*#__PURE__*/
    React.createElement("div", { className: "fld-icon", style: { left: "auto", right: 13 } }, /*#__PURE__*/React.createElement(Icon.chevD, { size: 16 }))
    )
    )
    ), /*#__PURE__*/

    React.createElement(Field, { label: "Fechas de la estad\xEDa", help: cabana ? "Tocá el día de ingreso y luego el de egreso. Las fechas ocupadas para esta cabaña aparecen bloqueadas." : "Primero elegí una cabaña para ver su disponibilidad." },
    !cabana && /*#__PURE__*/React.createElement("div", { className: "hint-box" }, "Eleg\xED una caba\xF1a arriba para habilitar el calendario."),
    cabana && /*#__PURE__*/
    React.createElement("div", { className: "picker-wrap" }, /*#__PURE__*/
    React.createElement(RangePicker, { cabana: cabana, reservas: reservas,
      value: { ini: f.inicioEstadia, fin: f.finEstadia },
      onChange: function (v) {set("inicioEstadia", v.ini);set("finEstadia", v.fin);} })
    ),

    choca && /*#__PURE__*/React.createElement("div", { className: "err-box" }, /*#__PURE__*/React.createElement(Icon.x, { size: 15 }), " Ese rango se superpone con otra reserva de ", cabana.nombre, ".")
    ), /*#__PURE__*/

    React.createElement("div", { className: "row-2" }, /*#__PURE__*/
    React.createElement(Field, { label: "Inicio de reserva" }, /*#__PURE__*/
    React.createElement("div", { className: "inp-readonly" }, f.inicioEstadia ? FDL.fmtFecha(f.inicioEstadia) : "—")
    ), /*#__PURE__*/
    React.createElement(Field, { label: "Fin de reserva" }, /*#__PURE__*/
    React.createElement("div", { className: "inp-readonly" }, f.finEstadia ? FDL.fmtFecha(f.finEstadia) : "—")
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "row-2" }, /*#__PURE__*/
    React.createElement(Field, { label: "Hora de ingreso", help: "Check-in sugerido 14:00. Editable." }, /*#__PURE__*/
    React.createElement("div", { style: { position: "relative" } }, /*#__PURE__*/
    React.createElement("div", { className: "fld-icon" }, /*#__PURE__*/React.createElement(Icon.clock, { size: 16 })), /*#__PURE__*/
    React.createElement("input", { type: "time", className: "inp has-icon", value: f.horaInicio, onChange: function (e) {set("horaInicio", e.target.value);} })
    )
    ), /*#__PURE__*/
    React.createElement(Field, { label: "Hora de salida", help: "Check-out sugerido 10:00. Editable." }, /*#__PURE__*/
    React.createElement("div", { style: { position: "relative" } }, /*#__PURE__*/
    React.createElement("div", { className: "fld-icon" }, /*#__PURE__*/React.createElement(Icon.clock, { size: 16 })), /*#__PURE__*/
    React.createElement("input", { type: "time", className: "inp has-icon", value: f.horaFin, onChange: function (e) {set("horaFin", e.target.value);} })
    )
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 22 } }, /*#__PURE__*/
    React.createElement("div", { className: "card" }, /*#__PURE__*/
    React.createElement("div", { className: "card-title" }, /*#__PURE__*/React.createElement(Icon.money, { size: 18 }), " Importe"), /*#__PURE__*/
    React.createElement(Field, { label: "\xBFC\xF3mo carg\xE1s el importe?", help: "El total se calcula autom\xE1ticamente seg\xFAn las noches." }, /*#__PURE__*/
    React.createElement("div", { className: "toggle2" }, /*#__PURE__*/
    React.createElement("button", { type: "button", className: f.modoImporte === "total" ? "active" : "", onClick: function () {set("modoImporte", "total");} }, "Importe total"), /*#__PURE__*/
    React.createElement("button", { type: "button", className: f.modoImporte === "noche" ? "active" : "", onClick: function () {set("modoImporte", "noche");} }, "Importe por noche")
    )
    ), /*#__PURE__*/
    React.createElement(Field, { label: f.modoImporte === "total" ? "Importe total de la estadía" : "Importe por noche", tight: true }, /*#__PURE__*/
    React.createElement("div", { style: { position: "relative" } }, /*#__PURE__*/
    React.createElement("div", { className: "fld-icon", style: { fontWeight: 700, color: "var(--ink-soft)" } }, "$"), /*#__PURE__*/
    React.createElement("input", { className: "inp has-icon", inputMode: "numeric", placeholder: "0",
      value: f.importeIngresado,
      onChange: function (e) {set("importeIngresado", e.target.value.replace(/[^\d]/g, ""));} })
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "calc-strip" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Noches"), /*#__PURE__*/React.createElement("b", null, nn || "—")), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Total estad\xEDa"), /*#__PURE__*/React.createElement("b", null, rangoOk && f.importeIngresado ? FDL.fmtMoney(totalCalc) : "—")), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Promedio x d\xEDa"), /*#__PURE__*/React.createElement("b", null, nn && f.importeIngresado ? FDL.fmtMoney(prom) : "—"))
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "card" }, /*#__PURE__*/
    React.createElement("div", { className: "card-title" }, /*#__PURE__*/React.createElement(Icon.user, { size: 18 }), " Cliente"), /*#__PURE__*/
    React.createElement(Field, { label: "Nombre y apellido" }, /*#__PURE__*/
    React.createElement("div", { style: { position: "relative" } }, /*#__PURE__*/
    React.createElement("div", { className: "fld-icon" }, /*#__PURE__*/React.createElement(Icon.user, { size: 16 })), /*#__PURE__*/
    React.createElement("input", { className: "inp has-icon", placeholder: "Ej: Familia G\xF3mez", value: f.nombre, onChange: function (e) {set("nombre", e.target.value);} })
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "row-2" }, /*#__PURE__*/
    React.createElement(Field, { label: "Ciudad de origen", help: "Empez\xE1 a escribir y eleg\xED de la lista de ciudades de Argentina.", helpW: 240 }, /*#__PURE__*/
    React.createElement(CiudadInput, { value: f.ciudadOrigen, onChange: function (v) {set("ciudadOrigen", v);} })
    ), /*#__PURE__*/
    React.createElement(Field, { label: "Celular" }, /*#__PURE__*/
    React.createElement("div", { style: { position: "relative" } }, /*#__PURE__*/
    React.createElement("div", { className: "fld-icon" }, /*#__PURE__*/React.createElement(Icon.phone, { size: 15 })), /*#__PURE__*/
    React.createElement("input", { className: "inp has-icon", placeholder: "Ej: 341 555 1234", value: f.celular, onChange: function (e) {set("celular", e.target.value);} })
    )
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "row-3" }, /*#__PURE__*/
    React.createElement(Field, { label: "Adultos", tight: true }, /*#__PURE__*/
    React.createElement(Stepper, { value: Number(f.adultos) || 0, min: 1, onChange: function (v) {set("adultos", v);} })
    ), /*#__PURE__*/
    React.createElement(Field, { label: "Menores", tight: true }, /*#__PURE__*/
    React.createElement(Stepper, { value: Number(f.menores) || 0, min: 0, onChange: function (v) {set("menores", v);} })
    ), /*#__PURE__*/
    React.createElement(Field, { label: "Total personas", tight: true, help: "Suma de adultos y menores." }, /*#__PURE__*/
    React.createElement("div", { className: "pax-total" + (excede ? " over" : "") }, /*#__PURE__*/
    React.createElement(Icon.users, { size: 17 }), " ", pax
    )
    )
    ),
    excede && /*#__PURE__*/React.createElement("div", { className: "err-box" }, /*#__PURE__*/React.createElement(Icon.x, { size: 15 }), " ", cabana.nombre, " admite hasta ", cabana.maxPersonas, " personas.")
    )
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "form-actions" }, /*#__PURE__*/
    React.createElement("button", { type: "button", className: "btn-ghost", onClick: function () {setF(empty());} }, "Limpiar"), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "btn-primary", disabled: !puedeGuardar, onClick: guardar }, /*#__PURE__*/
    React.createElement(Icon.check, { size: 18 }), " Guardar reserva"
    )
    )
    ));

}

Object.assign(window, { ReservaForm: ReservaForm, CiudadInput: CiudadInput });