/* Flor de Lis — capa de datos unificada.
   - Modo nube (Supabase configurado): lee/escribe en Postgres.
   - Modo local (sin configurar): guarda en localStorage, con datos de ejemplo. */
import React from "react";
import * as FDL from "../lib/fdl";
import { supabase, isConfigured } from "../lib/supabaseClient";
import { cabanaFromRow, cabanaToRow, reservaFromRow, reservaToRow } from "./mappers";

const LS_KEY = "florDeLis.v2";

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (!data.cabanas) data.cabanas = FDL.DEFAULT_CABANAS.slice();
      if (!data.reservas) data.reservas = [];
      return data;
    }
  } catch (e) { /* ignore */ }
  return { cabanas: FDL.DEFAULT_CABANAS.slice(), reservas: FDL.seedReservas() };
}
function saveLocal(state) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

export function useData(auth) {
  const [cabanas, setCabanas] = React.useState([]);
  const [reservas, setReservas] = React.useState([]);
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
        setCabanas(s.cabanas); setReservas(s.reservas); setLoading(false);
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
        if (!alive) return;
        setCabanas((cabRows || []).map(cabanaFromRow));
        setReservas((resRows || []).map(reservaFromRow));
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
    if (!isConfigured && !loading) saveLocal({ cabanas, reservas });
  }, [cabanas, reservas, loading]);

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
    let updated = null;
    setReservas((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const n = Object.assign({}, r); n[k] = v;
      if (k === "importeIngresado" || k === "modoImporte") n.importeTotal = FDL.importeTotal(n);
      updated = n; return n;
    }));
    if (isConfigured && updated) {
      const patch = reservaToRow(updated);
      const { error: e } = await supabase.from("reservas").update(patch).eq("id", id);
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
    let updated = null;
    setCabanas((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const n = Object.assign({}, c); n[k] = v; updated = n; return n;
    }));
    if (isConfigured && updated) {
      const patch = {}; const row = cabanaToRow(updated);
      const map = { nombre: "nombre", maxPersonas: "max_personas", color: "color" };
      patch[map[k] || k] = row[map[k] || k];
      const { error: e } = await supabase.from("cabanas").update(patch).eq("id", id);
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

  // ---------- Demo (solo modo local) ----------
  function resetDemo() {
    if (isConfigured) return;
    try { localStorage.removeItem(LS_KEY); } catch (e) { /* ignore */ }
    setCabanas(FDL.DEFAULT_CABANAS.slice());
    setReservas(FDL.seedReservas());
  }

  return {
    cabanas, reservas, loading, error,
    addReserva, updateReserva, deleteReserva,
    addCabana, updateCabana, deleteCabana,
    resetDemo,
  };
}
