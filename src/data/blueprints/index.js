export { rigVerification } from './rigVerification'
export { riskAssessment } from './riskAssessment'
export { selfVerification } from './selfVerification'
export { riskRegister } from './riskRegister'

export const blueprintList = [
  {
    id: 'rig-verification',
    title: 'Rig Verification',
    subtitle: 'Pre-Contract Offshore Verification',
    phase: 'Pre-Contract',
    primaryUser: 'Rig Verifier',
    setting: 'Onshore + Offshore',
    cadence: 'Periodic',
    sourceLabel: 'Built from stakeholder research',
    order: 2,
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment',
    subtitle: 'Pre-Well Risk Identification',
    phase: 'Pre-Well',
    primaryUser: 'Risk Engineer',
    setting: 'Onshore',
    cadence: 'Approval-gated',
    sourceLabel: 'Informed synthesis',
    order: 1,
  },
  {
    id: 'self-verification',
    title: 'Self Verification + Oversight',
    subtitle: 'Continuous Safety Monitoring',
    phase: 'Continuous',
    primaryUser: 'Well Site Leader',
    setting: 'Offshore',
    cadence: 'Daily',
    sourceLabel: 'Informed synthesis',
    order: 3,
  },
  {
    id: 'risk-register',
    title: 'Risk Register',
    subtitle: 'Accumulative Risk Tracking',
    phase: 'Collective',
    primaryUser: 'Risk Engineer + Well Team',
    setting: 'Onshore',
    cadence: 'Ongoing',
    sourceLabel: 'Informed synthesis',
    order: 4,
  },
]
