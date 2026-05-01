import { Fragment, useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { rigVerification } from '../data/blueprints/rigVerification'
import { riskAssessment } from '../data/blueprints/riskAssessment'
import { selfVerification } from '../data/blueprints/selfVerification'
import { riskRegister } from '../data/blueprints/riskRegister'
import { roles } from '../data/roles'
import { blueprintList } from '../data/blueprints'
import { findSystem } from '../data/platformEcosystem'
import { serviceBlueprintGlossary } from '../data/serviceBlueprintGlossary'
import { glossaryEntries, GLOSSARY_CATEGORIES } from '../data/glossary'
import SystemLogo from '../components/SystemLogos'
import OutputIcon from '../components/OutputIcon'
import DetailPanel from '../components/DetailPanel'
import bpHelios from '../assets/logos/bp-helios.png'
import valarisMark from '../assets/logos/valaris-mark.png'
import sunnyIcon from '../assets/icons/sunny.png'
import infinityIcon from '../assets/icons/infinity.png'
import BpHelios3D from '../components/BpHelios3D'

const blueprintMap = {
  'rig-verification': rigVerification,
  'risk-assessment': riskAssessment,
  'self-verification': selfVerification,
  'risk-register': riskRegister,
}

// Uppercase a phase/document name while preserving "ToR" (Terms of
// Reference) with its lowercase "o" — that's the conventional casing.
function upperKeepToR(s) {
  return String(s).toUpperCase().replace(/\bTOR\b/g, 'ToR')
}

// Phase-purpose summaries shown in the header tooltip. Keyed by phase.id —
// the rig-verification phase ids today, with stubs for the other blueprints
// to fill in later. Plain-language summaries based on the rig verification
// process.
const PHASE_PURPOSES = {
  'create-tor':
    'Define what gets verified. The Rig Verifier drafts the Terms of Reference: which barriers and bowties the team will inspect, the rig type, and which standards apply. Sets the scope of the entire verification.',
  'review-tor':
    'RV Manager reviews the draft for completeness and alignment with global verification standards. Catches gaps before the document goes to the operator.',
  'agree-tor':
    "The operator's Well Superintendent accepts or negotiates the scope. Both organizations align on what's being checked, when, and by whom before any field work begins.",
  'approve-tor':
    'Final formal sign-off locks the ToR. The Activity transitions from Preparation to Execution status — the verification is now committed and travel is booked.',
  'conduct-verification':
    'The RV Team boards the rig and physically inspects every barrier on the agreed checklists. Captures evidence (photos, video, notes) via RVRT, working offline since rig connectivity is unreliable.',
  'offshore-closeout':
    "Verbal closeout meeting between the RV Team and the operator's Well Delivery Team before the verifiers leave the rig. Last chance to clarify findings face-to-face while everyone is still on the platform.",
  'onshore-closeout':
    'Formal review back on shore. Evidence is consolidated, findings ranked by severity, draft language begins. The transition from field observations to a structured report.',
  'create-draft-report':
    'Rig Verifier compiles findings into a draft report. Status flips to Draft Issues — the verification is no longer active offshore but the report has not been finalized or agreed.',
  'approve-report':
    'RV Manager reviews the draft for tone, accuracy, and consistency. Nothing leaves BP without this approval, ensuring every report meets the same bar across regions.',
  'internal-review':
    'Negotiation phase with the Well Delivery Team on language and resolution timelines for each finding. Operator can push back on specific items before finalization.',
  'final-report':
    'Formal report issued. The application auto-distributes to the Responsible Person, VP Wells Region, Wells Operations Manager, and Regional Risk Engineer.',
  'review-evidence-close':
    'Operator submits evidence as gaps are closed. RV Team reviews each piece and either accepts the closure or sends it back for more work. Can run for weeks or months.',
  'complete':
    'All findings resolved or formally accepted. Verification is closed in the system; the record archives in Salesforce + Power BI for trend analysis across rigs and regions.',
}

const swimlaneLabels = [
  { key: 'header', label: 'PHASE', height: 'h-[46px]' },
  { key: 'location', label: 'LOCATION', height: 'min-h-[36px]' },
  { key: 'appState', label: 'APP STATUS', height: 'min-h-[36px]' },
  { key: 'time', label: 'TIME IN DAYS', height: 'min-h-[36px]' },
  { key: 'actions', label: 'PRIMARY ACTIONS', height: 'min-h-[80px]' },
  { key: 'output', label: 'OUTPUT', height: 'min-h-[60px]' },
  { key: 'frontstage', label: 'FRONTSTAGE', height: 'min-h-[48px]' },
  { key: 'visibility', label: '', height: 'h-[20px]' },
  { key: 'backstage', label: 'BACKSTAGE', height: 'min-h-[48px]' },
  { key: 'interaction', label: '', height: 'h-[20px]' },
  { key: 'support', label: 'SUPPORT PROCESSES', height: 'min-h-[60px]' },
  { key: 'systems', label: 'SYSTEMS', height: 'min-h-[36px]' },
  { key: 'roles', label: 'ACTIVE ROLES', height: 'min-h-[40px]' },
]

// Research-sources strip — collapsed by default. Click the underlined label
// to spool out the joined source list. Sequence:
//   1. Slide-in (~900ms): content translates from x=-100% to 0; Alex (the
//      first source) lands on the left.
//   2. Pause 5s with Alex fully readable.
//   3. Marquee (~30px/sec): content translates from 0 to -overflow,
//      revealing later sources on the right.
//   4. Done: animation stops at the end position; user can drag the strip
//      left/right to scrub through the text.
function ResearchSourcesStrip({ label, sources }) {
  const [phase, setPhase] = useState('closed') // closed | sliding | paused | marqueeing | done
  const [panelW, setPanelW] = useState(0)
  const [contentW, setContentW] = useState(0)
  const panelRef = useRef(null)
  const contentRef = useRef(null)

  const text = sources.join('     ·     ')
  const overflow = Math.max(0, contentW - panelW)

  // Re-measure when opened or on window resize.
  useEffect(() => {
    if (phase === 'closed') return
    function measure() {
      if (panelRef.current) setPanelW(panelRef.current.offsetWidth)
      if (contentRef.current) setContentW(contentRef.current.scrollWidth)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [phase])

  // Drive the phase timeline.
  useEffect(() => {
    if (phase === 'sliding') {
      const t = setTimeout(() => setPhase('paused'), 900)
      return () => clearTimeout(t)
    }
    if (phase === 'paused') {
      const t = setTimeout(() => setPhase('marqueeing'), 5000)
      return () => clearTimeout(t)
    }
    if (phase === 'marqueeing') {
      const dur = overflow > 0 ? Math.max(4000, (overflow / 30) * 1000) : 0
      const t = setTimeout(() => setPhase('done'), dur)
      return () => clearTimeout(t)
    }
  }, [phase, overflow])

  const open = phase !== 'closed'
  const targetX =
    phase === 'sliding' || phase === 'paused' ? 0 :
    phase === 'marqueeing' || phase === 'done' ? -overflow :
    0
  const duration =
    phase === 'sliding' ? 0.9 :
    phase === 'marqueeing' ? (overflow > 0 ? Math.max(4, overflow / 30) : 0) :
    0

  return (
    <div className="flex-shrink-0 bg-gray-200 border-b border-gray-300 flex items-center gap-3 px-4 py-1.5">
      <button
        type="button"
        onClick={() => { if (phase === 'closed') setPhase('sliding') }}
        className="font-mono text-[9px] tracking-[0.1em] uppercase text-bp-dark-grey font-medium underline underline-offset-[3px] hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer flex-shrink-0 select-none"
      >
        {label}
        <svg viewBox="0 0 6 6" className="w-[6px] h-[6px]" aria-hidden="true">
          <path d="M0 0 L6 3 L0 6 Z" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div ref={panelRef} className="flex-1 min-w-0 overflow-hidden relative h-[14px]">
          <motion.div
            ref={contentRef}
            initial={{ x: '-100%' }}
            animate={{ x: targetX }}
            transition={{ duration, ease: 'linear' }}
            drag={phase === 'done' ? 'x' : false}
            dragConstraints={{ left: -overflow, right: 0 }}
            dragElastic={0.05}
            className="font-mono text-[9px] text-black whitespace-nowrap inline-block absolute left-0 top-0 cursor-grab active:cursor-grabbing select-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none' }}
          >
            {text}
          </motion.div>
        </div>
      )}
    </div>
  )
}

function usePopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])
  return { open, setOpen, ref }
}

