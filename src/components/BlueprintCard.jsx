import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function BlueprintCard({ blueprint, index }) {
  const isResearched = blueprint.sourceLabel === 'Built from stakeholder research'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
    >
      <Link
        to={`/blueprint/${blueprint.id}`}
        className="group block border border-gray-200 hover:border-bp-green transition-all duration-300 bg-white relative overflow-hidden"
      >
        {/* Corner crosshairs */}
        <span className="absolute top-2 left-2 font-mono text-[8px] text-bp-silver opacity-40">+</span>
        <span className="absolute top-2 right-2 font-mono text-[8px] text-bp-silver opacity-40">+</span>
        <span className="absolute bottom-2 left-2 font-mono text-[8px] text-bp-silver opacity-40">+</span>
        <span className="absolute bottom-2 right-2 font-mono text-[8px] text-bp-silver opacity-40">+</span>

        {/* Top bar */}
        <div className="h-[3px] bg-bp-green group-hover:bg-bp-light-green transition-colors" />

        <div className="p-6">
          {/* Phase number */}
          <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-bp-silver mb-3">
            [ {String(blueprint.order).padStart(2, '0')} / {blueprint.title.toUpperCase()} ]
          </div>

          <h3 className="text-lg font-light text-bp-dark-green tracking-wide mb-1">
            {blueprint.title}
          </h3>
          <p className="text-xs text-bp-dark-grey mb-4">
            {blueprint.subtitle}
          </p>

          {/* Metadata readouts */}
          <div className="space-y-1.5 mb-4">
            <div className="font-mono text-[10px] tracking-[0.1em] text-bp-silver">
              USER: <span className="text-bp-dark-grey">{blueprint.primaryUser.toUpperCase()}</span>
            </div>
            <div className="font-mono text-[10px] tracking-[0.1em] text-bp-silver">
              LOC: <span className="text-bp-dark-grey">{blueprint.setting.toUpperCase()}</span>
            </div>
            <div className="font-mono text-[10px] tracking-[0.1em] text-bp-silver">
              CADENCE: <span className="text-bp-dark-grey">{blueprint.cadence.toUpperCase()}</span>
            </div>
          </div>

          {/* Source badge */}
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono tracking-[0.1em] uppercase ${
            isResearched
              ? 'bg-bp-pale-green text-bp-dark-green'
              : 'bg-bp-pale-grey text-bp-silver'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{
              backgroundColor: isResearched ? '#007F00' : '#999'
            }} />
            {blueprint.sourceLabel}
          </div>
        </div>

        {/* Bottom hover indicator */}
        <div className="h-8 flex items-center justify-center border-t border-gray-100 bg-bp-pale-grey/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-bp-green">
            VIEW BLUEPRINT →
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
