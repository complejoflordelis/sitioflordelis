# Flor de Lis · Gestión de reservas

Webapp interna para gestionar las reservas del Complejo de Cabañas Flor de Lis.
**No la ve el cliente.** Los datos se guardan solos en el navegador (localStorage).

## Cómo abrirla

Hacé doble clic en **`Flor de Lis - Gestión.html`**. Se abre en tu navegador y funciona
sin conexión a internet (React está incluido localmente en `app/vendor/`).

> Las tipografías (Spectral / Hanken Grotesk) se cargan desde Google Fonts. Sin internet,
> el navegador usa tipografías equivalentes del sistema y la app sigue funcionando igual.

## Secciones

- **Dashboard** — KPIs del período elegido (mes en curso / mes anterior / año en curso /
  año anterior, rango personalizado o histórico), variación % vs. período anterior, cabaña
  más alquilada / con más reservas / más personas / mayor facturación, reservas por mes con
  pico pasado y futuro, y ranking de ciudades de origen.
- **Registrar reserva** — formulario con calendario de rango que bloquea las fechas ya
  ocupadas de cada cabaña, horarios autocompletados (14:00 / 10:00, editables), importe
  total o por noche con cálculo automático de noches y promedio x día, autocompletado de
  ciudades de Argentina y contador de adultos/menores con aviso de capacidad.
- **Calendario** — vista mensual tipo Booking, franjas de color por cabaña con conteo de
  adultos/menores; clic en una franja muestra el detalle.
- **Reservas** — tabla de transacciones con edición inline, columnas calculadas
  (noches, mes, PAX, promedio, saldo, *Saldo a Flor de Lis = Total − Comisión*), totales
  y exportación a CSV.
- **Cabañas** — nombre, capacidad y color con que aparecen en el calendario.

El botón **Restaurar demo** (abajo a la izquierda) reemplaza todo por datos de ejemplo.

## Estructura del proyecto

```
Flor de Lis - Gestión.html   ← punto de entrada (doble clic)
app/
  store.js                   ← datos, utilidades y semilla (JS plano)
  styles.css                 ← estilos
  *.jsx                      ← código fuente de los componentes (React)
  *.js                       ← versión compilada de cada .jsx (lo que carga el HTML)
  vendor/                    ← React y ReactDOM (locales)
build/                       ← herramienta para recompilar los .jsx (solo para desarrollo)
```

## Modificar el código

Editá los archivos `.jsx` en `app/` y recompilá a `.js` con:

```
node build/build.js
```

(La primera vez, instalá las dependencias de compilación: `cd build && npm install`.)
El HTML carga los `.js` compilados, no los `.jsx`.
