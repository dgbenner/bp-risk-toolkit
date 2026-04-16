export const riskAssessment = {
  id: 'risk-assessment',
  title: 'Risk Assessment',
  subtitle: 'Pre-Well Risk Identification & Approval',
  primaryUser: 'riskEngineer',
  description:
    'Identifying, framing, scoring, and approving risks before well operations begin. Approval-gated — must be signed off before work proceeds.',
  sourceLabel: 'Informed synthesis',
  sources: [],
  systems: [
    { id: 'ra-tool', name: 'Risk Assessment Tool', description: 'Salesforce-based risk assessment platform' },
    { id: 'power-bi', name: 'Power BI', description: 'Risk dashboards and reporting' },
    { id: 'barriers-db', name: 'Barriers/Bowties DB', description: 'Database of safety barriers and bowtie models' },
  ],
  phases: [
    {
      id: 'initiate-assessment',
      index: 1,
      name: 'Initiate Assessment',
      location: 'ONSHORE / REGIONAL OFFICE',
      appState: 'INITIATED',
      timeEstimate: '1–2 days',
      actions: [
        'Identify well operation requiring risk assessment',
        'Create new assessment record',
        'Gather operational context from Well Team',
      ],
      output: [
        { type: 'doc', label: 'DOC / ASSESSMENT RECORD' },
      ],
      frontstage: [
        'Risk Engineer meets with Well Team to scope assessment',
      ],
      backstage: [
        'Salesforce record created for new assessment',
        'Linked to well operation record',
      ],
      supportProcesses: {
        employee: ['Well Team provides operational context'],
        technology: ['Salesforce record creation'],
      },
      systemsUsed: ['ra-tool'],
      activeRoles: ['riskEngineer', 'janos'],
      notes: '',
    },
    {
      id: 'build-bowtie',
      index: 2,
      name: 'Build Bowtie Model',
      location: 'ONSHORE',
      appState: 'IN PROGRESS',
      timeEstimate: '3–5 days',
      actions: [
        'Select relevant barriers from database',
        'Map threats and consequences in bowtie model',
        'Identify prevention and mitigation controls',
      ],
      output: [
        { type: 'report', label: 'RPT / BOWTIE DIAGRAM' },
      ],
      frontstage: [
        'Workshops with Well Team to validate bowtie structure',
      ],
      backstage: [
        'Barriers/Bowties database queried for relevant models',
        'Risk Assessment Tool generates bowtie visualization',
      ],
      supportProcesses: {
        employee: ['Well Team validates barrier selection'],
        technology: ['Barriers DB query', 'Bowtie visualization engine'],
      },
      systemsUsed: ['ra-tool', 'barriers-db'],
      activeRoles: ['riskEngineer'],
      notes: '',
    },
    {
      id: 'score-rank',
      index: 3,
      name: 'Score + Rank Risks',
      location: 'ONSHORE',
      appState: 'IN PROGRESS',
      timeEstimate: '2–3 days',
      actions: [
        'Apply risk scoring methodology',
        'Rank risks by severity and likelihood',
        'Identify top risks requiring mitigation',
      ],
      output: [
        { type: 'report', label: 'RPT / RISK RANKING MATRIX' },
      ],
      frontstage: [],
      backstage: [
        'Risk scoring calculated in assessment tool',
        'Ranking matrix generated automatically',
      ],
      supportProcesses: {
        employee: [],
        technology: ['Risk scoring engine', 'Matrix generation'],
      },
      systemsUsed: ['ra-tool'],
      activeRoles: ['riskEngineer'],
      notes: '',
    },
    {
      id: 'stakeholder-review',
      index: 4,
      name: 'Stakeholder Review',
      location: 'ONSHORE',
      appState: 'UNDER REVIEW',
      timeEstimate: '3–5 days',
      actions: [
        'Share assessment with Well Superintendent and Well Team',
        'Incorporate feedback on risk rankings',
        'Align on mitigation strategies',
      ],
      output: [
        { type: 'doc', label: 'DOC / REVIEWED ASSESSMENT' },
      ],
      frontstage: [
        'Review meeting with Well Superintendent',
        'Well Team provides operational feedback',
      ],
      backstage: [
        'Assessment routed for review in Salesforce',
        'Email notifications to reviewers',
      ],
      supportProcesses: {
        employee: ['Well Superintendent reviews risk rankings', 'Well Team validates mitigations'],
        technology: ['Salesforce review workflow', 'Email alerts'],
      },
      systemsUsed: ['ra-tool'],
      activeRoles: ['riskEngineer', 'hasan', 'janos'],
      notes: '',
    },
    {
      id: 'approval',
      index: 5,
      name: 'Approval',
      location: 'ONSHORE',
      appState: 'PENDING APPROVAL',
      timeEstimate: '1–3 days',
      actions: [
        'Submit assessment for formal approval',
        'Approval gates well operation to proceed',
      ],
      output: [
        { type: 'doc', label: 'DOC / APPROVED RISK ASSESSMENT' },
        { type: 'email', label: 'ALT / APPROVAL NOTIFICATION' },
      ],
      frontstage: [
        'Approval communicated to Well Team',
      ],
      backstage: [
        'Salesforce approval workflow triggered',
        'Status transitions to Approved',
      ],
      supportProcesses: {
        employee: ['Senior Risk Engineer or Manager approves'],
        technology: ['Salesforce approval workflow', 'Email distribution'],
      },
      systemsUsed: ['ra-tool'],
      activeRoles: ['riskEngineer', 'rvManager'],
      notes: 'This is a gate — well operations cannot proceed without approval.',
    },
    {
      id: 'publish',
      index: 6,
      name: 'Publish to Risk Register',
      location: 'ONSHORE',
      appState: 'PUBLISHED',
      timeEstimate: '1 day',
      actions: [
        'Approved risks published to Risk Register',
        'Power BI dashboards updated',
        'Risks available for tracking and monitoring',
      ],
      output: [
        { type: 'report', label: 'RPT / APPROVED RISK ASSESSMENT REPORT' },
        { type: 'integration', label: 'INT / RISK REGISTER ENTRY' },
        { type: 'integration', label: 'INT / POWER BI DASHBOARD' },
      ],
      frontstage: [
        'Risk Register updated and visible to all stakeholders',
      ],
      backstage: [
        'Data pushed from Risk Assessment Tool to Risk Register',
        'Power BI refreshed with new risk data',
      ],
      supportProcesses: {
        employee: [],
        technology: ['Risk Register integration', 'Power BI refresh'],
      },
      systemsUsed: ['ra-tool', 'power-bi'],
      activeRoles: ['riskEngineer'],
      notes: 'Feeds directly into the Risk Register — the accumulative record of all identified risks.',
    },
  ],
}
