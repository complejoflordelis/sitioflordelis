/* Flor de Lis — Tabla de reservas (transacciones, edición inline) */
import React from "react";
import * as FDL from "../lib/fdl";
import { Icon, Help, Badge } from "../components/ui";
import { waLink } from "../lib/whatsapp";

export function ReservasTable(props) {
  const cabanas = props.cabanas, reservas = props.reservas;
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState({ k: "inicioEstadia", dir: 1 });

  function upd(id, k, v) { props.onUpdate(id, k, v); }
  function setSortK(k) { setSort((p) => ({ k, dir: p.k === k ? -p.dir : 1 })); }

  function dateCell(r, k) { return <input type="date" className="cell" value={r[k]} onChange={(e) => upd(r.id, k, e.target.value)} />; }
  function textCell(r, k, ph, wide) { return <input className={"cell" + (wide ? " wide-cell" : "")} placeholder={ph || ""} value={r[k]} onChange={(e) => upd(r.id, k, e.target.value)} />; }
  function numCell(r, k) { return <input className="cell num" inputMode="numeric" value={r[k]} onChange={(e) => upd(r.id, k, e.target.value.replace(/[^\d]/g, ""))} />; }

  // Modelo único de columnas: header, celda y total se mantienen alineados.
  const columns = [
    { key: "fechaVenta", header: "Fecha venta", sortable: true, cell: (r) => dateCell(r, "fechaVenta"), foot: () => "Totales (" + filtered.length + ")" },
    { key: "estado", header: "Estado", calc: true, cell: (r) => { const es = FDL.estadoReserva(r); return <Badge tone={FDL.ESTADO_TONE[es]}>{FDL.ESTADO_LABEL[es]}</Badge>; } },
    { key: "cabanaId", header: "Cabaña", sortable: true, tdClass: "cell-cab", cell: (r) => {
        const c = cabanas.find((x) => x.id === r.cabanaId) || {}; const col = FDL.CABANA_COLORS[c.color] || {};
        return <select className="cell sel" value={r.cabanaId} onChange={(e) => upd(r.id, "cabanaId", e.target.value)} style={{ color: col.ink, background: col.soft }}>{cabanas.map((cc) => <option key={cc.id} value={cc.id}>{cc.nombre}</option>)}</select>;
      } },
    { key: "inicioEstadia", header: "Inicio estadía", sortable: true, cell: (r) => dateCell(r, "inicioEstadia") },
    { key: "finEstadia", header: "Fin estadía", sortable: true, cell: (r) => dateCell(r, "finEstadia") },
    { key: "noches", header: "Noches", calc: true, num: true, cell: (r) => FDL.noches(r), foot: (t) => t.noches },
    { key: "mes", header: "Mes", calc: true, cell: (r) => { const m = FDL.parseIso(r.inicioEstadia); return m ? FDL.MESES_ABR[m.getMonth()] : "—"; } },
    { key: "nombre", header: "Familia", sortable: true, cell: (r) => textCell(r, "nombre") },
    { key: "pax", header: "PAX", calc: true, num: true, cell: (r) => FDL.pax(r), foot: (t) => t.pax },
    { key: "menores", header: "Menores", cell: (r) => numCell(r, "menores") },
    { key: "ciudadOrigen", header: "Zona origen", sortable: true, cell: (r) => textCell(r, "ciudadOrigen", "", true) },
    { key: "celular", header: "Celular", cell: (r) => textCell(r, "celular") },
    { key: "email", header: "Email", cell: (r) => textCell(r, "email", "—", true) },
    { key: "importe", header: "Importe total", num: true, cell: (r) => (
        <div className="money-cell">
          <input className="cell num" inputMode="numeric" value={r.importeIngresado} onChange={(e) => upd(r.id, "importeIngresado", e.target.value.replace(/[^\d]/g, ""))} />
          <button className={"mode-chip" + (r.modoImporte === "noche" ? " noche" : "")} title="Cambiar entre total y por noche" onClick={() => upd(r.id, "modoImporte", r.modoImporte === "noche" ? "total" : "noche")}>{r.modoImporte === "noche" ? "/noche" : "total"}</button>
        </div>
      ), foot: (t) => FDL.fmtMoney(t.total) },
    { key: "promedio", header: "Prom. x día", calc: true, num: true, cell: (r) => FDL.fmtMoney(FDL.promedioDia(r)) },
    { key: "anticipo", header: "Anticipo", num: true, cell: (r) => numCell(r, "anticipo"), foot: (t) => FDL.fmtMoney(t.anticipo) },
    { key: "pagadoDepositoA", header: "Pagó seña", cell: (r) => textCell(r, "pagadoDepositoA", "—") },
    { key: "fechaDeposito", header: "Fecha seña", cell: (r) => dateCell(r, "fechaDeposito") },
    { key: "saldo", header: "Saldo", calc: true, num: true, cell: (r) => { const s = FDL.saldoPendiente(r); return <span style={{ color: s > 0 ? "oklch(0.55 0.12 40)" : "var(--ink-soft)" }}>{FDL.fmtMoney(s)}</span>; }, foot: (t) => FDL.fmtMoney(t.saldo) },
    { key: "pagadoSaldoA", header: "Pagó saldo", cell: (r) => textCell(r, "pagadoSaldoA", "—") },
    { key: "fechaPagoCliente", header: "Fecha pago saldo", cell: (r) => dateCell(r, "fechaPagoCliente") },
    { key: "comisionPct", header: "Comisión %", num: true, cell: (r) => (
        <input className="cell num" inputMode="numeric" value={r.comisionPct ?? 30} onChange={(e) => upd(r.id, "comisionPct", e.target.value.replace(/[^\d]/g, ""))} />) },
    { key: "administracion", header: "Comisión a rendir", calc: true, num: true, strong: true,
      cell: (r) => <span title={r.fechaRendicion ? "Rendido el " + FDL.fmtFecha(r.fechaRendicion) + " (comisión " + FDL.fmtMoney(FDL.montoAdministracion(r)) + ")" : "Comisión " + FDL.comisionPct(r) + "%"}>{FDL.fmtMoney(FDL.adminPendiente(r))}</span>,
      foot: (t) => FDL.fmtMoney(t.admin) },
    { key: "propietario", header: "Propietario", calc: true, num: true, strong: true, cell: (r) => FDL.fmtMoney(FDL.montoPropietario(r)), foot: (t) => FDL.fmtMoney(t.prop) },
  ];

  let filtered = reservas.filter((r) => {
    if (!q) return true;
    const hay = (r.nombre + " " + r.ciudadOrigen + " " + r.celular + " " + (r.email || "")).toLowerCase();
    return hay.indexOf(q.toLowerCase()) !== -1;
  });
  filtered = filtered.slice().sort((a, b) => {
    const av = a[sort.k], bv = b[sort.k];
    if (av < bv) return -1 * sort.dir; if (av > bv) return 1 * sort.dir; return 0;
  });

  const tot = filtered.reduce((a, r) => {
    a.total += FDL.importeTotal(r); a.anticipo += Number(r.anticipo) || 0;
    a.saldo += FDL.saldoPendiente(r); a.admin += FDL.adminPendiente(r); a.prop += FDL.montoPropietario(r);
    a.pax += FDL.pax(r); a.noches += FDL.noches(r);
    return a;
  }, { total: 0, anticipo: 0, saldo: 0, admin: 0, prop: 0, pax: 0, noches: 0 });

  function exportCSV() {
    const heads = columns.map((c) => c.header).concat(["WhatsApp"]);
    const rows = filtered.map((r) => {
      const c = cabanas.find((x) => x.id === r.cabanaId) || {};
      const m = FDL.parseIso(r.inicioEstadia);
      return [
        r.fechaVenta, FDL.ESTADO_LABEL[FDL.estadoReserva(r)], c.nombre || "", r.inicioEstadia, r.finEstadia,
        FDL.noches(r), m ? FDL.MESES[m.getMonth()] : "", r.nombre, FDL.pax(r), r.menores, r.ciudadOrigen, r.celular, r.email || "",
        FDL.importeTotal(r), Math.round(FDL.promedioDia(r)), r.anticipo, r.pagadoDepositoA, r.fechaDeposito,
        FDL.saldoPendiente(r), r.pagadoSaldoA, r.fechaPagoCliente, FDL.comisionPct(r),
        FDL.adminPendiente(r), FDL.montoPropietario(r), "",
      ];
    });
    const csv = [heads].concat(rows).map((row) => row.map((x) => '"' + String(x == null ? "" : x).replace(/"/g, '""') + '"').join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "reservas-flor-de-lis.csv"; a.click();
    URL.revokeObjectURL(url);
  }

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
            <input placeholder="Buscar familia, ciudad, email…" value={q} onChange={(e) => setQ(e.target.value)} />
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
              {columns.map((col) => (
                <th key={col.key} className={(col.calc ? "calc" : "") + (col.num ? " num" : "")}
                  onClick={col.sortable ? () => setSortK(col.key) : undefined}
                  style={{ cursor: col.sortable ? "pointer" : "default" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {col.header}
                    {col.calc && <Help width={180}>Columna calculada automáticamente.</Help>}
                    {col.sortable && sort.k === col.key && <Icon.chevD size={12} style={{ transform: sort.dir < 0 ? "rotate(180deg)" : "none" }} />}
                  </span>
                </th>
              ))}
              <th className="sticky-r"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const c = cabanas.find((x) => x.id === r.cabanaId) || {};
              const wa = waLink(r, c);
              return (
                <tr key={r.id}>
                  {columns.map((col) => (
                    <td key={col.key} className={(col.calc ? "calc" : "") + (col.num ? " num" : "") + (col.strong ? " strong" : "") + (col.tdClass ? " " + col.tdClass : "")}>
                      {col.cell(r)}
                    </td>
                  ))}
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
              <tr><td colSpan={columns.length + 1} className="empty-row">No hay reservas que coincidan.</td></tr>
            )}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr>
                {columns.map((col) => (
                  <td key={col.key} className={(col.num ? "num" : "") + (col.strong ? " strong" : "")}>
                    {col.foot ? col.foot(tot) : ""}
                  </td>
                ))}
                <td className="sticky-r"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
