# Limpio — Guía de Setup

## Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Base de datos / Auth**: Supabase
- **Deploy**: Vercel
- **i18n**: next-intl (Español + English)

---

## 1. Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto nuevo.
2. En el editor SQL (SQL Editor) del dashboard, pega y ejecuta el contenido de `supabase/migrations/001_initial.sql`.
3. Copia las claves del proyecto: **Project URL** y **anon public key**.  
   Las encuentras en: *Settings → API*.

---

## 2. Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

---

## 3. Ejecutar en local

```bash
cd limpio
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## 4. Deploy en Vercel

1. Sube el proyecto a GitHub.
2. En [vercel.com](https://vercel.com), haz clic en "Add New Project" e importa el repo.
3. En *Environment Variables*, añade las mismas dos variables que en `.env.local`.
4. Haz clic en "Deploy". ¡Listo!

---

## 5. Configurar email en Supabase (para verificación)

En el dashboard de Supabase ve a *Authentication → Email Templates* y personaliza el mensaje si quieres.

Para producción, configura un proveedor SMTP propio en *Authentication → SMTP Settings* (SendGrid, Resend, etc. — tienen planes gratuitos).

---

## Estructura del proyecto

```
limpio/
├── messages/          # Traducciones (es.json, en.json)
├── src/
│   ├── app/
│   │   └── [locale]/
│   │       ├── page.tsx          # Landing pública
│   │       ├── auth/             # Login, Signup, Onboarding
│   │       └── app/              # Zona privada
│   │           ├── page.tsx      # Dashboard
│   │           ├── diary/        # Diario
│   │           ├── achievements/ # Logros
│   │           ├── stats/        # Estadísticas
│   │           └── settings/     # Ajustes
│   ├── components/    # LiveCounter, MoneySaved, CrisisModal...
│   ├── lib/           # Supabase client/server, achievements logic
│   └── types/         # TypeScript types
└── supabase/
    └── migrations/
        └── 001_initial.sql
```

---

## Features implementadas

- ✅ Contador en vivo (días, horas, minutos, segundos)
- ✅ Dinero ahorrado en tiempo real
- ✅ Botón de crisis con ejercicio de respiración
- ✅ Registro de antojos (intensidad, trigger, localización)
- ✅ Registro de recaídas (reinicia contador, conserva historial)
- ✅ Diario con selector de estado de ánimo
- ✅ 16 logros desbloqueables
- ✅ Estadísticas + heatmap de días limpios
- ✅ Ajustes completos (nombre, fecha, coste, divisa, idioma, razones)
- ✅ Multiidioma: Español + English
- ✅ 100% responsive (sidebar en desktop, bottom nav en móvil)
- ✅ Auth completa con Supabase (signup, login, email verification)
- ✅ RLS en Supabase (cada usuario solo ve sus propios datos)