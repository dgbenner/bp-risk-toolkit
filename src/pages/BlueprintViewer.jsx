import { useState, useMemo, useRef, useEffect } from 'react'
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
import SystemLogo from '../components/SystemLogos'
import PhaseColumn from '../components/PhaseColumn'
import DetailPanel from '../components/DetailPanel'
import bpHelios from '../assets/logos/bp-helios.png'

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
  `font-mono text-[10px] tracking-[0.08em] uppercase underline underline-offset-4 transition-colors cursor-pointer ${
    open
      ? 'text-bp-green'
      : 'text-bp-silver hover:text-bp-dark-grey'
  }`

function GlossaryButton() {
  const { open, setOpen, ref } = usePopover()
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className={linkStyleClass(open)}>
        GLOSSARY
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg z-40 pt-8 pb-4"
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
                Glossary
              </div>
              <p className="text-[11px] text-bp-dark-grey italic leading-relaxed">
                Key terms and definitions relevant to the Risk Toolkit and service blueprints — to be filled in.
              </p>
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

function RolesButton() {
  const { open, setOpen, ref } = usePopover()
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className={linkStyleClass(open)}>
        ROLES
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg z-40 pt-8 pb-4"
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
                Roles
              </div>
              <p className="text-[11px] text-bp-dark-grey italic leading-relaxed">
                Full role directory with avatars and responsibilities — to be filled in.
              </p>
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
      {/* Row 1 — header bar: logo + title + quote + blueprint tabs */}
      <div className="flex-shrink-0 border-b border-gray-200 px-4 flex items-end justify-between bg-white z-10">
        <div className="flex items-center gap-4 py-2">
          <Link
            to="/"
            className="flex items-center justify-center hover:opacity-80 transition-opacity"
            title="Return to Risk Toolkit"
          >
            <img src={bpHelios} alt="BP" className="w-14 h-14 object-contain" />
          </Link>
          <div>
            {/* Title + subtitle sharing a baseline */}
            <div className="flex items-baseline gap-3">
              <div className="text-xl font-light text-bp-dark-green tracking-wide leading-tight whitespace-nowrap">
                {blueprint.title}
              </div>
              {blueprint.subtitle && (
                <div className="text-[13px] font-light text-bp-dark-grey leading-tight whitespace-nowrap">
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
            <RolesButton />
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
                className="px-2 py-1 font-mono text-[9px] tracking-[0.1em] uppercase border transition-colors"
                style={{
                  borderColor: isActive ? color : '#e5e7eb',
                  color: isActive ? color : '#999',
                  backgroundColor: isActive ? `${color}08` : 'transparent',
                }}
              >
                {role.name}
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

      {/* Main canvas: fixed left rail + horizontal scroll */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left rail — swimlane labels (reversed out on dark green) */}
        <div className="flex-shrink-0 w-[140px] border-r border-bp-green bg-bp-green z-10">
          {swimlaneLabels.map((row) => {
            const hasGlossary = serviceBlueprintGlossary[row.key]
            const triangle = hasGlossary ? (
              <svg
                viewBox="0 0 6 6"
                className="w-[6px] h-[6px] absolute bottom-0 right-0 text-white"
              >
                <path d="M6 0V6H0z" fill="currentColor" />
              </svg>
            ) : null

            if (row.key === 'visibility') {
              return (
                <button
                  key={row.key}
                  onClick={(e) => openGlossary(row.key, e)}
                  className={`${row.height} w-full flex items-center px-3 relative cursor-pointer hover:bg-white/5 transition-colors`}
                >
                  <span className="font-mono text-[11px] tracking-[0.05em] text-white/60 uppercase">
                    ── VISIBILITY ──
                  </span>
                  {triangle}
                </button>
              )
            }
            if (row.key === 'interaction') {
              return (
                <button
                  key={row.key}
                  onClick={(e) => openGlossary(row.key, e)}
                  className={`${row.height} w-full flex items-center px-3 relative cursor-pointer hover:bg-white/5 transition-colors`}
                >
                  <span className="font-mono text-[11px] tracking-[0.05em] text-white/50 uppercase">
                    ── INTERACT ──
                  </span>
                  {triangle}
                </button>
              )
            }
            // Primary Actions row — show the primary user's headshot stacked above the labels
            if (row.key === 'actions') {
              const primaryRole = roles[blueprint.primaryUser]
              return (
                <button
                  key={row.key}
                  onClick={(e) => openGlossary(row.key, e)}
                  className={`${row.height} w-full flex flex-col items-start gap-3 px-2 py-2 border-b-2 border-white/10 bg-white/10 relative cursor-pointer hover:bg-white/15 transition-colors text-left`}
                >
                  {primaryRole?.avatar && (
                    <div className="relative flex-shrink-0">
                      <img
                        src={primaryRole.avatar}
                        alt={primaryRole.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white"
                      />
                      {/* BP badge — doubled in size, overlapping lower-right */}
                      <div className="absolute -bottom-1 -right-[14px] w-7 h-7 rounded-full bg-white border-2 border-white flex items-center justify-center overflow-hidden">
                        <img
                          src={bpHelios}
                          alt="BP"
                          className="w-full h-full object-contain p-[2px]"
                        />
                      </div>
                    </div>
                  )}
                  <div className="w-full text-left">
                    <div className="font-mono text-[12px] tracking-[0.05em] uppercase text-white leading-tight">
                      {blueprint.actionsLabel || 'Primary Actions'}
                    </div>
                    {blueprint.actionsDescription && (
                      <div className="text-[10px] italic text-white/70 leading-snug">
                        {blueprint.actionsDescription}
                      </div>
                    )}
                  </div>
                  {triangle}
                </button>
              )
            }
            return (
              <button
                key={row.key}
                onClick={(e) => openGlossary(row.key, e)}
                className={`${row.height} w-full flex items-center px-3 border-b-2 border-white/10 relative cursor-pointer hover:bg-white/5 transition-colors ${
                  row.key === 'header' ? 'border-b-white/20 bg-black/15 hover:bg-black/20' : ''
                }`}
              >
                <span className="font-mono text-[12px] tracking-[0.05em] uppercase text-white">
                  {row.label}
                </span>
                {triangle}
              </button>
            )
          })}
        </div>

        {/* Horizontal scroll canvas */}
        <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="flex">
            {blueprint.phases.map((phase) => (
              <div key={phase.id} id={`phase-${phase.id}`}>
                <PhaseColumn
                  phase={phase}
                  systems={blueprint.systems}
                  onNodeClick={setSelectedPhase}
                  activeRole={activeRole}
                />
              </div>
            ))}
          </div>
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
