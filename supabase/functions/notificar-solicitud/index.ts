// Flor de Lis — Edge Function: avisos al recibir una solicitud de reserva.
//  - Email a TODOS los usuarios activos (staff): "tenés una reserva para gestionar".
//  - Email al CLIENTE: gracias + resumen de su solicitud.
//  - SMS al admin (Twilio), opcional.
// Todo según los secrets configurados; si falta una clave, esa vía no se envía.
// Se invoca desde la página pública (sin sesión) -> deploy con verify_jwt = false.
//
// Secrets (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY, RESEND_FROM (remitente verificado), ADMIN_NOTIF_EMAIL (opcional, se suma al staff)
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, ADMIN_NOTIF_PHONE
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
function esc(s: unknown) { return String(s ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!)); }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  try {
    const s = await req.json();
    const nombre = [s.nombre, s.apellido].filter(Boolean).join(" ") || "Cliente";
    const fechas = (s.fecha_inicio || "?") + " → " + (s.fecha_fin || "?");
    const pax = (Number(s.adultos) || 0) + " adulto(s)" + ((Number(s.menores) || 0) > 0 ? " + " + s.menores + " menor(es)" : "");

    const detalleHtml =
      "<p style='font-size:15px;line-height:1.7'>" +
      "<b>Cliente:</b> " + esc(nombre) + "<br>" +
      "<b>Teléfono:</b> " + esc(s.telefono || "—") + "<br>" +
      "<b>Email:</b> " + esc(s.email || "—") + "<br>" +
      "<b>Fechas:</b> " + esc(fechas) + "<br>" +
      "<b>Personas:</b> " + esc(pax) + "<br>" +
      "<b>Late check-out:</b> " + (s.late_checkout ? "Sí" : "No") +
      (s.comentario ? "<br><b>Comentario:</b> " + esc(s.comentario) : "") + "</p>";
    const detalleTexto = [
      "Cliente: " + nombre, "Teléfono: " + (s.telefono || "—"), "Email: " + (s.email || "—"),
      "Fechas: " + fechas, "Personas: " + pax, "Late check-out: " + (s.late_checkout ? "Sí" : "No"),
    ].concat(s.comentario ? ["Comentario: " + s.comentario] : []).join("\n");

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const RESEND_FROM = Deno.env.get("RESEND_FROM") || "Flor de Lis <onboarding@resend.dev>";
    async function sendEmail(to: string[] | string, subject: string, html: string) {
      const dest = Array.isArray(to) ? to.filter(Boolean) : (to ? [to] : []);
      if (!RESEND_API_KEY || dest.length === 0) return "sin configurar";
      try {
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ from: RESEND_FROM, to: dest, subject, html }),
        });
        return r.ok ? "enviado" : ("error " + r.status + ": " + (await r.text()).slice(0, 140));
      } catch (e) { return "error: " + (e as Error).message; }
    }

    // 1) Aviso a TODOS los usuarios activos.
    let staff: string[] = [];
    try {
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
      const { data } = await admin.from("profiles").select("email").eq("activo", true);
      staff = (data || []).map((p: { email: string }) => p.email).filter(Boolean);
    } catch (e) { /* sin staff */ }
    const ADMIN_EMAIL = Deno.env.get("ADMIN_NOTIF_EMAIL");
    if (ADMIN_EMAIL && staff.indexOf(ADMIN_EMAIL) === -1) staff.push(ADMIN_EMAIL);
    const staffHtml = "<h2 style='color:#385a45'>Tenés una nueva reserva para gestionar 🌿</h2>" +
      "<p>Entró una solicitud desde la web. Entrá a la app para crearla con un toque.</p>" + detalleHtml;
    const staffRes = await sendEmail(staff, "Nueva solicitud para gestionar — " + nombre, staffHtml);

    // 2) Gracias al cliente.
    const clienteHtml = "<h2 style='color:#385a45'>¡Gracias por tenernos en cuenta, " + esc(s.nombre || "") + "! 🌿</h2>" +
      "<p>Recibimos tu solicitud de reserva en el <b>Complejo Flor de Lis</b>. Este es el resumen:</p>" +
      detalleHtml + "<p>Te vamos a contactar a la brevedad para confirmar la disponibilidad. ¡Muchas gracias!</p>" +
      "<p style='color:#777;font-size:12px'>Complejo Flor de Lis · Cabañas en el campo</p>";
    const clienteRes = await sendEmail(s.email, "¡Gracias por tu solicitud! — Flor de Lis", clienteHtml);

    // 3) SMS al admin (Twilio).
    const SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const FROM = Deno.env.get("TWILIO_FROM");
    const ADMIN_PHONE = Deno.env.get("ADMIN_NOTIF_PHONE");
    let smsRes = "sin configurar";
    if (SID && TOKEN && FROM && ADMIN_PHONE) {
      try {
        const form = new URLSearchParams({ From: FROM, To: ADMIN_PHONE, Body: "Nueva solicitud de reserva — Flor de Lis\n" + detalleTexto });
        const r = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + SID + "/Messages.json", {
          method: "POST",
          headers: { Authorization: "Basic " + btoa(SID + ":" + TOKEN), "Content-Type": "application/x-www-form-urlencoded" },
          body: form.toString(),
        });
        smsRes = r.ok ? "enviado" : ("error " + r.status);
      } catch (e) { smsRes = "error: " + (e as Error).message; }
    }

    return json({ ok: true, staff: staffRes, cliente: clienteRes, sms: smsRes });
  } catch (e) {
    return json({ error: (e as Error).message || "Error interno" }, 500);
  }
});
