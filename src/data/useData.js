/* Flor de Lis — capa de datos unificada.
   - Modo nube (Supabase configurado): lee/escribe en Postgres.
   - Modo local (sin configurar): guarda en localStorage, con datos de ejemplo. */
import React from "react";
import * as FDL from "../lib/fdl";
import { supabase, isConfigured } from "../lib/supabaseClient";
import { cabanaFromRow, cabanaToRow, reservaFromRow, reservaToRow, gastoFromRow, gastoToRow } from "./mappers";

const LS_KEY = "florDeLis.v2";

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (!data.cabanas) data.cabanas = FDL.DEFAULT_CABANAS.slice();
      if (!data.reservas) data.reservas = [];
      if (!data.gastos) data.gastos = [];
      return data;
    }
  } catch (e) { /* ignore */ }
  return { cabanas: FDL.DEFAULT_CABANAS.slice(), reservas: FDL.seedReservas(), gastos: [] };
}
function saveLocal(state) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

export function useData(auth) {
  const [cabanas, setCabanas] = React.useState([]);
  const [reservas, setReservas] = React.useState([]);
  const [gastos, setGastos] = React.useState([]);
  const [solicitudes, setSolicitudes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // En modo nube necesitamos la sesión antes de consultar: si no, la RLS
  // rechaza todo (y al estar la tabla "vacía" intentaría sembrar sin permiso).
  const userId = auth && auth.session && auth.session.user ? auth.session.user.id : null;

  // ---------- Carga inicial ----------
  React.useEffect(() => {
    let alive = true;
    async function init() {
      if (!isConfigured) {
        const s = loadLocal();
        if (!alive) return;
        setCabanas(s.cabanas); setReservas(s.reservas); setGastos(s.gastos || []); setLoading(false);
        return;
      }
      if (!userId) { setLoading(true); return; } // esperar al login
      setLoading(true);
      try {
        let { data: cabRows, error: e1 } = await supabase.from("cabanas").select("*").order("orden", { ascending: true });
        if (e1) throw e1;
        // Proyecto nuevo sin cabañas: sembrar las 3 por defecto.
        if (!cabRows || cabRows.length === 0) {
          const seed = FDL.DEFAULT_CABANAS.map((c, i) => cabanaToRow({ ...c, orden: i }));
          const { data: ins, error: e2 } = await supabase.from("cabanas").insert(seed).select("*");
          if (e2) throw e2;
          cabRows = ins;
        }
        const { data: resRows, error: e3 } = await supabase.from("reservas").select("*").order("inicio_estadia", { ascending: true });
        if (e3) throw e3;
        const { data: gasRows, error: e4 } = await supabase.from("gastos").select("*").order("fecha", { ascending: false });
        if (e4) throw e4;
        const { data: solRows } = await supabase.from("solicitudes").select("*").order("created_at", { ascending: false });
        if (!alive) return;
        setCabanas((cabRows || []).map(cabanaFromRow));
        setReservas((resRows || []).map(reservaFromRow));
        setGastos((gasRows || []).map(gastoFromRow));
        setSolicitudes(solRows || []);
        setLoading(false);
      } catch (err) {
        if (!alive) return;
        setError(err.message || String(err));
        setLoading(false);
      }
    }
    init();
    return () => { alive = false; };
  }, [userId]);

  // Persistencia en modo local (cada cambio)
  React.useEffect(() => {
    if (!isConfigured && !loading) saveLocal({ cabanas, reservas, gastos });
  }, [cabanas, reservas, gastos, loading]);

  // ---------- Reservas ----------
  async function addReserva(r) {
    setReservas((prev) => prev.concat([r]));
    if (isConfigured) {
      const row = reservaToRow(r); delete row.id; // que la DB genere el uuid
      const { data, error: e } = await supabase.from("reservas").insert(row).select("*").single();
      if (e) { setError(e.message); return; }
      const mapped = reservaFromRow(data);
      setReservas((prev) => prev.map((x) => (x.id === r.id ? mapped : x)));
    }
  }

  async function updateReserva(id, k, v) {
    const current = reservas.find((r) => r.id === id);
    if (!current) return;
    const n = Object.assign({}, current, { [k]: v });
    if (k === "importeIngresado" || k === "modoImporte") n.importeTotal = FDL.importeTotal(n);
    setReservas((prev) => prev.map((r) => (r.id === id ? n : r)));
    if (isConfigured) {
      const { error: e } = await supabase.from("reservas").update(reservaToRow(n)).eq("id", id);
      if (e) setError(e.message);
    }
  }

  // Actualiza varios campos de una reserva de una sola vez (ej: saldar saldo).
  async function patchReserva(id, patch) {
    const current = reservas.find((r) => r.id === id);
    if (!current) return;
    const n = Object.assign({}, current, patch);
    n.importeTotal = FDL.importeTotal(n);
    setReservas((prev) => prev.map((r) => (r.id === id ? n : r)));
    if (isConfigured) {
      const { error: e } = await supabase.from("reservas").update(reservaToRow(n)).eq("id", id);
      if (e) setError(e.message);
    }
  }

  async function deleteReserva(id) {
    setReservas((prev) => prev.filter((r) => r.id !== id));
    if (isConfigured) {
      const { error: e } = await supabase.from("reservas").delete().eq("id", id);
      if (e) setError(e.message);
    }
  }

  // Rinde la comisión de Administración pendiente: estampa la fecha de rendición
  // en todas las reservas con comisión > 0 y sin rendir.
  async function rendirAdministracion(fecha) {
    const f = fecha || FDL.todayIso();
    const pendientes = reservas.filter((r) => !r.fechaRendicion && FDL.montoAdministracion(r) > 0);
    const ids = pendientes.map((r) => r.id);
    if (ids.length === 0) return { count: 0, total: 0 };
    const total = pendientes.reduce((a, r) => a + FDL.montoAdministracion(r), 0);
    setReservas((prev) => prev.map((r) => (ids.indexOf(r.id) !== -1 ? Object.assign({}, r, { fechaRendicion: f }) : r)));
    if (isConfigured) {
      const { error: e } = await supabase.from("reservas").update({ fecha_rendicion: f }).in("id", ids);
      if (e) setError(e.message);
    }
    return { count: ids.length, total };
  }

  // ---------- Cabañas ----------
  async function addCabana(c) {
    const orden = cabanas.length;
    const withOrden = { ...c, orden };
    setCabanas((prev) => prev.concat([withOrden]));
    if (isConfigured) {
      const { error: e } = await supabase.from("cabanas").insert(cabanaToRow(withOrden));
      if (e) setError(e.message);
    }
  }

  async function updateCabana(id, k, v) {
    setCabanas((prev) => prev.map((c) => (c.id === id ? Object.assign({}, c, { [k]: v }) : c)));
    if (isConfigured) {
      const col = { nombre: "nombre", maxPersonas: "max_personas", color: "color" }[k] || k;
      const { error: e } = await supabase.from("cabanas").update({ [col]: v }).eq("id", id);
      if (e) setError(e.message);
    }
  }

  async function deleteCabana(id) {
    setCabanas((prev) => prev.filter((c) => c.id !== id));
    if (isConfigured) {
      const { error: e } = await supabase.from("cabanas").delete().eq("id", id);
      if (e) setError(e.message);
    }
  }

  // ---------- Gastos ----------
  async function addGasto(g) {
    const localId = g.id || ("g" + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36));
    const withId = { ...g, id: localId };
    setGastos((prev) => [withId, ...prev]);
    if (isConfigured) {
      const { data, error: e } = await supabase.from("gastos").insert(gastoToRow(g)).select("*").single();
      if (e) { setError(e.message); return; }
      const mapped = gastoFromRow(data);
      setGastos((prev) => prev.map((x) => (x.id === localId ? mapped : x)));
    }
  }

  async function deleteGasto(id) {
    const g = gastos.find((x) => x.id === id);
    setGastos((prev) => prev.filter((x) => x.id !== id));
    if (isConfigured) {
      if (g && g.facturaPath) { try { await supabase.storage.from("facturas").remove([g.facturaPath]); } catch (e) { /* ignore */ } }
      const { error: e } = await supabase.from("gastos").delete().eq("id", id);
      if (e) setError(e.message);
    }
  }

  // Sube la foto de una factura al bucket privado y devuelve su ruta.
  async function uploadFactura(file) {
    if (!isConfigured || !file) return "";
    const ext = (file.name && file.name.indexOf(".") !== -1 ? file.name.split(".").pop() : "jpg").toLowerCase();
    const path = (userId || "anon") + "/" + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36) + "." + ext;
    const { error: e } = await supabase.storage.from("facturas").upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (e) { setError(e.message); return ""; }
    return path;
  }

  // URL temporal (firmada) para visualizar una factura guardada.
  async function facturaUrl(path) {
    if (!isConfigured || !path) return "";
    const { data, error: e } = await supabase.storage.from("facturas").createSignedUrl(path, 3600);
    if (e) return "";
    return data.signedUrl;
  }

  // ---------- Solicitudes (de la página pública) ----------
  async function atenderSolicitud(id, estado) {
    const nuevo = estado || "atendida";
    setSolicitudes((prev) => prev.map((s) => (s.id === id ? { ...s, estado: nuevo } : s)));
    if (isConfigured) {
      const { error: e } = await supabase.from("solicitudes").update({ estado: nuevo }).eq("id", id);
      if (e) setError(e.message);
    }
  }
  async function deleteSolicitud(id) {
    setSolicitudes((prev) => prev.filter((s) => s.id !== id));
    if (isConfigured) {
      const { error: e } = await supabase.from("solicitudes").delete().eq("id", id);
      if (e) setError(e.message);
    }
  }

  // ---------- Demo (solo modo local) ----------
  function resetDemo() {
    if (isConfigured) return;
    try { localStorage.removeItem(LS_KEY); } catch (e) { /* ignore */ }
    setCabanas(FDL.DEFAULT_CABANAS.slice());
    setReservas(FDL.seedReservas());
  }

  return {
    cabanas, reservas, gastos, solicitudes, loading, error,
    addReserva, updateReserva, patchReserva, deleteReserva, rendirAdministracion,
    addCabana, updateCabana, deleteCabana,
    addGasto, deleteGasto, uploadFactura, facturaUrl,
    atenderSolicitud, deleteSolicitud,
    resetDemo,
  };
}
