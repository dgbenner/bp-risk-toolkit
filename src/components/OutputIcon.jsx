// Output icons + label formatting for the OUTPUT row.
//
// Layout: image icon on the left, sentence-case label to the right.
// Brand icons (Word, Outlook, PDF, etc.) used where the doc type maps
// cleanly. Monoline SVG fallbacks for types without a brand mapping.
import wordIcon from '../assets/icons/word.png'
import outlookIcon from '../assets/icons/outlook.png'
import pdfIcon from '../assets/icons/pdf.png'
import checklistIcon from '../assets/icons/checklist.png'
import powerpointIcon from '../assets/icons/powerpoint.png'

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

// Mapping of output type → branded icon image. PDF used for "report"
// since reports tend to be distributed as PDFs. Integration falls back
// to the monoline SVG below.
const ICON_IMAGE = {
  doc: wordIcon,
  checklist: checklistIcon,
  report: pdfIcon,
  email: outlookIcon,
  presentation: powerpointIcon,
}

// Monoline fallback for types without a brand image (e.g., integration).
const FALLBACK_ICON = (
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
    <rect x="3" y="3" width="8" height="8" rx="1" />
    <rect x="13" y="13" width="8" height="8" rx="1" />
    <path d="M11 7h2a2 2 0 0 1 2 2v2" />
    <path d="M13 17h-2a2 2 0 0 1-2-2v-2" />
  </svg>
)

export default function OutputIcon({ type, label }) {
  const img = ICON_IMAGE[type]
  const { body, suffix } = formatLabel(label, type)
  return (
    <div className="flex items-center gap-1">
      {img ? (
        <img
          src={img}
          alt=""
          className="w-8 h-8 flex-shrink-0 object-contain select-none"
          draggable={false}
        />
      ) : (
        FALLBACK_ICON
      )}
      <span className="text-[10px] text-black leading-tight">
        {body}
        {suffix && <span className="text-bp-silver"> ({suffix})</span>}
      </span>
    </div>
  )
}
