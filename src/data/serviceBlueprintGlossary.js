// Educational definitions for service blueprint terminology — shown as tooltips
// in the left rail of the Blueprint Viewer. Keyed by swimlane row identifier.
export const serviceBlueprintGlossary = {
  header: {
    title: 'Phase',
    bullets: [
      'The major chapters of the journey',
      'Groups related activities into logical stages',
      'Marks decision points, handoffs, or context shifts',
    ],
  },
  location: {
    title: 'Location',
    bullets: [
      'Where each action physically or digitally occurs',
      'Visualizes handoffs between spaces (onshore ↔ offshore)',
      'Highlights transitions between in-person and digital touchpoints',
    ],
  },
  appState: {
    title: 'Application State',
    bullets: [
      'The status of the supporting software at this phase',
      'Ties the user journey to the system\u2019s state machine',
      'Surfaces how technical state drives what\u2019s possible next',
    ],
  },
  time: {
    title: 'Time',
    bullets: [
      'Estimated duration of each phase',
      'Shows pacing across the journey',
      'Helps spot bottlenecks or delays',
    ],
  },
  actions: {
    title: 'Primary Actions',
    bullets: [
      'The main actor\u2019s journey \u2014 the spine of the blueprint',
      'Each step the primary user takes, in sequence',
      'Everything else supports this row',
    ],
  },
  output: {
    title: 'Output',
    bullets: [
      'Documents, deliverables, and artifacts produced',
      'The tangible results of each phase',
      'Used as inputs to downstream phases',
    ],
  },
  frontstage: {
    title: 'Frontstage',
    bullets: [
      'Actions visible to the primary user',
      'Touchpoints they see, feel, or directly interact with',
      'Sits above the Line of Visibility',
    ],
  },
  visibility: {
    title: 'Line of Visibility',
    bullets: [
      'Horizontal boundary in the blueprint',
      'Everything above = visible to the user (frontstage)',
      'Everything below = happens behind the scenes (backstage)',
    ],
  },
  backstage: {
    title: 'Backstage',
    bullets: [
      'Actions that support frontstage but out of the user\u2019s sight',
      'Internal tasks, prep work, coordination',
      'Invisible to the user but essential to the service',
    ],
  },
  interaction: {
    title: 'Line of Interaction',
    bullets: [
      'Separates the primary user\u2019s team from extended support teams',
      'Signals a handoff of responsibility',
      'Useful for spotting cross-team friction',
    ],
  },
  support: {
    title: 'Support Processes',
    bullets: [
      'Internal activities that enable frontstage + backstage',
      'Can be employee-driven (admin, scheduling) or technology-driven',
      'Often shared across multiple services',
    ],
  },
  systems: {
    title: 'Systems',
    bullets: [
      'The technology platforms powering the service',
      'Mapped to the phase where each tool is used',
      'Exposes the tech dependencies of the service',
    ],
  },
  roles: {
    title: 'Active Roles',
    bullets: [
      'Who is participating at each phase',
      'May include staff, contractors, or automated systems',
      'Shows ownership shifts across the journey',
    ],
  },
}
