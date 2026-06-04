/* Flor de Lis — mapeo entre filas de Supabase (snake_case) y objetos de la app (camelCase). */

function emptyToNull(v) { return v === "" || v === undefined ? null : v; }
function numOrNull(v) { return v === "" || v === null || v === undefined ? null : Number(v); }
function nullToEmpty(v) { return v === null || v === undefined ? "" : v; }

// ---------- Cabañas ----------
export function cabanaFromRow(row) {
  return { id: row.id, nombre: row.nombre, maxPersonas: row.max_personas, color: row.color, orden: row.orden };
}
export function cabanaToRow(c) {
  return { id: c.id, nombre: c.nombre, max_personas: c.maxPersonas, color: c.color, orden: c.orden ?? 0 };
}

// ---------- Reservas ----------
export function reservaFromRow(row) {
  return {
    id: row.id,
    numero: row.numero === null || row.numero === undefined ? null : Number(row.numero),
    creadoPor: nullToEmpty(row.creado_por),
    fechaVenta: nullToEmpty(row.fecha_venta),
    cabanaId: row.cabana_id,
    inicioEstadia: nullToEmpty(row.inicio_estadia),
    finEstadia: nullToEmpty(row.fin_estadia),
    horaInicio: nullToEmpty(row.hora_inicio),
    horaFin: nullToEmpty(row.hora_fin),
    modoImporte: row.modo_importe || "total",
    importeIngresado: row.importe_ingresado === null || row.importe_ingresado === undefined ? "" : Number(row.importe_ingresado),
    importeTotal: Number(row.importe_total) || 0,
    nombre: nullToEmpty(row.nombre),
    ciudadOrigen: nullToEmpty(row.ciudad_origen),
    celular: nullToEmpty(row.celular),
    email: nullToEmpty(row.email),
    adultos: row.adultos ?? 0,
    menores: row.menores ?? 0,
    anticipo: row.anticipo === null || row.anticipo === undefined ? "" : Number(row.anticipo),
    pagadoDepositoA: nullToEmpty(row.pagado_deposito_a),
    fechaDeposito: nullToEmpty(row.fecha_deposito),
    anticipoDestino: nullToEmpty(row.anticipo_destino),
    pagadoSaldoA: nullToEmpty(row.pagado_saldo_a),
    fechaPagoCliente: nullToEmpty(row.fecha_pago_cliente),
    saldoDestino: nullToEmpty(row.saldo_destino),
    saldoPagado: !!row.saldo_pagado,
    fechaRendicion: nullToEmpty(row.fecha_rendicion),
    comision: row.comision === null || row.comision === undefined ? "" : Number(row.comision),
    comisionPct: row.comision_pct === null || row.comision_pct === undefined ? 30 : Number(row.comision_pct),
    notas: nullToEmpty(row.notas),
  };
}
export function reservaToRow(r) {
  return {
    id: r.id,
    creado_por: emptyToNull(r.creadoPor),
    fecha_venta: emptyToNull(r.fechaVenta),
    cabana_id: r.cabanaId,
    inicio_estadia: emptyToNull(r.inicioEstadia),
    fin_estadia: emptyToNull(r.finEstadia),
    hora_inicio: emptyToNull(r.horaInicio),
    hora_fin: emptyToNull(r.horaFin),
    modo_importe: r.modoImporte || "total",
    importe_ingresado: numOrNull(r.importeIngresado),
    importe_total: Number(r.importeTotal) || 0,
    nombre: emptyToNull(r.nombre),
    ciudad_origen: emptyToNull(r.ciudadOrigen),
    celular: emptyToNull(r.celular),
    email: emptyToNull(r.email),
    adultos: Number(r.adultos) || 0,
    menores: Number(r.menores) || 0,
    anticipo: numOrNull(r.anticipo),
    pagado_deposito_a: emptyToNull(r.pagadoDepositoA),
    fecha_deposito: emptyToNull(r.fechaDeposito),
    anticipo_destino: emptyToNull(r.anticipoDestino),
    pagado_saldo_a: emptyToNull(r.pagadoSaldoA),
    fecha_pago_cliente: emptyToNull(r.fechaPagoCliente),
    saldo_destino: emptyToNull(r.saldoDestino),
    saldo_pagado: !!r.saldoPagado,
    fecha_rendicion: emptyToNull(r.fechaRendicion),
    comision: numOrNull(r.comision),
    comision_pct: r.comisionPct === "" || r.comisionPct === null || r.comisionPct === undefined ? 30 : Number(r.comisionPct),
    notas: emptyToNull(r.notas),
  };
}

// ---------- Gastos ----------
export function gastoFromRow(row) {
  return {
    id: row.id,
    fecha: nullToEmpty(row.fecha),
    tipo: row.tipo || "otros",
    detalle: nullToEmpty(row.detalle),
    monto: row.monto === null || row.monto === undefined ? "" : Number(row.monto),
    cabanaId: row.cabana_id || "",
    facturaPath: row.factura_path || "",
    createdAt: row.created_at,
  };
}
export function gastoToRow(g) {
  return {
    fecha: emptyToNull(g.fecha),
    tipo: g.tipo || "otros",
    detalle: emptyToNull(g.detalle),
    monto: Number(g.monto) || 0,
    cabana_id: g.cabanaId ? g.cabanaId : null,
    factura_path: g.facturaPath ? g.facturaPath : null,
  };
}
