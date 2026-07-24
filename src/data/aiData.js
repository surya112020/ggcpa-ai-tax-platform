// ============================================================
// MOCK DATA — Challenge 10 (Trustworthy AI)
// Simulated AI output. getAiSuggestions() is a stub returning fixed
// JSON in the SAME SHAPE a real model endpoint would, so the UI is
// genuinely wired and could point at a real model with no UI changes.
//
// Scenarios are deliberately varied to prove the UI against real edge
// cases (not a single happy path): a multi-doc correction, a domain
// compliance warning (cannabis IRC 280E — GreenGrowth's specialty),
// a low-confidence scan, a document conflict, an AI that refuses to
// guess when evidence is missing, and an informational suggestion.
// ============================================================

const SUGGESTIONS = [
  {
    id: 'ai-1',
    client: 'Priya Raman · Individual',
    kind: 'correction',
    severity: 'high',
    title: 'Wages may be understated — a second W-2 was found',
    field: 'Form 1040 · Line 1a — Wages',
    current: '$124,000.00',
    suggested: '$182,540.00',
    confidence: 0.88,
    summary: 'A second W-2 (Northwind Traders) was uploaded but its wages were not included in Line 1a. Adding it raises wages by $58,540.',
    reasoning:
      'Line 1a currently reflects only the Acme Robotics W-2. A second W-2 from Northwind Traders LLC was found in the document set with $58,540.00 in Box 1. IRS rules require all W-2 Box 1 amounts to be summed onto Line 1a, so the second employer should be included.',
    evidence: [
      { icon: 'file', label: 'W-2 — Acme Robotics, Box 1', value: '$124,000.00' },
      { icon: 'file', label: 'W-2 — Northwind Traders, Box 1', value: '$58,540.00' },
      { icon: 'calc', label: 'Sum applied to Line 1a', value: '$182,540.00' },
    ],
    uncertainty:
      'Confidence is not 100% because the two W-2s share the same employee SSN but slightly different name spellings ("Priya Raman" vs "Priya R. Raman"). Confirm both belong to this taxpayer before accepting.',
    recommendedAction: 'Review both W-2s side by side, confirm identity, then accept the combined total.',
  },
  {
    id: 'ai-280e',
    client: 'Emerald Coast Dispensary LLC · Cannabis (CA)',
    kind: 'warning',
    severity: 'high',
    title: 'IRC 280E — operating expenses may be non-deductible',
    field: 'Form 1120 · Deductions — Operating expenses',
    current: '$412,000 deducted',
    suggested: 'Disallow below-the-line; reclass eligible costs to COGS',
    confidence: 0.79,
    summary: 'This is a cannabis business. Under IRC 280E, ordinary operating expenses are not deductible — only cost of goods sold. $412,000 of operating expenses were deducted below the COGS line.',
    reasoning:
      'IRC 280E disallows deductions for any business trafficking in a Schedule I substance; cannabis is federally Schedule I. The only amount a cannabis seller may deduct is cost of goods sold (COGS). This return deducted $412,000 of rent, marketing, and administrative salaries below the COGS line — those are disallowed. A portion of production-related overhead may be reclassifiable into COGS under §471, which would preserve its deductibility.',
    evidence: [
      { icon: 'chart', label: 'P&L — operating expenses (below COGS)', value: '$412,000.00' },
      { icon: 'chart', label: 'COGS already claimed', value: '$1,284,500.00' },
      { icon: 'rule', label: 'Rule applied', value: 'IRC §280E' },
    ],
    uncertainty:
      'The AI cannot determine how much of the $412,000 is production-related (reclassifiable into COGS) versus pure retail/admin (permanently disallowed) — that requires a cost-accounting allocation a preparer must perform. Treat the reclass figure as a prompt, not an answer.',
    recommendedAction: 'Review the cost allocation, move production overhead into COGS under §471, and disallow the remainder.',
  },
  {
    id: 'ai-conflict',
    client: 'Priya Raman · Individual',
    kind: 'correction',
    severity: 'high',
    title: 'Two versions of the same W-2 — a corrected W-2c was filed',
    field: 'Form 1040 · Line 1a — Wages (Acme Robotics)',
    current: '$124,000.00 (original W-2)',
    suggested: '$121,500.00 (W-2c)',
    confidence: 0.83,
    summary: 'A corrected W-2c from Acme Robotics was uploaded after the original. It lowers Box 1 by $2,500. The return is still using the original figure.',
    reasoning:
      'A W-2c supersedes the W-2 it corrects. The W-2c from Acme Robotics reduces Box 1 wages from $124,000.00 to $121,500.00 (a $2,500 correction, likely a reclassified fringe benefit). The return should use the corrected amount, which also changes the two-employer wage total.',
    evidence: [
      { icon: 'file', label: 'Original W-2 — Box 1', value: '$124,000.00' },
      { icon: 'file', label: 'Corrected W-2c — Box 1', value: '$121,500.00' },
      { icon: 'date', label: 'W-2c issued', value: 'after original' },
    ],
    uncertainty:
      'Confirm the W-2c is the final version (not itself later corrected) and that it matches the same employer EIN and employee before overwriting the original.',
    recommendedAction: 'Verify the W-2c is final, then accept the corrected figure.',
  },
  {
    id: 'ai-3',
    client: 'Priya Raman · Individual',
    kind: 'extraction',
    severity: 'medium',
    title: 'Low-confidence read on 1099-INT interest amount',
    field: 'Form 1040 · Line 2b — Taxable interest',
    current: '$1,204.00',
    suggested: '$1,204.00',
    confidence: 0.71,
    summary: 'The interest figure was read from a scanned 1099-INT where Box 1 and Box 3 are close together. The value looks right but should be eyeballed.',
    reasoning:
      'The uploaded 1099-INT is a photo, not a digital PDF. Box 1 (interest income) and Box 3 (US savings bond interest) are adjacent, and low-resolution scans sometimes cause the two to be swapped. Box 3 reads $0.00, so a swap would be visible, which raises confidence — but not to certainty.',
    evidence: [
      { icon: 'file', label: '1099-INT — Box 1, interest income', value: '$1,204.00' },
      { icon: 'file', label: '1099-INT — Box 3 (adjacent box)', value: '$0.00' },
    ],
    uncertainty:
      'Image quality is the limiting factor. If the client uploads the original PDF instead of a photo, confidence would rise.',
    recommendedAction: 'Glance at the highlighted box on the source, then accept or request a cleaner copy.',
  },
  {
    id: 'ai-missing',
    client: 'Vertex Labs Inc. · Technology',
    kind: 'blocked',
    severity: 'medium',
    title: "R&D credit can't be computed — required documents missing",
    field: 'Form 1120 · R&D tax credit (Form 6765)',
    current: 'Not calculated',
    suggested: 'Blocked — 2 documents needed',
    confidence: null,
    summary: 'The AI will not estimate the R&D credit because the qualified-research-expense (QRE) documentation has not been uploaded. It is asking for evidence rather than guessing.',
    reasoning:
      'Form 6765 requires QRE detail: wages for qualified services, supplies, and contract research. None of those source documents are in the file. Any credit figure produced now would be fabricated, so the AI declines to compute one and flags exactly what it needs. Refusing to guess is the correct behavior for a number that must survive audit.',
    evidence: [
      { icon: 'block', label: 'QRE payroll allocation', value: 'not uploaded' },
      { icon: 'block', label: 'Contractor 1099-NEC (contract research)', value: 'not uploaded' },
      { icon: 'rule', label: 'Form required', value: 'Form 6765' },
    ],
    uncertainty:
      'There is deliberately no suggested number here. A trustworthy AI says “I cannot compute this yet” instead of inventing a defensible-looking figure with no evidence behind it.',
    recommendedAction: 'Request the two missing documents from the client; the credit will compute automatically once they arrive.',
  },
  {
    id: 'ai-4',
    client: 'Priya Raman · Individual',
    kind: 'suggestion',
    severity: 'low',
    title: 'Consider the standard deduction instead of itemizing',
    field: 'Form 1040 · Line 12 — Deduction',
    current: 'Itemized · $19,949',
    suggested: 'Standard · $15,000',
    confidence: 0.45,
    summary: 'Itemized deductions ($19,949) currently exceed the standard deduction, so itemizing is likely correct — but the mortgage limitation could flip this. Re-check after resolving it.',
    reasoning:
      'Right now itemized deductions total $19,949 versus a $15,000 standard deduction, so itemizing wins by $4,949. However, if the mortgage-interest limitation is applied, itemized drops to ~$18,512 and itemizing still wins, but by less. This is informational, not a required change.',
    evidence: [
      { icon: 'calc', label: 'Itemized total (current)', value: '$19,949.00' },
      { icon: 'rule', label: 'Standard deduction (single, 2025)', value: '$15,000.00' },
    ],
    uncertainty:
      'Low confidence by design — this is a judgment call that depends on how the mortgage limitation is resolved. Shown as informational, not actionable yet.',
    recommendedAction: 'Resolve the mortgage limitation first, then revisit if desired. No action required now.',
  },
];

// Stub "endpoint". A real integration would fetch() this.
export function getAiSuggestions() {
  return SUGGESTIONS.map((s) => ({ ...s }));
}

export const severityMeta = {
  high:   { label: 'High priority', cls: 'pill-risk' },
  medium: { label: 'Medium',        cls: 'pill-warn' },
  low:    { label: 'Informational', cls: 'pill-info' },
};

export const kindMeta = {
  correction:  { label: 'Correction', icon: 'edit', bg: 'var(--risk-100)', fg: 'var(--risk-600)' },
  warning:     { label: 'Compliance warning', icon: 'warning', bg: 'var(--warn-100)', fg: 'var(--warn-600)' },
  extraction:  { label: 'Extraction', icon: 'download', bg: 'var(--ai-100)',   fg: 'var(--ai-600)' },
  blocked:     { label: 'Needs evidence', icon: 'block', bg: 'var(--info-100)', fg: 'var(--info-600)' },
  suggestion:  { label: 'Suggestion', icon: 'idea', bg: 'var(--info-100)', fg: 'var(--info-600)' },
};

export function confColor(c) {
  if (c >= 0.85) return 'var(--ok-600)';
  if (c >= 0.65) return 'var(--warn-600)';
  return 'var(--risk-600)';
}
