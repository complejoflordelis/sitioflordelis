/* Flor de Lis — Gastos de administración (rendición con foto de factura). */
import React from "react";
import * as FDL from "../lib/fdl";
import { Icon } from "../components/ui";
import { isConfigured } from "../lib/supabaseClient";

export function Gastos({ cabanas, gastos, onAdd, onDelete, uploadFactura, facturaUrl }) {
  const vacio = () => ({ fecha: FDL.todayIso(), tipo: "mantenimiento", monto: "", cabanaId: "", detalle: "" });
  const [form, setForm] = React.useState(vacio());
  const [file, setFile] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [q, setQ] = React.useState("");
  const fileRef = React.useRef(null);

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  async function crear(e) {
    e.preventDefault();
    if (!form.monto) return;
    setBusy(true);
    let facturaPath = "";
    if (file && isConfigured) facturaPath = await uploadFactura(file);
    await onAdd({ ...form, facturaPath });
    setBusy(false);
    setForm(vacio());
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function verFactura(path) {
    const url = await facturaUrl(path);
    if (url) window.open(url, "_blank", "noopener");
  }

  const filtrados = gastos.filter((g) => {
    if (!q) return true;
    const hay = (FDL.GASTO_TIPO_LABEL[g.tipo] + " " + (g.detalle || "")).toLowerCase();
    return hay.indexOf(q.toLowerCase()) !== -1;
  });
  const totalGeneral = filtrados.reduce((a, g) => a + (Number(g.monto) || 0), 0);
  const mesAct = FDL.todayIso().slice(0, 7);
  const totalMes = gastos.filter((g) => (g.fecha || "").slice(0, 7) === mesAct).reduce((a, g) => a + (Number(g.monto) || 0), 0);
  const cabName = (id) => { const c = cabanas.find((x) => x.id === id); return c ? c.nombre : "Común / General"; };

  return (
    <div className="page wide">
      <div className="page-head">
        <div>
          <h1>Gastos</h1>
          <p className="sub">Rendición de gastos del complejo: mantenimiento, limpieza, servicios y más, con su comprobante.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div className="kpi" style={{ padding: 12 }}>
            <div className="kpi-ico" style={{ background: "var(--brand-50)", color: "var(--brand-700)", width: 36, height: 36 }}><Icon.receipt size={18} /></div>
            <div><div className="kpi-num" style={{ fontSize: 18 }}>{FDL.fmtMoney(totalMes)}</div><div className="kpi-lbl">Este mes</div></div>
          </div>
        </div>
      </div>

      <div className="form-grid">
        <div className="card">
          <div className="card-title"><Icon.plus size={18} /> Registrar gasto</div>
          <form onSubmit={crear}>
            <div className="row-2" style={{ marginBottom: 14 }}>
              <div>
                <label className="lbl">Fecha</label>
                <input type="date" className="inp" value={form.fecha} onChange={(e) => set("fecha", e.target.value)} />
              </div>
              <div>
                <label className="lbl">Tipo de gasto</label>
                <select className="inp" value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
                  {FDL.GASTO_TIPOS.map((t) => <option key={t} value={t}>{FDL.GASTO_TIPO_LABEL[t]}</option>)}
                </select>
              </div>
            </div>
            <div className="row-2" style={{ marginBottom: 14 }}>
              <div>
                <label className="lbl">Monto</label>
                <div style={{ position: "relative" }}>
                  <div className="fld-icon" style={{ fontWeight: 700, color: "var(--ink-soft)" }}>$</div>
                  <input className="inp has-icon" inputMode="numeric" placeholder="0" value={form.monto}
                    onChange={(e) => set("monto", e.target.value.replace(/[^\d]/g, ""))} required />
                </div>
              </div>
              <div>
                <label className="lbl">¿A qué corresponde?</label>
                <select className="inp" value={form.cabanaId} onChange={(e) => set("cabanaId", e.target.value)}>
                  <option value="">Común / General</option>
                  {cabanas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="lbl">Detalle</label>
              <input className="inp" placeholder="Ej: Reparación de termotanque" value={form.detalle} onChange={(e) => set("detalle", e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="lbl">Foto de la factura {!isConfigured && <span style={{ color: "var(--ink-faint)", fontWeight: 500 }}>(disponible en modo nube)</span>}</label>
              <input ref={fileRef} id="factura-file" type="file" accept="image/*,application/pdf" style={{ display: "none" }}
                disabled={!isConfigured} onChange={(e) => setFile(e.target.files && e.target.files[0])} />
              <label htmlFor="factura-file" style={{
                display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 11,
                border: "1.5px dashed " + (file ? "var(--brand-300)" : "var(--line-strong)"),
                background: file ? "var(--brand-50)" : "var(--surface-2)",
                cursor: isConfigured ? "pointer" : "not-allowed", opacity: isConfigured ? 1 : 0.55,
                color: file ? "var(--brand-700)" : "var(--ink-soft)", fontWeight: 600, fontSize: 13.5, transition: "all .14s",
              }}>
                {file ? <Icon.check size={18} /> : <Icon.camera size={18} />}
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                  {file ? file.name : "Elegir foto o PDF…"}
                </span>
                {file
                  ? <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                      style={{ color: "var(--ink-faint)", display: "inline-flex" }} title="Quitar"><Icon.x size={16} /></span>
                  : <span className="btn-soft" style={{ height: 28, padding: "0 12px", pointerEvents: "none" }}>Examinar</span>}
              </label>
            </div>
            <button className="btn-primary" type="submit" disabled={busy || !form.monto} style={{ width: "100%", justifyContent: "center" }}>
              {busy ? "Guardando…" : <><Icon.check size={18} /> Guardar gasto</>}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-title" style={{ justifyContent: "space-between" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}><Icon.receipt size={18} /> Gastos ({filtrados.length})</span>
            <div className="search-box" style={{ height: 34 }}>
              <Icon.search size={15} />
              <input placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 130 }} />
            </div>
          </div>
          {filtrados.length === 0 ? (
            <div className="hint-box">Todavía no cargaste gastos.</div>
          ) : (
            <div className="modal-rows">
              {filtrados.map((g) => (
                <div key={g.id} style={{ alignItems: "center" }}>
                  <span style={{ flexDirection: "column", alignItems: "flex-start", gap: 3 }}>
                    <b style={{ color: "var(--ink)" }}>{FDL.GASTO_TIPO_LABEL[g.tipo] || g.tipo}{g.detalle ? " · " + g.detalle : ""}</b>
                    <span style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 500 }}>
                      {FDL.fmtFecha(g.fecha)} · {cabName(g.cabanaId)}
                    </span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {g.facturaPath && (
                      <button className="icon-btn subtle" title="Ver factura" onClick={() => verFactura(g.facturaPath)}><Icon.camera size={16} /></button>
                    )}
                    <b style={{ fontVariantNumeric: "tabular-nums" }}>{FDL.fmtMoney(g.monto)}</b>
                    <button className="row-del" title="Eliminar" onClick={() => { if (confirm("¿Eliminar este gasto?")) onDelete(g.id); }}><Icon.trash size={15} /></button>
                  </span>
                </div>
              ))}
              <div style={{ alignItems: "center", borderTop: "2px solid var(--line-strong)", marginTop: 2 }}>
                <span style={{ fontWeight: 700, color: "var(--ink)" }}>Total {q ? "(filtro)" : "general"}</span>
                <b style={{ fontSize: 16, color: "var(--brand-800)" }}>{FDL.fmtMoney(totalGeneral)}</b>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
