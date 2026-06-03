/* Flor de Lis — Tabla de reservas (transacciones, edición inline) */

function ReservasTable(props) {
  var cabanas = props.cabanas,reservas = props.reservas;
  var qs = React.useState("");
  var q = qs[0],setQ = qs[1];
  var sortS = React.useState({ k: "inicioEstadia", dir: 1 });
  var sort = sortS[0],setSort = sortS[1];

  function upd(id, k, v) {props.onUpdate(id, k, v);}

  var filtered = reservas.filter(function (r) {
    if (!q) return true;
    var hay = (r.nombre + " " + r.ciudadOrigen + " " + r.celular).toLowerCase();
    return hay.indexOf(q.toLowerCase()) !== -1;
  });
  filtered = filtered.slice().sort(function (a, b) {
    var av = a[sort.k],bv = b[sort.k];
    if (av < bv) return -1 * sort.dir;if (av > bv) return 1 * sort.dir;return 0;
  });

  function setSortK(k) {setSort(function (p) {return { k: k, dir: p.k === k ? -p.dir : 1 };});}

  // totales
  var tot = filtered.reduce(function (a, r) {
    a.total += FDL.importeTotal(r);a.anticipo += Number(r.anticipo) || 0;
    a.saldo += FDL.saldo(r);a.comision += Number(r.comision) || 0;
    a.flor += FDL.saldoFlorDeLis(r);a.pax += FDL.pax(r);a.noches += FDL.noches(r);
    return a;
  }, { total: 0, anticipo: 0, saldo: 0, comision: 0, flor: 0, pax: 0, noches: 0 });

  function exportCSV() {
    var heads = ["Fecha Venta", "Cabaña", "Inicio", "Fin", "Noches", "Mes", "Familia", "PAX", "Menores", "Zona origen", "Celular", "Importe total", "Promedio x día", "Anticipo", "Pagado a", "Fecha depósito", "Saldo", "Pagado a", "Fecha pago cliente", "Comisión", "Saldo a Flor de Lis"];
    var rows = filtered.map(function (r) {
      var c = cabanas.find(function (x) {return x.id === r.cabanaId;}) || {};
      return [r.fechaVenta, c.nombre || "", r.inicioEstadia, r.finEstadia, FDL.noches(r), FDL.MESES[FDL.parseIso(r.inicioEstadia).getMonth()], r.nombre, FDL.pax(r), r.menores, r.ciudadOrigen, r.celular, FDL.importeTotal(r), Math.round(FDL.promedioDia(r)), r.anticipo, r.pagadoDepositoA, r.fechaDeposito, FDL.saldo(r), r.pagadoSaldoA, r.fechaPagoCliente, r.comision, FDL.saldoFlorDeLis(r)];
    });
    var csv = [heads].concat(rows).map(function (row) {
      return row.map(function (x) {return '"' + String(x == null ? "" : x).replace(/"/g, '""') + '"';}).join(",");
    }).join("\n");
    var blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");a.href = url;a.download = "reservas-flor-de-lis.csv";a.click();
    URL.revokeObjectURL(url);
  }

  var cols = [
  { k: "fechaVenta", t: "Fecha venta", sortable: true },
  { k: "cabanaId", t: "Cabaña", sortable: true },
  { k: "inicioEstadia", t: "Inicio estadía", sortable: true },
  { k: "finEstadia", t: "Fin estadía", sortable: true },
  { k: "noches", t: "Noches", calc: true },
  { k: "mes", t: "Mes", calc: true },
  { k: "nombre", t: "Familia", sortable: true },
  { k: "pax", t: "PAX", calc: true },
  { k: "menores", t: "Menores" },
  { k: "ciudadOrigen", t: "Zona origen", sortable: true },
  { k: "celular", t: "Celular" },
  { k: "importe", t: "Importe total", money: true },
  { k: "promedio", t: "Prom. x día", calc: true, money: true },
  { k: "anticipo", t: "Anticipo", money: true },
  { k: "pagadoDepositoA", t: "Pagado a" },
  { k: "fechaDeposito", t: "Fecha depósito", date: true },
  { k: "saldo", t: "Saldo", calc: true, money: true },
  { k: "pagadoSaldoA", t: "Pagado a" },
  { k: "fechaPagoCliente", t: "Fecha pago cliente", date: true },
  { k: "comision", t: "Comisión", money: true },
  { k: "flor", t: "Saldo a Flor de Lis", calc: true, money: true }];


  return (/*#__PURE__*/
    React.createElement("div", { className: "page wide" }, /*#__PURE__*/
    React.createElement("div", { className: "page-head" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h1", null, "Reservas"), /*#__PURE__*/
    React.createElement("p", { className: "sub" }, "Una fila por reserva. Las columnas grises se calculan solas; el resto se edita ac\xE1 mismo.")
    ), /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "center" } }, /*#__PURE__*/
    React.createElement("div", { className: "search-box" }, /*#__PURE__*/
    React.createElement(Icon.search, { size: 16 }), /*#__PURE__*/
    React.createElement("input", { placeholder: "Buscar familia, ciudad\u2026", value: q, onChange: function (e) {setQ(e.target.value);} })
    ), /*#__PURE__*/
    React.createElement("button", { className: "btn-soft", onClick: exportCSV }, /*#__PURE__*/React.createElement(Icon.download, { size: 16 }), " Exportar CSV")
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "tbl-info" }, /*#__PURE__*/
    React.createElement(Icon.info, { size: 14 }), " Tip: hac\xE9 clic en cualquier celda editable para modificarla. Los c\xE1lculos se actualizan al instante."
    ), /*#__PURE__*/

    React.createElement("div", { className: "tbl-scroll" }, /*#__PURE__*/
    React.createElement("table", { className: "tx-table" }, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/
    React.createElement("tr", null,
    cols.map(function (col) {
      return (/*#__PURE__*/
        React.createElement("th", { key: col.k, className: (col.calc ? "calc" : "") + (col.money ? " num" : ""),
          onClick: col.sortable ? function () {setSortK(col.k);} : undefined,
          style: { cursor: col.sortable ? "pointer" : "default" } }, /*#__PURE__*/
        React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } },
        col.t,
        col.calc && /*#__PURE__*/React.createElement(Help, { width: 180 }, "Columna calculada autom\xE1ticamente."),
        col.sortable && sort.k === col.k && /*#__PURE__*/React.createElement(Icon.chevD, { size: 12, style: { transform: sort.dir < 0 ? "rotate(180deg)" : "none" } })
        )
        ));

    }), /*#__PURE__*/
    React.createElement("th", { className: "sticky-r" })
    )
    ), /*#__PURE__*/
    React.createElement("tbody", null,
    filtered.map(function (r) {
      var c = cabanas.find(function (x) {return x.id === r.cabanaId;}) || {};
      var col = FDL.CABANA_COLORS[c.color] || {};
      var m = FDL.parseIso(r.inicioEstadia);
      return (/*#__PURE__*/
        React.createElement("tr", { key: r.id }, /*#__PURE__*/
        React.createElement("td", null, /*#__PURE__*/React.createElement("input", { type: "date", className: "cell", value: r.fechaVenta, onChange: function (e) {upd(r.id, "fechaVenta", e.target.value);} })), /*#__PURE__*/
        React.createElement("td", { className: "cell-cab" }, /*#__PURE__*/
        React.createElement("select", { className: "cell sel", value: r.cabanaId, onChange: function (e) {upd(r.id, "cabanaId", e.target.value);}, style: { color: col.ink, background: col.soft } },
        cabanas.map(function (cc) {return /*#__PURE__*/React.createElement("option", { key: cc.id, value: cc.id }, cc.nombre);})
        )
        ), /*#__PURE__*/
        React.createElement("td", null, /*#__PURE__*/React.createElement("input", { type: "date", className: "cell", value: r.inicioEstadia, onChange: function (e) {upd(r.id, "inicioEstadia", e.target.value);} })), /*#__PURE__*/
        React.createElement("td", null, /*#__PURE__*/React.createElement("input", { type: "date", className: "cell", value: r.finEstadia, onChange: function (e) {upd(r.id, "finEstadia", e.target.value);} })), /*#__PURE__*/
        React.createElement("td", { className: "calc num" }, FDL.noches(r)), /*#__PURE__*/
        React.createElement("td", { className: "calc" }, m ? FDL.MESES_ABR[m.getMonth()] : "—"), /*#__PURE__*/
        React.createElement("td", null, /*#__PURE__*/React.createElement("input", { className: "cell", value: r.nombre, onChange: function (e) {upd(r.id, "nombre", e.target.value);} })), /*#__PURE__*/
        React.createElement("td", { className: "calc num" }, FDL.pax(r)), /*#__PURE__*/
        React.createElement("td", null, /*#__PURE__*/React.createElement("input", { className: "cell num", inputMode: "numeric", value: r.menores, onChange: function (e) {upd(r.id, "menores", e.target.value.replace(/[^\d]/g, ""));} })), /*#__PURE__*/
        React.createElement("td", null, /*#__PURE__*/React.createElement("input", { className: "cell wide-cell", value: r.ciudadOrigen, onChange: function (e) {upd(r.id, "ciudadOrigen", e.target.value);} })), /*#__PURE__*/
        React.createElement("td", null, /*#__PURE__*/React.createElement("input", { className: "cell", value: r.celular, onChange: function (e) {upd(r.id, "celular", e.target.value);} })), /*#__PURE__*/
        React.createElement("td", { className: "num" }, /*#__PURE__*/
        React.createElement("div", { className: "money-cell" }, /*#__PURE__*/
        React.createElement("input", { className: "cell num", inputMode: "numeric", value: r.importeIngresado, onChange: function (e) {upd(r.id, "importeIngresado", e.target.value.replace(/[^\d]/g, ""));} }), /*#__PURE__*/
        React.createElement("button", { className: "mode-chip" + (r.modoImporte === "noche" ? " noche" : ""), title: "Cambiar entre total y por noche",
          onClick: function () {upd(r.id, "modoImporte", r.modoImporte === "noche" ? "total" : "noche");} },
        r.modoImporte === "noche" ? "/noche" : "total"
        )
        )
        ), /*#__PURE__*/
        React.createElement("td", { className: "calc num" }, FDL.fmtMoney(FDL.promedioDia(r))), /*#__PURE__*/
        React.createElement("td", { className: "num" }, /*#__PURE__*/React.createElement("input", { className: "cell num", inputMode: "numeric", value: r.anticipo, onChange: function (e) {upd(r.id, "anticipo", e.target.value.replace(/[^\d]/g, ""));} })), /*#__PURE__*/
        React.createElement("td", null, /*#__PURE__*/React.createElement("input", { className: "cell", placeholder: "\u2014", value: r.pagadoDepositoA, onChange: function (e) {upd(r.id, "pagadoDepositoA", e.target.value);} })), /*#__PURE__*/
        React.createElement("td", null, /*#__PURE__*/React.createElement("input", { type: "date", className: "cell", value: r.fechaDeposito, onChange: function (e) {upd(r.id, "fechaDeposito", e.target.value);} })), /*#__PURE__*/
        React.createElement("td", { className: "calc num" + (FDL.saldo(r) > 0 ? " pend" : "") }, FDL.fmtMoney(FDL.saldo(r))), /*#__PURE__*/
        React.createElement("td", null, /*#__PURE__*/React.createElement("input", { className: "cell", placeholder: "\u2014", value: r.pagadoSaldoA, onChange: function (e) {upd(r.id, "pagadoSaldoA", e.target.value);} })), /*#__PURE__*/
        React.createElement("td", null, /*#__PURE__*/React.createElement("input", { type: "date", className: "cell", value: r.fechaPagoCliente, onChange: function (e) {upd(r.id, "fechaPagoCliente", e.target.value);} })), /*#__PURE__*/
        React.createElement("td", { className: "num" }, /*#__PURE__*/React.createElement("input", { className: "cell num", inputMode: "numeric", value: r.comision, onChange: function (e) {upd(r.id, "comision", e.target.value.replace(/[^\d]/g, ""));} })), /*#__PURE__*/
        React.createElement("td", { className: "calc num strong" }, FDL.fmtMoney(FDL.saldoFlorDeLis(r))), /*#__PURE__*/
        React.createElement("td", { className: "sticky-r" }, /*#__PURE__*/
        React.createElement("button", { className: "row-del", title: "Eliminar reserva", onClick: function () {if (confirm("¿Eliminar la reserva de " + r.nombre + "?")) props.onDelete(r.id);} }, /*#__PURE__*/React.createElement(Icon.trash, { size: 15 }))
        )
        ));

    }),
    filtered.length === 0 && /*#__PURE__*/
    React.createElement("tr", null, /*#__PURE__*/React.createElement("td", { colSpan: cols.length + 1, className: "empty-row" }, "No hay reservas que coincidan."))

    ),
    filtered.length > 0 && /*#__PURE__*/
    React.createElement("tfoot", null, /*#__PURE__*/
    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", { className: "ft-label", colSpan: 4 }, "Totales (", filtered.length, ")"), /*#__PURE__*/
    React.createElement("td", { className: "num" }, tot.noches), /*#__PURE__*/
    React.createElement("td", null), /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/
    React.createElement("td", { className: "num" }, tot.pax), /*#__PURE__*/
    React.createElement("td", { colSpan: 3 }), /*#__PURE__*/
    React.createElement("td", { className: "num" }, FDL.fmtMoney(tot.total)), /*#__PURE__*/
    React.createElement("td", null), /*#__PURE__*/
    React.createElement("td", { className: "num" }, FDL.fmtMoney(tot.anticipo)), /*#__PURE__*/
    React.createElement("td", { colSpan: 2 }), /*#__PURE__*/
    React.createElement("td", { className: "num" }, FDL.fmtMoney(tot.saldo)), /*#__PURE__*/
    React.createElement("td", { colSpan: 2 }), /*#__PURE__*/
    React.createElement("td", { className: "num" }, FDL.fmtMoney(tot.comision)), /*#__PURE__*/
    React.createElement("td", { className: "num strong" }, FDL.fmtMoney(tot.flor)), /*#__PURE__*/
    React.createElement("td", { className: "sticky-r" })
    )
    )

    )
    )
    ));

}

Object.assign(window, { ReservasTable: ReservasTable });