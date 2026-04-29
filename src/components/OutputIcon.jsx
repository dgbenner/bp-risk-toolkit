// Distinct, larger icons per output type. Stroke style at 20px so the
// silhouette is recognizable at a glance. Darker BP green for contrast.
const ICON_PATHS = {
  // Page with folded corner + body text lines (Word-style document).
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
  // Page with bar chart (report).
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
  // Two linked squares (integration / handoff).
  integration: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
      <path d="M11 7h2a2 2 0 0 1 2 2v2" />
      <path d="M13 17h-2a2 2 0 0 1-2-2v-2" />
    </>
  ),
}

const FORMAT_SUFFIX = {
  doc: '.doc',
  checklist: 'Checklist',
  report: 'Report',
  email: 'Email',
  integration: 'Integration',
}

// Labels in the data look like "PREFIX / BODY" — strip the prefix and use the
// body as the readable title, then append a clear format suffix in parens
// (e.g. "Draft Terms of Reference (.doc)").
function splitLabel(rawLabel) {
  const idx = rawLabel.indexOf(' / ')
  if (idx < 0) return rawLabel
  return rawLabel.slice(idx + 3)
}

export default function OutputIcon({ type, label }) {
  const icon = ICON_PATHS[type] || ICON_PATHS.doc
  const formatSuffix = FORMAT_SUFFIX[type]
  const body = splitLabel(label)

  return (
    <div className="flex items-start gap-2">
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 flex-shrink-0 mt-0.5"
        fill="none"
        stroke="#004F00"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon}
      </svg>
      <span className="text-[11px] text-black leading-snug">
        {body}
        {formatSuffix && (
          <span className="text-bp-silver"> ({formatSuffix})</span>
        )}
      </span>
    </div>
  )
}
