/* Flor de Lis — App shell + navegación + estado global */

function App() {
  var initial = React.useState(function () { return FDL.load(); });
  var state = initial[0], setState = initial[1];
  var nav = React.useState("dashboard");
  var route = nav[0], setRoute = nav[1];

  // persistir en cada cambio
  React.useEffect(function () { FDL.save(state); }, [state]);

  function addReserva(r) {
    setState(function (s) { return Object.assign({}, s, { reservas: s.reservas.concat([r]) }); });
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
    setState(function (s) { return Object.assign({}, s, { reservas: s.reservas.filter(function (r){ return r.id !== id; }) }); });
  }
  function addCabana(c) { setState(function (s) { return Object.assign({}, s, { cabanas: s.cabanas.concat([c]) }); }); }
  function updateCabana(id, k, v) {
    setState(function (s) {
      return Object.assign({}, s, { cabanas: s.cabanas.map(function (c) { if (c.id !== id) return c; var n = Object.assign({}, c); n[k] = v; return n; }) });
    });
  }
  function deleteCabana(id) { setState(function (s) { return Object.assign({}, s, { cabanas: s.cabanas.filter(function (c){ return c.id !== id; }) }); }); }

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
    { k: "cabanas", t: "Cabañas", ico: "cabin" }
  ];

  var pendientes = state.reservas.filter(function (r){ return FDL.saldo(r) > 0; }).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="side-brand"><BrandMark /></div>
        <nav className="side-nav">
          {items.map(function (it) {
            var I = Icon[it.ico];
            var active = route === it.k;
            return (
              <button key={it.k} className={"nav-item" + (active ? " active" : "")} onClick={function(){ setRoute(it.k); }}>
                <I size={19} /> <span>{it.t}</span>
                {it.k === "registrar" && <span className="nav-plus">+</span>}
              </button>
            );
          })}
        </nav>
        <div className="side-foot">
          <div className="side-stat">
            <div><b>{state.reservas.length}</b><span>reservas</span></div>
            <div><b>{state.cabanas.length}</b><span>cabañas</span></div>
          </div>
          {pendientes > 0 && <div className="side-pend"><Icon.clock size={14} /> {pendientes} con saldo pendiente</div>}
          <button className="reset-btn" onClick={resetDemo} title="Restaurar datos de ejemplo">Restaurar demo</button>
        </div>
      </aside>

      <main className="main">
        {route === "dashboard" && <Dashboard cabanas={state.cabanas} reservas={state.reservas} />}
        {route === "registrar" && <ReservaForm cabanas={state.cabanas} reservas={state.reservas} onSave={addReserva} />}
        {route === "calendario" && <Calendario cabanas={state.cabanas} reservas={state.reservas} onDelete={deleteReserva} />}
        {route === "reservas" && <ReservasTable cabanas={state.cabanas} reservas={state.reservas} onUpdate={updateReserva} onDelete={deleteReserva} />}
        {route === "cabanas" && <Cabanas cabanas={state.cabanas} reservas={state.reservas} onAdd={addCabana} onUpdate={updateCabana} onDelete={deleteCabana} />}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
