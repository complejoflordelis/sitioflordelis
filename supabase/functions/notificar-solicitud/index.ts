// Flor de Lis — Edge Function: avisar al admin cuando entra una solicitud.
// Manda email (Resend) y/o SMS (Twilio) según los secrets configurados.
// Si falta una clave, esa vía simplemente no se envía (no rompe).
// Se invoca desde la página pública (sin sesión) -> deploy con verify_jwt = false.
//
// Secrets a configurar (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY      clave de https://resend.com  (email)
//   ADMIN_NOTIF_EMAIL   email del admin que recibe el aviso
//   RESEND_FROM         remitente verificado (ej: "Flor de Lis <reservas@tudominio.com>")
//   TWILIO_ACCOUNT_SID  / TWILIO_AUTH_TOKEN / TWILIO_FROM   (SMS)
//   ADMIN_NOTIF_PHONE   teléfono del admin en formato +54911...

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
    const lineas = [
      "Nueva solicitud de reserva — Flor de Lis", "",
      "Cliente: " + nombre,
      "Teléfono: " + (s.telefono || "—"),
      "Email: " + (s.email || "—"),
      "Fechas: " + fechas,
      "Late check-in: " + (s.late_checkin ? "Sí" : "No"),
    ];
    if (s.comentario) lineas.push("Comentario: " + s.comentario);
    const texto = lineas.join("\n");
    const html = "<h2>Nueva solicitud de reserva</h2>" +
      "<p><b>Cliente:</b> " + esc(nombre) + "<br>" +
      "<b>Teléfono:</b> " + esc(s.telefono || "—") + "<br>" +
      "<b>Email:</b> " + esc(s.email || "—") + "<br>" +
      "<b>Fechas:</b> " + esc(fechas) + "<br>" +
      "<b>Late check-in:</b> " + (s.late_checkin ? "Sí" : "No") +
      (s.comentario ? "<br><b>Comentario:</b> " + esc(s.comentario) : "") + "</p>";

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_NOTIF_EMAIL");
    const RESEND_FROM = Deno.env.get("RESEND_FROM") || "Flor de Lis <onboarding@resend.dev>";
    let emailRes = "sin configurar";
    if (RESEND_API_KEY && ADMIN_EMAIL) {
      try {
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ from: RESEND_FROM, to: [ADMIN_EMAIL], subject: "Nueva solicitud de reserva — " + nombre, html }),
        });
        emailRes = r.ok ? "enviado" : ("error " + r.status);
      } catch (e) { emailRes = "error: " + (e as Error).message; }
    }

    const SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const FROM = Deno.env.get("TWILIO_FROM");
    const ADMIN_PHONE = Deno.env.get("ADMIN_NOTIF_PHONE");
    let smsRes = "sin configurar";
    if (SID && TOKEN && FROM && ADMIN_PHONE) {
      try {
        const form = new URLSearchParams({ From: FROM, To: ADMIN_PHONE, Body: texto });
        const r = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + SID + "/Messages.json", {
          method: "POST",
          headers: { Authorization: "Basic " + btoa(SID + ":" + TOKEN), "Content-Type": "application/x-www-form-urlencoded" },
          body: form.toString(),
        });
        smsRes = r.ok ? "enviado" : ("error " + r.status);
      } catch (e) { smsRes = "error: " + (e as Error).message; }
    }

    return json({ ok: true, email: emailRes, sms: smsRes });
  } catch (e) {
    return json({ error: (e as Error).message || "Error interno" }, 500);
  }
});
