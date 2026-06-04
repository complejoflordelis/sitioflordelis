/* Flor de Lis — UI compartida: logo, iconos, primitivos. */
import React from "react";
import { CABANA_COLORS } from "../lib/fdl";

// ---------- Logo flor de lis (SVG simple, sello heráldico estilizado) ----------
export function FleurDeLis(props) {
  const size = props.size || 28;
  const color = props.color || "currentColor";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M32 4c2.6 4.2 2.6 8.4 0 12.6-2.6-4.2-2.6-8.4 0-12.6z" fill={color} />
      <path d="M32 14c1.6 6 1.6 11 0 18-3.2-3-7-4-11-3 .6-6 4.6-10.5 11-15zm0 0c-1.6 6-1.6 11 0 18 3.2-3 7-4 11-3-.6-6-4.6-10.5-11-15z" fill={color} />
      <path d="M21 30c-4.6 2.2-7 6-7 11 0 5 3.4 9 9 11-3-3.4-4-7-3-11 .8-3.2 2.4-7 1-11zm22 0c4.6 2.2 7 6 7 11 0 5-3.4 9-9 11 3-3.4 4-7 3-11-.8-3.2-2.4-7-1-11z" fill={color} opacity="0.9" />
      <path d="M32 28c2.4 6 2.4 18 0 30-2.4-12-2.4-24 0-30z" fill={color} />
      <rect x="20" y="44" width="24" height="5" rx="2.5" fill={color} />
    </svg>
  );
}

export function BrandMark(props) {
  const compact = props.compact;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: compact ? 0 : 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center",
        background: "var(--brand-700)", color: "var(--gold)", flexShrink: 0,
        boxShadow: "0 1px 0 rgba(255,255,255,.25) inset, 0 6px 16px -8px rgba(0,0,0,.4)",
      }}>
        <FleurDeLis size={24} />
      </div>
      {!compact && (
        <div style={{ lineHeight: 1.05 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 19, fontWeight: 600, color: "var(--ink)", letterSpacing: ".01em" }}>Flor de Lis</div>
          <div style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 600 }}>Complejo de Cabañas</div>
        </div>
      )}
    </div>
  );
}

// ---------- Iconos de línea (stroke), trazo simple ----------
export function Ico(props) {
  const s = props.size || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke={props.color || "currentColor"} strokeWidth={props.w || 1.7}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={props.style}>
      {props.children}
    </svg>
  );
}
export const Icon = {
  dashboard: (p) => <Ico {...p}><path d="M3 13h8V3H3zM13 21h8V3h-8zM3 21h8v-6H3z"/></Ico>,
  plus:      (p) => <Ico {...p}><path d="M12 5v14M5 12h14"/></Ico>,
  calendar:  (p) => <Ico {...p}><rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></Ico>,
  table:     (p) => <Ico {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M3 15h18M9 4v16"/></Ico>,
  cabin:     (p) => <Ico {...p}><path d="M4 11l8-6 8 6M6 10v9h12v-9M10 19v-5h4v5"/></Ico>,
  user:      (p) => <Ico {...p}><circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"/></Ico>,
  child:     (p) => <Ico {...p}><circle cx="12" cy="7" r="2.6"/><path d="M7 20c0-3 2.3-4.6 5-4.6s5 1.6 5 4.6"/></Ico>,
  pin:       (p) => <Ico {...p}><path d="M12 21c4-4.5 7-7.7 7-11a7 7 0 1 0-14 0c0 3.3 3 6.5 7 11z"/><circle cx="12" cy="10" r="2.5"/></Ico>,
  phone:     (p) => <Ico {...p}><path d="M6.5 3h3l1.5 5-2 1.5a13 13 0 0 0 5.5 5.5l1.5-2 5 1.5v3a2 2 0 0 1-2 2A17 17 0 0 1 4.5 5a2 2 0 0 1 2-2z"/></Ico>,
  money:     (p) => <Ico {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7v10M9.5 9.2c0-1 1.1-1.7 2.5-1.7s2.5.7 2.5 1.7-1.1 1.6-2.5 1.6-2.5.7-2.5 1.8 1.1 1.7 2.5 1.7 2.5-.7 2.5-1.7"/></Ico>,
  clock:     (p) => <Ico {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></Ico>,
  check:     (p) => <Ico {...p}><path d="M4 12.5l5 5L20 6.5"/></Ico>,
  x:         (p) => <Ico {...p}><path d="M6 6l12 12M18 6L6 18"/></Ico>,
  chevL:     (p) => <Ico {...p}><path d="M15 5l-7 7 7 7"/></Ico>,
  chevR:     (p) => <Ico {...p}><path d="M9 5l7 7-7 7"/></Ico>,
  chevD:     (p) => <Ico {...p}><path d="M5 9l7 7 7-7"/></Ico>,
  edit:      (p) => <Ico {...p}><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z"/><path d="M14 7l3 3"/></Ico>,
  trash:     (p) => <Ico {...p}><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></Ico>,
  trend:     (p) => <Ico {...p}><path d="M3 17l6-6 4 4 8-8M21 7v5h-5"/></Ico>,
  trophy:    (p) => <Ico {...p}><path d="M7 4h10v4a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 16h6M8 20h8M12 14v2"/></Ico>,
  users:     (p) => <Ico {...p}><circle cx="9" cy="8" r="3"/><path d="M3 19c0-3.2 2.7-4.8 6-4.8s6 1.6 6 4.8"/><path d="M16 5.2A3 3 0 0 1 16 11M17 14.5c2.5.4 4 1.9 4 4.5"/></Ico>,
  search:    (p) => <Ico {...p}><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-3.6-3.6"/></Ico>,
  bed:       (p) => <Ico {...p}><path d="M3 8v11M3 12h18a0 0 0 0 1 0 0v7M21 19v-5a3 3 0 0 0-3-3H9M6.5 9.5h2"/></Ico>,
  download:  (p) => <Ico {...p}><path d="M12 4v10M8 11l4 4 4-4M5 20h14"/></Ico>,
  whatsapp:  (p) => <Ico {...p}><path d="M3 21l1.8-5A8 8 0 1 1 8 19.2z"/><path d="M8.5 8.5c0 4 3 7 7 7 .6 0 1-.4 1-1l-.2-1.6-2 -.6-.9 1a6 6 0 0 1-2.7-2.7l1-.9-.6-2L9 8c-.5 0-1 .4-1 1z" strokeWidth="1.2"/></Ico>,
  logout:    (p) => <Ico {...p}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h12"/></Ico>,
  shield:    (p) => <Ico {...p}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></Ico>,
  info:      (p) => <Ico {...p}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></Ico>,
  home:      (p) => <Ico {...p}><path d="M3 11l9-7 9 7M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9M9 20v-6h6v6"/></Ico>,
  receipt:   (p) => <Ico {...p}><path d="M6 2h12v20l-2.5-1.6L13 22l-2.5-1.6L8 22l-2-1.6V2z"/><path d="M9 7h6M9 11h6M9 15h4"/></Ico>,
  camera:    (p) => <Ico {...p}><path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.2"/></Ico>,
  wallet:    (p) => <Ico {...p}><path d="M3 7a2 2 0 0 1 2-2h11v4M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6"/><circle cx="17" cy="13" r="1.2"/></Ico>,
  mail:      (p) => <Ico {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/></Ico>,
  menu:      (p) => <Ico {...p}><path d="M4 7h16M4 12h16M4 17h16"/></Ico>,
};

// ---------- Tooltip de ayuda (hover) ----------
export function Help(props) {
  const [open, setOpen] = React.useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "help", color: "var(--ink-faint)" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Icon.info size={14} w={1.8} />
      {open && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          background: "var(--ink)", color: "#fff", fontSize: 12, lineHeight: 1.45, fontWeight: 500,
          padding: "8px 11px", borderRadius: 9, width: props.width || 220, zIndex: 60,
          boxShadow: "0 10px 30px -8px rgba(0,0,0,.4)", textAlign: "left", letterSpacing: 0,
        }}>
          {props.children}
          <span style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", borderWidth: 6, borderStyle: "solid", borderColor: "var(--ink) transparent transparent transparent" }}></span>
        </span>
      )}
    </span>
  );
}

