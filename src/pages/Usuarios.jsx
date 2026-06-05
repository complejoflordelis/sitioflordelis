/* Flor de Lis — Administración de usuarios (solo admin).
   Crea operadores vía Edge Function (no hay registro público). */
import React from "react";
import { supabase, isConfigured } from "../lib/supabaseClient";
import { Icon, Badge } from "../components/ui";
import { useAuth } from "../auth/AuthProvider";

export function Usuarios() {
  const auth = useAuth();
  const miId = auth && auth.session ? auth.session.user.id : null;
  const [lista, setLista] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState({ email: "", nombre: "", username: "", password: "", rol: "operador" });
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
    setForm({ email: "", nombre: "", username: "", password: "", rol: "operador" });
    cargar();
  }

  async function toggleActivo(p) {
    await supabase.from("profiles").update({ activo: !p.activo }).eq("id", p.id);
    cargar();
  }

  function setCampo(id, campo, val) {
    setLista((prev) => prev.map((x) => (x.id === id ? { ...x, [campo]: val } : x)));
  }
  async function guardarNombre(p) {
    const { error } = await supabase.from("profiles").update({ nombre: p.nombre }).eq("id", p.id);
    if (error) setMsg({ tipo: "err", txt: error.message });
  }
  async function guardarUsername(p) {
    const { error } = await supabase.from("profiles").update({ username: p.username ? p.username : null }).eq("id", p.id);
    if (error) setMsg({ tipo: "err", txt: /duplicate|unique/i.test(error.message) ? "Ese nombre de usuario ya está en uso." : error.message });
    else setMsg({ tipo: "ok", txt: "Usuario actualizado." });
  }
  async function guardarRol(p, rol) {
    setCampo(p.id, "rol", rol);
    const { error } = await supabase.from("profiles").update({ rol }).eq("id", p.id);
    if (error) setMsg({ tipo: "err", txt: error.message });
  }
  async function eliminar(p) {
    if (!window.confirm("¿Eliminar a " + (p.nombre || p.email) + "? Esta acción no se puede deshacer.")) return;
    const { data, error } = await supabase.functions.invoke("admin-delete-user", { body: { id: p.id } });
    if (error || (data && data.error)) {
      setMsg({ tipo: "err", txt: (data && data.error) || "No se pudo eliminar el usuario." });
      return;
    }
    setMsg({ tipo: "ok", txt: "Usuario eliminado." });
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
            <div className="row-2" style={{ marginBottom: 14 }}>
              <div>
                <label className="lbl">Nombre</label>
                <input className="inp" value={form.nombre} placeholder="Ej: Recepción"
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div>
                <label className="lbl">Usuario <span style={{ color: "var(--ink-faint)", fontWeight: 500 }}>(para login)</span></label>
                <input className="inp" value={form.username} placeholder="Ej: recepcion" autoCapitalize="none" spellCheck="false"
                  onChange={(e) => setForm({ ...form, username: e.target.value.replace(/\s/g, "") })} />
              </div>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {lista.map((p) => {
                const esYo = p.id === miId;
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", padding: "12px 0", borderTop: "1px solid var(--line)" }}>
                    <div style={{ flex: "1 1 200px", minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                      <input className="inp" style={{ height: 38 }} value={p.nombre || ""} placeholder="Nombre"
                        onChange={(e) => setCampo(p.id, "nombre", e.target.value)} onBlur={() => guardarNombre(p)} />
                      <div style={{ position: "relative" }}>
                        <div className="fld-icon"><Icon.user size={14} /></div>
                        <input className="inp has-icon" style={{ height: 34, fontSize: 13 }} value={p.username || ""} placeholder="usuario (para login)"
                          autoCapitalize="none" spellCheck="false"
                          onChange={(e) => setCampo(p.id, "username", e.target.value.replace(/\s/g, ""))} onBlur={() => guardarUsername(p)} />
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ink-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
                        {p.email}
                        {p.activo === false && <Badge tone="danger">Inactivo</Badge>}
                        {esYo && <Badge tone="gold">Vos</Badge>}
                      </div>
                    </div>
                    <select className="inp" style={{ height: 38, width: 134, flexShrink: 0 }} value={p.rol} disabled={esYo}
                      onChange={(e) => guardarRol(p, e.target.value)}>
                      <option value="operador">Operador</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <button className="btn-soft" style={{ height: 38, flexShrink: 0 }} onClick={() => toggleActivo(p)}>
                      {p.activo === false ? "Activar" : "Desactivar"}
                    </button>
                    {!esYo && (
                      <button className="row-del" title="Eliminar usuario" onClick={() => eliminar(p)}><Icon.trash size={16} /></button>
                    )}
                  </div>
                );
              })}
              {lista.length === 0 && <div className="muted" style={{ paddingTop: 10 }}>Todavía no hay usuarios.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
