# GreenGrowth CPAs — AI-Powered Tax Platform (Case Study Prototype)

A greenfield prototype covering two of the ten challenges:

- **Challenge 01 — Source Document Traceability:** trace every number on a return back to the exact box on the exact source document.
- **Challenge 10 — Trustworthy AI:** an AI-review workflow that shows what the model did, why, the evidence, its confidence and uncertainty, and lets a preparer accept / correct / dismiss each suggestion.

Both challenges live inside **one shared product shell** (sidebar, breadcrumbs, role switcher) so they feel like a single platform, not two demos.

**Tailored to GreenGrowth.** GreenGrowth is a PCAOB-registered firm known for cannabis accounting, where numbers must be audit-defensible. The AI review includes 6 deliberately varied scenarios — including an **IRC 280E** cannabis compliance flag and an AI that **refuses to compute** an R&D credit when the source documents are missing — to prove the UI against real edge cases, not a single happy path. See `CHEATSHEET.md` for the full narration guide and interviewer Q&A.

---

## Run it locally

You need [Node.js](https://nodejs.org) (LTS). Then:

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

To make a production build: `npm run build`, then `npm run preview`.

---

## What's real vs. simulated

**Real (genuinely working):**
- The entire frontend — React + Vite, client-side routing, all interactions.
- The traceability model: selecting any field walks the real data structure (field → value → source doc(s) → exact box → transformation) and highlights the matching box on a rendered document.
- Derived fields (e.g. wages summed from two W-2s) let you click between each source and see each one highlighted.
- The AI-review workflow: accept / edit / dismiss actually update state, the queue reflects resolution, and Undo restores it.
- The role switch (Preparer ↔ Client) really changes what the UI exposes (internal notes and raw confidence are hidden from the client).

**Simulated (faked on purpose, per the brief):**
- No OCR, no document parsing, no real AI. `src/data/returnData.js` and `src/data/aiData.js` hold hand-authored mock data.
- `getAiSuggestions()` in `aiData.js` is a stub that returns fixed JSON **in the same shape a real model endpoint would** — so the UI is wired against a realistic contract and could be pointed at a live model later with no UI changes.
- The "documents" are drawn with HTML/CSS to look like a W-2 / 1099 / 1098; they are not real files.
- Confidence scores, the mortgage $750k-limitation math, and the "second W-2 found" scenario are fabricated but plausible.

---

## Design decisions worth calling out

1. **Traceability is a chain, not a tooltip.** Every figure resolves to five explicit links (field, value, document, exact region, transformation). A CPA never has to take the software's word for a number.
2. **Multi-source figures are shown honestly.** Line 1a wages is the sum of two W-2s — a classic source of client confusion — so both sources are listed and individually highlightable, with the arithmetic shown.
3. **Confidence is one consistent component everywhere.** The same meter appears on the return and in AI review, so "how sure is the system" reads identically across the product.
4. **The AI proposes; the human decides.** Nothing changes on the return until a preparer acts. Uncertainty is always shown, not hidden, because hiding it is what makes people distrust AI.
5. **Correcting the AI is a first-class action,** not a fight with the software — Edit captures the right value with a note rather than silently overwriting.
6. **Appropriate detail by audience.** The client role never sees raw confidence percentages or internal preparer notes; the preparer sees everything. Same shell, different surface.

## Where to look in the code
- `src/App.jsx` — shell, routing, role context
- `src/pages/Review.jsx` — Challenge 01
- `src/pages/TrustAI.jsx` — Challenge 10
- `src/data/*.js` — all fabricated data + the AI stub contract
