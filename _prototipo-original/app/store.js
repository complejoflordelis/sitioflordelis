/* Flor de Lis — capa de datos, utilidades y semilla.
   Plain JS, expone todo en window. */
(function () {
  "use strict";

  var LS_KEY = "florDeLis.v1";

  // ---------- Cabañas por defecto ----------
  var DEFAULT_CABANAS = [
    { id: "c1", nombre: "Cabaña 1", maxPersonas: 4, color: "azul" },
    { id: "c2", nombre: "Cabaña 2", maxPersonas: 6, color: "verde" },
    { id: "c3", nombre: "Cabaña 3", maxPersonas: 5, color: "celeste" }
  ];

  // Paleta por color de cabaña (relleno suave + borde/acento fuerte + texto)
  var CABANA_COLORS = {
    azul:    { soft: "oklch(0.93 0.04 250)", mid: "oklch(0.62 0.13 255)", strong: "oklch(0.5 0.15 258)", ink: "oklch(0.32 0.1 258)", label: "Azul" },
    verde:   { soft: "oklch(0.93 0.05 150)", mid: "oklch(0.6 0.12 150)",  strong: "oklch(0.48 0.12 152)", ink: "oklch(0.32 0.08 152)", label: "Verde" },
    celeste: { soft: "oklch(0.94 0.04 220)", mid: "oklch(0.72 0.1 222)",  strong: "oklch(0.6 0.12 224)",  ink: "oklch(0.36 0.08 224)", label: "Celeste" },
    arena:   { soft: "oklch(0.93 0.04 80)",  mid: "oklch(0.72 0.1 78)",   strong: "oklch(0.6 0.11 70)",   ink: "oklch(0.38 0.07 70)",  label: "Arena" },
    rosa:    { soft: "oklch(0.93 0.04 10)",  mid: "oklch(0.68 0.12 12)",  strong: "oklch(0.56 0.14 14)",  ink: "oklch(0.36 0.09 14)",  label: "Rosa" }
  };
  var COLOR_ORDER = ["azul", "verde", "celeste", "arena", "rosa"];

  // ---------- Ciudades de Argentina (para autocompletar) ----------
  var CIUDADES_AR = [
    "Buenos Aires, CABA","La Plata, Buenos Aires","Mar del Plata, Buenos Aires","Bahía Blanca, Buenos Aires",
    "Tandil, Buenos Aires","Pinamar, Buenos Aires","Villa Gesell, Buenos Aires","Necochea, Buenos Aires",
    "San Nicolás, Buenos Aires","Pergamino, Buenos Aires","Junín, Buenos Aires","Olavarría, Buenos Aires",
    "Quilmes, Buenos Aires","Lomas de Zamora, Buenos Aires","San Isidro, Buenos Aires","Tigre, Buenos Aires",
    "Pilar, Buenos Aires","Luján, Buenos Aires","Zárate, Buenos Aires","Chivilcoy, Buenos Aires",
    "Córdoba, Córdoba","Villa Carlos Paz, Córdoba","Río Cuarto, Córdoba","Villa General Belgrano, Córdoba",
    "La Falda, Córdoba","Alta Gracia, Córdoba","Mina Clavero, Córdoba","Cosquín, Córdoba","San Francisco, Córdoba",
    "Rosario, Santa Fe","Santa Fe, Santa Fe","Rafaela, Santa Fe","Venado Tuerto, Santa Fe","Reconquista, Santa Fe",
    "Mendoza, Mendoza","San Rafael, Mendoza","Maipú, Mendoza","Luján de Cuyo, Mendoza","Tunuyán, Mendoza",
    "San Miguel de Tucumán, Tucumán","Tafí del Valle, Tucumán","Yerba Buena, Tucumán",
    "Salta, Salta","Cafayate, Salta","San Salvador de Jujuy, Jujuy","Tilcara, Jujuy","Purmamarca, Jujuy",
    "Neuquén, Neuquén","San Martín de los Andes, Neuquén","Villa La Angostura, Neuquén","Plottier, Neuquén",
    "San Carlos de Bariloche, Río Negro","General Roca, Río Negro","Cipolletti, Río Negro","Viedma, Río Negro",
    "El Bolsón, Río Negro","Esquel, Chubut","Puerto Madryn, Chubut","Comodoro Rivadavia, Chubut","Trelew, Chubut",
    "Río Gallegos, Santa Cruz","El Calafate, Santa Cruz","Ushuaia, Tierra del Fuego",
    "Posadas, Misiones","Puerto Iguazú, Misiones","Oberá, Misiones",
    "Corrientes, Corrientes","Goya, Corrientes","Paso de los Libres, Corrientes",
    "Resistencia, Chaco","Sáenz Peña, Chaco","Formosa, Formosa",
    "Paraná, Entre Ríos","Concordia, Entre Ríos","Gualeguaychú, Entre Ríos","Colón, Entre Ríos","Federación, Entre Ríos",
    "Santiago del Estero, Santiago del Estero","La Banda, Santiago del Estero",
    "San Luis, San Luis","Villa Mercedes, San Luis","Merlo, San Luis",
    "San Juan, San Juan","La Rioja, La Rioja","Catamarca, Catamarca","Santa Rosa, La Pampa","General Pico, La Pampa"
  ];

  // ---------- Reservas semilla (datos de ejemplo realistas) ----------
  function seedReservas() {
    var hoy = new Date();
    var y = hoy.getFullYear();
    var m = hoy.getMonth();
    function d(year, month, day) { return iso(new Date(year, month, day)); }
    var base = [
      { cabanaId:"c1", ini:d(y,m,3),  fin:d(y,m,7),  nombre:"Familia Gómez",     ciudad:"Rosario, Santa Fe",        cel:"341 555 1042", ad:2, me:2, total:280000, anticipo:120000 },
      { cabanaId:"c2", ini:d(y,m,5),  fin:d(y,m,10), nombre:"Familia Pérez",     ciudad:"Córdoba, Córdoba",         cel:"351 555 8890", ad:2, me:3, total:420000, anticipo:200000 },
      { cabanaId:"c3", ini:d(y,m,2),  fin:d(y,m,4),  nombre:"Lucía Fernández",   ciudad:"Buenos Aires, CABA",       cel:"11 5555 3321", ad:2, me:0, total:130000, anticipo:130000 },
      { cabanaId:"c1", ini:d(y,m,12), fin:d(y,m,16), nombre:"Familia Rodríguez", ciudad:"Mendoza, Mendoza",         cel:"261 555 7712", ad:3, me:1, total:300000, anticipo:150000 },
      { cabanaId:"c2", ini:d(y,m,14), fin:d(y,m,18), nombre:"Familia López",     ciudad:"Santa Fe, Santa Fe",       cel:"342 555 9001", ad:2, me:2, total:360000, anticipo:0 },
      { cabanaId:"c3", ini:d(y,m,16), fin:d(y,m,20), nombre:"Martín Suárez",     ciudad:"La Plata, Buenos Aires",   cel:"221 555 4456", ad:2, me:1, total:255000, anticipo:100000 },
      { cabanaId:"c1", ini:d(y,m,22), fin:d(y,m,26), nombre:"Familia Díaz",      ciudad:"Villa Carlos Paz, Córdoba",cel:"351 555 2278", ad:2, me:2, total:290000, anticipo:145000 },
      { cabanaId:"c2", ini:d(y,m,24), fin:d(y,m,28), nombre:"Familia Romero",    ciudad:"Rosario, Santa Fe",        cel:"341 555 6634", ad:4, me:2, total:480000, anticipo:240000 },
      // mes siguiente
      { cabanaId:"c3", ini:d(y,m+1,4),fin:d(y,m+1,9), nombre:"Familia Torres",   ciudad:"Buenos Aires, CABA",       cel:"11 5555 1199", ad:2, me:1, total:340000, anticipo:0 },
      { cabanaId:"c1", ini:d(y,m+1,6),fin:d(y,m+1,11),nombre:"Familia Castro",   ciudad:"Tandil, Buenos Aires",     cel:"249 555 7745", ad:2, me:3, total:410000, anticipo:200000 },
      // mes anterior
      { cabanaId:"c2", ini:d(y,m-1,18),fin:d(y,m-1,22),nombre:"Familia Herrera", ciudad:"Córdoba, Córdoba",         cel:"351 555 3367", ad:2, me:2, total:330000, anticipo:330000 },
      { cabanaId:"c1", ini:d(y,m-1,20),fin:d(y,m-1,24),nombre:"Familia Vega",    ciudad:"Rosario, Santa Fe",        cel:"341 555 9912", ad:3, me:0, total:300000, anticipo:150000 }
    ];
    return base.map(function (b, i) {
      var noches = diffDays(b.ini, b.fin);
      return {
        id: "r" + (i + 1),
        fechaVenta: addDaysIso(b.ini, -(7 + i)),
        cabanaId: b.cabanaId,
        inicioEstadia: b.ini,
        finEstadia: b.fin,
        horaInicio: "14:00",
        horaFin: "10:00",
        modoImporte: "total",
        importeIngresado: b.total,
        importeTotal: b.total,
        nombre: b.nombre,
        ciudadOrigen: b.ciudad,
        celular: b.cel,
        adultos: b.ad,
        menores: b.me,
        anticipo: b.anticipo,
        pagadoDepositoA: b.anticipo > 0 ? "Efectivo" : "",
        fechaDeposito: b.anticipo > 0 ? addDaysIso(b.ini, -(5 + i)) : "",
        pagadoSaldoA: "",
        fechaPagoCliente: "",
        comision: Math.round(b.total * 0.0),
        notas: ""
      };
    });
  }

  // ---------- Persistencia ----------
  function load() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        if (!data.cabanas) data.cabanas = DEFAULT_CABANAS.slice();
        if (!data.reservas) data.reservas = [];
        return data;
      }
    } catch (e) { /* ignore */ }
    return { cabanas: DEFAULT_CABANAS.slice(), reservas: seedReservas() };
  }
  function save(state) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function resetAll() {
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
  }

  // ---------- Utilidades de fecha ----------
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(date) { return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()); }
  function parseIso(s) {
    if (!s) return null;
    var p = s.split("-");
    return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  }
  function todayIso() { return iso(new Date()); }
  function diffDays(a, b) {
    var da = parseIso(a), db = parseIso(b);
    if (!da || !db) return 0;
    return Math.round((db - da) / 86400000);
  }
  function addDaysIso(s, n) {
    var d = parseIso(s); if (!d) return s;
    d.setDate(d.getDate() + n); return iso(d);
  }
  var MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  var MESES_ABR = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  var DIAS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"]; // semana arranca lunes
  function mesNombre(s) { var d = parseIso(s); return d ? MESES[d.getMonth()] + " " + d.getFullYear() : ""; }
  function fmtFecha(s) {
    var d = parseIso(s); if (!d) return "—";
    return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear();
  }
  function fmtFechaCorta(s) {
    var d = parseIso(s); if (!d) return "—";
    return pad(d.getDate()) + " " + MESES_ABR[d.getMonth()];
  }

  // ---------- Moneda ----------
  function fmtMoney(n) {
    if (n === "" || n === null || n === undefined || isNaN(n)) return "—";
    return "$ " + Math.round(n).toLocaleString("es-AR");
  }
  function fmtMoneyShort(n) {
    if (!n) return "$0";
    if (n >= 1000000) return "$" + (n / 1000000).toFixed(1).replace(".0", "") + "M";
    if (n >= 1000) return "$" + Math.round(n / 1000) + "k";
    return "$" + Math.round(n);
  }

  // ---------- Cálculos de reserva ----------
  function noches(r) { return Math.max(0, diffDays(r.inicioEstadia, r.finEstadia)); }
  function pax(r) { return (Number(r.adultos) || 0) + (Number(r.menores) || 0); }
  function importeTotal(r) {
    var n = Number(r.importeIngresado) || 0;
    if (r.modoImporte === "noche") return n * noches(r);
    return n;
  }
  function promedioDia(r) {
    var nn = noches(r);
    return nn > 0 ? importeTotal(r) / nn : 0;
  }
  function saldo(r) { return importeTotal(r) - (Number(r.anticipo) || 0); }
  function saldoFlorDeLis(r) { return importeTotal(r) - (Number(r.comision) || 0); }

  // ---------- Disponibilidad ----------
  // Dos reservas se solapan si comparten al menos una noche.
  function overlaps(aIni, aFin, bIni, bFin) {
    return aIni < bFin && bIni < aFin;
  }
  function rangoOcupado(reservas, cabanaId, ini, fin, exceptId) {
    return reservas.some(function (r) {
      if (r.cabanaId !== cabanaId) return false;
      if (exceptId && r.id === exceptId) return false;
      return overlaps(ini, fin, r.inicioEstadia, r.finEstadia);
    });
  }
  // Devuelve set de fechas-iso ocupadas (noches) para una cabaña
  function nochesOcupadas(reservas, cabanaId, exceptId) {
    var set = {};
    reservas.forEach(function (r) {
      if (r.cabanaId !== cabanaId) return;
      if (exceptId && r.id === exceptId) return;
      var cur = r.inicioEstadia;
      while (cur < r.finEstadia) {
        set[cur] = true;
        cur = addDaysIso(cur, 1);
      }
    });
    return set;
  }

  function uid() { return "r" + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36); }

  window.FDL = {
    LS_KEY: LS_KEY,
    DEFAULT_CABANAS: DEFAULT_CABANAS,
    CABANA_COLORS: CABANA_COLORS,
    COLOR_ORDER: COLOR_ORDER,
    CIUDADES_AR: CIUDADES_AR,
    seedReservas: seedReservas,
    load: load, save: save, resetAll: resetAll,
    iso: iso, parseIso: parseIso, todayIso: todayIso, diffDays: diffDays, addDaysIso: addDaysIso,
    MESES: MESES, MESES_ABR: MESES_ABR, DIAS: DIAS,
    mesNombre: mesNombre, fmtFecha: fmtFecha, fmtFechaCorta: fmtFechaCorta,
    fmtMoney: fmtMoney, fmtMoneyShort: fmtMoneyShort, pad: pad,
    noches: noches, pax: pax, importeTotal: importeTotal, promedioDia: promedioDia,
    saldo: saldo, saldoFlorDeLis: saldoFlorDeLis,
    overlaps: overlaps, rangoOcupado: rangoOcupado, nochesOcupadas: nochesOcupadas,
    uid: uid
  };
})();
