/* Flor de Lis — pantalla de inicio de sesión (sin registro público). */
import React from "react";
import { useAuth } from "./AuthProvider";
import { BrandMark, Icon } from "../components/ui";

export function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const { error } = await signIn(email, pass);
    setBusy(false);
    if (error) setErr("No pudimos iniciar sesión. Revisá el email y la contraseña.");
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "var(--bg)" }}>
      <form className="card" onSubmit={submit} style={{ width: 380, maxWidth: "100%", padding: "30px 28px 28px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}><BrandMark /></div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, textAlign: "center", margin: "0 0 4px" }}>Gestión de reservas</h1>
        <p className="sub" style={{ textAlign: "center", margin: "0 0 22px", color: "var(--ink-faint)" }}>Acceso del personal</p>

        <label className="lbl">Email</label>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <div className="fld-icon"><Icon.user size={16} /></div>
          <input className="inp has-icon" type="email" autoComplete="username" placeholder="tu@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <label className="lbl">Contraseña</label>
        <div style={{ position: "relative", marginBottom: 18 }}>
          <div className="fld-icon"><Icon.shield size={16} /></div>
          <input className="inp has-icon" type="password" autoComplete="current-password" placeholder="••••••••"
            value={pass} onChange={(e) => setPass(e.target.value)} required />
        </div>

        {err && <div className="err-box" style={{ marginBottom: 14 }}><Icon.x size={15} /> {err}</div>}

        <button className="btn-primary" type="submit" disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
          {busy ? "Ingresando…" : "Ingresar"}
        </button>

        <p style={{ fontSize: 12, color: "var(--ink-faint)", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
          ¿No tenés acceso? Pedíle al administrador que te cree una cuenta.
        </p>
      </form>
    </div>
  );
}
