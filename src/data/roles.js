import rvManager from '../assets/headshots/RV-Manager.png'
import rvVerifier from '../assets/headshots/RV-Verifier.png'
import wellSuper from '../assets/headshots/WellSuper.png'
import wellCrew from '../assets/headshots/Well-Crew.png'

export const ORG_BP = 'bp'
export const ORG_VALARIS = 'valaris'

// Blueprint id constants used by role.blueprints arrays — match the route ids.
export const BP_RV = 'rig-verification'
export const BP_RA = 'risk-assessment'
export const BP_SVO = 'self-verification'
export const BP_RR = 'risk-register'

// Role records.
//   name        — chip label used by PhaseColumn / DetailPanel / chip strip.
//                 Person name when known, role title otherwise (legacy).
//   title       — secondary string shown below name in DetailPanel (legacy).
//   personName  — actual person name OR null. Used by the Roles panel only.
//   role        — role title (always). Used by the Roles panel only.
//   description — short responsibility blurb. Roles panel only.
//   blueprints  — blueprint ids in which this role is active. Roles panel only.
export const roles = {
  arthur: {
    id: 'arthur',
    name: 'Arthur',
    title: 'BP Rig Verifier',
    org: ORG_BP,
    avatar: rvVerifier,
    personName: 'Arthur',
    role: 'Rig Verifier',
    description:
      'Boards platforms to inspect equipment and safety barriers. Works from checklists tied to bowties. Produces the report of findings.',
    blueprints: [BP_RV, BP_RA],
  },
  julian: {
    id: 'julian',
    name: 'Julian',
    title: 'Contracted Rig Verifier',
    org: ORG_BP,
    avatar: rvVerifier,
    personName: 'Julian',
    role: 'Rig Verifier',
    description:
      'Contracted rig verifier supplementing the core team during peak verification windows.',
    blueprints: [],
  },
  rvManager: {
    id: 'rvManager',
    name: 'RV Manager',
    title: 'BP Employee',
    org: ORG_BP,
    avatar: rvManager,
    personName: null,
    role: 'RV Manager',
    description:
      "Single point of oversight for all verification activity globally. Reviews every ToR and every report before it's issued. One person holds this role.",
    blueprints: [BP_RV, BP_RA, BP_RR],
  },
  rvTeam: {
    id: 'rvTeam',
    name: 'RV Team',
    title: '2–6 Verifiers',
    org: ORG_BP,
    avatar: rvManager,
    personName: null,
    role: 'RV Team',
    description:
      'Subset of 9 verifiers selected per job based on rig type and expertise needed. Work as a unit on the rig. Collaborate on findings.',
    blueprints: [BP_RV],
  },
  hasan: {
    id: 'hasan',
    name: 'Hasan',
    title: 'Well Superintendent',
    org: ORG_VALARIS,
    avatar: wellSuper,
    personName: 'Hasan',
    role: 'Well Superintendent',
    description:
      'The Responsible Person. Signs off on the ToR, receives the final report, accountable for closing findings. The person BP calls.',
    blueprints: [BP_RV, BP_RA, BP_RR],
  },
  janos: {
    id: 'janos',
    name: 'Janos',
    title: 'Well Delivery Team',
    org: ORG_VALARIS,
    avatar: wellCrew,
    personName: 'Janos',
    role: 'Well Delivery Team',
    description:
      'Receives verification findings. Responsible for resolving them after the RV team leaves. Lives with the consequences.',
    blueprints: [BP_RV, BP_RR],
  },
  wellSiteManager: {
    id: 'wellSiteManager',
    name: 'Well Site Manager',
    title: 'Offshore Manager',
    org: ORG_VALARIS,
    avatar: wellCrew,
    personName: null,
    role: 'Well Site Manager',
    description:
      "On the rig during verification. Operational counterpart to BP's inspection team.",
    blueprints: [BP_RV],
  },
  wellCrew: {
    id: 'wellCrew',
    name: 'Well Crew',
    title: 'Rig Crew',
    org: ORG_VALARIS,
    avatar: wellCrew,
    personName: null,
    role: 'Well Crew',
    description:
      'Roughnecks, derrickmen, drillers, toolpushers. Not application users. Directly affected by findings. The people the system exists to protect.',
    blueprints: [BP_RV, BP_SVO],
  },
  riskEngineer: {
    id: 'riskEngineer',
    name: 'Risk Engineer',
    title: 'BP Risk Engineer',
    org: ORG_BP,
    avatar: rvManager,
    personName: null,
    role: 'Risk Engineer',
    description:
      'Onshore analyst. Evaluates and ranks risks using bowtie methodology. Maintains the Risk Register. Feeds Power BI dashboards for leadership.',
    blueprints: [BP_RA, BP_RR],
  },
  wsl: {
    id: 'wsl',
    name: 'Well Site Leader',
    title: 'WSL (Offshore)',
    org: ORG_VALARIS,
    avatar: wellSuper,
    personName: null,
    role: 'Well Site Leader (WSL)',
    description:
      'Runs the rig day to day. Manages crew, runs shift handovers, makes real-time operational decisions. Two per rig, back-to-back rotation.',
    blueprints: [BP_SVO],
  },
  regionalRiskEngineer: {
    id: 'regionalRiskEngineer',
    name: 'Regional Risk Engineer',
    title: 'BP Regional Risk Engineer',
    org: ORG_BP,
    avatar: rvManager,
    personName: null,
    role: 'Regional Risk Engineer',
    description:
      "Owns a geographic region's risk profile. Reviews SV&O outputs and escalations. Reports to VP Wells.",
    blueprints: [BP_SVO],
  },
}
