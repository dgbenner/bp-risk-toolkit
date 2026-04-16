const iconPaths = {
  doc: 'M6 2h8l4 4v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm7 0v5h5M8 13h8M8 17h5',
  checklist: 'M4 4h16v16H4zM8 9l2 2 4-4M8 15h8',
  report: 'M4 4h16v16H4zM8 8h4M8 12h8M8 16h6',
  email: 'M4 6h16v12H4zM4 6l8 6 8-6',
  integration: 'M10 2v6M14 2v6M6 6h12v4H6zM8 10v4a2 2 0 002 2h4a2 2 0 002-2v-4',
}

export default function OutputIcon({ type, label }) {
  const path = iconPaths[type] || iconPaths.doc

  return (
    <div className="flex items-start gap-2">
      <svg
        viewBox="0 0 24 24"
        className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
        fill="none"
        stroke="#007F00"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
      <span className="font-mono text-[9px] tracking-[0.08em] text-bp-dark-grey leading-snug">
        {label}
      </span>
    </div>
  )
}
