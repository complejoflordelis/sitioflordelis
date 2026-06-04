// Flor de Lis — Edge Function: eliminar usuarios (solo admin).
// Verifica que QUIEN llama sea admin y borra la cuenta con la service role key.
// Deploy: supabase functions deploy admin-delete-user
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

    const caller = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: uerr } = await caller.auth.getUser(token);
    if (uerr || !userData?.user) return json({ error: "Sesión inválida" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
    const { data: prof } = await admin.from("profiles").select("rol, activo").eq("id", userData.user.id).maybeSingle();
    if (!prof || prof.rol !== "admin" || prof.activo === false) {
      return json({ error: "Solo el administrador puede eliminar usuarios" }, 403);
    }

    const { id } = await req.json();
    if (!id) return json({ error: "Falta el id del usuario" }, 400);
    if (id === userData.user.id) return json({ error: "No podés eliminar tu propia cuenta" }, 400);

    const { error: derr } = await admin.auth.admin.deleteUser(id);
    if (derr) return json({ error: derr.message }, 400);
    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error).message || "Error interno" }, 500);
  }
});
