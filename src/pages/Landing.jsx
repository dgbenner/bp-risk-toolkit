import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { blueprintList } from '../data/blueprints'
import BlueprintCard from '../components/BlueprintCard'
import OilRigIllustration from '../components/OilRigIllustration'
import SystemLogo from '../components/SystemLogos'
import bpHelios from '../assets/logos/bp-helios.png'
import bpHorizontal from '../assets/logos/bp-horizontal.png'
import valarisLogo from '../assets/logos/valaris.jpg'
import valarisMark from '../assets/logos/valaris-mark.png'

const sorted = [...blueprintList].sort((a, b) => a.order - b.order)

const systems = [
  { name: 'Salesforce', label: 'SALESFORCE', bullets: ['Master platform across all four services', 'Workflow routing + approval chains', 'Email alerts + notifications', 'Risk Register data store'] },
  { name: 'RVRT', label: 'RVRT', bullets: ['Rig Verification Reporting Tool', 'Offline-capable browser app', 'Used on-rig during field verification', 'Syncs to Salesforce on reconnect'] },
  { name: 'Youreka', label: 'YOUREKA', bullets: ['Salesforce-based inspection platform', 'Self Verification + Oversight shift checklists', 'Safety walkdown documentation', 'Mobile-first, used offshore'] },
  { name: 'Power BI', label: 'POWER BI', bullets: ['Dashboards + reporting layer', 'Pulls from all four services', 'Leadership risk visibility', 'Trend analysis + status tracking'] },
  { name: 'REST API', label: 'REST API', bullets: ['Custom integration layer', 'Generates Terms of Reference docs', 'Connects verification workflow to Salesforce'] },
  { name: 'Quip', label: 'QUIP', bullets: ['Document collaboration', 'TSV template creation', 'Shared across verification team'] },
]

// All tooltips open to the right (left-aligned) for consistency
const opensRight = new Set(['Salesforce', 'RVRT', 'Youreka', 'Power BI', 'REST API', 'Quip'])

