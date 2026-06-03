/* Flor de Lis — Cabañas (tabla editable) */

function Cabanas(props) {
  var cabanas = props.cabanas, reservas = props.reservas;

  function countRes(id) { return reservas.filter(function(r){ return r.cabanaId === id; }).length; }

  function addCab() {
    var usados = cabanas.map(function(c){ return c.color; });
    var color = FDL.COLOR_ORDER.find(function(c){ return usados.indexOf(c) === -1; }) || "arena";
    props.onAdd({ id: "c" + Date.now().toString(36), nombre: "Cabaña " + (cabanas.length + 1), maxPersonas: 4, color: color });
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Cabañas</h1>
          <p className="sub">Definí tus cabañas, su capacidad y el color con que aparecen en el calendario.</p>
        </div>
        <button className="btn-primary" onClick={addCab}><Icon.plus size={18} /> Agregar cabaña</button>
      </div>

      <div className="cab-grid">
        {cabanas.map(function (c) {
          var col = FDL.CABANA_COLORS[c.color];
          var n = countRes(c.id);
          return (
            <div className="cab-card" key={c.id} style={{ borderTopColor: col.strong }}>
              <div className="cab-card-top">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: col.soft, border: "1px solid " + col.mid, display: "grid", placeItems: "center", color: col.ink }}>
                  <Icon.cabin size={22} />
                </div>
                {cabanas.length > 1 && (
                  <button className="icon-btn subtle" title="Eliminar cabaña"
                    onClick={function(){ if (confirm("¿Eliminar " + c.nombre + "? Esto no borra sus reservas.")) props.onDelete(c.id); }}>
                    <Icon.trash size={16} />
                  </button>
                )}
              </div>
              <label className="cab-lbl">Nombre</label>
              <input className="inp" value={c.nombre} onChange={function(e){ props.onUpdate(c.id, "nombre", e.target.value); }} />

              <div className="row-2" style={{ marginTop: 12 }}>
                <div>
                  <label className="cab-lbl">Máx. personas</label>
                  <div className="stepper">
                    <button type="button" onClick={function(){ props.onUpdate(c.id,"maxPersonas", Math.max(1, (c.maxPersonas||1)-1)); }}>–</button>
                    <span>{c.maxPersonas}</span>
                    <button type="button" onClick={function(){ props.onUpdate(c.id,"maxPersonas", (c.maxPersonas||0)+1); }}>+</button>
                  </div>
                </div>
                <div>
                  <label className="cab-lbl">Color</label>
                  <div className="color-row">
                    {FDL.COLOR_ORDER.map(function (ck) {
                      var cc = FDL.CABANA_COLORS[ck];
                      var active = c.color === ck;
                      return (
                        <button key={ck} type="button" title={cc.label}
                          onClick={function(){ props.onUpdate(c.id, "color", ck); }}
                          className={"swatch" + (active ? " active" : "")}
                          style={{ background: cc.strong }}>
                          {active && <Icon.check size={13} color="#fff" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="cab-foot">
                <span><b>{n}</b> {n === 1 ? "reserva" : "reservas"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { Cabanas: Cabanas });
