import rvManager from '../assets/headshots/RV-Manager.png'
import rvVerifier from '../assets/headshots/RV-Verifier.png'
import wellSuper from '../assets/headshots/WellSuper.png'
import wellCrew from '../assets/headshots/Well-Crew.png'

export const ORG_BP = 'bp'
export const ORG_VALARIS = 'valaris'

export const roles = {
  arthur: {
    id: 'arthur',
    name: 'Arthur',
    title: 'BP Rig Verifier',
    org: ORG_BP,
    avatar: rvVerifier,
  },
  julian: {
    id: 'julian',
    name: 'Julian',
    title: 'Contracted Rig Verifier',
    org: ORG_BP,
    avatar: rvVerifier,
  },
  rvManager: {
    id: 'rvManager',
    name: 'RV Manager',
    title: 'BP Employee',
    org: ORG_BP,
    avatar: rvManager,
  },
  rvTeam: {
    id: 'rvTeam',
    name: 'RV Team',
    title: '2–6 Verifiers',
    org: ORG_BP,
    avatar: rvManager,
  },
  hasan: {
    id: 'hasan',
    name: 'Hasan',
    title: 'Well Superintendent',
    org: ORG_VALARIS,
    avatar: wellSuper,
  },
  janos: {
    id: 'janos',
    name: 'Janos',
    title: 'Well Delivery Team',
    org: ORG_VALARIS,
    avatar: wellCrew,
  },
  wellSiteManager: {
    id: 'wellSiteManager',
    name: 'Well Site Manager',
    title: 'Offshore Manager',
    org: ORG_VALARIS,
    avatar: wellCrew,
  },
  wellCrew: {
    id: 'wellCrew',
    name: 'Well Crew',
    title: 'Rig Crew',
    org: ORG_VALARIS,
    avatar: wellCrew,
  },
  riskEngineer: {
    id: 'riskEngineer',
    name: 'Risk Engineer',
    title: 'BP Risk Engineer',
    org: ORG_BP,
    avatar: rvManager,
  },
  wsl: {
    id: 'wsl',
    name: 'Well Site Leader',
    title: 'WSL (Offshore)',
    org: ORG_VALARIS,
    avatar: wellSuper,
  },
}
