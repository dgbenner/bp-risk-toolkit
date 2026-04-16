export const riskRegister = {
  id: 'risk-register',
  title: 'Risk Register',
  subtitle: 'Accumulative Risk Tracking & Resolution',
  primaryUser: 'riskEngineer',
  description:
    'The accumulative record of all identified risks across Risk Assessment and Rig Verification. Risks flow in, are categorized, assigned, tracked, and resolved.',
  sourceLabel: 'Informed synthesis',
  sources: [],
  systems: [
    { id: 'risk-register', name: 'Risk Register', description: 'Salesforce-based risk tracking system' },
    { id: 'ra-link', name: 'Risk Assessment Link', description: 'Integration with Risk Assessment outputs' },
    { id: 'rv-link', name: 'RV Link', description: 'Integration with Rig Verification outputs' },
    { id: 'power-bi', name: 'Power BI', description: 'Regional risk summary dashboards' },
  ],
  phases: [
    {
      id: 'risk-intake',
      index: 1,
      name: 'Risk Intake',
      location: 'ONSHORE',
      appState: 'INTAKE',
      timeEstimate: 'Ongoing',
      actions: [
        'Risks flow in from Risk Assessment approvals',
        'Risks flow in from Rig Verification findings',
        'Manual risk entries from field observations',
      ],
      output: [
        { type: 'doc', label: 'DOC / NEW RISK ENTRIES' },
      ],
      frontstage: [],
      backstage: [
        'Automated intake from Risk Assessment and RV systems',
        'Salesforce records created for each new risk',
      ],
      supportProcesses: {
        employee: [],
        technology: ['RA → Risk Register integration', 'RV → Risk Register integration', 'Salesforce record creation'],
      },
      systemsUsed: ['risk-register', 'ra-link', 'rv-link'],
      activeRoles: ['riskEngineer'],
      notes: 'Most risks arrive automatically from upstream tools. Manual entry is the exception.',
    },
    {
      id: 'categorization',
      index: 2,
      name: 'Categorization + Ownership',
      location: 'ONSHORE',
      appState: 'TRIAGE',
      timeEstimate: '1–2 days',
      actions: [
        'Categorize risk by type and severity',
        'Assign risk owner (BP or ACME)',
        'Set resolution timeline',
        'Link to relevant bowtie/barrier',
      ],
      output: [
        { type: 'doc', label: 'DOC / CATEGORIZED RISK RECORD' },
      ],
      frontstage: [
        'Risk owner notified of assignment',
      ],
      backstage: [
        'Risk categorization in Salesforce',
        'Owner assignment and notification',
      ],
      supportProcesses: {
        employee: ['Risk owner accepts assignment'],
        technology: ['Salesforce categorization', 'Email notification'],
      },
      systemsUsed: ['risk-register'],
      activeRoles: ['riskEngineer', 'janos'],
      notes: '',
    },
    {
      id: 'active-monitoring',
      index: 3,
      name: 'Active Monitoring',
      location: 'ONSHORE',
      appState: 'ACTIVE',
      timeEstimate: 'Ongoing',
      actions: [
        'Track mitigation progress',
        'Review risk status in regular cadence',
        'Escalate overdue or worsening risks',
        'Update risk scores as conditions change',
      ],
      output: [
        { type: 'integration', label: 'INT / POWER BI RISK DASHBOARD' },
      ],
      frontstage: [
        'Regular risk review meetings with Well Team',
        'Power BI dashboards visible to leadership',
      ],
      backstage: [
        'Salesforce tracks mitigation activities',
        'Power BI refreshes with latest risk data',
        'Automated alerts for overdue items',
      ],
      supportProcesses: {
        employee: ['Well Team provides mitigation updates', 'Leadership reviews dashboards'],
        technology: ['Salesforce tracking', 'Power BI refresh', 'Overdue alerts'],
      },
      systemsUsed: ['risk-register', 'power-bi'],
      activeRoles: ['riskEngineer', 'janos', 'hasan'],
      notes: '',
    },
    {
      id: 'resolution-closure',
      index: 4,
      name: 'Resolution / Closure',
      location: 'ONSHORE',
      appState: 'CLOSING',
      timeEstimate: 'Per risk',
      actions: [
        'Risk owner submits evidence of resolution',
        'Risk Engineer validates closure',
        'Risk marked as Closed in register',
      ],
      output: [
        { type: 'report', label: 'RPT / CLOSURE REPORT' },
      ],
      frontstage: [
        'Closure confirmation to risk owner and stakeholders',
      ],
      backstage: [
        'Evidence validated in Salesforce',
        'Risk status → Closed',
      ],
      supportProcesses: {
        employee: ['Risk owner provides closure evidence', 'Risk Engineer validates'],
        technology: ['Salesforce closure workflow'],
      },
      systemsUsed: ['risk-register'],
      activeRoles: ['riskEngineer', 'janos'],
      notes: '',
    },
    {
      id: 'reporting',
      index: 5,
      name: 'Reporting',
      location: 'ONSHORE',
      appState: 'REPORTING',
      timeEstimate: 'Monthly / quarterly',
      actions: [
        'Generate regional risk summary',
        'Export risk register for VP Wells review',
        'Identify trends and systemic patterns',
      ],
      output: [
        { type: 'report', label: 'RPT / REGIONAL RISK SUMMARY' },
        { type: 'report', label: 'RPT / RISK REGISTER EXPORT' },
        { type: 'integration', label: 'INT / VP WELLS DASHBOARD' },
      ],
      frontstage: [
        'Regional risk summary presented to VP Wells',
      ],
      backstage: [
        'Power BI generates trend analysis',
        'Salesforce exports full register',
      ],
      supportProcesses: {
        employee: ['VP Wells Region reviews summary'],
        technology: ['Power BI trend analysis', 'Salesforce data export'],
      },
      systemsUsed: ['risk-register', 'power-bi'],
      activeRoles: ['riskEngineer', 'rvManager'],
      notes: 'This feeds into strategic decisions about where to focus safety investments.',
    },
  ],
}
