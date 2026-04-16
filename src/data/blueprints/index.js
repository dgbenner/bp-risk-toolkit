export { rigVerification } from './rigVerification'
export { riskAssessment } from './riskAssessment'
export { selfVerification } from './selfVerification'
export { riskRegister } from './riskRegister'

export const blueprintList = [
  {
    id: 'rig-verification',
    title: 'Rig Verification',
    subtitle: 'Pre-Contract Offshore Verification',
    primaryUser: 'Rig Verifier (Arthur)',
    setting: 'Onshore + Offshore',
    cadence: 'Pre-contract + periodic',
    sourceLabel: 'Built from stakeholder research',
    order: 2,
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment',
    subtitle: 'Pre-Well Risk Identification',
    primaryUser: 'Risk Engineer',
    setting: 'Onshore',
    cadence: 'Pre-well, approval-gated',
    sourceLabel: 'Informed synthesis',
    order: 1,
  },
  {
    id: 'self-verification',
    title: 'Self Verification & Oversight',
    subtitle: 'Continuous Safety Monitoring',
    primaryUser: 'Well Site Leader (WSL)',
    setting: 'Offshore (rig)',
    cadence: 'Continuous / daily',
    sourceLabel: 'Informed synthesis',
    order: 3,
  },
  {
    id: 'risk-register',
    title: 'Risk Register',
    subtitle: 'Accumulative Risk Tracking',
    primaryUser: 'Risk Engineer + Well Team',
    setting: 'Onshore',
    cadence: 'Ongoing / accumulative',
    sourceLabel: 'Informed synthesis',
    order: 4,
  },
]
