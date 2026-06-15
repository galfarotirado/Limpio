# Limpio — Supabase Email Templates

Branded HTML email templates for all Supabase Auth emails.

## How to apply

1. Go to **Supabase Dashboard → Authentication → Email Templates**
2. For each template, paste the corresponding HTML file content:

| Template | File |
|---|---|
| Confirm signup | `confirm-signup.html` |
| Magic Link | `magic-link.html` |
| Reset Password | `reset-password.html` |
| Email Change | `email-change.html` |

## Template variables (Supabase inserts these automatically)

- `{{ .ConfirmationURL }}` — the action URL
- `{{ .MagicLink }}` — magic link URL  
- `{{ .NewEmail }}` — new email address (email change only)
- `{{ .SiteURL }}` — your site URL

## Email subjects (set in Supabase dashboard)

| Template | Suggested subject |
|---|---|
| Confirm signup | `Confirma tu cuenta en Limpio 🌿` |
| Magic Link | `Tu enlace de acceso a Limpio 🔑` |
| Reset Password | `Restablecer tu contraseña de Limpio` |
| Email Change | `Confirma tu nuevo correo en Limpio` |

## Sender settings (recommended)

- **From name:** `Limpio`
- **From address:** `hola@limpio.app` (or your domain)
- **Reply-to:** `soporte@limpio.app`
