import { useState, useMemo, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { rigVerification } from '../data/blueprints/rigVerification'
import { riskAssessment } from '../data/blueprints/riskAssessment'
import { selfVerification } from '../data/blueprints/selfVerification'
import { riskRegister } from '../data/blueprints/riskRegister'
import { roles } from '../data/roles'
import { blueprintList } from '../data/blueprints'
import PhaseColumn from '../components/PhaseColumn'
import DetailPanel from '../components/DetailPanel'

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

export default function BlueprintViewer() {
  const { blueprintId } = useParams()
  const blueprint = blueprintMap[blueprintId]
  const [selectedPhase, setSelectedPhase] = useState(null)
  const [activeRole, setActiveRole] = useState(null)
  const scrollRef = useRef(null)

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
      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-gray-200 px-4 py-3 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="w-7 h-7 rounded-full bg-bp-green flex items-center justify-center hover:bg-bp-dark-green transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.5" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="white" strokeWidth="1.5" />
            </svg>
          </Link>
          <div>
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-bp-green font-medium">
              {blueprint.title}
            </div>
            <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-bp-silver">
              {blueprint.subtitle}
            </div>
          </div>
        </div>

        {/* Phase progress dots */}
        <div className="flex items-center gap-1.5">
          {blueprint.phases.map((phase, i) => (
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

        {/* Blueprint switcher */}
        <div className="flex items-center gap-1">
          {sorted.map(bp => (
            <Link
              key={bp.id}
              to={`/blueprint/${bp.id}`}
              className={`px-2.5 py-1 font-mono text-[9px] tracking-[0.1em] uppercase border transition-colors ${
                bp.id === blueprintId
                  ? 'border-bp-green text-bp-green bg-bp-green/5'
                  : 'border-gray-200 text-bp-silver hover:border-gray-300 hover:text-bp-dark-grey'
              }`}
            >
              {bp.title.split(' ')[0]}
            </Link>
          ))}
        </div>
      </div>

      {/* Source badge */}
      {blueprint.sourceLabel && (
        <div className="flex-shrink-0 px-4 py-1.5 bg-bp-pale-grey border-b border-gray-100 flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${
            blueprint.sourceLabel.includes('research') ? 'bg-bp-green' : 'bg-bp-silver'
          }`} />
          <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-bp-silver">
            {blueprint.sourceLabel}
          </span>
          {blueprint.sources.length > 0 && (
            <span className="font-mono text-[9px] text-bp-silver opacity-60 ml-2">
              — {blueprint.sources.join(' · ')}
            </span>
          )}
        </div>
      )}

      {/* Main canvas: fixed left rail + horizontal scroll */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left rail — swimlane labels */}
        <div className="flex-shrink-0 w-[140px] border-r border-gray-200 bg-white z-10">
          {swimlaneLabels.map((row) => {
            if (row.key === 'visibility') {
              return (
                <div key={row.key} className={`${row.height} flex items-center px-3`}>
                  <span className="font-mono text-[7px] tracking-[0.12em] text-bp-green/60 uppercase">
                    ── VISIBILITY ──
                  </span>
                </div>
              )
            }
            if (row.key === 'interaction') {
              return (
                <div key={row.key} className={`${row.height} flex items-center px-3`}>
                  <span className="font-mono text-[7px] tracking-[0.12em] text-bp-silver/60 uppercase">
                    ── INTERACT ──
                  </span>
                </div>
              )
            }
            return (
              <div
                key={row.key}
                className={`${row.height} flex items-center px-3 border-b border-gray-50 ${
                  row.key === 'header' ? 'border-b-gray-200 bg-bp-pale-grey/50' : ''
                } ${row.key === 'actions' ? 'bg-bp-pale-green/10' : ''}`}
              >
                <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-bp-silver">
                  {row.label}
                </span>
              </div>
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

      {/* Bottom bar — systems */}
      <div className="flex-shrink-0 border-t border-gray-200 px-4 py-2 bg-bp-pale-grey flex items-center gap-4">
        <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-bp-silver">
          SYSTEMS:
        </span>
        {blueprint.systems.map(sys => (
          <span
            key={sys.id}
            className="px-2 py-1 bg-white font-mono text-[9px] tracking-[0.08em] text-bp-dark-blue border border-bp-dark-blue/15"
            title={sys.description}
          >
            {sys.name}
          </span>
        ))}
      </div>

      {/* Detail panel */}
      <DetailPanel
        phase={selectedPhase}
        systems={blueprint.systems}
        onClose={() => setSelectedPhase(null)}
      />
    </div>
  )
}
