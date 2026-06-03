# Flor de Lis · Gestión de reservas

App interna para gestionar las reservas del Complejo Flor de Lis (no la ve el cliente).
Construida con **Vite + React**, base de datos y login con **Supabase**, y publicada con **Firebase Hosting**.

## Dos modos de funcionamiento

| Modo | Cuándo | Datos | Login |
|------|--------|-------|-------|
| **Local** | Sin configurar Supabase (`.env` vacío) | En el navegador | No pide login |
| **Nube** | Con Supabase configurado | Base de datos en la nube | Login real con roles |

La app detecta sola en qué modo está. Podés desarrollar/probar en **Local** y, cuando cargás las
claves de Supabase, pasa automáticamente a **Nube**.

---

## 1) Correr la app en tu compu (desarrollo)

```bash
npm install      # solo la primera vez
npm run dev      # abre http://localhost:5173
```

Sin `.env`, arranca en **Modo local** con datos de ejemplo. Botón "Restaurar demo" para resetear.

---

## 2) Conectar la base de datos (Supabase)

**a. Cuenta y proyecto**
1. Creá el Gmail del negocio: **complejo.flordelis.admin@gmail.com**.
2. Entrá a [supabase.com](https://supabase.com) con ese Gmail → **New project** (anotá la contraseña de la base).

**b. Crear las tablas**
3. En el panel de Supabase → **SQL Editor** → pegá y ejecutá el contenido de
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   Esto crea las tablas `cabanas`, `reservas`, `profiles`, la seguridad (RLS) y el alta automática del admin.

**c. Cerrar el registro público** (solo el admin crea usuarios)
4. Supabase → **Authentication → Sign In / Providers → Email** → **desactivá "Allow new users to sign up"**.

**d. Crear el usuario administrador**
5. Supabase → **Authentication → Users → Add user** → email `complejo.flordelis.admin@gmail.com` + contraseña.
   (Al crearlo, queda con rol **admin** automáticamente.)

**e. Conectar la app a Supabase**
6. Supabase → **Project Settings → API**: copiá **Project URL** y la **anon public key**.
7. En la carpeta del proyecto, copiá `.env.example` como `.env` y completá:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   VITE_ADMIN_EMAIL=complejo.flordelis.admin@gmail.com
   ```
8. Reiniciá `npm run dev`. Ahora la app pide **login**.

> La `anon key` es pública por diseño: la seguridad la dan las reglas RLS de la base. No es un secreto.

---

## 3) Crear operadores (recepción) desde la app

El alta de usuarios la hace una **Edge Function** (con permisos de servidor). Una sola vez:

```bash
npm install -g supabase          # CLI de Supabase (si no la tenés)
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase functions deploy admin-create-user
```

Listo: entrando como admin, en la sección **Usuarios** podés crear operadores (nombre, email, contraseña, rol)
y activarlos/desactivarlos. No hay registro público.

> El `service_role` que usa la función ya está disponible para la función dentro de Supabase; **no** va en la app.

---

## 4) Publicar online (Firebase Hosting)

```bash
npm install -g firebase-tools    # CLI de Firebase (si no la tenés)
firebase login
```

1. Creá un proyecto en [console.firebase.google.com](https://console.firebase.google.com) (con el mismo Gmail).
2. Poné su ID en [`.firebaserc`](.firebaserc) reemplazando `TU_PROYECTO_FIREBASE`.
3. Compilá y publicá:
   ```bash
   npm run build
   firebase deploy
   ```
4. Te queda una URL del estilo `https://tu-proyecto.web.app`. (Opcional: conectar un dominio propio
   desde Firebase → Hosting → Add custom domain.)

> Cada vez que cambies algo: `npm run build` y `firebase deploy`.

---

## Roles y permisos

- **Admin** (`complejo.flordelis.admin@gmail.com`): todo, incluida la sección **Usuarios**.
- **Operador**: carga y edita reservas y cabañas; no ve la sección Usuarios.
- Datos protegidos por **RLS**: nadie sin sesión activa lee la base.

## Funciones destacadas

- Registrar reserva con calendario que bloquea fechas ocupadas, importe total o por noche, autocompletado de ciudades.
- Calendario mensual por cabaña, tabla de transacciones editable con totales y export CSV, dashboard con períodos y comparativas.
- **WhatsApp en un clic**: en el detalle de cada reserva y en la tabla, abre WhatsApp con un mensaje de confirmación prearmado (número argentino normalizado).

## Estructura del proyecto

```
index.html                     ← entrada (Vite)
src/
  main.jsx, App.jsx            ← arranque + shell + navegación + gate de login
  styles.css
  lib/        fdl.js (utilidades/cálculos), whatsapp.js, supabaseClient.js
  components/ ui.jsx (logo, iconos, primitivos), RangePicker.jsx
  pages/      Dashboard, ReservaForm, Calendario, ReservasTable, Cabanas, Usuarios
  auth/       AuthProvider.jsx, Login.jsx
  data/       useData.js (nube/local), mappers.js
supabase/
  migrations/0001_init.sql                ← esquema + RLS + admin
  functions/admin-create-user/index.ts    ← alta de usuarios (solo admin)
firebase.json, .firebaserc                ← hosting
.env.example                              ← plantilla de configuración
_prototipo-original/                      ← el diseño original (referencia)
```

## Cambiar el email del administrador

Si usás otro email de admin, cambialo en **dos lugares**: la variable `VITE_ADMIN_EMAIL` del `.env`
y la línea del trigger en `supabase/migrations/0001_init.sql` (`lower(new.email) = '...'`).