const topButtonClass = (open) =>
  `flex items-center gap-1.5 px-2.5 py-1 font-mono text-[9px] tracking-[0.1em] uppercase border transition-colors ${
    open
      ? 'border-bp-green text-bp-green bg-bp-green/5'
      : 'border-gray-200 text-bp-silver hover:border-gray-300 hover:text-bp-dark-grey'
  }`

const linkStyleClass = (open) =>
  `font-mono text-[10px] tracking-[0.08em] uppercase underline underline-offset-4 transition-colors cursor-pointer font-medium ${
    open
      ? 'text-bp-green'
      : 'text-[#333] hover:text-bp-green'
  }`

function GlossaryEntryRow({ entry, expanded, onToggle }) {
  return (
    <div className="border-t border-[#EBEBEB] first:border-t-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 relative cursor-pointer transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-baseline gap-1.5 pr-3">
          <span className="text-[12px] font-bold text-black leading-snug">
            {entry.term}
          </span>
          {entry.acronym && (
            <span className="text-[11px] text-bp-silver leading-snug">
              ({entry.acronym})
            </span>
          )}
        </div>
        {/* Lower-right corner triangle — same affordance pattern used on
            cards / nav buttons elsewhere. Rotates open when expanded. */}
        <svg
          viewBox="0 0 6 6"
          className={`w-[6px] h-[6px] absolute bottom-1 right-1 text-bp-green transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
        >
          <path d="M6 0V6H0z" fill="currentColor" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 -mt-1 text-[11px] text-bp-dark-grey leading-relaxed">
              {entry.description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function GlossaryButton() {
  const { open, setOpen, ref } = usePopover()
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(() => new Set())

  const visibleEntries = useMemo(() => {
    const list = filter === 'all'
      ? glossaryEntries
      : glossaryEntries.filter(e => e.category === filter)
    return [...list].sort((a, b) => a.term.localeCompare(b.term))
  }, [filter])

  const toggle = (term) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(term)) next.delete(term)
      else next.add(term)
      return next
    })
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className={linkStyleClass(open)}>
        GLOSSARY
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-full right-0 mt-2 w-[440px] max-h-[640px] flex flex-col bg-white border border-gray-200 shadow-lg z-40"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center text-bp-silver hover:text-bp-dark-grey cursor-pointer font-mono text-[14px] leading-none z-10"
              aria-label="Close"
            >
              ×
            </button>
            {/* Header + category filter tabs */}
            <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-gray-200">
              <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-bp-green mb-2 font-medium">
                Glossary
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`pb-1 font-mono text-[9px] tracking-[0.1em] uppercase transition-colors cursor-pointer border-b-2 ${
                    filter === 'all'
                      ? 'border-bp-green text-bp-green'
                      : 'border-transparent text-[#333] hover:text-bp-green'
                  }`}
                >
                  ALL
                </button>
                {GLOSSARY_CATEGORIES.map(cat => {
                  const active = filter === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setFilter(cat.id)}
                      className={`pb-1 font-mono text-[9px] tracking-[0.1em] uppercase transition-colors cursor-pointer border-b-2 ${
                        active
                          ? 'border-bp-green text-bp-green'
                          : 'border-transparent text-[#333] hover:text-bp-green'
                      }`}
                    >
                      {cat.label.toUpperCase()}
                    </button>
                  )
                })}
              </div>
            </div>
            {/* Entries (alphabetized within filter) */}
            <div className="flex-1 overflow-y-auto">
              {visibleEntries.length === 0 ? (
                <div className="px-4 py-6 font-mono text-[10px] tracking-[0.1em] uppercase text-bp-silver">
                  No terms in this category.
                </div>
              ) : (
                visibleEntries.map(entry => (
                  <GlossaryEntryRow
                    key={entry.term}
                    entry={entry}
                    expanded={expanded.has(entry.term)}
                    onToggle={() => toggle(entry.term)}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const severityLevels = [
  { color: '#3B8F3C', label: 'Informational' },
  { color: '#99CC00', label: 'Acceptable' },
  { color: '#FFE600', label: 'Low' },
  { color: '#FFA500', label: 'Moderate' },
  { color: '#FF6A00', label: 'Elevated' },
  { color: '#E11D1D', label: 'High' },
  { color: '#7A1A8C', label: 'Critical' },
]

const ROLE_FILTER_TABS = [
  { id: 'all', label: 'ALL' },
  { id: 'rig-verification', label: 'RIG VERIFICATION' },
  { id: 'risk-assessment', label: 'RISK ASSESSMENT' },
  { id: 'self-verification', label: 'SV&O' },
  { id: 'risk-register', label: 'RISK REGISTER' },
]

function RoleCard({ role, isFirst }) {
  const isBp = role.org === 'bp'
  const badgeImg = isBp ? bpHelios : valarisMark
  const badgeAlt = isBp ? 'BP' : 'Operator'
  // Outlined treatment: org color appears as a 3px ring around the photo
  // instead of a solid block behind it. BP green / operator navy.
  const outlineColor = isBp ? '#007F00' : '#1A2D5C'
  // Flip the RV Manager headshot horizontally per stylistic preference.
  const flipImg = role.id === 'rvManager'
  return (
    <div className={`flex items-start gap-3 px-3 py-3 ${isFirst ? '' : 'border-t border-[#EBEBEB]'}`}>
      <div className="relative flex-shrink-0 w-20 h-20">
        {role.avatar ? (
          <img
            src={role.avatar}
            alt={role.name || role.role}
            className="w-20 h-20 rounded-full object-cover bg-gray-100"
            style={{
              border: `3px solid ${outlineColor}`,
              transform: flipImg ? 'scaleX(-1)' : undefined,
            }}
          />
        ) : (
          // Silhouette placeholder for roles without a real headshot yet.
          <div
            className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"
            style={{ border: `3px solid ${outlineColor}` }}
          >
            <svg viewBox="0 0 24 24" className="w-12 h-12 text-bp-silver" fill="currentColor">
              <circle cx="12" cy="8.5" r="3.6" />
              <path d="M3.5 22c0-4.3 3.8-7.5 8.5-7.5s8.5 3.2 8.5 7.5z" />
            </svg>
          </div>
        )}
        {/* Org badge — circular white-fill with the org's logo, overlapping
            bottom-right. Mirrors the left rail / hover treatment. */}
        <div
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-white flex items-center justify-center overflow-hidden shadow-sm"
          aria-label={badgeAlt}
        >
          <img src={badgeImg} alt={badgeAlt} className="w-full h-full object-contain p-[2px]" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        {/* Role title is primary; person's name (if known) sits below as
            secondary. */}
        <div className="text-[13px] font-medium text-black leading-tight">
          {role.role}
        </div>
        {role.personName && (
          <div className="text-[11px] italic text-bp-silver mt-0.5">
            {role.personName}
          </div>
        )}
        <p className="text-[11px] text-black leading-snug mt-1.5">
          {role.description}
        </p>
      </div>
    </div>
  )
}

function RolesButton({ currentBlueprintId }) {
  const { open, setOpen, ref } = usePopover()
  const [filter, setFilter] = useState(currentBlueprintId || 'all')

  // Re-sync the filter to the active blueprint each time the panel is opened,
  // so it always defaults to "show roles for whatever blueprint I'm viewing."
  useEffect(() => {
    if (open) setFilter(currentBlueprintId || 'all')
  }, [open, currentBlueprintId])

  const visibleRoles = useMemo(() => {
    const all = Object.values(roles)
    if (filter === 'all') return all
    return all.filter(r => r.blueprints?.includes(filter))
  }, [filter])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className={linkStyleClass(open)}>
        ROLES
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-full right-0 mt-2 w-[420px] max-h-[640px] flex flex-col bg-[#FAFAFA] border border-gray-200 shadow-lg z-40"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center text-bp-silver hover:text-bp-dark-grey cursor-pointer font-mono text-[14px] leading-none z-10"
              aria-label="Close"
            >
              ×
            </button>

            {/* Header + filter tabs */}
            <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-gray-200 bg-[#FAFAFA]">
              <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-bp-green mb-2 font-medium">
                Roles
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {ROLE_FILTER_TABS.map(tab => {
                  const active = filter === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setFilter(tab.id)}
                      className={`pb-1 font-mono text-[9px] tracking-[0.1em] uppercase transition-colors cursor-pointer border-b-2 ${
                        active
                          ? 'border-bp-green text-bp-green'
                          : 'border-transparent text-bp-silver hover:text-bp-dark-grey'
                      }`}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Scrollable role list */}
            <div className="flex-1 overflow-y-auto">
              {visibleRoles.length === 0 ? (
                <div className="px-4 py-6 font-mono text-[10px] tracking-[0.1em] uppercase text-bp-silver">
                  No roles for this filter.
                </div>
              ) : (
                visibleRoles.map((r, i) => (
                  <RoleCard key={r.id} role={r} isFirst={i === 0} />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SeverityButton() {
  const { open, setOpen, ref } = usePopover()
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className={linkStyleClass(open)}>
        SEVERITY INDEX
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-full right-0 mt-2 w-60 bg-white border border-gray-200 shadow-lg z-40 pt-8 pb-3"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center text-bp-silver hover:text-bp-dark-grey cursor-pointer font-mono text-[14px] leading-none"
              aria-label="Close"
            >
              ×
            </button>
            <div className="px-4">
              <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-bp-green mb-3 font-medium">
                Finding Severity
              </div>
              <div className="space-y-1.5">
                {severityLevels.map((level, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: level.color }}
                    />
                    <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-bp-dark-grey">
                      {level.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function RowFilter({ swimlaneLabels }) {
  const [open, setOpen] = useState(false)
  const [visibleRows, setVisibleRows] = useState(
    swimlaneLabels.reduce((acc, row) => ({ ...acc, [row.key]: true }), {})
  )
  const ref = useRef(null)
  const allChecked = Object.values(visibleRows).every(v => v)

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const toggleAll = () => {
    const next = !allChecked
    setVisibleRows(
      swimlaneLabels.reduce((acc, row) => ({ ...acc, [row.key]: next }), {})
    )
  }
  const toggleRow = key => setVisibleRows(prev => ({ ...prev, [key]: !prev[key] }))

  const niceLabel = row => {
    if (row.key === 'visibility') return 'LINE OF VISIBILITY'
    if (row.key === 'interaction') return 'LINE OF INTERACTION'
    return row.label || row.key.toUpperCase()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={linkStyleClass(open)}
      >
        SHOW/HIDE ROWS
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-full right-0 mt-2 w-60 bg-white border border-gray-200 shadow-lg z-40 pt-8 pb-2"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {/* Close button — top right, with generous hit area */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center text-bp-silver hover:text-bp-dark-grey transition-colors cursor-pointer font-mono text-[14px] leading-none"
              aria-label="Close"
            >
              ×
            </button>
            <label className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="accent-bp-green"
              />
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-bp-dark-grey font-medium">
                ALL / NONE
              </span>
            </label>
            <div className="my-1 border-t border-gray-100" />
            {swimlaneLabels.map(row => (
              <label
                key={row.key}
                className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={visibleRows[row.key]}
                  onChange={() => toggleRow(row.key)}
                  className="accent-bp-green"
                />
                <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-bp-dark-grey">
                  {niceLabel(row)}
                </span>
              </label>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FooterEcosystem({ systems }) {
  const [activeName, setActiveName] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!activeName) return
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveName(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [activeName])

  return (
    <div
      ref={containerRef}
      className="flex-shrink-0 border-t border-gray-200 px-4 py-3 bg-white flex items-center justify-center gap-4"
    >
      <h3 className="text-sm font-light text-bp-dark-green tracking-wide whitespace-nowrap">
        Risk Toolkit Platform Ecosystem
      </h3>
      <div className="flex items-center gap-2 flex-wrap">
        {systems.map(sys => {
          const isActive = activeName === sys.name
          const enriched = findSystem(sys.name) // may be undefined for unknown systems
          return (
            <div key={sys.id} className="relative">
              <button
                onClick={() => setActiveName(isActive ? null : sys.name)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 border transition-all duration-200 cursor-pointer relative ${
                  isActive
                    ? 'bg-white border-bp-green shadow-sm'
                    : 'bg-white border-gray-200 hover:border-bp-green/50'
                }`}
              >
                <SystemLogo name={sys.name} className="w-4 h-4" />
                <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-bp-dark-grey">
                  {sys.name}
                </span>
                {/* Green triangle indicator — flush bottom-right */}
                <svg
                  viewBox="0 0 6 6"
                  className="w-[6px] h-[6px] absolute bottom-0 right-0 text-bp-green"
                >
                  <path d="M6 0V6H0z" fill="currentColor" />
                </svg>
              </button>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute bottom-full mb-2 left-0 w-64 bg-white border border-bp-green/30 shadow-[0_0_36px_rgba(137,207,240,0.3)] z-30 p-4"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Notch pointing DOWN toward the badge */}
                    <div className="absolute -bottom-[5px] left-4 w-2.5 h-2.5 bg-white border-r border-b border-bp-green/30 rotate-45" />
                    {/* Close X */}
                    <button
                      onClick={() => setActiveName(null)}
                      className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-bp-silver hover:text-bp-dark-grey transition-colors cursor-pointer font-mono text-[11px] leading-none"
                    >
                      ×
                    </button>
                    <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-bp-green mb-3 font-medium pr-5">
                      {sys.name.toUpperCase()}
                    </div>
                    <ul className="space-y-1.5">
                      {(enriched?.bullets || [sys.description]).map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-bp-dark-grey leading-snug">
                          <span className="text-bp-green text-[8px] mt-1 flex-shrink-0">▸</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function BlueprintViewer() {
  const { blueprintId } = useParams()
  const blueprint = blueprintMap[blueprintId]
  const [selectedPhase, setSelectedPhase] = useState(null)
  const [activeRole, setActiveRole] = useState(null)
  const [glossaryTooltip, setGlossaryTooltip] = useState(null) // { key, top, left }
  const [pinnedPhases, setPinnedPhases] = useState(() => new Set())
  const [phaseTooltip, setPhaseTooltip] = useState(null) // { id, top, left }
  const [visiblePhaseIds, setVisiblePhaseIds] = useState(() => new Set())
  const togglePin = (phaseId, e) => {
    e.stopPropagation()
    setPinnedPhases(prev => {
      const next = new Set(prev)
      if (next.has(phaseId)) next.delete(phaseId)
      else next.add(phaseId)
      return next
    })
  }
  const scrollRef = useRef(null)
  const glossaryRef = useRef(null)

  useEffect(() => {
    if (!glossaryTooltip) return
    function handleClick(e) {
      if (glossaryRef.current && !glossaryRef.current.contains(e.target)) {
        setGlossaryTooltip(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [glossaryTooltip])

  // Track which phase columns are currently visible inside the scroll
  // canvas so the progress dots can reflect viewport state. Each phase's
  // header cell carries `id="phase-${phase.id}"`, and we observe them
  // against the scrollRef container as the IntersectionObserver root.
  useEffect(() => {
    if (!scrollRef.current || !blueprint) return
    const observer = new IntersectionObserver(
      (entries) => {
        setVisiblePhaseIds(prev => {
          const next = new Set(prev)
          for (const entry of entries) {
            const id = entry.target.id.replace(/^phase-/, '')
            if (entry.isIntersecting) next.add(id)
            else next.delete(id)
          }
          return next
        })
      },
      { root: scrollRef.current, threshold: 0.4 },
    )
    blueprint.phases.forEach(phase => {
      const el = document.getElementById(`phase-${phase.id}`)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [blueprint])

  function openGlossary(key, event) {
    const entry = serviceBlueprintGlossary[key]
    if (!entry) return
    const rect = event.currentTarget.getBoundingClientRect()
    setGlossaryTooltip({
      key,
      top: rect.top + rect.height / 2,
      left: rect.right + 8,
    })
  }

  const allRoles = useMemo(() => {
    if (!blueprint) return []
    const roleIds = new Set()
    blueprint.phases.forEach(p => p.activeRoles.forEach(r => roleIds.add(r)))
    return Array.from(roleIds).map(id => roles[id]).filter(Boolean)
  }, [blueprint])

  if (!blueprint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-bp-silver mb-4">
            BLUEPRINT NOT FOUND
          </div>
          <Link to="/" className="font-mono text-[10px] tracking-[0.1em] uppercase text-bp-green hover:underline">
            ← RETURN TO INDEX
          </Link>
        </div>
      </div>
    )
  }

  const sorted = [...blueprintList].sort((a, b) => a.order - b.order)

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Row 1 — header bar: logo + title + quote + blueprint tabs.
          z-30 so the Roles popover (z-40 within this stacking context) can
          paint above the source-badge / swimlane-labels rows below (z-10).
          Bottom border is BP green and visually flows into the active tab. */}
      <div className="flex-shrink-0 border-b border-bp-green px-4 flex items-end justify-between bg-white relative z-30">
        <div className="flex items-center gap-4 py-2">
          {/* Variant A: 3D Helios logo in place of the flat PNG header icon */}
          <Link
            to="/"
            className="flex items-center justify-center hover:opacity-80 transition-opacity"
            title="Return to Risk Toolkit"
          >
            <BpHelios3D size={72} />
          </Link>
          <div>
            {/* Title + subtitle sharing a baseline */}
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-light text-bp-dark-green tracking-wide leading-tight whitespace-nowrap">
                {blueprint.title}
              </div>
              {blueprint.subtitle && (
                <div className="text-[13px] font-normal text-bp-dark-grey leading-tight whitespace-nowrap">
                  {blueprint.subtitle} Service Blueprint
                </div>
              )}
            </div>
            {/* Quote — own line below, hanging punctuation so W aligns with R above */}
            {blueprint.tagline && (
              <div
                className="text-[12px] italic text-bp-dark-grey leading-tight mt-0 max-w-[520px] -ml-[5px]"
                style={{ hangingPunctuation: 'first' }}
              >
                &ldquo;{blueprint.tagline}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* Right column: reference links on top, blueprint tabs on bottom */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-4 pt-2 pb-[10px]">
            <RolesButton currentBlueprintId={blueprintId} />
            <GlossaryButton />
            <SeverityButton />
          </div>
          <div className="flex items-end gap-0.5">
            {sorted.map(bp => {
              const isActive = bp.id === blueprintId
              return (
                <Link
                  key={bp.id}
                  to={`/blueprint/${bp.id}`}
                  className={`relative px-4 py-2 rounded-t-md border-t border-l border-r font-mono text-[10px] tracking-[0.1em] uppercase transition-colors ${
                    isActive
                      ? 'bg-white border-bp-green -mb-px text-bp-green font-medium z-10'
                      : 'bg-gray-50 border-transparent text-bp-silver hover:text-bp-dark-grey hover:bg-gray-100'
                  }`}
                >
                  {bp.title}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Row 2 — controls: phase dots, role filter, reference buttons */}
      <div className="flex-shrink-0 border-b border-gray-200 px-4 py-2 flex items-center justify-between bg-white z-10 gap-6">
        {/* Phase progress dots — green if currently in the viewport, dark
            green if the phase's detail panel is open, gray otherwise. */}
        <div className="flex items-center gap-1.5">
          {blueprint.phases.map((phase) => {
            const isSelected = selectedPhase?.id === phase.id
            const isVisible = visiblePhaseIds.has(phase.id)
            const dotClass = isSelected
              ? 'bg-bp-dark-green'
              : isVisible
                ? 'bg-bp-green'
                : 'bg-gray-300 group-hover:bg-bp-light-green'
            return (
              <button
                key={phase.id}
                onClick={() => {
                  const el = document.getElementById(`phase-${phase.id}`)
                  el?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
                }}
                className="group relative"
                title={phase.name}
              >
                <div className={`w-2 h-2 rounded-full transition-colors ${dotClass}`} />
              </button>
            )
          })}
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-bp-silver">
            FILTER:
          </span>
          <button
            onClick={() => setActiveRole(null)}
            className={`px-2 py-1 font-mono text-[9px] tracking-[0.1em] uppercase border transition-colors ${
              !activeRole
                ? 'border-bp-green text-bp-green bg-bp-green/5'
                : 'border-gray-200 text-bp-silver hover:border-gray-300'
            }`}
          >
            ALL
          </button>
          {allRoles.map(role => {
            const isBP = role.org === 'bp'
            const color = isBP ? '#007F00' : '#FF9900'
            const isActive = activeRole === role.id
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(isActive ? null : role.id)}
                className="px-2 py-1 font-mono text-[9px] tracking-[0.1em] uppercase border transition-colors font-medium"
                style={{
                  borderColor: isActive ? color : '#d1d5db',
                  color: isActive ? color : '#333',
                  backgroundColor: isActive ? `${color}08` : 'transparent',
                }}
              >
                {role.role || role.name}
              </button>
            )
          })}
        </div>

        {/* Row filter — blueprint-specific, stays in this row */}
        <RowFilter swimlaneLabels={swimlaneLabels} />
      </div>

      {/* Source badge — click "Research Sources" to spool the source list
          out from behind the label, pause 5s on Alex, then marquee through
          the rest. Once finished the user can drag-scrub the text. */}
      {blueprint.sourceLabel && (
        <ResearchSourcesStrip
          label={blueprint.sourceLabel}
          sources={blueprint.sources}
        />
      )}

      {/* Main canvas: single CSS grid. First column = swimlane labels,
          remaining columns = phase data. Row heights auto-size to the
          tallest cell across all columns so labels stay aligned with
          their content. The freeze on the left column was removed for
          this pass — to be restored after row heights settle. */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div
          className="grid bg-white"
          style={{
            gridTemplateColumns: `140px repeat(${blueprint.phases.length}, minmax(260px, 300px))`,
          }}
        >
          {swimlaneLabels.map((row) => {
            const isLine = row.key === 'visibility' || row.key === 'interaction'
            // Per-row background. Top stack (header/location/appState/time) is
            // neutral white. The actions row is "the journey" — pale green.
            // Below that, zebra alternates rose-50 / gray-100 starting at output.
            const ROW_BG = {
              header: 'bg-bp-green/85',
              location: 'bg-white',
              appState: 'bg-white',
              time: 'bg-white',
              actions: 'bg-bp-pale-green/30',
              // Desaturated mauve/maroon (was rose-50 #FFF1F2 — too pink).
              output: 'bg-[#F5E8E2]',
              // Navy-leaning light gray (was gray-100 #F3F4F6 — too neutral).
              frontstage: 'bg-[#EAF0F8]',
              backstage: 'bg-[#F5E8E2]',
              support: 'bg-[#EAF0F8]',
              systems: 'bg-[#F5E8E2]',
              roles: 'bg-[#EAF0F8]',
            }
            const zebraBg = ROW_BG[row.key] || 'bg-white'
            // 2px dark gray separator under TIME — visual break between the
            // identifying-data stack above and the journey/output rows below.
            const heavyDivider = row.key === 'time' ? 'border-b-2 border-bp-dark-grey' : 'border-b border-gray-100'
            const hasGlossary = serviceBlueprintGlossary[row.key]
            const triangle = hasGlossary ? (
              <svg viewBox="0 0 6 6" className="w-[6px] h-[6px] absolute bottom-0 right-0 text-white">
                <path d="M6 0V6H0z" fill="currentColor" />
              </svg>
            ) : null

            // Lines of visibility/interaction span all phase columns.
            if (isLine) {
              return (
                <Fragment key={row.key}>
                  <button
                    onClick={(e) => openGlossary(row.key, e)}
                    className="bg-bp-green text-white text-[11px] tracking-tight uppercase px-3 py-1 flex items-center border-r border-bp-dark-green relative cursor-pointer hover:bg-bp-green/90 transition-colors font-bold"
                  >
                    <span>
                      {row.key === 'visibility' ? '── VISIBILITY ──' : '── INTERACT ──'}
                    </span>
                    {triangle}
                  </button>
                  <div
                    className="bg-white px-4 py-2 flex items-center gap-2 border-b border-gray-100"
                    style={{ gridColumn: `2 / span ${blueprint.phases.length}` }}
                  >
                    {/* Repeat the label every ~3 phase columns so the line
                        reads at any horizontal scroll position. Description
                        is keyed to the primary user of this blueprint. */}
                    {(() => {
                      const labelCount = Math.max(1, Math.ceil(blueprint.phases.length / 3))
                      const primaryRole = roles[blueprint.primaryUser]
                      const userTitle = (primaryRole?.role || 'user').toUpperCase()
                      const labelText = row.key === 'visibility'
                        ? `LINE OF VISIBILITY: WHAT THE ${userTitle} SEES`
                        : `LINE OF INTERACTION: BEHIND THE SCENES`
                      return Array.from({ length: labelCount + 1 }).map((_, i) => (
                        <Fragment key={i}>
                          <div className="flex-1 border-t border-dashed border-bp-green/40" />
                          {i < labelCount && (
                            <span className="bg-white px-2 font-mono text-[9px] tracking-[0.18em] uppercase text-bp-silver whitespace-nowrap">
                              {labelText}
                            </span>
                          )}
                        </Fragment>
                      ))
                    })()}
                  </div>
                </Fragment>
              )
            }

            // Actions row label gets the special primary-user headshot +
            // caption treatment (carried over from the old left rail).
            const isActionsRow = row.key === 'actions'
            const primaryRole = isActionsRow ? roles[blueprint.primaryUser] : null
            // Short, identifying rows are centered horizontally.
            const isCentered = ['header', 'location', 'appState'].includes(row.key)

            return (
              <Fragment key={row.key}>
                {/* Label cell */}
                {isActionsRow ? (
                  <button
                    onClick={(e) => openGlossary(row.key, e)}
                    className="bg-bp-green text-white px-3 py-3 flex flex-col items-start gap-3 text-left border-r border-bp-dark-green border-b border-bp-dark-green/30 relative cursor-pointer hover:bg-bp-green/90 transition-colors"
                  >
                    {primaryRole?.avatar && (
                      <div className="relative flex-shrink-0">
                        <img
                          src={primaryRole.avatar}
                          alt={primaryRole.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white"
                          style={{ transform: primaryRole.id === 'rvManager' ? 'scaleX(-1)' : undefined }}
                        />
                        <div className="absolute -bottom-1 -right-[14px] w-7 h-7 rounded-full bg-white border-2 border-white flex items-center justify-center overflow-hidden">
                          <img src={bpHelios} alt="BP" className="w-full h-full object-contain p-[2px]" />
                        </div>
                      </div>
                    )}
                    <div className="w-full">
                      <div className="text-[13px] tracking-tight uppercase text-white leading-tight font-bold">
                        {blueprint.actionsLabel || 'Primary Actions'}
                      </div>
                      {blueprint.actionsDescription && (
                        <div className="text-[10px] italic text-white leading-snug mt-1">
                          {blueprint.actionsDescription}
                        </div>
                      )}
                    </div>
                    {triangle}
                  </button>
                ) : (
                  <button
                    onClick={(e) => openGlossary(row.key, e)}
                    className="bg-bp-green text-white text-[13px] tracking-tight uppercase px-3 py-2 flex items-start text-left border-r border-bp-dark-green border-b border-bp-dark-green/30 relative cursor-pointer hover:bg-bp-green/90 transition-colors font-bold"
                  >
                    <span>{row.label || row.key.toUpperCase()}</span>
                    {triangle}
                  </button>
                )}
                {/* Phase data cells for this row */}
                {blueprint.phases.map((phase, phaseIdx) => {
                  const dimmed = activeRole && !phase.activeRoles.includes(activeRole)
                  const isHeader = row.key === 'header'
                  const pinned = pinnedPhases.has(phase.id)
                  return (
                    <div
                      key={phase.id}
                      id={isHeader ? `phase-${phase.id}` : undefined}
                      onClick={isHeader ? (e) => {
                        // stopPropagation so the DetailPanel's outside-click
                        // listener doesn't fire on this same click — that
                        // race caused the open-close-open jitter.
                        e.stopPropagation()
                        setPhaseTooltip(null)
                        // Toggle: clicking the same cell again closes.
                        setSelectedPhase(prev => prev?.id === phase.id ? null : phase)
                      } : undefined}
                      onMouseEnter={isHeader ? (e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setPhaseTooltip({
                          id: phase.id,
                          top: rect.bottom + 6,
                          left: rect.left + rect.width / 2,
                        })
                      } : undefined}
                      onMouseLeave={isHeader ? () => setPhaseTooltip(null) : undefined}
                      className={`${zebraBg} ${['frontstage', 'backstage', 'support'].includes(row.key) ? 'px-5' : 'px-3'} ${['header', 'location', 'appState', 'time'].includes(row.key) ? 'py-1' : 'py-2'} border-r border-gray-100 ${heavyDivider} transition-opacity duration-300 relative ${
                        dimmed ? 'opacity-25' : ''
                      } ${isHeader ? 'cursor-pointer hover:opacity-90' : ''} ${
                        isCentered ? 'text-center flex items-center justify-center' : ''
                      }`}
                    >
                      {/* Pin toggle — upper-left corner of the header cell.
                          White, fills on pin. Sits opposite the [01] tag in
                          the upper-right so the title remains truly centered. */}
                      {isHeader && (
                        <button
                          type="button"
                          onClick={(e) => togglePin(phase.id, e)}
                          aria-label={pinned ? 'Unpin phase' : 'Pin phase'}
                          aria-pressed={pinned}
                          className="absolute top-2 left-2 w-5 h-5 flex items-center justify-center text-white transition-opacity hover:opacity-80"
                        >
                          <svg
                            viewBox="0 0 16 16"
                            className="w-4 h-4"
                            fill={pinned ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M10.5 2.5l3 3-1.5 1.5-1 4-2.5-2.5L4 13l-.5-.5L8 8l-2.5-2.5 4-1z" />
                            <path d="M3.5 12.5l-1 1" />
                          </svg>
                        </button>
                      )}
                      {renderCellContent(row.key, phase, blueprint.systems, phaseIdx)}
                    </div>
                  )
                })}
              </Fragment>
            )
          })}
        </div>
      </div>

      {/* Bottom bar — Platform Ecosystem (matches landing page label + style) */}
      <FooterEcosystem systems={blueprint.systems} />

      {/* Detail panel */}
      <DetailPanel
        phase={selectedPhase}
        systems={blueprint.systems}
        onClose={() => setSelectedPhase(null)}
      />

      {/* Phase-purpose tooltip — appears on header-cell hover. Portaled to
          body so the grid's overflow doesn't clip it. */}
      <AnimatePresence>
        {phaseTooltip && PHASE_PURPOSES[phaseTooltip.id] && createPortal(
          <motion.div
            className="fixed z-50 w-72 bg-white border border-bp-green/30 shadow-lg p-3 pointer-events-none"
            style={{
              top: phaseTooltip.top,
              left: phaseTooltip.left,
              transform: 'translateX(-50%)',
            }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
          >
            {/* Notch on top edge pointing up toward the cell */}
            <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-l border-t border-bp-green/30 rotate-45" />
            <p className="text-[11px] text-black leading-relaxed">
              {PHASE_PURPOSES[phaseTooltip.id]}
            </p>
          </motion.div>,
          document.body,
        )}
      </AnimatePresence>

      {/* Service blueprint glossary tooltip (fixed-position to escape overflow containers) */}
      <AnimatePresence>
        {glossaryTooltip && (() => {
          const entry = serviceBlueprintGlossary[glossaryTooltip.key]
          return (
            <motion.div
              ref={glossaryRef}
              className="fixed w-72 bg-white border border-bp-green/30 shadow-[0_0_36px_rgba(137,207,240,0.3)] z-50 p-4"
              style={{
                top: glossaryTooltip.top,
                left: glossaryTooltip.left,
                transform: 'translateY(-50%)',
              }}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.15 }}
            >
              {/* Notch pointing left toward the rail */}
              <div className="absolute top-1/2 -left-[5px] -translate-y-1/2 w-2.5 h-2.5 bg-white border-l border-b border-bp-green/30 rotate-45" />
              {/* Close X */}
              <button
                onClick={() => setGlossaryTooltip(null)}
                className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-bp-silver hover:text-bp-dark-grey transition-colors cursor-pointer font-mono text-[11px] leading-none"
              >
                ×
              </button>
              <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-bp-green mb-3 font-medium pr-5">
                {entry.title}
              </div>
              <ul className="space-y-1.5">
                {entry.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-bp-dark-grey leading-snug">
                    <span className="text-bp-green text-[8px] mt-1 flex-shrink-0">▸</span>
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}

// ── Cell content renderer for the unified blueprint grid ────────────────
// All text colors here are intentionally black for this pass — the user
// asked for a single readable baseline before we tune the gray hierarchy.
// Parse strings like "1–2 days", "1-2 days", "3 days", "1 day", "Max 10 days"
// into a numeric min/max range. Returns null/null for non-numeric labels
// ("Ongoing", "—"), which fall back to text rendering.
function parseTimeEstimate(str) {
  if (!str || str === '—' || /ongoing/i.test(str)) return { min: null, max: null, rangeText: str || '' }
  const range = str.match(/^(\d+)\s*[–-]\s*(\d+)\s*days?$/i)
  if (range) {
    const lo = +range[1], hi = +range[2]
    return { min: lo, max: hi, rangeText: `${lo}–${hi} days` }
  }
  const single = str.match(/^(\d+)\s*days?$/i)
  if (single) {
    const v = +single[1]
    return { min: v, max: v, rangeText: `${v} day${v === 1 ? '' : 's'}` }
  }
  // "Max 10 days" and similar — keep as-is text, no icon range.
  return { min: null, max: null, rangeText: str }
}

function renderCellContent(key, phase, systems, phaseIdx) {
  switch (key) {
    case 'header':
      // Title is the only flow content in the cell — true center alignment.
      // [01] sits vertically centered on the right edge; pin sits in the
      // upper-left; bottom-right triangle hints "hover for details".
      return (
        <>
          <span className="text-[14px] font-bold text-white leading-tight tracking-tight select-none">
            {upperKeepToR(phase.name)}
          </span>
          <span className="absolute top-1/2 -translate-y-1/2 right-2 font-mono text-[10px] text-white/85 leading-none select-none">
            [{String(phase.index).padStart(2, '0')}]
          </span>
          <svg
            viewBox="0 0 6 6"
            className="absolute bottom-0 right-0 w-[6px] h-[6px] text-white/80 pointer-events-none"
            aria-hidden="true"
          >
            <path d="M6 0V6H0z" fill="currentColor" />
          </svg>
        </>
      )
    case 'location':
      return (
        <div className="inline-flex items-center gap-1.5 text-black">
          <LocationIcon location={phase.location} />
          <span className="text-[11px]">{phase.location}</span>
        </div>
      )
    case 'appState': {
      // Monochromatic green progression: lighter → darker as the workflow
      // advances from "before use" through approval. Level returned as
      // bg + text color pair for the pill.
      const STATE_LEVELS = {
        'BEFORE APPLICATION USE': { bg: '#F0F7F0', fg: '#666666' },
        'PREPARATION':            { bg: '#D5E8D5', fg: '#004F00' },
        'EXECUTION':              { bg: '#99CC99', fg: '#003300' },
        'DRAFT ISSUES':           { bg: '#4D9E4D', fg: '#FFFFFF' },
        'APPROVED':               { bg: '#007F00', fg: '#FFFFFF' },
      }
      const level = STATE_LEVELS[phase.appState] || { bg: '#FFFFFF', fg: '#000000' }
      return (
        <span
          className="inline-flex items-center px-2 py-0.5 font-mono text-[10px] tracking-[0.1em]"
          style={{ backgroundColor: level.bg, color: level.fg }}
        >
          {phase.appState}
        </span>
      )
    }
    case 'time': {
      // Two sun groups separated by "to": minimum count → maximum count.
      // e.g. "1–2 days" reads as ☀  to  ☀☀. Non-numeric labels
      // ("Ongoing", "Max 10 days", "—") fall back to plain text.
      const { min, max, rangeText } = parseTimeEstimate(phase.timeEstimate)
      if (min == null) {
        const isOngoing = /ongoing/i.test(rangeText)
        return (
          <div className="flex items-center justify-center gap-1.5 w-full">
            {isOngoing && (
              <img src={infinityIcon} alt="" className="w-[14px] h-[14px] object-contain select-none flex-shrink-0" draggable={false} />
            )}
            <span className="text-[11px] text-bp-dark-grey">{rangeText}</span>
          </div>
        )
      }
      const sun = (key) => (
        <img key={key} src={sunnyIcon} alt="" className="w-[14px] h-[14px] object-contain select-none" draggable={false} />
      )
      return (
        <div className="flex items-center justify-center gap-2 w-full flex-wrap">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: min }).map((_, i) => sun(`a${i}`))}
          </div>
          {max > min && (
            <>
              <span className="text-[11px] text-black">to</span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: max }).map((_, i) => sun(`b${i}`))}
              </div>
            </>
          )}
        </div>
      )
    }
    case 'actions':
      // Primary content row. Number column kept distinctive (bp-dark-green
      // font-black). Action text matches the unified body color/size; only
      // the slight weight bump (font-medium) signals it as primary.
      return (
        <ol className="space-y-1 pr-3">
          {phase.actions.map((action, i) => (
            <li key={i} className="grid grid-cols-[1.4em_1fr] gap-2 items-start text-[11px] text-black leading-snug font-medium tracking-tight">
              <span className="text-bp-dark-green font-black text-[13px] leading-snug text-center">
                {i + 1}
              </span>
              <span>{action}</span>
            </li>
          ))}
        </ol>
      )
    case 'output':
      if (!phase.output?.length) {
        return (
          <div className="flex items-center justify-center h-full">
            <span className="text-[11px] text-bp-silver">N/A</span>
          </div>
        )
      }
      return (
        <div className="space-y-1.5">
          {phase.output.map((doc, i) => (
            <OutputIcon key={i} type={doc.type} label={doc.label} />
          ))}
        </div>
      )
    case 'frontstage':
      return renderCellList(phase.frontstage, 'text-[11px] text-black')
    case 'backstage':
      return renderCellList(phase.backstage, 'text-[11px] text-black')
    case 'support':
      return (
        <div className="space-y-2">
          {phase.supportProcesses?.employee?.length > 0 && (
            <div>
              <span className="font-mono text-[9px] tracking-[0.1em] text-black uppercase">EMPLOYEE</span>
              {renderCellList(phase.supportProcesses.employee, 'text-[11px] text-black')}
            </div>
          )}
          {phase.supportProcesses?.technology?.length > 0 && (
            <div>
              <span className="font-mono text-[9px] tracking-[0.1em] text-black uppercase">TECHNOLOGY</span>
              {renderCellList(phase.supportProcesses.technology, 'text-[11px] text-black')}
            </div>
          )}
        </div>
      )
    case 'systems': {
      if (!phase.systemsUsed?.length) return <span className="font-mono text-[9px] text-bp-dark-grey">—</span>
      return (
        <div className="flex flex-wrap gap-1">
          {phase.systemsUsed.map(sysId => {
            const sys = systems?.find(s => s.id === sysId)
            const name = sys?.name || sysId
            return (
              <span
                key={sysId}
                className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-gray-200 font-mono text-[9px] tracking-[0.1em] text-black uppercase"
              >
                <SystemLogo name={name} className="w-3 h-3" />
                {name}
              </span>
            )
          })}
        </div>
      )
    }
    case 'roles':
      return (
        <div className="flex flex-wrap gap-1.5">
          {phase.activeRoles.map(roleId => {
            const role = roles[roleId]
            if (!role) return null
            return <RoleIcon key={roleId} role={role} />
          })}
        </div>
      )
    default:
      return null
  }
}

// Stand-in human icon used in the active-roles row. Color-coded by org
// (BP green / operator navy). Hover shows a fixed-position card with the
// role's photo + title — fixed positioning so it's not clipped by the
// grid's overflow container.
function RoleIcon({ role }) {
  const isBp = role.org === 'bp'
  const bg = isBp ? '#007F00' : '#1A2D5C'
  const [hovered, setHovered] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const ref = useRef(null)

  const onEnter = () => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setCoords({ top: rect.top, left: rect.left + rect.width / 2 })
    setHovered(true)
  }
  const onLeave = () => setHovered(false)

  return (
    <>
      <button
        ref={ref}
        type="button"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        aria-label={role.role}
        className="w-5 h-5 rounded-full flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-bp-green"
        style={{ backgroundColor: bg }}
      >
        <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="currentColor">
          <circle cx="8" cy="5.5" r="2.6" />
          <path d="M2.5 14.5c0-2.9 2.4-4.6 5.5-4.6s5.5 1.7 5.5 4.6z" />
        </svg>
      </button>
      {hovered && createPortal(
        <div
          className="fixed z-[60] pointer-events-none"
          style={{
            top: coords.top - 8,
            left: coords.left,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-white border border-gray-200 shadow-lg p-2 flex items-center gap-3 min-w-[180px]">
            <div className="relative flex-shrink-0">
              {role.avatar ? (
                <img
                  src={role.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                  style={{
                    border: `2px solid ${bg}`,
                    transform: role.id === 'rvManager' ? 'scaleX(-1)' : undefined,
                  }}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: bg }}
                >
                  <svg viewBox="0 0 16 16" className="w-5 h-5 text-white" fill="currentColor">
                    <circle cx="8" cy="5.5" r="2.6" />
                    <path d="M2.5 14.5c0-2.9 2.4-4.6 5.5-4.6s5.5 1.7 5.5 4.6z" />
                  </svg>
                </div>
              )}
              {/* Org badge — circular white-fill with the org's logo,
                  overlapping bottom-right. Mirrors the Roles drop-down. */}
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-white flex items-center justify-center overflow-hidden shadow-sm"
                aria-hidden="true"
              >
                <img
                  src={isBp ? bpHelios : valarisMark}
                  alt=""
                  className="w-full h-full object-contain p-[1px]"
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-black leading-tight">
                {role.role}
              </div>
              {role.personName && (
                <div className="text-[10px] italic text-bp-silver leading-tight mt-0.5">
                  {role.personName}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

// Monoline location icons. Compound locations (split by " / ") render two
// atomic icons side-by-side. 20px, currentColor stroke at 1.5px so the
// icons inherit the parent's text color.
function LocationAtom({ part }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: 'w-5 h-5 flex-shrink-0',
    'aria-hidden': 'true',
  }
  switch (part) {
    case 'ONSHORE':
      // Peaked-roof house with a door.
      return (
        <svg {...common}>
          <path d="M4 11l8-7 8 7v9H4z" />
          <path d="M9 20v-5h6v5" />
          <path d="M9 11h6" />
        </svg>
      )
    case 'OFFSHORE':
      // Water drop — open-water shorthand, distinct from the derrick.
      return (
        <svg {...common}>
          <path d="M12 2.5 C7 9, 5 13, 5 16 A7 7 0 0 0 19 16 C19 13, 17 9, 12 2.5 Z" />
        </svg>
      )
    case 'NEAR RIG':
    case 'ON RIG':
      // Drilling derrick: peaked tower over a legged platform with waves.
      return (
        <svg {...common}>
          <path d="M9 4l3 4 3-4" />
          <path d="M12 4v9" />
          <path d="M7 13h10v2H7z" />
          <path d="M8 15v5" />
          <path d="M16 15v5" />
          <path d="M3 21c2-1 4 1 6 0s4 1 6 0 4 1 6 0" />
        </svg>
      )
    case 'REGIONAL OFFICE':
      // Tall office block with a location pin on top.
      return (
        <svg {...common}>
          <path d="M5 21V8h14v13" />
          <path d="M5 21h14" />
          <path d="M9 12h2M9 16h2M13 12h2M13 16h2" />
          <path d="M12 7c1.4 0 2.5-1.1 2.5-2.5S13.4 2 12 2 9.5 3.1 9.5 4.5 11 7 12 7z" />
        </svg>
      )
    default:
      return null
  }
}

function LocationIcon({ location }) {
  const parts = location.split(' / ').map(p => p.trim())
  return (
    <span className="inline-flex items-center gap-1">
      {parts.map((part, i) => (
        <LocationAtom key={`${part}-${i}`} part={part} />
      ))}
    </span>
  )
}

function renderCellList(items, textClass = 'text-[11px] text-black') {
  if (!items?.length) return <span className={`font-mono ${textClass}`}>—</span>
  return (
    <ul className="space-y-0.5">
      {items.map((item, i) => (
        <li key={i} className={`${textClass} leading-snug`}>
          {item}
        </li>
      ))}
    </ul>
  )
}
