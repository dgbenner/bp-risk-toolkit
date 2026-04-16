import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import bpHorizontal from '../assets/logos/bp-horizontal.png'
import valarisLogo from '../assets/logos/valaris.jpg'

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

        <div className="px-6 pt-6 pb-6 flex-1">
          {/* Org logos — top left */}
          <div className="flex items-center gap-3 mb-4 h-16">
            {blueprint.orgs.includes('bp') && (
              <img src={bpHorizontal} alt="BP" className="h-16 object-contain" />
            )}
            {blueprint.orgs.includes('valaris') && (
              <img src={valarisLogo} alt="Valaris" className="h-14 object-contain" />
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-light text-bp-dark-green tracking-wide pb-4">
            {blueprint.title}
          </h3>

          {/* Metadata readouts */}
          <div className="space-y-2">
            {[
              ['PHASE', blueprint.phase],
              ['USER', blueprint.primaryUser],
              ['LOC', blueprint.setting],
              ['CADENCE', blueprint.cadence],
            ].map(([label, value]) => (
              <div key={label} className="flex font-mono text-[12px] tracking-[0.1em]">
                <span className="text-bp-silver w-[72px] flex-shrink-0">{label}</span>
                <span className="text-bp-dark-grey">{value.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="h-9 flex items-center justify-center border-t border-gray-100 bg-bp-pale-grey/50 group-hover:bg-bp-green/10 transition-colors">
          <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-bp-silver group-hover:text-bp-green transition-colors">
            VIEW BLUEPRINT →
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
