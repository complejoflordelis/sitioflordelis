// Flor de Lis — Edge Function: crear usuarios (solo admin).
// Verifica que QUIEN llama sea admin y crea la cuenta con la service role key.
// Deploy: supabase functions deploy admin-create-user
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
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "Falta autenticación" }, 401);

    // 1) Identificar al que llama y validar que sea admin.
    const caller = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: uerr } = await caller.auth.getUser(token);
    if (uerr || !userData?.user) return json({ error: "Sesión inválida" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
    const { data: prof } = await admin.from("profiles").select("rol, activo").eq("id", userData.user.id).maybeSingle();
    if (!prof || prof.rol !== "admin" || prof.activo === false) {
      return json({ error: "Solo el administrador puede crear usuarios" }, 403);
    }

    // 2) Crear el usuario.
    const { email, password, nombre, rol } = await req.json();
    if (!email || !password) return json({ error: "Faltan email o contraseña" }, 400);
    if (String(password).length < 6) return json({ error: "La contraseña debe tener al menos 6 caracteres" }, 400);

    const { data: created, error: cerr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre: nombre || email },
    });
    if (cerr) return json({ error: cerr.message }, 400);

    // 3) Fijar el rol/nombre solicitados (el trigger ya creó el perfil base).
    const rolFinal = rol === "admin" ? "admin" : "operador";
    await admin.from("profiles").upsert({
      id: created.user!.id,
      email,
      nombre: nombre || email,
      rol: rolFinal,
      activo: true,
    });

    return json({ ok: true, id: created.user!.id });
  } catch (e) {
    return json({ error: (e as Error).message || "Error interno" }, 500);
  }
});
