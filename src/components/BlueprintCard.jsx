import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function BlueprintCard({ blueprint, index }) {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
    >
      <Link
        to={`/blueprint/${blueprint.id}`}
        className="group h-full flex flex-col border border-gray-200 hover:border-bp-green transition-all duration-300 bg-white relative overflow-hidden"
      >
        {/* Corner crosshairs */}
        <span className="absolute top-2 left-2 font-mono text-[28px] leading-none text-bp-silver opacity-20">+</span>
        <span className="absolute top-2 right-2 font-mono text-[28px] leading-none text-bp-silver opacity-20">+</span>
        <span className="absolute bottom-2 left-2 font-mono text-[28px] leading-none text-bp-silver opacity-20">+</span>
        <span className="absolute bottom-2 right-2 font-mono text-[28px] leading-none text-bp-silver opacity-20">+</span>

        {/* Top bar */}
        <div className="h-[3px] bg-bp-green group-hover:bg-bp-light-green transition-colors" />

        <div className="px-6 pt-8 pb-6 flex-1">
          {/* Title with breathing room */}
          <h3 className="text-xl font-light text-bp-dark-green tracking-wide pt-2 pb-5">
            {blueprint.title}
          </h3>

          {/* Metadata readouts — phase grouped with the rest */}
          <div className="space-y-2 mb-5">
            <div className="font-mono text-[12px] tracking-[0.1em] text-bp-silver">
              PHASE: <span className="text-bp-dark-grey">{blueprint.phase.toUpperCase()}</span>
            </div>
            <div className="font-mono text-[12px] tracking-[0.1em] text-bp-silver">
              USER: <span className="text-bp-dark-grey">{blueprint.primaryUser.toUpperCase()}</span>
            </div>
            <div className="font-mono text-[12px] tracking-[0.1em] text-bp-silver">
              LOC: <span className="text-bp-dark-grey">{blueprint.setting.toUpperCase()}</span>
            </div>
            <div className="font-mono text-[12px] tracking-[0.1em] text-bp-silver">
              CADENCE: <span className="text-bp-dark-grey">{blueprint.cadence.toUpperCase()}</span>
            </div>
          </div>

        </div>

        {/* Bottom hover indicator */}
        <div className="h-9 flex items-center justify-center border-t border-gray-100 bg-bp-pale-grey/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-bp-green">
            VIEW BLUEPRINT →
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