// ---------- Píldora de cabaña ----------
export function CabanaTag(props) {
  const cab = props.cabana;
  if (!cab) return null;
  const c = CABANA_COLORS[cab.color] || CABANA_COLORS.azul;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 7, fontSize: props.size || 13, fontWeight: 600,
      color: c.ink, background: c.soft, border: "1px solid " + c.mid, borderRadius: 999,
      padding: props.size ? "3px 10px" : "4px 11px", lineHeight: 1.2, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 9, height: 9, borderRadius: 3, background: c.strong, flexShrink: 0 }}></span>
      {cab.nombre}
    </span>
  );
}

// ---------- Badge genérico ----------
export function Badge(props) {
  const tone = props.tone || "neutral";
  const tones = {
    neutral: { bg: "var(--surface-2)", fg: "var(--ink-soft)", bd: "var(--line)" },
    ok:      { bg: "oklch(0.95 0.05 150)", fg: "oklch(0.42 0.1 150)", bd: "oklch(0.85 0.07 150)" },
    warn:    { bg: "oklch(0.95 0.06 75)",  fg: "oklch(0.5 0.11 60)",  bd: "oklch(0.85 0.09 70)" },
    danger:  { bg: "oklch(0.95 0.05 25)",  fg: "oklch(0.5 0.13 25)",  bd: "oklch(0.86 0.08 25)" },
    gold:    { bg: "oklch(0.95 0.05 85)",  fg: "oklch(0.5 0.1 75)",   bd: "oklch(0.85 0.09 80)" },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600,
      color: t.fg, background: t.bg, border: "1px solid " + t.bd, borderRadius: 999, padding: "3px 9px", lineHeight: 1.3,
    }}>{props.children}</span>
  );
}

// ---------- Iconitos pax (adulto / menor) con conteo ----------
export function PaxMini(props) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: props.size || 12, color: props.color || "inherit", fontWeight: 600 }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
        <Icon.user size={(props.size || 12) + 2} w={1.9} />{props.adultos}
      </span>
      {props.menores > 0 && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
          <Icon.child size={(props.size || 12) + 1} w={1.9} />{props.menores}
        </span>
      )}
    </span>
  );
}
