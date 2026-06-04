/* Flor de Lis — cliente Supabase.
   Si no hay variables de entorno configuradas, la app corre en "Modo local"
   (sin login, guardando en el navegador). */
import { createClient } from "@supabase/supabase-js";

// La URL y la anon key son PÚBLICAS por diseño (la seguridad la da la RLS de
// Supabase, no estas claves). Por eso quedan como valor por defecto: así la app
// siempre corre en modo nube aunque falten las variables de entorno en el host.
// Se pueden sobrescribir con VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
const FALLBACK_URL = "https://gucgvudiomxhvxirwpks.supabase.co";
const FALLBACK_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Y2d2dWRpb214aHZ4aXJ3cGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MDg1OTUsImV4cCI6MjA5NjA4NDU5NX0.9QMTQwk3CQ7XHsDI1QUODY5EfL71-ZIyO1fSkDjVL1Q";

const url = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON;

export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || "complejo.flordelis.admin@gmail.com").toLowerCase();

// ¿Está conectada la nube?
export const isConfigured = Boolean(url && anon);

export const supabase = isConfigured
  ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
