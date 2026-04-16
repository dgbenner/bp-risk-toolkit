import { motion, AnimatePresence } from 'framer-motion'
import { roles } from '../data/roles'
import OutputIcon from './OutputIcon'

export default function DetailPanel({ phase, systems, onClose }) {
  return (
    <AnimatePresence>
      {phase && (
        <motion.div
          className="fixed top-0 right-0 h-full w-[380px] bg-white border-l border-gray-200 shadow-xl z-50 overflow-y-auto"
          initial={{ x: 380 }}
          animate={{ x: 0 }}
          exit={{ x: 380 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
            <div>
              <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-bp-green mb-1">
                [ {String(phase.index).padStart(2, '0')} / {phase.name.toUpperCase()} ]
              </div>
              <div className="font-mono text-[10px] tracking-[0.1em] text-bp-silver">
                LOC: {phase.location}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-bp-silver hover:text-bp-dark-grey transition-colors font-mono text-sm"
            >
              ×
            </button>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* Status + Time */}
            <div className="flex gap-3">
              <span className="px-2 py-1 bg-bp-dark-blue/5 font-mono text-[10px] tracking-[0.1em] text-bp-dark-blue border border-bp-dark-blue/20">
                STATUS: {phase.appState}
              </span>
              <span className="px-2 py-1 bg-bp-pale-grey font-mono text-[10px] tracking-[0.1em] text-bp-silver">
                {phase.timeEstimate}
              </span>
            </div>

            {/* Active Roles */}
            <div>
              <h4 className="font-mono text-[9px] tracking-[0.15em] uppercase text-bp-silver mb-3">
                ACTIVE ROLES
              </h4>
              <div className="space-y-2">
                {phase.activeRoles.map(roleId => {
                  const role = roles[roleId]
                  if (!role) return null
                  const isBP = role.org === 'bp'
                  return (
                    <div key={roleId} className="flex items-center gap-3">
                      <img
                        src={role.avatar}
                        alt={role.name}
                        className="w-8 h-8 rounded-full object-cover"
                        style={{
                          border: `2px solid ${isBP ? '#007F00' : '#FF9900'}`,
                        }}
                      />
                      <div>
                        <div className="text-xs font-medium text-bp-dark-grey">
                          {role.name}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-bp-silver">{role.title}</span>
                          <span
                            className="px-1 py-0.5 font-mono text-[7px] tracking-[0.1em] uppercase"
                            style={{
                              backgroundColor: isBP ? 'rgba(0,127,0,0.08)' : 'rgba(255,153,0,0.08)',
                              color: isBP ? '#007F00' : '#FF9900',
                            }}
                          >
                            {isBP ? 'BP' : 'VALARIS'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div>
              <h4 className="font-mono text-[9px] tracking-[0.15em] uppercase text-bp-silver mb-3">
                KEY ACTIONS
              </h4>
              <ul className="space-y-1.5">
                {phase.actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-bp-dark-grey leading-snug">
                    <span className="text-bp-green mt-0.5 text-[8px]">▸</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            {/* Output Documents */}
            {phase.output?.length > 0 && (
              <div>
                <h4 className="font-mono text-[9px] tracking-[0.15em] uppercase text-bp-silver mb-3">
                  OUTPUT DOCUMENTS
                </h4>
                <div className="space-y-2">
                  {phase.output.map((doc, i) => (
                    <OutputIcon key={i} type={doc.type} label={doc.label} />
                  ))}
                </div>
              </div>
            )}

            {/* Systems */}
            {phase.systemsUsed?.length > 0 && (
              <div>
                <h4 className="font-mono text-[9px] tracking-[0.15em] uppercase text-bp-silver mb-3">
                  SYSTEMS IN USE
                </h4>
                <div className="space-y-2">
                  {phase.systemsUsed.map(sysId => {
                    const sys = systems?.find(s => s.id === sysId)
                    if (!sys) return null
                    return (
                      <div key={sysId} className="flex items-start gap-2">
                        <span className="px-1.5 py-0.5 bg-bp-dark-blue/5 font-mono text-[9px] tracking-[0.08em] text-bp-dark-blue border border-bp-dark-blue/15 flex-shrink-0">
                          {sys.name}
                        </span>
                        <span className="text-[10px] text-bp-silver leading-snug">
                          {sys.description}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            {phase.notes && (
              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-mono text-[9px] tracking-[0.15em] uppercase text-bp-silver mb-2">
                  NOTES
                </h4>
                <p className="text-[11px] text-bp-dark-grey leading-relaxed italic">
                  {phase.notes}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
