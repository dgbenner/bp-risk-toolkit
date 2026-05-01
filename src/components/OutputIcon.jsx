// Output icons + label formatting for the OUTPUT row.
//
// Layout: monoline icon on the left, sentence-case label to the right.
// Icons sized larger than before (32px) as placeholders until the brand
// icons are sourced. Label format: "Item — Modifier" (sentence case).

const MODIFIERS = ['DRAFT', 'REVIEWED', 'AGREED', 'APPROVED', 'COMPLETED', 'GENERATED', 'FINAL']
const ACRONYMS = new Set(['SF', 'BI', 'RV', 'BP', 'TSV'])
const SMALL_WORDS = new Set(['of', 'to', 'for', 'and', 'the', 'in', 'on', 'at'])

const FORMAT_SUFFIX = {
  doc: '.doc',
  checklist: 'Checklist',
  report: 'Report',
  email: 'Email',
  integration: 'Integration',
}

function formatLabel(raw, type) {
  if (!raw) return { body: '', suffix: FORMAT_SUFFIX[type] }
  let body
  if (/^ToR-APPROVED$/i.test(raw)) {
    body = 'Terms of Reference — Approved'
  } else {
    const slashIdx = raw.indexOf(' / ')
    let inner = slashIdx >= 0 ? raw.slice(slashIdx + 3) : raw

    const modRe = new RegExp(`^(${MODIFIERS.join('|')})\\s+(.+)$`, 'i')
    const m = inner.match(modRe)
    let modifier = null
    if (m) {
      modifier = m[1]
      inner = m[2]
    }

    const titleCased = inner.split(/\s+/).map((word, i) => {
      const upper = word.toUpperCase()
      const lower = word.toLowerCase()
      if (upper === 'TOR') return 'ToR'
      if (ACRONYMS.has(upper)) return upper
      if (SMALL_WORDS.has(lower) && i > 0) return lower
      if (word === '+' || word === '&') return word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    }).join(' ')

    if (modifier) {
      const cap = modifier.charAt(0).toUpperCase() + modifier.slice(1).toLowerCase()
      body = `${titleCased} — ${cap}`
    } else {
      body = titleCased
    }
  }
  return { body, suffix: FORMAT_SUFFIX[type] }
}

const ICON_PATHS = {
  // Page with folded corner + body text lines.
  doc: (
    <>
      <path d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M14 2v4a1 1 0 0 0 1 1h3" />
      <path d="M8 12h8M8 15h8M8 18h5" />
    </>
  ),
  // Clipboard with two checkmarks.
  checklist: (
    <>
      <rect x="5" y="4" width="14" height="18" rx="1" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M8 11l1.6 1.6L13 9.2" />
      <path d="M8 17l1.6 1.6L13 15.2" />
    </>
  ),
  // Page with bar chart.
  report: (
    <>
      <path d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M14 2v4a1 1 0 0 0 1 1h3" />
      <path d="M9 18v-3" />
      <path d="M12 18v-6" />
      <path d="M15 18v-4" />
    </>
  ),
  // Envelope.
  email: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="1" />
      <path d="M3 7l9 7 9-7" />
    </>
  ),
  // Two linked squares.
  integration: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
      <path d="M11 7h2a2 2 0 0 1 2 2v2" />
      <path d="M13 17h-2a2 2 0 0 1-2-2v-2" />
    </>
  ),
}

export default function OutputIcon({ type, label }) {
  const path = ICON_PATHS[type] || ICON_PATHS.doc
  const { body, suffix } = formatLabel(label, type)
  return (
    <div className="flex items-center gap-1">
      <svg
        viewBox="0 0 24 24"
        className="w-8 h-8 flex-shrink-0 text-bp-dark-grey"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {path}
      </svg>
      <span className="text-[10px] text-black leading-tight">
        {body}
        {suffix && <span className="text-bp-silver"> ({suffix})</span>}
      </span>
    </div>
  )
}
