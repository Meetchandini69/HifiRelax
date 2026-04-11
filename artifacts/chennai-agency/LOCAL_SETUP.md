# Chennai Call Girls Services Agency — Local Setup Guide

## What You Have

A fully built, SEO-optimized React + Tailwind CSS landing page targeting the keyword **"Chennai Call Girls Services Agency"**. Built with:

- **React 18** — Component-based UI
- **Vite** — Fast dev server & bundler
- **Tailwind CSS v4** — Utility-first styling
- **TypeScript** — Type-safe code
- **Lucide React** — Clean icon set
- **Wouter** — Lightweight routing

---

## Prerequisites (Install These First)

Before running locally, install the following on your computer:

1. **Node.js** (v18 or higher) — https://nodejs.org/en/download
2. **pnpm** — https://pnpm.io/installation
   ```bash
   npm install -g pnpm
   ```

---

## Running Locally (Step-by-Step)

### 1. Extract the ZIP

Unzip the downloaded file anywhere on your computer.

### 2. Install Dependencies

Open a terminal/command prompt inside the `chennai-agency` folder:

```bash
cd chennai-agency
pnpm install
```

Wait for all packages to download (first time takes 1–2 minutes).

### 3. Start the Development Server

```bash
PORT=3000 BASE_PATH=/ pnpm run dev
```

> **Windows users** — use this instead:
> ```cmd
> set PORT=3000 && set BASE_PATH=/ && pnpm run dev
> ```

### 4. Open in Browser

Go to: **http://localhost:3000**

The page will **auto-refresh** whenever you save any file.

---

## Making Changes

All the page content lives in individual component files inside `src/components/`:

| File | What It Controls |
|------|-----------------|
| `src/components/Navbar.tsx` | Top navigation bar |
| `src/components/Hero.tsx` | Hero/banner section |
| `src/components/About.tsx` | About the agency section |
| `src/components/Benefits.tsx` | 8-card benefits grid |
| `src/components/Services.tsx` | Services offered |
| `src/components/Categories.tsx` | Escort category cards |
| `src/components/CTABanner.tsx` | Mid-page call-to-action banner |
| `src/components/Locations.tsx` | Adyar, T Nagar, ECR etc. |
| `src/components/FeaturedProfiles.tsx` | Profile cards section |
| `src/components/HiringProcess.tsx` | Step-by-step process |
| `src/components/FAQ.tsx` | FAQ accordion |
| `src/components/Footer.tsx` | Keyword-rich footer |
| `src/index.css` | Global colors and theme |
| `src/App.tsx` | Page title & meta description |

---

## Common Customizations

### Change the Phone Number

Search for `+91 98765 43210` across all component files and replace with your actual number.

Use Find & Replace (Ctrl+H in VS Code) for all files at once.

### Change the Agency Name

In `src/components/Navbar.tsx` and `src/components/Footer.tsx`, find `Chennai Agency` and update.

### Change Colors (Theme)

Open `src/index.css` and edit the CSS variables under `:root`:

```css
:root {
  --primary: 328 85% 45%;   /* Main pink color (HSL format) */
  --accent: 328 70% 55%;    /* Accent pink */
}
```

The `gradient-hero` class controls the hero dark gradient:
```css
.gradient-hero {
  background: linear-gradient(135deg, #1a0a12 0%, #3d1027 40%, #6b1a3a 70%, #a01d50 100%);
}
```

### Add/Remove FAQ Items

Open `src/components/FAQ.tsx` and edit the `faqs` array:
```tsx
const faqs = [
  {
    question: "Your question here?",
    answer: "Your answer here.",
  },
  // add or remove items...
];
```

### Change Profile Cards

Open `src/components/FeaturedProfiles.tsx` and edit the `profiles` array. To use your own image, replace the `img` URL with a local path or your hosted image URL.

### Change Location Cards

Open `src/components/Locations.tsx` and edit the `locations` array — add or remove locations as needed.

### Add/Remove Service Cards

Open `src/components/Services.tsx` and edit the `services` array.

---

## Build for Production (Deploy to Your Server)

To generate optimized production files:

```bash
PORT=3000 BASE_PATH=/ pnpm run build
```

> **Windows:**
> ```cmd
> set PORT=3000 && set BASE_PATH=/ && pnpm run build
> ```

The output will be in the `dist/public/` folder. Upload that folder's contents to any web host (Netlify, Vercel, cPanel, etc.).

### Deploy on Netlify (Free)

1. Go to https://netlify.com and sign up for free
2. Click **"Add new site" → "Deploy manually"**
3. Drag and drop the `dist/public/` folder
4. Your site goes live instantly with a free `.netlify.app` domain

### Deploy on Vercel (Free)

1. Go to https://vercel.com and sign up
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel` inside the project folder
4. Follow the prompts — it auto-detects Vite

---

## Recommended Code Editor

Use **VS Code** (free): https://code.visualstudio.com/

Helpful extensions:
- **Tailwind CSS IntelliSense** — autocomplete for Tailwind classes
- **ES7+ React snippets** — quick React component shortcuts
- **Prettier** — auto-format your code

---

## File Structure Overview

```
chennai-agency/
├── src/
│   ├── components/         ← All page sections (edit these!)
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Benefits.tsx
│   │   ├── Services.tsx
│   │   ├── Categories.tsx
│   │   ├── CTABanner.tsx
│   │   ├── Locations.tsx
│   │   ├── FeaturedProfiles.tsx
│   │   ├── HiringProcess.tsx
│   │   ├── FAQ.tsx
│   │   └── Footer.tsx
│   ├── index.css           ← Colors, fonts, theme
│   ├── App.tsx             ← Page title & meta tags
│   └── main.tsx            ← Entry point (don't edit)
├── index.html              ← HTML shell
├── package.json            ← Dependencies list
├── vite.config.ts          ← Dev server config
└── tsconfig.json           ← TypeScript config
```

---

## Need Help?

If you get stuck, the most common fixes are:

- **"Module not found" error** → Run `pnpm install` again
- **Port already in use** → Change `PORT=3000` to `PORT=4000`
- **Blank screen** → Check browser console (F12) for errors
- **CSS not updating** → Hard refresh with Ctrl+Shift+R

---

*Generated by Replit Agent — Chennai Call Girls Services Agency Website*
