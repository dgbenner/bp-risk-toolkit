// Shared source of truth for the Platform Ecosystem items
// Both the landing page and the blueprint viewer footer import from here.
export const platformEcosystem = [
  {
    name: 'Salesforce',
    label: 'SALESFORCE',
    bullets: [
      'Master platform across all four services',
      'Workflow routing + approval chains',
      'Email alerts + notifications',
      'Risk Register data store',
    ],
  },
  {
    name: 'RVRT',
    label: 'RVRT',
    bullets: [
      'Rig Verification Reporting Tool',
      'Offline-capable browser app',
      'Used on-rig during field verification',
      'Syncs to Salesforce on reconnect',
    ],
  },
  {
    name: 'Youreka',
    label: 'YOUREKA',
    bullets: [
      'Salesforce-based inspection platform',
      'Self Verification + Oversight shift checklists',
      'Safety walkdown documentation',
      'Mobile-first, used offshore',
    ],
  },
  {
    name: 'Power BI',
    label: 'POWER BI',
    bullets: [
      'Dashboards + reporting layer',
      'Pulls from all four services',
      'Leadership risk visibility',
      'Trend analysis + status tracking',
    ],
  },
  {
    name: 'Custom REST API',
    label: 'CUSTOM REST API',
    bullets: [
      'Custom integration layer',
      'Generates Terms of Reference docs',
      'Connects verification workflow to Salesforce',
    ],
  },
  {
    name: 'Quip',
    label: 'QUIP',
    bullets: [
      'Document collaboration',
      'TSV template creation',
      'Shared across verification team',
    ],
  },
]

export function findSystem(name) {
  return platformEcosystem.find(s => s.name === name)
}
