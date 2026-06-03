/* Flor de Lis — Administración de usuarios (solo admin).
   Crea operadores vía Edge Function (no hay registro público). */
import React from "react";
import { supabase, isConfigured } from "../lib/supabaseClient";
import { Icon, Badge } from "../components/ui";

export function Usuarios() {
  const [lista, setLista] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState({ email: "", nombre: "", password: "", rol: "operador" });
  const [msg, setMsg] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  async function cargar() {
    if (!isConfigured) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: true });
    setLista(data || []);
    setLoading(false);
  }
  React.useEffect(() => { cargar(); }, []);

  async function crear(e) {
    e.preventDefault();
    setMsg(null);
    if (!form.email || !form.password) { setMsg({ tipo: "err", txt: "Completá email y contraseña." }); return; }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-create-user", { body: form });
    setBusy(false);
    if (error || (data && data.error)) {
      setMsg({ tipo: "err", txt: (data && data.error) || "No se pudo crear el usuario." });
      return;
    }
    setMsg({ tipo: "ok", txt: "Usuario creado: " + form.email });
    setForm({ email: "", nombre: "", password: "", rol: "operador" });
    cargar();
  }

  async function toggleActivo(p) {
    await supabase.from("profiles").update({ activo: !p.activo }).eq("id", p.id);
    cargar();
  }

  if (!isConfigured) {
    return (
      <div className="page">
        <div className="page-head"><div><h1>Usuarios</h1><p className="sub">Gestión del personal que accede al sistema.</p></div></div>
        <div className="hint-box" style={{ maxWidth: 560 }}>
          La gestión de usuarios funciona cuando la app está conectada a Supabase (nube).
          Ahora estás en <b>Modo local</b>: no hay login ni usuarios.
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Usuarios</h1><p className="sub">Solo el administrador puede crear y gestionar accesos.</p></div>
      </div>

      <div className="form-grid">
        <div className="card">
          <div className="card-title"><Icon.plus size={18} /> Crear usuario</div>
          <form onSubmit={crear}>
            <div style={{ marginBottom: 14 }}>
              <label className="lbl">Nombre</label>
              <input className="inp" value={form.nombre} placeholder="Ej: Recepción"
                onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="lbl">Email</label>
              <input className="inp" type="email" value={form.email} placeholder="persona@email.com"
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="row-2" style={{ marginBottom: 18 }}>
              <div>
                <label className="lbl">Contraseña inicial</label>
                <input className="inp" type="text" value={form.password} placeholder="mínimo 6 caracteres"
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div>
                <label className="lbl">Rol</label>
                <select className="inp" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                  <option value="operador">Operador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            {msg && (
              <div className={msg.tipo === "ok" ? "toast-ok" : "err-box"} style={{ marginBottom: 14 }}>
                {msg.tipo === "ok" ? <Icon.check size={15} /> : <Icon.x size={15} />} {msg.txt}
              </div>
            )}
            <button className="btn-primary" type="submit" disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
              {busy ? "Creando…" : "Crear usuario"}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-title"><Icon.users size={18} /> Personal ({lista.length})</div>
          {loading ? <div className="muted">Cargando…</div> : (
            <div className="modal-rows">
              {lista.map((p) => (
                <div key={p.id} style={{ alignItems: "center" }}>
                  <span style={{ flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                    <b style={{ color: "var(--ink)" }}>{p.nombre || p.email}</b>
                    <span style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 500 }}>{p.email}</span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {p.rol === "admin"
                      ? <Badge tone="gold"><Icon.shield size={12} /> Admin</Badge>
                      : <Badge tone="neutral">Operador</Badge>}
                    {p.activo === false
                      ? <Badge tone="danger">Inactivo</Badge>
                      : <Badge tone="ok">Activo</Badge>}
                    <button className="btn-soft" style={{ height: 32, padding: "0 10px" }} onClick={() => toggleActivo(p)}>
                      {p.activo === false ? "Activar" : "Desactivar"}
                    </button>
                  </span>
                </div>
              ))}
              {lista.length === 0 && <div className="muted">Todavía no hay usuarios.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
