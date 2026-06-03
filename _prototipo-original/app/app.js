/* Flor de Lis — App shell + navegación + estado global */

function App() {
  var initial = React.useState(function () {return FDL.load();});
  var state = initial[0],setState = initial[1];
  var nav = React.useState("dashboard");
  var route = nav[0],setRoute = nav[1];

  // persistir en cada cambio
  React.useEffect(function () {FDL.save(state);}, [state]);

  function addReserva(r) {
    setState(function (s) {return Object.assign({}, s, { reservas: s.reservas.concat([r]) });});
  }
  function updateReserva(id, k, v) {
    setState(function (s) {
      return Object.assign({}, s, {
        reservas: s.reservas.map(function (r) {
          if (r.id !== id) return r;
          var n = Object.assign({}, r);
          n[k] = v;
          if (k === "importeIngresado" || k === "modoImporte") n.importeTotal = FDL.importeTotal(n);
          return n;
        })
      });
    });
  }
  function deleteReserva(id) {
    setState(function (s) {return Object.assign({}, s, { reservas: s.reservas.filter(function (r) {return r.id !== id;}) });});
  }
  function addCabana(c) {setState(function (s) {return Object.assign({}, s, { cabanas: s.cabanas.concat([c]) });});}
  function updateCabana(id, k, v) {
    setState(function (s) {
      return Object.assign({}, s, { cabanas: s.cabanas.map(function (c) {if (c.id !== id) return c;var n = Object.assign({}, c);n[k] = v;return n;}) });
    });
  }
  function deleteCabana(id) {setState(function (s) {return Object.assign({}, s, { cabanas: s.cabanas.filter(function (c) {return c.id !== id;}) });});}

  function resetDemo() {
    if (!confirm("Esto reemplaza todo con los datos de ejemplo. ¿Continuar?")) return;
    FDL.resetAll();
    setState({ cabanas: FDL.DEFAULT_CABANAS.slice(), reservas: FDL.seedReservas() });
  }

  var items = [
  { k: "dashboard", t: "Dashboard", ico: "dashboard" },
  { k: "registrar", t: "Registrar reserva", ico: "plus" },
  { k: "calendario", t: "Calendario", ico: "calendar" },
  { k: "reservas", t: "Reservas", ico: "table" },
  { k: "cabanas", t: "Cabañas", ico: "cabin" }];


  var pendientes = state.reservas.filter(function (r) {return FDL.saldo(r) > 0;}).length;

  return (/*#__PURE__*/
    React.createElement("div", { className: "app" }, /*#__PURE__*/
    React.createElement("aside", { className: "sidebar" }, /*#__PURE__*/
    React.createElement("div", { className: "side-brand" }, /*#__PURE__*/React.createElement(BrandMark, null)), /*#__PURE__*/
    React.createElement("nav", { className: "side-nav" },
    items.map(function (it) {
      var I = Icon[it.ico];
      var active = route === it.k;
      return (/*#__PURE__*/
        React.createElement("button", { key: it.k, className: "nav-item" + (active ? " active" : ""), onClick: function () {setRoute(it.k);} }, /*#__PURE__*/
        React.createElement(I, { size: 19 }), " ", /*#__PURE__*/React.createElement("span", null, it.t),
        it.k === "registrar" && /*#__PURE__*/React.createElement("span", { className: "nav-plus" }, "+")
        ));

    })
    ), /*#__PURE__*/
    React.createElement("div", { className: "side-foot" }, /*#__PURE__*/
    React.createElement("div", { className: "side-stat" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, state.reservas.length), /*#__PURE__*/React.createElement("span", null, "reservas")), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, state.cabanas.length), /*#__PURE__*/React.createElement("span", null, "caba\xF1as"))
    ),
    pendientes > 0 && /*#__PURE__*/React.createElement("div", { className: "side-pend" }, /*#__PURE__*/React.createElement(Icon.clock, { size: 14 }), " ", pendientes, " con saldo pendiente"), /*#__PURE__*/
    React.createElement("button", { className: "reset-btn", onClick: resetDemo, title: "Restaurar datos de ejemplo" }, "Restaurar demo")
    )
    ), /*#__PURE__*/

    React.createElement("main", { className: "main" },
    route === "dashboard" && /*#__PURE__*/React.createElement(Dashboard, { cabanas: state.cabanas, reservas: state.reservas }),
    route === "registrar" && /*#__PURE__*/React.createElement(ReservaForm, { cabanas: state.cabanas, reservas: state.reservas, onSave: addReserva }),
    route === "calendario" && /*#__PURE__*/React.createElement(Calendario, { cabanas: state.cabanas, reservas: state.reservas, onDelete: deleteReserva }),
    route === "reservas" && /*#__PURE__*/React.createElement(ReservasTable, { cabanas: state.cabanas, reservas: state.reservas, onUpdate: updateReserva, onDelete: deleteReserva }),
    route === "cabanas" && /*#__PURE__*/React.createElement(Cabanas, { cabanas: state.cabanas, reservas: state.reservas, onAdd: addCabana, onUpdate: updateCabana, onDelete: deleteCabana })
    )
    ));

}

ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));