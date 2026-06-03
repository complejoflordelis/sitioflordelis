/* Flor de Lis — armado de enlaces de WhatsApp con mensaje prearmado. */
import * as FDL from "./fdl";

// Normaliza un celular argentino a formato wa.me (54 + 9 + número, sin espacios).
export function normalizarCel(cel) {
  if (!cel) return "";
  let d = String(cel).replace(/[^\d]/g, "");
  if (!d) return "";
  if (d.indexOf("54") === 0) return d;       // ya tiene código de país
  if (d.indexOf("0") === 0) d = d.slice(1);   // saca 0 inicial
  return "549" + d;                            // celular argentino
}

// Mensaje de confirmación/recordatorio para el huésped.
export function mensajeReserva(r, cabana) {
  const nombre = (r.nombre || "").trim();
  const cab = cabana ? cabana.nombre : "la cabaña";
  const saldo = FDL.saldo(r);
  const lineas = [
    "¡Hola" + (nombre ? " " + nombre : "") + "! 🌿 Te escribimos del Complejo Flor de Lis.",
    "",
    "Reserva en *" + cab + "*",
    "📅 " + FDL.fmtFecha(r.inicioEstadia) + " → " + FDL.fmtFecha(r.finEstadia) + " (" + FDL.noches(r) + " noches)",
    "🕑 Check-in " + (r.horaInicio || "14:00") + " · Check-out " + (r.horaFin || "10:00"),
    "👥 " + FDL.pax(r) + " personas",
    "💵 Total: " + FDL.fmtMoney(FDL.importeTotal(r)),
  ];
  if (saldo > 0) lineas.push("⏳ Saldo pendiente: " + FDL.fmtMoney(saldo));
  lineas.push("", "Cualquier consulta quedamos a disposición. ¡Gracias!");
  return lineas.join("\n");
}

// Devuelve el enlace wa.me o null si no hay celular válido.
export function waLink(r, cabana) {
  const num = normalizarCel(r.celular);
  if (!num) return null;
  return "https://wa.me/" + num + "?text=" + encodeURIComponent(mensajeReserva(r, cabana));
}
