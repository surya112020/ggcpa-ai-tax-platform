# How to put this online (get your submission link)

You need a public link to submit. Here are two easy options — pick ONE.

## Option A — Vercel (recommended, ~5 min, free)

1. Make a free account at https://vercel.com (sign in with GitHub or email).
2. Install the tool and deploy — in a terminal, inside this project folder:
   ```bash
   npm install
   npm run build
   npx vercel --prod
   ```
3. The first time, it asks a few questions — accept the defaults (press Enter).
   When it asks the build/output settings, Vercel auto-detects Vite; just accept.
4. It prints a public URL like `https://ggcpa-tax-platform.vercel.app`. **That's your submission link.**

## Option B — Netlify Drop (no account, drag-and-drop)

1. In a terminal inside this folder:
   ```bash
   npm install
   npm run build
   ```
   This creates a `dist` folder.
2. Go to https://app.netlify.com/drop
3. Drag the **`dist`** folder onto the page.
4. It gives you a public URL instantly. **That's your submission link.**

> Tip: open your link in a fresh browser tab and click through it once before submitting,
> just to confirm it loads.
