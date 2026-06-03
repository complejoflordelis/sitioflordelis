/* Flor de Lis — Cabañas (tabla editable) */

function Cabanas(props) {
  var cabanas = props.cabanas,reservas = props.reservas;

  function countRes(id) {return reservas.filter(function (r) {return r.cabanaId === id;}).length;}

  function addCab() {
    var usados = cabanas.map(function (c) {return c.color;});
    var color = FDL.COLOR_ORDER.find(function (c) {return usados.indexOf(c) === -1;}) || "arena";
    props.onAdd({ id: "c" + Date.now().toString(36), nombre: "Cabaña " + (cabanas.length + 1), maxPersonas: 4, color: color });
  }

  return (/*#__PURE__*/
    React.createElement("div", { className: "page" }, /*#__PURE__*/
    React.createElement("div", { className: "page-head" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h1", null, "Caba\xF1as"), /*#__PURE__*/
    React.createElement("p", { className: "sub" }, "Defin\xED tus caba\xF1as, su capacidad y el color con que aparecen en el calendario.")
    ), /*#__PURE__*/
    React.createElement("button", { className: "btn-primary", onClick: addCab }, /*#__PURE__*/React.createElement(Icon.plus, { size: 18 }), " Agregar caba\xF1a")
    ), /*#__PURE__*/

    React.createElement("div", { className: "cab-grid" },
    cabanas.map(function (c) {
      var col = FDL.CABANA_COLORS[c.color];
      var n = countRes(c.id);
      return (/*#__PURE__*/
        React.createElement("div", { className: "cab-card", key: c.id, style: { borderTopColor: col.strong } }, /*#__PURE__*/
        React.createElement("div", { className: "cab-card-top" }, /*#__PURE__*/
        React.createElement("div", { style: { width: 44, height: 44, borderRadius: 12, background: col.soft, border: "1px solid " + col.mid, display: "grid", placeItems: "center", color: col.ink } }, /*#__PURE__*/
        React.createElement(Icon.cabin, { size: 22 })
        ),
        cabanas.length > 1 && /*#__PURE__*/
        React.createElement("button", { className: "icon-btn subtle", title: "Eliminar caba\xF1a",
          onClick: function () {if (confirm("¿Eliminar " + c.nombre + "? Esto no borra sus reservas.")) props.onDelete(c.id);} }, /*#__PURE__*/
        React.createElement(Icon.trash, { size: 16 })
        )

        ), /*#__PURE__*/
        React.createElement("label", { className: "cab-lbl" }, "Nombre"), /*#__PURE__*/
        React.createElement("input", { className: "inp", value: c.nombre, onChange: function (e) {props.onUpdate(c.id, "nombre", e.target.value);} }), /*#__PURE__*/

        React.createElement("div", { className: "row-2", style: { marginTop: 12 } }, /*#__PURE__*/
        React.createElement("div", null, /*#__PURE__*/
        React.createElement("label", { className: "cab-lbl" }, "M\xE1x. personas"), /*#__PURE__*/
        React.createElement("div", { className: "stepper" }, /*#__PURE__*/
        React.createElement("button", { type: "button", onClick: function () {props.onUpdate(c.id, "maxPersonas", Math.max(1, (c.maxPersonas || 1) - 1));} }, "\u2013"), /*#__PURE__*/
        React.createElement("span", null, c.maxPersonas), /*#__PURE__*/
        React.createElement("button", { type: "button", onClick: function () {props.onUpdate(c.id, "maxPersonas", (c.maxPersonas || 0) + 1);} }, "+")
        )
        ), /*#__PURE__*/
        React.createElement("div", null, /*#__PURE__*/
        React.createElement("label", { className: "cab-lbl" }, "Color"), /*#__PURE__*/
        React.createElement("div", { className: "color-row" },
        FDL.COLOR_ORDER.map(function (ck) {
          var cc = FDL.CABANA_COLORS[ck];
          var active = c.color === ck;
          return (/*#__PURE__*/
            React.createElement("button", { key: ck, type: "button", title: cc.label,
              onClick: function () {props.onUpdate(c.id, "color", ck);},
              className: "swatch" + (active ? " active" : ""),
              style: { background: cc.strong } },
            active && /*#__PURE__*/React.createElement(Icon.check, { size: 13, color: "#fff" })
            ));

        })
        )
        )
        ), /*#__PURE__*/

        React.createElement("div", { className: "cab-foot" }, /*#__PURE__*/
        React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, n), " ", n === 1 ? "reserva" : "reservas")
        )
        ));

    })
    )
    ));

}

Object.assign(window, { Cabanas: Cabanas });