/* Flor de Lis — Tabla de reservas (transacciones, edición inline) */
import React from "react";
import * as FDL from "../lib/fdl";
import { Icon, Help } from "../components/ui";
import { waLink } from "../lib/whatsapp";

export function ReservasTable(props) {
  const cabanas = props.cabanas, reservas = props.reservas;
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState({ k: "inicioEstadia", dir: 1 });

  function upd(id, k, v) { props.onUpdate(id, k, v); }

  let filtered = reservas.filter((r) => {
    if (!q) return true;
    const hay = (r.nombre + " " + r.ciudadOrigen + " " + r.celular).toLowerCase();
    return hay.indexOf(q.toLowerCase()) !== -1;
  });
  filtered = filtered.slice().sort((a, b) => {
    const av = a[sort.k], bv = b[sort.k];
    if (av < bv) return -1 * sort.dir; if (av > bv) return 1 * sort.dir; return 0;
  });

  function setSortK(k) { setSort((p) => ({ k, dir: p.k === k ? -p.dir : 1 })); }

  const tot = filtered.reduce((a, r) => {
    a.total += FDL.importeTotal(r); a.anticipo += Number(r.anticipo) || 0;
    a.saldo += FDL.saldo(r); a.comision += Number(r.comision) || 0;
    a.flor += FDL.saldoFlorDeLis(r); a.pax += FDL.pax(r); a.noches += FDL.noches(r);
    return a;
  }, { total: 0, anticipo: 0, saldo: 0, comision: 0, flor: 0, pax: 0, noches: 0 });

  function exportCSV() {
    const heads = ["Fecha Venta","Cabaña","Inicio","Fin","Noches","Mes","Familia","PAX","Menores","Zona origen","Celular","Importe total","Promedio x día","Anticipo","Pagado a","Fecha depósito","Saldo","Pagado a","Fecha pago cliente","Comisión","Saldo a Flor de Lis"];
    const rows = filtered.map((r) => {
      const c = cabanas.find((x) => x.id === r.cabanaId) || {};
      return [r.fechaVenta, c.nombre || "", r.inicioEstadia, r.finEstadia, FDL.noches(r), FDL.MESES[FDL.parseIso(r.inicioEstadia).getMonth()], r.nombre, FDL.pax(r), r.menores, r.ciudadOrigen, r.celular, FDL.importeTotal(r), Math.round(FDL.promedioDia(r)), r.anticipo, r.pagadoDepositoA, r.fechaDeposito, FDL.saldo(r), r.pagadoSaldoA, r.fechaPagoCliente, r.comision, FDL.saldoFlorDeLis(r)];
    });
    const csv = [heads].concat(rows).map((row) =>
      row.map((x) => '"' + String(x == null ? "" : x).replace(/"/g, '""') + '"').join(",")
    ).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "reservas-flor-de-lis.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const cols = [
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
    { k: "flor", t: "Saldo a Flor de Lis", calc: true, money: true },
  ];

  return (
    <div className="page wide">
      <div className="page-head">
        <div>
          <h1>Reservas</h1>
          <p className="sub">Una fila por reserva. Las columnas grises se calculan solas; el resto se edita acá mismo.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="search-box">
            <Icon.search size={16} />
            <input placeholder="Buscar familia, ciudad…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button className="btn-soft" onClick={exportCSV}><Icon.download size={16} /> Exportar CSV</button>
        </div>
      </div>

      <div className="tbl-info">
        <Icon.info size={14} /> Tip: hacé clic en cualquier celda editable para modificarla. Los cálculos se actualizan al instante.
      </div>

      <div className="tbl-scroll">
        <table className="tx-table">
          <thead>
            <tr>
              {cols.map((col) => (
                <th key={col.k} className={(col.calc ? "calc" : "") + (col.money ? " num" : "")}
                  onClick={col.sortable ? () => setSortK(col.k) : undefined}
                  style={{ cursor: col.sortable ? "pointer" : "default" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {col.t}
                    {col.calc && <Help width={180}>Columna calculada automáticamente.</Help>}
                    {col.sortable && sort.k === col.k && <Icon.chevD size={12} style={{ transform: sort.dir < 0 ? "rotate(180deg)" : "none" }} />}
                  </span>
                </th>
              ))}
              <th className="sticky-r"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const c = cabanas.find((x) => x.id === r.cabanaId) || {};
              const col = FDL.CABANA_COLORS[c.color] || {};
              const m = FDL.parseIso(r.inicioEstadia);
              const wa = waLink(r, c);
              return (
                <tr key={r.id}>
                  <td><input type="date" className="cell" value={r.fechaVenta} onChange={(e) => upd(r.id, "fechaVenta", e.target.value)} /></td>
                  <td className="cell-cab">
                    <select className="cell sel" value={r.cabanaId} onChange={(e) => upd(r.id, "cabanaId", e.target.value)} style={{ color: col.ink, background: col.soft }}>
                      {cabanas.map((cc) => <option key={cc.id} value={cc.id}>{cc.nombre}</option>)}
                    </select>
                  </td>
                  <td><input type="date" className="cell" value={r.inicioEstadia} onChange={(e) => upd(r.id, "inicioEstadia", e.target.value)} /></td>
                  <td><input type="date" className="cell" value={r.finEstadia} onChange={(e) => upd(r.id, "finEstadia", e.target.value)} /></td>
                  <td className="calc num">{FDL.noches(r)}</td>
                  <td className="calc">{m ? FDL.MESES_ABR[m.getMonth()] : "—"}</td>
                  <td><input className="cell" value={r.nombre} onChange={(e) => upd(r.id, "nombre", e.target.value)} /></td>
                  <td className="calc num">{FDL.pax(r)}</td>
                  <td><input className="cell num" inputMode="numeric" value={r.menores} onChange={(e) => upd(r.id, "menores", e.target.value.replace(/[^\d]/g, ""))} /></td>
                  <td><input className="cell wide-cell" value={r.ciudadOrigen} onChange={(e) => upd(r.id, "ciudadOrigen", e.target.value)} /></td>
                  <td><input className="cell" value={r.celular} onChange={(e) => upd(r.id, "celular", e.target.value)} /></td>
                  <td className="num">
                    <div className="money-cell">
                      <input className="cell num" inputMode="numeric" value={r.importeIngresado} onChange={(e) => upd(r.id, "importeIngresado", e.target.value.replace(/[^\d]/g, ""))} />
                      <button className={"mode-chip" + (r.modoImporte === "noche" ? " noche" : "")} title="Cambiar entre total y por noche"
                        onClick={() => upd(r.id, "modoImporte", r.modoImporte === "noche" ? "total" : "noche")}>
                        {r.modoImporte === "noche" ? "/noche" : "total"}
                      </button>
                    </div>
                  </td>
                  <td className="calc num">{FDL.fmtMoney(FDL.promedioDia(r))}</td>
                  <td className="num"><input className="cell num" inputMode="numeric" value={r.anticipo} onChange={(e) => upd(r.id, "anticipo", e.target.value.replace(/[^\d]/g, ""))} /></td>
                  <td><input className="cell" placeholder="—" value={r.pagadoDepositoA} onChange={(e) => upd(r.id, "pagadoDepositoA", e.target.value)} /></td>
                  <td><input type="date" className="cell" value={r.fechaDeposito} onChange={(e) => upd(r.id, "fechaDeposito", e.target.value)} /></td>
                  <td className={"calc num" + (FDL.saldo(r) > 0 ? " pend" : "")}>{FDL.fmtMoney(FDL.saldo(r))}</td>
                  <td><input className="cell" placeholder="—" value={r.pagadoSaldoA} onChange={(e) => upd(r.id, "pagadoSaldoA", e.target.value)} /></td>
                  <td><input type="date" className="cell" value={r.fechaPagoCliente} onChange={(e) => upd(r.id, "fechaPagoCliente", e.target.value)} /></td>
                  <td className="num"><input className="cell num" inputMode="numeric" value={r.comision} onChange={(e) => upd(r.id, "comision", e.target.value.replace(/[^\d]/g, ""))} /></td>
                  <td className="calc num strong">{FDL.fmtMoney(FDL.saldoFlorDeLis(r))}</td>
                  <td className="sticky-r">
                    <div style={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                      {wa && <a className="row-del" style={{ color: "oklch(0.5 0.13 150)" }} href={wa} target="_blank" rel="noreferrer" title="Enviar WhatsApp"><Icon.whatsapp size={15} /></a>}
                      <button className="row-del" title="Eliminar reserva" onClick={() => { if (confirm("¿Eliminar la reserva de " + r.nombre + "?")) props.onDelete(r.id); }}><Icon.trash size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={cols.length + 1} className="empty-row">No hay reservas que coincidan.</td></tr>
            )}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr>
                <td className="ft-label" colSpan={4}>Totales ({filtered.length})</td>
                <td className="num">{tot.noches}</td>
                <td></td><td></td>
                <td className="num">{tot.pax}</td>
                <td colSpan={3}></td>
                <td className="num">{FDL.fmtMoney(tot.total)}</td>
                <td></td>
                <td className="num">{FDL.fmtMoney(tot.anticipo)}</td>
                <td colSpan={2}></td>
                <td className="num">{FDL.fmtMoney(tot.saldo)}</td>
                <td colSpan={2}></td>
                <td className="num">{FDL.fmtMoney(tot.comision)}</td>
                <td className="num strong">{FDL.fmtMoney(tot.flor)}</td>
                <td className="sticky-r"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
