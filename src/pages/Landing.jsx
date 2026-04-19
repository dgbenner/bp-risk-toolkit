import { Fragment, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { blueprintList } from '../data/blueprints'
import { platformEcosystem as systems } from '../data/platformEcosystem'
import BlueprintCard from '../components/BlueprintCard'
import Rig3D from '../components/Rig3D'
import SystemLogo from '../components/SystemLogos'
import bpHelios from '../assets/logos/bp-helios.png'
import bpHorizontal from '../assets/logos/bp-horizontal.png'
import valarisLogo from '../assets/logos/valaris.jpg'
import valarisMark from '../assets/logos/valaris-mark.png'

const sorted = [...blueprintList].sort((a, b) => a.order - b.order)

// All tooltips open to the right (left-aligned) for consistency
const opensRight = new Set(systems.map(s => s.name))

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
      className="pt-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      ref={containerRef}
    >
      <h3
        className="text-2xl font-light text-bp-dark-green tracking-wide mb-2 select-none"
        style={{ textShadow: '0 0 10px rgba(255,255,255,1), 0 0 20px rgba(255,255,255,1), 0 0 40px rgba(255,255,255,1), 0 0 70px rgba(255,255,255,1), 0 0 110px rgba(255,255,255,0.95)' }}
      >
        Platform Ecosystem
      </h3>
      <div className="flex flex-wrap gap-3 relative max-w-md">
        {systems.map(sys => {
          const isActive = activeSystem === sys.name
          const toRight = opensRight.has(sys.name)
          return (
            <div key={sys.name} className="relative">
              <button
                onClick={() => setActiveSystem(isActive ? null : sys.name)}
                className={`flex items-center gap-1.5 px-2.5 py-2 border transition-all duration-200 cursor-pointer relative shadow-[0_0_28px_rgba(137,207,240,0.3)] ${
                  isActive
                    ? 'bg-white border-bp-green'
                    : 'bg-white border-gray-200 hover:border-bp-green/50'
                }`}
              >
                <SystemLogo name={sys.name} className="w-5 h-5" />
                <span className="font-mono text-[11px] tracking-[0.1em] text-bp-dark-grey">
                  {sys.label}
                </span>
                <svg
                  viewBox="0 0 6 6"
                  className={`w-[6px] h-[6px] absolute bottom-0 right-0 transition-colors duration-200 ${
                    isActive ? 'text-bp-green' : 'text-bp-green'
                  }`}
                >
                  <path d="M6 0V6H0z" fill="currentColor" />
                </svg>
              </button>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className={`absolute top-full mt-2 w-64 bg-white border border-bp-green/30 shadow-[0_0_36px_rgba(137,207,240,0.3)] z-20 p-4 ${
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

const regions = [
  {
    code: 'GOM',
    name: 'Gulf of Mexico',
    detail: "OPERATED HUBS: Thunder Horse · Atlantis · Mad Dog · Na Kika · Argos — BP's largest deepwater operation. 150–200mi offshore Louisiana. Water depths 4,500–7,000ft. Production target 400,000 boe/d by mid-2020s.",
  },
  {
    code: 'NSA',
    name: 'North Sea',
    detail: "KEY FIELDS: Clair · Vorlich · Schiehallion — West of Shetland and Central North Sea. BP's original home territory. Operated from Aberdeen. Clair is one of the largest remaining UK fields.",
  },
  {
    code: 'ACG',
    name: 'Azerbaijan / Caspian',
    detail: "ACG COMPLEX: Azeri · Chirag · Deepwater Gunashli — BP's single largest asset. Shah Deniz supplies gas to Europe via Southern Gas Corridor. Production since 1997. BP stake 30.37%.",
  },
  {
    code: 'ANG',
    name: 'Angola',
    detail: 'BLOCKS 18 + 31: Platina · Plutao · Zinia Phase 2 — Deepwater pre-salt development offshore Luanda. Water depths 1,200–1,500m. Joint operations with TotalEnergies.',
  },
  {
    code: 'EGY',
    name: 'Egypt / Mediterranean',
    detail: "WEST NILE DELTA: Raven · Qattameya — Egypt's largest deepwater gas development. Raven online 2021. BP operator 82.75%. Supplies domestic Egyptian gas market.",
  },
  {
    code: 'TTO',
    name: 'Trinidad & Tobago',
    detail: 'GAS FIELDS: Cassia · Cassia C · Matapal — BPTT operates from Port of Spain. Primarily gas production feeding LNG export. Matapal came online 2021.',
  },
  {
    code: 'OMN',
    name: 'Oman',
    detail: 'BLOCK 61 — KHAZZAN: Onshore tight gas. Largest tight gas development in the Middle East. BP operator 60%. Capacity 1.5 bcf/day. Online since 2017.',
  },
  {
    code: 'SCC',
    name: 'South Caucasus Corridor',
    detail: 'PIPELINE INFRASTRUCTURE: BTC · SCP · TAP — Baku-Tbilisi-Ceyhan pipeline 1,768km. Trans Adriatic Pipeline 878km to Italy. Carries Azerbaijani oil and gas to European markets.',
  },
]

function RegionList() {
  const [activeRegion, setActiveRegion] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!activeRegion) return
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveRegion(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [activeRegion])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.0 }}
      ref={containerRef}
    >
      <h3
        className="font-mono text-[10px] tracking-[0.12em] uppercase text-bp-silver mb-0.5 select-none"
        style={{ textShadow: '0 0 10px rgba(255,255,255,1), 0 0 20px rgba(255,255,255,0.95)' }}
      >
        Operating Regions
      </h3>
      <div className="flex flex-wrap items-center gap-y-2 relative">
        {regions.map((r, i) => {
          const isActive = activeRegion === r.code
          return (
            <Fragment key={r.code}>
              {i > 0 && (
                <span
                  className="font-mono text-[10px] tracking-[0.05em] text-bp-silver select-none"
                  style={{ textShadow: '0 0 10px rgba(255,255,255,1), 0 0 18px rgba(255,255,255,0.9)' }}
                  aria-hidden="true"
                >
                  ···
                </span>
              )}
              <motion.div
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 + i * 0.08, duration: 0.3 }}
              >
              <button
                onClick={() => setActiveRegion(isActive ? null : r.code)}
                className={`font-mono text-[10px] tracking-[0.05em] uppercase cursor-pointer transition-colors select-none ${
                  isActive ? 'text-bp-green' : 'text-bp-dark-grey hover:text-bp-green'
                }`}
                style={{ textShadow: '0 0 10px rgba(255,255,255,1), 0 0 18px rgba(255,255,255,0.9)' }}
              >
                <span className="text-bp-silver">[</span>
                {r.code}
                <span className="text-bp-silver">]</span>
              </button>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute left-0 bottom-full mb-2 w-72 bg-white border border-bp-silver/30 shadow-[0_0_36px_rgba(137,207,240,0.3)] z-20 p-4"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="absolute -bottom-[5px] left-4 w-2.5 h-2.5 bg-white border-r border-b border-bp-silver/30 rotate-45" />
                    <button
                      onClick={() => setActiveRegion(null)}
                      className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-bp-silver hover:text-bp-dark-grey transition-colors cursor-pointer font-mono text-[11px] leading-none"
                    >
                      ×
                    </button>
                    <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-bp-green mb-3 font-medium pr-5">
                      [ {r.code} ] {r.name}
                    </div>
                    <p className="text-[12px] text-bp-dark-grey leading-snug">
                      {r.detail}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              </motion.div>
            </Fragment>
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

      {/* Hero — full-width wrapper so the 3D canvas reaches the browser edges */}
      <div className="relative">
        {/* Rig 3D spans the full viewport width behind the content */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Rig3D className="w-full h-full" />
        </div>
      <header className="relative max-w-6xl mx-auto px-8 pt-12 pb-3">
        {/* Top bar — BP logo + WDW label with tooltip */}
        <motion.div
          className="flex items-center gap-5 mb-14 relative z-30 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={bpHorizontal}
            alt="BP"
            className="h-20 object-contain select-none"
            draggable={false}
            style={{ filter: 'drop-shadow(0 0 24px rgba(255,255,255,0.55)) drop-shadow(0 0 10px rgba(255,255,255,0.35))' }}
          />
          <div className="h-6 w-px bg-gray-200" />
          <div className="relative" ref={wdwRef}>
            <button
              onClick={() => setShowWdw(!showWdw)}
              className={`flex items-center font-mono text-[12px] tracking-[0.15em] uppercase cursor-pointer px-3 py-2 border transition-all duration-200 relative shadow-[0_0_32px_rgba(137,207,240,0.3)] ${
                showWdw
                  ? 'text-bp-dark-grey border-bp-silver/60 bg-white'
                  : 'text-bp-dark-grey bg-white border-gray-200 hover:border-bp-silver/50'
              }`}
            >
              WELL DELIVERY WORKBENCH
              <svg
                viewBox="0 0 6 6"
                className={`w-[6px] h-[6px] absolute bottom-0 right-0 transition-colors duration-200 ${
                  showWdw ? 'text-bp-green' : 'text-bp-green'
                }`}
              >
                <path d="M6 0V6H0z" fill="currentColor" />
              </svg>
            </button>

            <AnimatePresence>
              {showWdw && (
                <motion.div
                  className="absolute left-0 top-full mt-2 w-72 bg-white border border-bp-silver/30 shadow-[0_0_36px_rgba(137,207,240,0.3)] z-20 p-4"
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

        <div className="grid grid-cols-[1fr_440px] gap-12 items-start relative z-10 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
          <div>
            <motion.h1
              className="text-6xl font-light text-bp-dark-green tracking-wide leading-tight mb-5 select-none"
              style={{ textShadow: '0 0 36px rgba(255,255,255,0.5), 0 0 16px rgba(255,255,255,0.35)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Risk Toolkit
            </motion.h1>

            <motion.p
              className="text-xl text-bp-dark-grey font-light leading-relaxed max-w-[410px] mb-4 select-none"
              style={{ textShadow: '0 0 10px rgba(255,255,255,0.85), 0 0 20px rgba(255,255,255,0.5), 0 0 35px rgba(255,255,255,0.25)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Four service blueprints mapping the safety verification lifecycle
              for on and offshore oil rig operations. From risk identification
              through continuous monitoring to resolution.
            </motion.p>

            {/* Platform Ecosystem with tooltips */}
            <PlatformEcosystem />
          </div>

          {/* Right column reserved for rig model (rendered as absolute bg above) */}
          <div />
        </div>

        {/* Operating regions — sits at bottom of the hero canvas, just above
            the horizontal rule divider. Moved out of the grid so it runs
            across the full content width. */}
        <div className="mt-8 relative z-10 pointer-events-none [&_button]:pointer-events-auto">
          <RegionList />
        </div>
      </header>
      </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-8">
        <div className="border-t border-gray-200 relative">
          <span className="absolute -top-[5px] left-0 font-mono text-[10px] text-bp-silver opacity-40">+</span>
          <span className="absolute -top-[5px] right-0 font-mono text-[10px] text-bp-silver opacity-40">+</span>
        </div>
      </div>

      {/* Blueprint Cards */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <motion.div
          className="flex items-end justify-between mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <h2 className="text-4xl font-light text-bp-dark-green tracking-wide">
            Service Blueprints
          </h2>

          {/* Org legend — sits on the right, in line with the heading */}
          <div className="flex items-center gap-6 pb-2">
            <div className="flex items-center gap-1.5">
              <img src={bpHelios} alt="BP" className="w-5 h-5 object-contain" />
              <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-bp-green font-medium">
                BP
              </span>
              <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-bp-dark-grey">
                — OPERATOR
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <img src={valarisMark} alt="Valaris" className="h-5 object-contain" />
              <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-bp-yellow-orange font-medium">
                VALARIS (EXAMPLE)
              </span>
              <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-bp-dark-grey">
                — RIG CONTRACTOR
              </span>
            </div>
          </div>
        </motion.div>

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

      {/* Footer — Org hierarchy + dates. Uses Arial rather than HUD mono
          so the attribution reads as more conventional document metadata. */}
      <footer
        className="max-w-6xl mx-auto px-8 py-8 border-t border-gray-200"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        <div className="flex justify-between items-center">
          {/* Left: organizational hierarchy */}
          <div className="flex items-center gap-2.5">
            <img src={bpHelios} alt="BP" className="w-5 h-5 object-contain" />
            <span className="text-[9px] tracking-[0.1em] uppercase text-bp-green font-medium">
              BP
            </span>
            <span className="text-bp-silver text-[10px]">/</span>
            <span className="text-[9px] tracking-[0.1em] uppercase text-bp-dark-grey">
              UPSTREAM — OFFSHORE OPERATIONS
            </span>
            <span className="text-bp-silver text-[10px]">/</span>
            <span className="text-[9px] tracking-[0.1em] uppercase text-bp-dark-grey">
              WELL DELIVERY WORKBENCH
            </span>
            <span className="text-bp-silver text-[10px]">/</span>
            <span className="text-[9px] tracking-[0.1em] uppercase text-bp-green font-medium">
              RISK TOOLKIT
            </span>
          </div>

          {/* Right: dates — each date sits in a 20px-tall row to match the
              left side's icon-driven row height, so text baselines align. */}
          <div className="flex items-center gap-6">
            <div className="h-5 flex items-center">
              <span className="text-[8px] tracking-[0.12em] uppercase text-bp-silver">
                CREATED:{' '}
              </span>
              <span className="text-[9px] tracking-[0.08em] text-bp-dark-grey">
                AUGUST 2021
              </span>
            </div>
            <div className="h-5 flex items-center">
              <span className="text-[8px] tracking-[0.12em] uppercase text-bp-silver">
                LAST UPDATED:{' '}
              </span>
              <span className="text-[9px] tracking-[0.08em] text-bp-dark-grey">
                NOVEMBER 2021
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
