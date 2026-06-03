/* Flor de Lis — cliente Supabase.
   Si no hay variables de entorno configuradas, la app corre en "Modo local"
   (sin login, guardando en el navegador). */
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || "complejo.flordelis.admin@gmail.com").toLowerCase();

// ¿Está conectada la nube?
export const isConfigured = Boolean(url && anon);

export const supabase = isConfigured
  ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
