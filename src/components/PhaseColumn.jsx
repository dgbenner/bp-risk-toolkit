import { motion } from 'framer-motion'
import { roles } from '../data/roles'
import OutputIcon from './OutputIcon'

const swimlaneRows = [
  { key: 'location', label: 'LOCATION' },
  { key: 'appState', label: 'APPLICATION STATE' },
  { key: 'timeEstimate', label: 'TIME' },
  { key: 'actions', label: 'PRIMARY ACTIONS' },
  { key: 'output', label: 'OUTPUT' },
  { key: 'frontstage', label: 'FRONTSTAGE' },
  { key: 'visibility-line', label: '' },
  { key: 'backstage', label: 'BACKSTAGE' },
  { key: 'interaction-line', label: '' },
  { key: 'supportProcesses', label: 'SUPPORT PROCESSES' },
  { key: 'systemsUsed', label: 'SYSTEMS' },
]

export default function PhaseColumn({ phase, systems, onNodeClick, activeRole, isActive }) {
  const columnVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.05 } },
  }

  const rowVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const dimmed = activeRole && !phase.activeRoles.includes(activeRole)

  return (
    <motion.div
      className={`min-w-[260px] max-w-[300px] flex-shrink-0 border-r border-gray-100 transition-opacity duration-300 ${
        dimmed ? 'opacity-25' : ''
      }`}
      variants={columnVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {/* Phase header */}
      <div
        className="px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-bp-pale-green/30 transition-colors"
        onClick={() => onNodeClick(phase)}
      >
        <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-bp-green font-medium">
          [ {String(phase.index).padStart(2, '0')} / {phase.name.toUpperCase()} ]
        </div>
      </div>

      {/* Swimlane rows */}
      {swimlaneRows.map((row) => {
        if (row.key === 'visibility-line') {
          return (
            <div key={row.key} className="px-4 py-1 flex items-center gap-2">
              <div className="flex-1 border-t border-dashed border-bp-green/40" />
              <span className="font-mono text-[7px] tracking-[0.15em] text-bp-green/50 uppercase whitespace-nowrap">
                LINE OF VISIBILITY
              </span>
              <div className="flex-1 border-t border-dashed border-bp-green/40" />
            </div>
          )
        }

        if (row.key === 'interaction-line') {
          return (
            <div key={row.key} className="px-4 py-1 flex items-center gap-2">
              <div className="flex-1 border-t border-dotted border-bp-silver/40" />
              <span className="font-mono text-[7px] tracking-[0.15em] text-bp-silver/50 uppercase whitespace-nowrap">
                LINE OF INTERACTION
              </span>
              <div className="flex-1 border-t border-dotted border-bp-silver/40" />
            </div>
          )
        }

        return (
          <motion.div
            key={row.key}
            variants={rowVariants}
            className={`px-4 py-2.5 border-b border-gray-50 min-h-[48px] ${
              row.key === 'actions' ? 'bg-bp-pale-green/20' : ''
            }`}
          >
            {renderRowContent(row.key, phase, systems)}
          </motion.div>
        )
      })}

      {/* Active roles */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-1.5">
          {phase.activeRoles.map(roleId => {
            const role = roles[roleId]
            if (!role) return null
            const isBP = role.org === 'bp'
            return (
              <span
                key={roleId}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-mono tracking-[0.1em] uppercase border"
                style={{
                  borderColor: isBP ? '#007F00' : '#FF9900',
                  color: isBP ? '#007F00' : '#FF9900',
                  backgroundColor: isBP ? 'rgba(0,127,0,0.05)' : 'rgba(255,153,0,0.05)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: isBP ? '#007F00' : '#FF9900' }}
                />
                {role.name}
              </span>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

function renderRowContent(key, phase, systems) {
  switch (key) {
    case 'location':
      return (
        <span className="font-mono text-[10px] tracking-[0.1em] text-bp-dark-grey">
          LOC: {phase.location}
        </span>
      )
    case 'appState':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-bp-dark-blue/5 font-mono text-[10px] tracking-[0.1em] text-bp-dark-blue border border-bp-dark-blue/20">
          STATUS: {phase.appState}
        </span>
      )
    case 'timeEstimate':
      return (
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 bg-gray-100 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-bp-green/30 w-3/4" />
          </div>
          <span className="font-mono text-[10px] tracking-[0.1em] text-bp-silver whitespace-nowrap">
            {phase.timeEstimate}
          </span>
        </div>
      )
    case 'actions':
      return (
        <ul className="space-y-1">
          {phase.actions.map((action, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-bp-dark-grey leading-snug">
              <span className="text-bp-green mt-0.5 text-[8px]">▸</span>
              {action}
            </li>
          ))}
        </ul>
      )
    case 'output':
      if (!phase.output?.length) {
        return <span className="font-mono text-[9px] text-bp-silver">— NO OUTPUT —</span>
      }
      return (
        <div className="space-y-1.5">
          {phase.output.map((doc, i) => (
            <OutputIcon key={i} type={doc.type} label={doc.label} />
          ))}
        </div>
      )
    case 'frontstage':
      return renderList(phase.frontstage)
    case 'backstage':
      return renderList(phase.backstage)
    case 'supportProcesses':
      return (
        <div className="space-y-2">
          {phase.supportProcesses.employee?.length > 0 && (
            <div>
              <span className="font-mono text-[8px] tracking-[0.15em] text-bp-silver uppercase">EMPLOYEE</span>
              {renderList(phase.supportProcesses.employee)}
            </div>
          )}
          {phase.supportProcesses.technology?.length > 0 && (
            <div>
              <span className="font-mono text-[8px] tracking-[0.15em] text-bp-silver uppercase">TECHNOLOGY</span>
              {renderList(phase.supportProcesses.technology)}
            </div>
          )}
        </div>
      )
    case 'systemsUsed': {
      if (!phase.systemsUsed?.length) return <span className="font-mono text-[9px] text-bp-silver">—</span>
      return (
        <div className="flex flex-wrap gap-1">
          {phase.systemsUsed.map(sysId => {
            const sys = systems?.find(s => s.id === sysId)
            return (
              <span
                key={sysId}
                className="px-1.5 py-0.5 bg-bp-dark-blue/5 font-mono text-[9px] tracking-[0.08em] text-bp-dark-blue border border-bp-dark-blue/15"
              >
                {sys?.name || sysId}
              </span>
            )
          })}
        </div>
      )
    }
    default:
      return null
  }
}

function renderList(items) {
  if (!items?.length) return <span className="font-mono text-[9px] text-bp-silver">—</span>
  return (
    <ul className="space-y-0.5">
      {items.map((item, i) => (
        <li key={i} className="text-[10px] text-bp-dark-grey leading-snug">
          {item}
        </li>
      ))}
    </ul>
  )
}
