# Finch — design theme reference

Concise notes from project theming decisions. Use this when implementing UI, writing skills, or keeping Tailwind tokens aligned.

## Global surface

- **Page / HTML background:** Tailwind **`stone-100`** (`bg-stone-100` on `html`).
- **Body copy feel:** **`antialiased`** on `html` (current setup).

## Colors

| Token | Hex | Notes |
|-------|-----|--------|
| `stone-150` | `#eeedec` | Project extension between `stone-100` and `stone-200` (`--color-stone-150` in `@theme`) |

Use like any Tailwind color: `bg-stone-150`, `text-stone-150`, `border-stone-150`, etc.

## Typography

### Fonts

| Role | Font | Tailwind token / utility |
|------|------|---------------------------|
| Default (UI, paragraphs) | **Nunito Sans** | `font-sans` → `@theme --font-sans` |
| Display, headings, buttons | **Nunito** | `font-display` → `@theme --font-display` |

### Base application (current)

- **`html`:** `font-sans`, `bg-stone-100`, `antialiased`.
- **`h1`–`h6`:** `font-display`.
- **`button`** and **`input[type='button']` / `submit` / `reset`:** `font-display`.

Link-styled controls (`<a>` as a button) do **not** get Nunito automatically — add **`font-display`** (or equivalent) in component classes.

## Where it lives

Implementation: **`src/routes/layout.css`** (`@theme`, `@layer base`, font import).

## Stack reminder

Tailwind CSS v4, SvelteKit, theme extended via `@theme` in CSS (no separate `tailwind.config` in this repo).
