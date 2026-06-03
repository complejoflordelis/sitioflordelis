# Flor de Lis · Gestión de reservas

App interna para gestionar las reservas del Complejo Flor de Lis (no la ve el cliente).
**Vite + React**, base de datos y login con **Supabase**, y publicada con **Vercel**.

- **Repositorio:** https://github.com/complejoflordelis/sitioflordelis
- **Supabase (proyecto):** `gucgvudiomxhvxirwpks` → `https://gucgvudiomxhvxirwpks.supabase.co`

## Dos modos de funcionamiento

| Modo | Cuándo | Datos | Login |
|------|--------|-------|-------|
| **Local** | Sin ANON KEY en `.env` | En el navegador | No pide login |
| **Nube** | Con Supabase configurado | Base de datos en la nube | Login real con roles |

La app detecta sola en qué modo está. Probás en **Local** y, al cargar la `anon key`, pasa a **Nube**.

---

## 1) Correr la app en tu compu (desarrollo)

```bash
npm install      # solo la primera vez
npm run dev      # abre http://localhost:5173
```

Sin `.env`, arranca en **Modo local** con datos de ejemplo (botón "Restaurar demo").

---

## 2) Subir el código a GitHub

El repo ya está inicializado y con el remoto configurado. Solo falta autenticarte con una cuenta
que tenga permiso sobre `complejoflordelis` y empujar:

```bash
git push -u origin main
```

> Si te da **403 / Permission denied**: la sesión de git de esta PC es de otra cuenta de GitHub.
> Soluciones: iniciar sesión con la cuenta del negocio (Git Credential Manager abre el navegador),
> agregar tu usuario como *collaborator* del repo, o usar un *Personal Access Token* de la cuenta dueña.

---

## 3) Base de datos (Supabase — proyecto `gucgvudiomxhvxirwpks`)

**a. Crear las tablas**
1. Supabase → **SQL Editor** → pegá y ejecutá [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   Crea `cabanas`, `reservas`, `profiles`, la seguridad (RLS) y el alta automática del admin.

**b. Cerrar el registro público** (solo el admin crea usuarios)
2. **Authentication → Sign In / Providers → Email** → desactivá **"Allow new users to sign up"**.

**c. Crear el usuario administrador**
3. **Authentication → Users → Add user** → `complejo.flordelis.admin@gmail.com` + contraseña.
   (Queda con rol **admin** automáticamente.)

**d. Conectar la app**
4. **Project Settings → API**: copiá la **anon public key**.
5. Copiá `.env.example` como `.env` y completá la `VITE_SUPABASE_ANON_KEY` (la URL ya viene cargada).
6. Reiniciá `npm run dev`: ahora la app pide **login**.

> La `anon key` es pública por diseño: la seguridad la dan las reglas RLS. No es un secreto.
> El acceso de Claude a este proyecto está en [`.mcp.json`](.mcp.json) (MCP de Supabase con scope al proyecto).

**e. Alta de usuarios desde la app** (Edge Function)
```bash
npm install -g supabase
supabase login
supabase link --project-ref gucgvudiomxhvxirwpks
supabase functions deploy admin-create-user
```
Después, como admin, en la sección **Usuarios** podés crear operadores. No hay registro público.

---

## 4) Publicar online (Vercel)

La forma recomendada es conectar el repo de GitHub a Vercel (se redeploya solo en cada `git push`):

1. Entrá a [vercel.com/new](https://vercel.com/new) e **importá** `complejoflordelis/sitioflordelis`.
2. Vercel detecta **Vite** automáticamente (build `npm run build`, salida `dist` — ya están en `vercel.json`).
3. En **Settings → Environment Variables** cargá:
   - `VITE_SUPABASE_URL` = `https://gucgvudiomxhvxirwpks.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = *(la anon key)*
   - `VITE_ADMIN_EMAIL` = `complejo.flordelis.admin@gmail.com`
4. **Deploy**. Queda en una URL `https://sitioflordelis.vercel.app` (podés agregar dominio propio).

> Alternativa por CLI: `npm i -g vercel` → `vercel` (preview) → `vercel --prod`.
> Acordate de no olvidar las *Environment Variables* en Vercel: el `.env` local **no** se sube (está en `.gitignore`).

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
vercel.json                    ← config de hosting (Vercel)
.mcp.json                      ← MCP de Supabase (scope al proyecto)
.env.example                   ← plantilla de configuración
src/
  main.jsx, App.jsx            ← arranque + shell + navegación + gate de login
  styles.css
  lib/        fdl.js, whatsapp.js, supabaseClient.js
  components/ ui.jsx, RangePicker.jsx
  pages/      Dashboard, ReservaForm, Calendario, ReservasTable, Cabanas, Usuarios
  auth/       AuthProvider.jsx, Login.jsx
  data/       useData.js (nube/local), mappers.js
supabase/
  migrations/0001_init.sql                ← esquema + RLS + admin
  functions/admin-create-user/index.ts    ← alta de usuarios (solo admin)
_prototipo-original/                       ← el diseño original (referencia)
```

## Cambiar el email del administrador

Cambialo en **dos lugares**: la variable `VITE_ADMIN_EMAIL` (en `.env` y en Vercel) y la línea del
trigger en `supabase/migrations/0001_init.sql` (`lower(new.email) = '...'`).
