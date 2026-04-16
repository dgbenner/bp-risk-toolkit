import { motion } from 'framer-motion'
import { blueprintList } from '../data/blueprints'
import BlueprintCard from '../components/BlueprintCard'
import OilRigIllustration from '../components/OilRigIllustration'

const sorted = [...blueprintList].sort((a, b) => a.order - b.order)

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Dot grid background layer */}
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      {/* Hero */}
      <header className="relative max-w-6xl mx-auto px-8 pt-16 pb-12">
        {/* Top bar */}
        <motion.div
          className="flex items-center gap-4 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-8 h-8 rounded-full bg-bp-green flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.5" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="white" strokeWidth="1.5" />
              <path d="M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" stroke="white" strokeWidth="1" opacity="0.6" />
            </svg>
          </div>
          <div>
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-bp-silver">
              BP / WELL DELIVERY WORKBENCH
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-[1fr_340px] gap-16 items-start">
          <div>
            <motion.div
              className="font-mono text-[10px] tracking-[0.15em] uppercase text-bp-silver mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              SERVICE DESIGN / PORTFOLIO CASE STUDY
            </motion.div>

            <motion.h1
              className="text-5xl font-light text-bp-dark-green tracking-wide leading-tight mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Risk Toolkit
            </motion.h1>

            <motion.p
              className="text-lg text-bp-dark-grey font-light leading-relaxed max-w-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Four service blueprints mapping the safety verification lifecycle
              for offshore oil rig operations. From risk identification through
              continuous monitoring to resolution.
            </motion.p>

            <motion.div
              className="flex items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-bp-green" />
                <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-bp-dark-grey">
                  BP — CLIENT
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-bp-yellow-orange" />
                <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-bp-dark-grey">
                  ACME OIL RIGS — OPERATOR
                </span>
              </div>
            </motion.div>

            {/* Systems readout */}
            <motion.div
              className="mt-8 pt-6 border-t border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-bp-silver mb-3">
                INTEGRATED SYSTEMS
              </div>
              <div className="flex flex-wrap gap-3">
                {['Salesforce', 'RVRT', 'Youreka', 'Power BI', 'REST API', 'Quip'].map(sys => (
                  <span
                    key={sys}
                    className="px-2.5 py-1 bg-bp-pale-grey font-mono text-[10px] tracking-[0.1em] text-bp-dark-grey border border-gray-200"
                  >
                    {sys.toUpperCase()}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Oil rig illustration */}
          <div className="relative">
            <OilRigIllustration className="w-full h-auto" />
          </div>
        </div>
      </header>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-8">
        <div className="border-t border-gray-200 relative">
          <span className="absolute -top-[5px] left-0 font-mono text-[8px] text-bp-silver opacity-40">+</span>
          <span className="absolute -top-[5px] right-0 font-mono text-[8px] text-bp-silver opacity-40">+</span>
        </div>
      </div>

      {/* Blueprint Cards */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <motion.div
          className="font-mono text-[10px] tracking-[0.15em] uppercase text-bp-silver mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          [ SELECT BLUEPRINT ]
        </motion.div>

        <div className="grid grid-cols-4 gap-5">
          {sorted.map((bp, i) => (
            <BlueprintCard key={bp.id} blueprint={bp} index={i} />
          ))}
        </div>

        {/* Sequence indicator */}
        <motion.div
          className="mt-10 flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {sorted.map((bp, i) => (
            <div key={bp.id} className="flex items-center gap-3">
              <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-bp-silver">
                {bp.title}
              </span>
              {i < sorted.length - 1 && (
                <span className="text-bp-silver text-xs">→</span>
              )}
            </div>
          ))}
        </motion.div>
        <div className="text-center mt-2">
          <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-bp-silver opacity-60">
            SEQUENTIAL DEPENDENCY — EACH TOOL FEEDS THE NEXT
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-8 py-8 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-bp-silver">
            PORTFOLIO PROJECT — NOT FOR COMMERCIAL USE
          </span>
          <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-bp-silver">
            DAN BENNER / SENIOR UX DESIGNER / 2026
          </span>
        </div>
      </footer>
    </div>
  )
}
