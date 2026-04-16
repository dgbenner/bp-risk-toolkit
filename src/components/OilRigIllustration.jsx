import { motion } from 'framer-motion'

export default function OilRigIllustration({ className = '' }) {
  return (
    <motion.svg
      viewBox="0 0 400 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      {/* Water line */}
      <motion.line
        x1="0" y1="380" x2="400" y2="380"
        stroke="#007F00" strokeWidth="1" strokeDasharray="4 4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      />

      {/* Platform base */}
      <motion.rect
        x="100" y="320" width="200" height="12" rx="2"
        stroke="#007F00" strokeWidth="1.5" fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      />

      {/* Platform legs */}
      <line x1="130" y1="332" x2="120" y2="380" stroke="#007F00" strokeWidth="1.5" />
      <line x1="270" y1="332" x2="280" y2="380" stroke="#007F00" strokeWidth="1.5" />
      <line x1="200" y1="332" x2="200" y2="395" stroke="#007F00" strokeWidth="1" strokeDasharray="2 3" />

      {/* Cross bracing */}
      <line x1="130" y1="345" x2="270" y2="365" stroke="#007F00" strokeWidth="0.5" opacity="0.4" />
      <line x1="270" y1="345" x2="130" y2="365" stroke="#007F00" strokeWidth="0.5" opacity="0.4" />

      {/* Main structure / derrick */}
      <motion.path
        d="M170 320 L200 140 L230 320"
        stroke="#007F00" strokeWidth="1.5" fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />

      {/* Derrick cross members */}
      {[180, 210, 240, 270, 300].map((y, i) => (
        <motion.line
          key={y}
          x1={170 + (320 - y) * (30 / 180)}
          y1={y}
          x2={230 - (320 - y) * (30 / 180)}
          y2={y}
          stroke="#007F00"
          strokeWidth="0.75"
          opacity="0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.8 + i * 0.1 }}
        />
      ))}

      {/* Crane arm */}
      <motion.path
        d="M230 280 L310 250 L320 255"
        stroke="#007F00" strokeWidth="1" fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 1 }}
      />
      <line x1="310" y1="250" x2="310" y2="280" stroke="#007F00" strokeWidth="0.75" strokeDasharray="2 2" />

      {/* Helipad */}
      <circle cx="140" cy="310" r="15" stroke="#007F00" strokeWidth="1" fill="none" opacity="0.6" />
      <text x="134" y="314" fill="#007F00" fontSize="10" fontFamily="monospace" opacity="0.6">H</text>

      {/* Module blocks on platform */}
      <rect x="150" y="305" width="25" height="15" rx="1" stroke="#007F00" strokeWidth="0.75" fill="none" opacity="0.5" />
      <rect x="225" y="305" width="30" height="15" rx="1" stroke="#007F00" strokeWidth="0.75" fill="none" opacity="0.5" />
      <rect x="260" y="300" width="20" height="20" rx="1" stroke="#007F00" strokeWidth="0.75" fill="none" opacity="0.5" />

      {/* Flare stack */}
      <line x1="280" y1="300" x2="290" y2="260" stroke="#FF9900" strokeWidth="1" />
      <motion.circle
        cx="290" cy="255" r="5"
        fill="#FF9900" opacity="0.6"
        animate={{ opacity: [0.3, 0.7, 0.3], r: [4, 6, 4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Subsea well */}
      <line x1="200" y1="395" x2="200" y2="460" stroke="#007F00" strokeWidth="1" strokeDasharray="3 4" />
      <rect x="190" y="460" width="20" height="8" rx="2" stroke="#007F00" strokeWidth="1" fill="none" />

      {/* Crosshair marks */}
      <text x="85" y="383" fill="#999" fontSize="8" fontFamily="monospace" opacity="0.4">+</text>
      <text x="310" y="383" fill="#999" fontSize="8" fontFamily="monospace" opacity="0.4">+</text>
      <text x="197" y="135" fill="#999" fontSize="8" fontFamily="monospace" opacity="0.4">+</text>

      {/* Labels */}
      <text x="330" y="384" fill="#999" fontSize="8" fontFamily="monospace" letterSpacing="0.1em">WATERLINE</text>
      <text x="200" y="485" fill="#999" fontSize="8" fontFamily="monospace" letterSpacing="0.1em" textAnchor="middle">SUBSEA WELL</text>
    </motion.svg>
  )
}
