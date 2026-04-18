// Simplified logo marks for integrated systems
// Using recognizable brand shapes rendered as clean SVGs

export function SalesforceLogo({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      {/* Cloud shape */}
      <path
        d="M10 6.5a4 4 0 0 1 7.5 1.8A3.5 3.5 0 0 1 20 11.5a3.5 3.5 0 0 1-3.2 3.5H7a3 3 0 0 1-.5-5.96A4 4 0 0 1 10 6.5z"
        fill="#00A1E0"
      />
    </svg>
  )
}

export function PowerBILogo({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      {/* Bar chart columns */}
      <rect x="4" y="14" width="3.5" height="6" rx="1" fill="#F2C811" />
      <rect x="10" y="8" width="3.5" height="12" rx="1" fill="#F2C811" />
      <rect x="16" y="4" width="3.5" height="16" rx="1" fill="#F2C811" />
    </svg>
  )
}

export function RVRTLogo({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      {/* Clipboard with check - field verification tool */}
      <rect x="6" y="3" width="12" height="18" rx="2" stroke="#007F00" strokeWidth="1.5" />
      <path d="M9 3V2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="#007F00" strokeWidth="1.5" />
      <path d="M9 12l2 2 4-4" stroke="#007F00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function YourekaLogo({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      {/* Mobile form / inspection app */}
      <rect x="7" y="2" width="10" height="20" rx="2" stroke="#5B57A2" strokeWidth="1.5" />
      <line x1="10" y1="8" x2="14" y2="8" stroke="#5B57A2" strokeWidth="1" />
      <line x1="10" y1="11" x2="14" y2="11" stroke="#5B57A2" strokeWidth="1" />
      <line x1="10" y1="14" x2="13" y2="14" stroke="#5B57A2" strokeWidth="1" />
      <circle cx="12" cy="19" r="1" fill="#5B57A2" />
    </svg>
  )
}

export function RESTAPILogo({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      {/* Code-bracket API glyph in BP dark blue */}
      <path d="M8 6l-4 6 4 6" stroke="#000099" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 6l4 6-4 6" stroke="#000099" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="14" y1="4" x2="10" y2="20" stroke="#000099" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function QuipLogo({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      {/* Document with collaboration indicator */}
      <path d="M5 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4z" stroke="#F27557" strokeWidth="1.5" />
      <line x1="9" y1="8" x2="15" y2="8" stroke="#F27557" strokeWidth="1" />
      <line x1="9" y1="11" x2="15" y2="11" stroke="#F27557" strokeWidth="1" />
      <line x1="9" y1="14" x2="13" y2="14" stroke="#F27557" strokeWidth="1" />
    </svg>
  )
}

const systemLogoMap = {
  Salesforce: SalesforceLogo,
  RVRT: RVRTLogo,
  Youreka: YourekaLogo,
  'Power BI': PowerBILogo,
  'REST API': RESTAPILogo,
  'Custom REST API': RESTAPILogo, // alias — same glyph
  Quip: QuipLogo,
}

export default function SystemLogo({ name, className }) {
  const Logo = systemLogoMap[name]
  if (!Logo) return null
  return <Logo className={className} />
}
