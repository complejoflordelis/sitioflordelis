/* Flor de Lis — contexto de autenticación.
   - Modo local: sesión ficticia con rol admin (sin login).
   - Modo nube: sesión real de Supabase + perfil (rol) desde la tabla profiles. */
import React from "react";
import { supabase, isConfigured, ADMIN_EMAIL } from "../lib/supabaseClient";

const AuthCtx = React.createContext(null);
export function useAuth() { return React.useContext(AuthCtx); }

export function AuthProvider({ children }) {
  const [session, setSession] = React.useState(null);
  const [profile, setProfile] = React.useState(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (!isConfigured) {
      // Modo local: usuario "demo" con permisos de admin.
      setProfile({ id: "local", email: "local@flordelis", nombre: "Modo local", rol: "admin", activo: true });
      setReady(true);
      return;
    }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      if (data.session) loadProfile(data.session.user);
      else setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess) loadProfile(sess.user);
      else { setProfile(null); setReady(true); }
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  async function loadProfile(user) {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setProfile(data);
      } else {
        // Sin perfil aún: derivar rol del email admin.
        const esAdmin = (user.email || "").toLowerCase() === ADMIN_EMAIL;
        setProfile({ id: user.id, email: user.email, nombre: user.email, rol: esAdmin ? "admin" : "operador", activo: true });
      }
    } catch (e) {
      setProfile({ id: user.id, email: user.email, nombre: user.email, rol: "operador", activo: true });
    } finally {
      setReady(true);
    }
  }

  async function signIn(email, password) {
    if (!isConfigured) return { error: null };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error };
  }

  async function signOut() {
    if (!isConfigured) return;
    await supabase.auth.signOut();
    setProfile(null); setSession(null);
  }

  const value = {
    ready,
    session,
    profile,
    isLocal: !isConfigured,
    isAdmin: profile && profile.rol === "admin",
    isActive: profile && profile.activo !== false,
    signIn,
    signOut,
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
