// ============================================================
// MOCK DATA — Challenge 1 (Source Document Traceability)
// Everything here is fabricated. No real OCR, no parsing.
// The traceability links (field -> value -> document -> region ->
// transformation) are hand-authored to demonstrate the interaction.
// ============================================================

export const client = {
  name: 'Priya Raman',
  entity: 'Individual · Form 1040',
  taxYear: 2025,
  preparer: 'Daniel Okafor, CPA',
  returnId: 'RTN-2025-00412',
};

// The source documents the client uploaded (simulated).
export const documents = {
  'doc-w2-acme': {
    id: 'doc-w2-acme',
    kind: 'W-2',
    title: 'W-2 — Acme Robotics Inc.',
    filename: 'W2_AcmeRobotics_2025.pdf',
    pages: 1,
    uploaded: 'Feb 3, 2025',
  },
  'doc-w2-northwind': {
    id: 'doc-w2-northwind',
    kind: 'W-2',
    title: 'W-2 — Northwind Traders LLC',
    filename: 'W2_Northwind_2025.pdf',
    pages: 1,
    uploaded: 'Feb 3, 2025',
  },
  'doc-1099int': {
    id: 'doc-1099int',
    kind: '1099-INT',
    title: '1099-INT — Harbor Savings Bank',
    filename: '1099INT_Harbor_2025.pdf',
    pages: 1,
    uploaded: 'Feb 6, 2025',
  },
  'doc-1098': {
    id: 'doc-1098',
    kind: '1098',
    title: '1098 — Mortgage Interest (Cascade Home Loans)',
    filename: '1098_Cascade_2025.pdf',
    pages: 2,
    uploaded: 'Feb 9, 2025',
  },
};

// Return fields. Each has a full traceability record.
// status: 'verified' | 'ai' | 'review' | 'locked'
// A field can be sourced from ONE doc, DERIVED from several, or entered manually.
export const returnFields = [
  {
    id: 'f-wages',
    line: 'Line 1a',
    label: 'Wages, salaries, tips',
    sublabel: 'W-2 box 1 (all employers)',
    section: 'Income',
    value: '$182,540.00',
    status: 'review',
    confidence: 0.88,
    origin: 'derived',
    trace: {
      summary: 'Sum of Box 1 wages from two W-2s.',
      transformation: '124,000.00 (Acme) + 58,540.00 (Northwind) = 182,540.00',
      sources: [
        { docId: 'doc-w2-acme', region: 'Box 1 — Wages, tips, other comp.', page: 1, raw: '$124,000.00' },
        { docId: 'doc-w2-northwind', region: 'Box 1 — Wages, tips, other comp.', page: 1, raw: '$58,540.00' },
      ],
      note: 'Two employers detected. Values added automatically — a common source of client confusion, so both sources are shown explicitly.',
    },
  },
  {
    id: 'f-fed-wh',
    line: 'Line 25a',
    label: 'Federal income tax withheld (W-2)',
    sublabel: 'W-2 box 2 (all employers)',
    section: 'Payments',
    value: '$31,180.00',
    status: 'verified',
    confidence: 0.99,
    origin: 'derived',
    trace: {
      summary: 'Sum of Box 2 federal withholding from two W-2s.',
      transformation: '22,300.00 (Acme) + 8,880.00 (Northwind) = 31,180.00',
      sources: [
        { docId: 'doc-w2-acme', region: 'Box 2 — Federal income tax withheld', page: 1, raw: '$22,300.00' },
        { docId: 'doc-w2-northwind', region: 'Box 2 — Federal income tax withheld', page: 1, raw: '$8,880.00' },
      ],
      note: 'Verified by preparer Feb 12, 2025.',
      verifiedBy: 'Daniel Okafor, CPA',
    },
  },
  {
    id: 'f-interest',
    line: 'Line 2b',
    label: 'Taxable interest',
    sublabel: '1099-INT box 1',
    section: 'Income',
    value: '$1,204.00',
    status: 'ai',
    confidence: 0.71,
    origin: 'single',
    trace: {
      summary: 'Extracted from 1099-INT box 1.',
      transformation: 'Direct copy from source — no transformation applied.',
      sources: [
        { docId: 'doc-1099int', region: 'Box 1 — Interest income', page: 1, raw: '$1,204.00' },
      ],
      note: 'Low-confidence: the source PDF is a scanned image and box 1 sits close to box 3. Flagged for a human to confirm box 1 vs. box 3.',
    },
  },
  {
    id: 'f-mortgage',
    line: 'Sch. A, Line 8a',
    label: 'Home mortgage interest',
    sublabel: '1098 box 1',
    section: 'Itemized Deductions',
    value: '$18,745.00',
    status: 'review',
    confidence: 0.64,
    origin: 'single',
    trace: {
      summary: 'Extracted from 1098 box 1 (mortgage interest received).',
      transformation: 'Direct copy from source — no transformation applied.',
      sources: [
        { docId: 'doc-1098', region: 'Box 1 — Mortgage interest received', page: 1, raw: '$18,745.00' },
      ],
      note: 'Mortgage balance exceeds $750k — deductible interest may be limited under the TCJA cap. AI could not confirm the limitation from the document alone. Needs preparer judgment.',
      warning: 'Possible $750k acquisition-debt limitation not yet applied.',
    },
  },
  {
    id: 'f-agi',
    line: 'Line 11',
    label: 'Adjusted gross income',
    sublabel: 'Calculated',
    section: 'Income',
    value: '$183,744.00',
    status: 'locked',
    confidence: 1.0,
    origin: 'calculated',
    trace: {
      summary: 'Calculated total — not sourced from a single document.',
      transformation: 'Wages 182,540.00 + Taxable interest 1,204.00 − Adjustments 0.00 = 183,744.00',
      sources: [
        { docId: 'doc-w2-acme', region: 'via Line 1a', page: 1, raw: 'Wages' },
        { docId: 'doc-1099int', region: 'via Line 2b', page: 1, raw: 'Interest' },
      ],
      note: 'System-calculated field. Locked — edit the underlying income lines to change it.',
    },
  },
  {
    id: 'f-name',
    line: 'Header',
    label: 'Taxpayer name',
    sublabel: 'Client profile',
    section: 'Filing',
    value: 'Priya Raman',
    status: 'verified',
    confidence: 1.0,
    origin: 'manual',
    trace: {
      summary: 'Entered from the client profile — not extracted from a document.',
      transformation: 'Manual entry.',
      sources: [],
      note: 'Confirmed against government ID on file during onboarding.',
      verifiedBy: 'Client onboarding',
    },
  },
];

