import { Fragment, useState, useMemo, useRef, useEffect } from 'react'
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
import BpHelios3D from '../components/BpHelios3D'

const blueprintMap = {
  'rig-verification': rigVerification,
  'risk-assessment': riskAssessment,
  'self-verification': selfVerification,
  'risk-register': riskRegister,
}

const swimlaneLabels = [
  { key: 'header', label: 'PHASE', height: 'h-[46px]' },
  { key: 'location', label: 'LOCATION', height: 'min-h-[36px]' },
  { key: 'appState', label: 'APP STATE', height: 'min-h-[36px]' },
  { key: 'time', label: 'TIME', height: 'min-h-[36px]' },
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
  // Org-coded color block on the left so org affiliation reads at a glance.
  // BP green for BP roles; dark navy (operator-logo blue) for operator roles.
  const blockBg = isBp ? '#007F00' : '#1A2D5C'
  return (
    <div className={`flex items-stretch ${isFirst ? '' : 'border-t border-[#EBEBEB]'}`}>
      <div
        className="flex-shrink-0 flex items-center px-3 py-3"
        style={{ backgroundColor: blockBg }}
      >
        <div className="relative w-20 h-20">
          {role.avatar ? (
            <img
              src={role.avatar}
              alt={role.name || role.role}
              className="w-20 h-20 rounded-full object-cover bg-gray-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center font-mono text-[9px] tracking-[0.1em] text-bp-silver">
              NO PHOTO
            </div>
          )}
          {/* Org badge — circular white-fill with the org's logo, mirrors the
              treatment used on the left rail's primary-actions photo. */}
          <div
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-white flex items-center justify-center overflow-hidden shadow-sm"
            aria-label={badgeAlt}
          >
            <img src={badgeImg} alt={badgeAlt} className="w-full h-full object-contain p-[2px]" />
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0 px-3 py-3">
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
          paint above the source-badge / swimlane-labels rows below (z-10). */}
      <div className="flex-shrink-0 border-b border-gray-200 px-4 flex items-end justify-between bg-white relative z-30">
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
                <div className="text-[13px] font-medium text-black leading-tight whitespace-nowrap">
                  {blueprint.subtitle}
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
                      ? 'bg-white border-gray-200 -mb-px text-bp-green font-medium z-10'
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
        {/* Phase progress dots */}
        <div className="flex items-center gap-1.5">
          {blueprint.phases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => {
                const el = document.getElementById(`phase-${phase.id}`)
                el?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
              }}
              className="group relative"
              title={phase.name}
            >
              <div className={`w-2 h-2 rounded-full transition-colors ${
                selectedPhase?.id === phase.id
                  ? 'bg-bp-green'
                  : 'bg-gray-200 group-hover:bg-bp-light-green'
              }`} />
            </button>
          ))}
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

      {/* Source badge */}
      {blueprint.sourceLabel && (
        <div className="flex-shrink-0 px-4 py-1.5 bg-gray-200 border-b border-gray-300 flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${
            blueprint.sourceLabel.toLowerCase().includes('research') ? 'bg-bp-green' : 'bg-bp-silver'
          }`} />
          <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-bp-dark-grey font-medium">
            {blueprint.sourceLabel}
          </span>
          {blueprint.sources.length > 0 && (
            <span className="font-mono text-[9px] text-bp-dark-grey ml-2">
              {blueprint.sources.join(' · ')}
            </span>
          )}
        </div>
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
              header: 'bg-white',
              location: 'bg-white',
              appState: 'bg-white',
              time: 'bg-white',
              actions: 'bg-bp-pale-green/30',
              output: 'bg-rose-50',
              frontstage: 'bg-gray-100',
              backstage: 'bg-rose-50',
              support: 'bg-gray-100',
              systems: 'bg-rose-50',
              roles: 'bg-gray-100',
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
                    className="bg-bp-green text-white text-[11px] tracking-[0.05em] uppercase px-3 py-1 flex items-center border-r border-bp-dark-green relative cursor-pointer hover:bg-bp-green/90 transition-colors font-bold"
                  >
                    <span>
                      {row.key === 'visibility' ? '── VISIBILITY ──' : '── INTERACT ──'}
                    </span>
                    {triangle}
                  </button>
                  <div
                    className="bg-white px-4 py-1 flex items-center gap-2 border-b border-gray-100"
                    style={{ gridColumn: `2 / span ${blueprint.phases.length}` }}
                  >
                    <div className={`flex-1 border-t ${row.key === 'visibility' ? 'border-dashed border-bp-green/50' : 'border-dotted border-bp-silver/50'}`} />
                    <span className={`font-mono text-[8px] tracking-[0.15em] uppercase ${row.key === 'visibility' ? 'text-bp-green/60' : 'text-bp-silver/60'}`}>
                      {row.key === 'visibility' ? 'LINE OF VISIBILITY' : 'LINE OF INTERACTION'}
                    </span>
                    <div className={`flex-1 border-t ${row.key === 'visibility' ? 'border-dashed border-bp-green/50' : 'border-dotted border-bp-silver/50'}`} />
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
                        />
                        <div className="absolute -bottom-1 -right-[14px] w-7 h-7 rounded-full bg-white border-2 border-white flex items-center justify-center overflow-hidden">
                          <img src={bpHelios} alt="BP" className="w-full h-full object-contain p-[2px]" />
                        </div>
                      </div>
                    )}
                    <div className="w-full">
                      <div className="text-[13px] tracking-[0.05em] uppercase text-white leading-tight font-bold">
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
                    className="bg-bp-green text-white text-[13px] tracking-[0.05em] uppercase px-3 py-2 flex items-start text-left border-r border-bp-dark-green border-b border-bp-dark-green/30 relative cursor-pointer hover:bg-bp-green/90 transition-colors font-bold"
                  >
                    <span>{row.label || row.key.toUpperCase()}</span>
                    {triangle}
                  </button>
                )}
                {/* Phase data cells for this row */}
                {blueprint.phases.map((phase) => {
                  const dimmed = activeRole && !phase.activeRoles.includes(activeRole)
                  const isHeader = row.key === 'header'
                  const pinned = pinnedPhases.has(phase.id)
                  return (
                    <div
                      key={phase.id}
                      id={isHeader ? `phase-${phase.id}` : undefined}
                      onClick={isHeader ? () => setSelectedPhase(phase) : undefined}
                      className={`${zebraBg} px-3 py-2 border-r border-gray-100 ${heavyDivider} transition-opacity duration-300 relative ${
                        dimmed ? 'opacity-25' : ''
                      } ${isHeader ? 'cursor-pointer hover:bg-bp-pale-green/30' : ''} ${
                        isCentered ? 'text-center flex items-center justify-center' : ''
                      }`}
                    >
                      {/* Pin toggle — top-left of phase header cells only.
                          Visual toggle for now; not wired to any behavior yet. */}
                      {isHeader && (
                        <button
                          type="button"
                          onClick={(e) => togglePin(phase.id, e)}
                          aria-label={pinned ? 'Unpin phase' : 'Pin phase'}
                          aria-pressed={pinned}
                          className={`absolute top-1.5 left-1.5 w-5 h-5 flex items-center justify-center transition-colors ${
                            pinned ? 'text-bp-dark-green' : 'text-bp-silver hover:text-bp-dark-grey'
                          }`}
                        >
                          <svg
                            viewBox="0 0 16 16"
                            className="w-3.5 h-3.5"
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
                      {renderCellContent(row.key, phase, blueprint.systems)}
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
function renderCellContent(key, phase, systems) {
  switch (key) {
    case 'header':
      return (
        <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-black font-medium">
          [ {String(phase.index).padStart(2, '0')} / {phase.name.toUpperCase()} ]
        </div>
      )
    case 'location':
      return (
        <span className="font-mono text-[10px] tracking-[0.1em] text-black">
          LOC: {phase.location}
        </span>
      )
    case 'appState':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] text-black border border-gray-300 bg-white">
          STATUS: {phase.appState}
        </span>
      )
    case 'time':
      return (
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-bp-green/40 w-3/4" />
          </div>
          <span className="font-mono text-[10px] tracking-[0.1em] text-black whitespace-nowrap">
            {phase.timeEstimate}
          </span>
        </div>
      )
    case 'actions':
      return (
        <ol className="space-y-1">
          {phase.actions.map((action, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-black leading-snug">
              <span className="text-bp-dark-green font-black text-[11px] leading-snug">{i + 1}</span>
              {action}
            </li>
          ))}
        </ol>
      )
    case 'output':
      if (!phase.output?.length) {
        return <span className="font-mono text-[9px] text-black">— NO OUTPUT —</span>
      }
      return (
        <div className="space-y-1.5">
          {phase.output.map((doc, i) => (
            <OutputIcon key={i} type={doc.type} label={doc.label} />
          ))}
        </div>
      )
    case 'frontstage':
      return renderCellList(phase.frontstage)
    case 'backstage':
      return renderCellList(phase.backstage)
    case 'support':
      return (
        <div className="space-y-2">
          {phase.supportProcesses?.employee?.length > 0 && (
            <div>
              <span className="font-mono text-[8px] tracking-[0.15em] text-black uppercase">EMPLOYEE</span>
              {renderCellList(phase.supportProcesses.employee)}
            </div>
          )}
          {phase.supportProcesses?.technology?.length > 0 && (
            <div>
              <span className="font-mono text-[8px] tracking-[0.15em] text-black uppercase">TECHNOLOGY</span>
              {renderCellList(phase.supportProcesses.technology)}
            </div>
          )}
        </div>
      )
    case 'systems': {
      if (!phase.systemsUsed?.length) return <span className="font-mono text-[9px] text-black">—</span>
      return (
        <div className="flex flex-wrap gap-1">
          {phase.systemsUsed.map(sysId => {
            const sys = systems?.find(s => s.id === sysId)
            const name = sys?.name || sysId
            return (
              <span
                key={sysId}
                className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-gray-200 font-mono text-[9px] tracking-[0.04em] text-black uppercase"
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
            const isBP = role.org === 'bp'
            return (
              <span
                key={roleId}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-mono tracking-[0.1em] uppercase border text-black"
                style={{
                  borderColor: isBP ? '#007F00' : '#FF9900',
                  backgroundColor: isBP ? 'rgba(0,127,0,0.05)' : 'rgba(255,153,0,0.05)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isBP ? '#007F00' : '#FF9900' }} />
                {role.name}
              </span>
            )
          })}
        </div>
      )
    default:
      return null
  }
}

function renderCellList(items) {
  if (!items?.length) return <span className="font-mono text-[11px] text-black">—</span>
  return (
    <ul className="space-y-0.5">
      {items.map((item, i) => (
        <li key={i} className="text-[11px] text-black leading-snug">
          {item}
        </li>
      ))}
    </ul>
  )
}