function PlatformEcosystem() {
  const [activeSystem, setActiveSystem] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!activeSystem) return
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveSystem(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [activeSystem])

  return (
    <motion.div
      className="pt-7 border-t border-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      ref={containerRef}
    >
      <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-bp-silver mb-4">
        PLATFORM ECOSYSTEM
      </div>
      <div className="flex flex-wrap gap-3 relative max-w-md">
        {systems.map(sys => {
          const isActive = activeSystem === sys.name
          const toRight = opensRight.has(sys.name)
          return (
            <div key={sys.name} className="relative">
              <button
                onClick={() => setActiveSystem(isActive ? null : sys.name)}
                className={`flex items-center gap-1.5 px-2.5 py-2 border transition-all duration-200 cursor-pointer relative ${
                  isActive
                    ? 'bg-white border-bp-green shadow-sm'
                    : 'bg-bp-pale-grey border-gray-200 hover:border-bp-green/50 hover:bg-white'
                }`}
              >
                <SystemLogo name={sys.name} className="w-5 h-5" />
                <span className="font-mono text-[11px] tracking-[0.1em] text-bp-dark-grey">
                  {sys.label}
                </span>
                <svg
                  viewBox="0 0 6 6"
                  className={`w-[6px] h-[6px] absolute bottom-0 right-0 transition-colors duration-200 ${
                    isActive ? 'text-bp-green' : 'text-bp-green/40'
                  }`}
                >
                  <path d="M6 0V6H0z" fill="currentColor" />
                </svg>
              </button>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className={`absolute top-full mt-2 w-64 bg-white border border-bp-green/30 shadow-lg z-20 p-4 ${
                      toRight ? 'left-0' : 'right-0'
                    }`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className={`absolute -top-[5px] w-2.5 h-2.5 bg-white border-l border-t border-bp-green/30 rotate-45 ${
                      toRight ? 'left-4' : 'right-4'
                    }`} />
                    {/* Close X */}
                    <button
                      onClick={() => setActiveSystem(null)}
                      className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-bp-silver hover:text-bp-dark-grey transition-colors cursor-pointer font-mono text-[11px] leading-none"
                    >
                      ×
                    </button>
                    <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-bp-green mb-3 font-medium pr-5">
                      {sys.label}
                    </div>
                    <ul className="space-y-1.5">
                      {sys.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-bp-dark-grey leading-snug">
                          <span className="text-bp-green text-[8px] mt-1 flex-shrink-0">▸</span>
                          {bullet}
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
    </motion.div>
  )
}

const wdwBullets = [
  'BP\'s internal digital platform for well operations',
  'Hosts Risk Toolkit + supporting modules',
  'Used by onshore + offshore teams globally',
  'Salesforce-based service architecture',
  'Integrates verification, risk, and oversight workflows',
]

export default function Landing() {
  const [showWdw, setShowWdw] = useState(false)
  const wdwRef = useRef(null)

  useEffect(() => {
    if (!showWdw) return
    function handleClick(e) {
      if (wdwRef.current && !wdwRef.current.contains(e.target)) {
        setShowWdw(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showWdw])

  return (
    <div className="min-h-screen bg-white">
      {/* Dot grid background layer */}
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      {/* Hero */}
      <header className="relative max-w-6xl mx-auto px-8 pt-12 pb-14">
        {/* Top bar — BP logo + WDW label with tooltip */}
        <motion.div
          className="flex items-center gap-5 mb-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img src={bpHorizontal} alt="BP" className="h-20 object-contain" />
          <div className="h-6 w-px bg-gray-200" />
          <div className="relative -ml-2" ref={wdwRef}>
            <button
              onClick={() => setShowWdw(!showWdw)}
              className={`font-mono text-[12px] tracking-[0.15em] uppercase cursor-pointer pl-1.5 pr-3 py-1.5 border transition-all duration-200 relative ${
                showWdw
                  ? 'text-bp-dark-grey border-bp-silver/40 bg-white shadow-sm'
                  : 'text-bp-silver border-transparent hover:border-gray-200 hover:bg-bp-pale-grey'
              }`}
            >
              WELL DELIVERY WORKBENCH
              <svg
                viewBox="0 0 6 6"
                className={`w-[6px] h-[6px] absolute bottom-0 right-0 transition-colors duration-200 ${
                  showWdw ? 'text-bp-silver' : 'text-bp-silver/40'
                }`}
              >
                <path d="M6 0V6H0z" fill="currentColor" />
              </svg>
            </button>

            <AnimatePresence>
              {showWdw && (
                <motion.div
                  className="absolute left-0 top-full mt-2 w-72 bg-white border border-bp-silver/30 shadow-lg z-20 p-4"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="absolute -top-[5px] left-4 w-2.5 h-2.5 bg-white border-l border-t border-bp-silver/30 rotate-45" />
                  <button
                    onClick={() => setShowWdw(false)}
                    className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-bp-silver hover:text-bp-dark-grey transition-colors cursor-pointer font-mono text-[11px] leading-none"
                  >
                    ×
                  </button>
                  <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-bp-dark-grey mb-3 font-medium pr-5">
                    WELL DELIVERY WORKBENCH (WDW)
                  </div>
                  <ul className="space-y-1.5">
                    {wdwBullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-bp-dark-grey leading-snug">
                        <span className="text-bp-silver text-[8px] mt-1 flex-shrink-0">▸</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="grid grid-cols-[1fr_440px] gap-12 items-start">
          <div>
            <motion.h1
              className="text-6xl font-light text-bp-dark-green tracking-wide leading-tight mb-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Risk Toolkit
            </motion.h1>

            <motion.p
              className="text-xl text-bp-dark-grey font-light leading-relaxed max-w-lg mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Four service blueprints mapping the safety verification lifecycle
              for offshore oil rig operations. From risk identification through
              continuous monitoring to resolution.
            </motion.p>

            {/* Org legend with logos */}
            <motion.div
              className="flex items-center gap-8 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-1.5">
                <img src={bpHelios} alt="BP" className="w-6 h-6 object-contain" />
                <div>
                  <span className="font-mono text-[12px] tracking-[0.1em] uppercase text-bp-green font-medium">
                    BP
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-bp-dark-grey ml-2">
                    — OPERATOR
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <img src={valarisMark} alt="Valaris" className="h-6 object-contain" />
                <div>
                  <span className="font-mono text-[12px] tracking-[0.1em] uppercase text-bp-yellow-orange font-medium">
                    VALARIS
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-bp-dark-grey ml-2">
                    — RIG CONTRACTOR
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Platform Ecosystem with tooltips */}
            <PlatformEcosystem />
          </div>

          {/* Oil rig illustration */}
          <div className="relative -mt-[150px]">
            <OilRigIllustration className="w-full h-auto" />
          </div>
        </div>
      </header>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-8">
        <div className="border-t border-gray-200 relative">
          <span className="absolute -top-[5px] left-0 font-mono text-[10px] text-bp-silver opacity-40">+</span>
          <span className="absolute -top-[5px] right-0 font-mono text-[10px] text-bp-silver opacity-40">+</span>
        </div>
      </div>

      {/* Blueprint Cards */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <motion.h2
          className="text-4xl font-light text-bp-dark-green tracking-wide mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Service Blueprints
        </motion.h2>

        {/* Progressive triangle + label */}
        <motion.div
          className="mb-1.5 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <svg
            viewBox="0 0 1000 40"
            preserveAspectRatio="none"
            className="w-full h-[40px]"
          >
            <polygon
              points="0,40 1000,40 1000,0"
              fill="#007F00"
              opacity="0.12"
            />
          </svg>
          <div className="text-center mt-0.5">
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-bp-dark-grey">
              SEQUENTIAL DEPENDENCY — EACH TOOL FEEDS THE NEXT
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-4 gap-5">
          {sorted.map((bp, i) => (
            <BlueprintCard key={bp.id} blueprint={bp} index={i} />
          ))}
        </div>
      </section>

      {/* Footer — Org hierarchy + dates */}
      <footer className="max-w-6xl mx-auto px-8 py-8 border-t border-gray-200">
        <div className="flex justify-between items-center">
          {/* Left: organizational hierarchy */}
          <div className="flex items-center gap-2.5">
            <img src={bpHelios} alt="BP" className="w-5 h-5 object-contain" />
            <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-bp-green font-medium">
              BP
            </span>
            <span className="text-bp-silver text-xs">/</span>
            <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-bp-dark-grey">
              UPSTREAM — OFFSHORE OPERATIONS
            </span>
            <span className="text-bp-silver text-xs">/</span>
            <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-bp-dark-grey">
              WELL DELIVERY WORKBENCH
            </span>
            <span className="text-bp-silver text-xs">/</span>
            <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-bp-green font-medium">
              RISK TOOLKIT
            </span>
          </div>

          {/* Right: dates */}
          <div className="flex items-center gap-6">
            <div>
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-bp-silver">
                CREATED:{' '}
              </span>
              <span className="font-mono text-[11px] tracking-[0.08em] text-bp-dark-grey">
                AUGUST 2021
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-bp-silver">
                LAST UPDATED:{' '}
              </span>
              <span className="font-mono text-[11px] tracking-[0.08em] text-bp-dark-grey">
                NOVEMBER 2021
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
