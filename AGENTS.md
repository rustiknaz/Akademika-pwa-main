# Project Manifest: Urban Glass Dance Studio App (PWA & Admin)

This file serves as the core source of truth for subsequent development sessions, containing the finalized technology stack, theme system, design rules, and UI component specifications.

---

## 🛠️ Technology Stack
* **Frontend Framework:** React 18+ (with Vite)
* **Routing:** `wouter` (client-side & admin routing with nested routes)
* **Styling & Theme:** Tailwind CSS + CSS Variables (`ThemeContext`)
* **Animations & Physics:** `framer-motion` (spring dynamics, tap/hover feedback)
* **Icons:** `lucide-react` (standardized across the app)
* **Database & Auth:** Supabase Client

---

## 🎨 Design System & Color Palette

### 1. Primary Accent System (Pantone Palette)
Managed dynamically via `ThemeContext` and CSS variables (`--accentColor`, `--accentTextColor`, `--accentGlowRgb`).

* **Sun Glare / Canary Lime:** `#CCFF00`
  * Text contrast: `text-black` / `#000000`
  * Glow: `rgba(204, 255, 0, 0.3)`
  * Use: Primary default accent for active states, CTA buttons, active calendar dates, and high-priority badges.
* **Exuberant Orange:** `#FF4500`
  * Text contrast: `text-white` / `#ffffff`
  * Glow: `rgba(255, 69, 0, 0.3)`
  * Use: High-energy warm accent preset.
* **Blue Violet:** `#6B52E1`
  * Text contrast: `text-white` / `#ffffff`
  * Glow: `rgba(107, 82, 225, 0.3)`
  * Use: Premium cyberpunk purple accent preset.

### 2. Neutral Palette
* **Dark Canvas (Dark Mode):** `#000000` or `#09090b` (`text-white`)
* **Light Canvas (Light Mode):** `#FFFFFF` (`bg-white` / `text-black`)
* **Iron (Day Control Background):** `#CDD2D7`
* **Cloud Dancer / Card Surface:** `bg-[#DDE2E5]` (Light) / `bg-zinc-900/60` (Dark)
* **Borders:** `border-zinc-800/80` (Dark) / `border-black/10` or `border-zinc-200` (Light)

---

## 📐 Tailwind Layout & Surface Standards

* **Page Root Container (Full Viewport Fluid):**
  ```tsx
  <div className={`min-h-screen h-screen h-[100dvh] flex flex-col overflow-hidden px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] font-sans relative transition-colors duration-300 ${
    theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'
  }`}>
  ```

* **Urban Glass Card (Rounded 32px):**
  ```tsx
  <div className={`p-5 rounded-[32px] border backdrop-blur-md transition-colors ${
    theme === 'light' 
      ? 'bg-[#DDE2E5]/80 border-black/10 text-black shadow-sm' 
      : 'bg-zinc-900/60 border-zinc-800/80 text-white'
  }`}>
  ```

* **Dynamic Accent Action Button (Rounded 16px):**
  ```tsx
  <button
    style={{ backgroundColor: accentColor, color: accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff' }}
    className="w-full h-14 font-black text-base uppercase rounded-[16px] flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer border-none"
  >
    {/* Label & Icon */}
  </button>
  ```

* **Standard Form Input (Rounded 16px):**
  ```tsx
  <input 
    className={`w-full h-12 rounded-[16px] px-4 font-semibold focus:outline-none focus:ring-2 text-sm transition-colors ${
      theme === 'light' 
        ? 'bg-[#DDE2E5]/90 border border-black/10 text-black placeholder:text-zinc-500' 
        : 'bg-zinc-800/80 border border-white/10 text-white placeholder:text-zinc-500'
    }`}
  />
  ```

---

## ⚡ ThemeContext Architecture

Located at `/client/src/context/ThemeContext.tsx`.

* **Exported Values:**
  * `theme`: `'light' | 'dark'`
  * `setTheme(theme)`: Updates state, `localStorage('app-theme')`, toggles `.dark` class on `<html>` and dynamically sets `document.body.style.backgroundColor` (`#F3F4F6` vs `#000000`).
  * `accent`: `'lime' | 'orange' | 'violet'`
  * `setAccent(accent)`: Updates state, `localStorage('app-accent')`, applies CSS variable `--accentColor`.
  * `accentColor`: Current HEX value (e.g. `#CCFF00`).
  * `accentConfig`: Object containing `{ id, name, hex, textColor, textHex, glowRgb }`.

---

## 🪟 Urban Glass Center Modal Dialog Template

```tsx
<AnimatePresence>
  {isOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      {/* Glass Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className={`relative z-10 w-full max-w-md p-6 rounded-[28px] border shadow-2xl backdrop-blur-xl transition-colors ${
          theme === 'light'
            ? 'bg-white/90 border-black/10 text-black'
            : 'bg-zinc-900/90 border-zinc-800 text-white'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black uppercase tracking-tight">Заголовок Окна</h3>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Modal Content */}
        </div>

        <div className="mt-6">
          <button
            style={{ backgroundColor: accentColor, color: accentConfig.textColor === 'text-black' ? '#000000' : '#ffffff' }}
            className="w-full h-12 font-black uppercase text-sm rounded-full shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer border-none"
          >
            Подтвердить
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
```

---

## 🏢 Rules for Admin Panel Porting

1. **Top Header & Back Navigation:** Use dynamic contrast icons based on `theme === 'light'` (`bg-black/5 text-black` vs `bg-white/10 text-white`).
2. **Action Floating Capsule:** Position `fixed bottom-24 right-6` with `backgroundColor: accentColor` and spring hover animation.
3. **Table & List Rows:** Render inside `rounded-[24px]` glass containers with `border-black/10` (light) or `border-zinc-800/80` (dark).
4. **Filter Tabs:** Selected tab uses `backgroundColor: accentColor`, `color: activeTextColor`. Unselected tab uses `bg-[#CDD2D7]` (Light) / `bg-zinc-800` (Dark).