// Simulated "document content" we render as a fake PDF page.
// region ids let the viewer highlight the exact box a field came from.
export const docContent = {
  'doc-w2-acme': {
    employer: 'Acme Robotics Inc.',
    employee: 'Priya Raman',
    boxes: [
      { region: 'Box 1 — Wages, tips, other comp.', cap: '1  Wages, tips, other comp.', val: '124,000.00' },
      { region: 'Box 2 — Federal income tax withheld', cap: '2  Federal income tax withheld', val: '22,300.00' },
      { region: 'Box 3 — Social security wages', cap: '3  Social security wages', val: '147,000.00' },
      { region: 'Box 4 — Social security tax', cap: '4  Social security tax withheld', val: '9,114.00' },
    ],
  },
  'doc-w2-northwind': {
    employer: 'Northwind Traders LLC',
    employee: 'Priya Raman',
    boxes: [
      { region: 'Box 1 — Wages, tips, other comp.', cap: '1  Wages, tips, other comp.', val: '58,540.00' },
      { region: 'Box 2 — Federal income tax withheld', cap: '2  Federal income tax withheld', val: '8,880.00' },
      { region: 'Box 3 — Social security wages', cap: '3  Social security wages', val: '58,540.00' },
      { region: 'Box 4 — Social security tax', cap: '4  Social security tax withheld', val: '3,629.48' },
    ],
  },
  'doc-1099int': {
    employer: 'Harbor Savings Bank',
    employee: 'Priya Raman',
    boxes: [
      { region: 'Box 1 — Interest income', cap: '1  Interest income', val: '1,204.00' },
      { region: 'Box 3 — Interest on US savings bonds', cap: '3  Interest on U.S. Savings Bonds', val: '0.00' },
      { region: 'Box 4 — Federal income tax withheld', cap: '4  Federal income tax withheld', val: '0.00' },
    ],
  },
  'doc-1098': {
    employer: 'Cascade Home Loans',
    employee: 'Priya Raman',
    boxes: [
      { region: 'Box 1 — Mortgage interest received', cap: '1  Mortgage interest received from payer', val: '18,745.00' },
      { region: 'Box 2 — Outstanding mortgage principal', cap: '2  Outstanding mortgage principal', val: '812,000.00' },
      { region: 'Box 3 — Mortgage origination date', cap: '3  Mortgage origination date', val: '04/14/2023' },
    ],
  },
};

export const statusMeta = {
  verified: { label: 'Verified', cls: 'pill-ok', dot: true },
  ai:       { label: 'AI extracted', cls: 'pill-ai', dot: true },
  review:   { label: 'Needs review', cls: 'pill-warn', dot: true },
  locked:   { label: 'Calculated · locked', cls: 'pill-neutral', dot: true },
};
