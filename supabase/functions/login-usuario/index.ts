// Flor de Lis — Edge Function: login con nombre de usuario O email.
// Resuelve el username a email (service role) y autentica; nunca expone emails.
// Se invoca SIN sesión -> deploy con verify_jwt = false.
//   supabase functions deploy login-usuario --no-verify-jwt
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  try {
    const { login, password } = await req.json();
    if (!login || !password) return json({ error: "Faltan usuario o contraseña" }, 400);

    let email = String(login).trim();
    if (email.indexOf("@") === -1) {
      // Es un username: resolver a email con la service role (bypassa RLS).
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
      const pat = email.replace(/([%_\\])/g, "\\$1"); // exacto, case-insensitive
      const { data: prof } = await admin.from("profiles").select("email, activo").ilike("username", pat).maybeSingle();
      if (!prof || !prof.email) return json({ error: "Usuario o contraseña incorrectos" }, 400);
      if (prof.activo === false) return json({ error: "Tu cuenta está desactivada por el administrador" }, 403);
      email = prof.email;
    }

    const anon = createClient(SUPABASE_URL, ANON, { auth: { persistSession: false } });
    const { data, error } = await anon.auth.signInWithPassword({ email, password });
    if (error || !data?.session) return json({ error: "Usuario o contraseña incorrectos" }, 400);
    return json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
  } catch (e) {
    return json({ error: (e as Error).message || "Error interno" }, 500);
  }
});
