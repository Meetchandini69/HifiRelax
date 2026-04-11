# Chennai Call Girls Services Agency — Local Setup Guide

## Requirements

Install these on your computer before starting:

- **Node.js** v18+ → https://nodejs.org/en/download
- **pnpm** → Run: `npm install -g pnpm`

---

## Run Locally (3 Steps)

### Step 1 — Extract the ZIP
Unzip the downloaded file anywhere on your computer.

### Step 2 — Install Dependencies
Open a terminal inside the extracted folder:
```bash
pnpm install
```

### Step 3 — Start the Dev Server
```bash
pnpm run dev
```
Open your browser at: **http://localhost:5173**

The page reloads automatically whenever you save a file.

---

## Build for Production

```bash
pnpm run build
```

Output goes into the `dist/` folder. Upload that folder to any web host.

### Preview the production build locally
```bash
pnpm run preview
```

---

## Customizing the Website

All page sections are individual files inside `src/components/`:

| File | Section |
|------|---------|
| `Navbar.tsx` | Top navigation bar |
| `Hero.tsx` | Hero banner with CTA |
| `About.tsx` | About the agency |
| `Benefits.tsx` | 8-card benefits grid |
| `Services.tsx` | Services offered |
| `Categories.tsx` | Escort category cards |
| `CTABanner.tsx` | Mid-page call-to-action |
| `Locations.tsx` | Adyar, T Nagar, ECR… |
| `FeaturedProfiles.tsx` | Profile cards |
| `HiringProcess.tsx` | 4-step process |
| `FAQ.tsx` | Accordion FAQ |
| `Footer.tsx` | SEO-rich footer |

---

### Change Phone Number

Search for `98765 43210` across all files and replace with your number.

In VS Code: `Ctrl + Shift + H` → Find All → Replace All.

### Change Colors

Edit `src/index.css`. The two main gradient utilities:

```css
/* Dark hero background */
.gradient-hero {
  background: linear-gradient(135deg, #1a0a12 0%, #3d1027 40%, #6b1a3a 70%, #a01d50 100%);
}

/* Pink CTA buttons */
.gradient-pink {
  background: linear-gradient(135deg, #c92060 0%, #e91e8c 100%);
}
```

Change the hex codes to your preferred brand colors.

### Change Agency Name / Branding

- `src/components/Navbar.tsx` — Logo text and tagline
- `src/components/Footer.tsx` — Footer brand name
- `index.html` — Page `<title>` and meta description

### Add/Edit FAQ Items

Open `src/components/FAQ.tsx` and edit the `faqs` array:

```tsx
const faqs = [
  {
    question: "Your question here?",
    answer: "Your detailed answer here.",
  },
  // ... add or remove items
];
```

### Add/Edit Location Cards

Open `src/components/Locations.tsx` and edit the `locations` array:

```tsx
const locations = [
  {
    area: "Your Area",
    description: "Description of service in this area.",
    landmarks: ["Landmark 1", "Landmark 2"],
    color: "from-pink-500 to-rose-600",
  },
  // ...
];
```

### Swap Profile Card Images

Open `src/components/FeaturedProfiles.tsx`. Each profile has an `img` field — replace the Unsplash URL with your own hosted image:

```tsx
img: "https://your-domain.com/images/profile1.jpg",
```

### Change Services

Open `src/components/Services.tsx` and edit the `services` array. You can change the icon (from `lucide-react`), title, description, and tag.

---

## Deploy for Free

### Netlify (Easiest)
1. Run `pnpm run build`
2. Go to https://netlify.com → "Add new site" → "Deploy manually"
3. Drag the `dist/` folder into the browser
4. Done — you get a free `.netlify.app` URL instantly

### Vercel
1. Install CLI: `npm i -g vercel`
2. Run `vercel` inside the project folder
3. Follow prompts — auto-detects Vite

### Traditional Web Hosting (cPanel)
1. Run `pnpm run build`
2. Upload the contents of `dist/` to `public_html/` via FTP or File Manager
3. Done

---

## File Structure

```
chennai-agency/
├── src/
│   ├── components/
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
│   ├── App.tsx          ← Assembles all sections
│   ├── index.css        ← Colors, fonts, gradients
│   └── main.tsx         ← Entry point (don't edit)
├── index.html           ← SEO title & meta tags
├── package.json         ← Dependencies
├── vite.config.ts       ← Build config
└── tsconfig.json        ← TypeScript config
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `pnpm: command not found` | Run `npm install -g pnpm` first |
| Port 5173 already in use | Edit `vite.config.ts`, add `server: { port: 3000 }` |
| CSS not showing | Stop server, run `pnpm install` again, then `pnpm run dev` |
| Blank screen | Check browser console (F12) for error messages |
| Build fails | Run `pnpm install` before `pnpm run build` |

---

## Recommended Tools

- **VS Code** (free editor) — https://code.visualstudio.com
  - Install extension: **Tailwind CSS IntelliSense** for class autocomplete
  - Install extension: **Prettier** for auto-formatting
