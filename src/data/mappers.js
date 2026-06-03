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
    adultos: row.adultos ?? 0,
    menores: row.menores ?? 0,
    anticipo: row.anticipo === null || row.anticipo === undefined ? "" : Number(row.anticipo),
    pagadoDepositoA: nullToEmpty(row.pagado_deposito_a),
    fechaDeposito: nullToEmpty(row.fecha_deposito),
    pagadoSaldoA: nullToEmpty(row.pagado_saldo_a),
    fechaPagoCliente: nullToEmpty(row.fecha_pago_cliente),
    comision: row.comision === null || row.comision === undefined ? "" : Number(row.comision),
    notas: nullToEmpty(row.notas),
  };
}
export function reservaToRow(r) {
  return {
    id: r.id,
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
    adultos: Number(r.adultos) || 0,
    menores: Number(r.menores) || 0,
    anticipo: numOrNull(r.anticipo),
    pagado_deposito_a: emptyToNull(r.pagadoDepositoA),
    fecha_deposito: emptyToNull(r.fechaDeposito),
    pagado_saldo_a: emptyToNull(r.pagadoSaldoA),
    fecha_pago_cliente: emptyToNull(r.fechaPagoCliente),
    comision: numOrNull(r.comision),
    notas: emptyToNull(r.notas),
  };
}
