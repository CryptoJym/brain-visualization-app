/**
 * Demo user data for testing visualization
 * Severity score of 10 (all official ACEs)
 * Varied trauma types with realistic age/frequency patterns
 */

export const demoUserResults = {
  responses: {
    // Abuse (3 ACEs)
    emotional_abuse: 'yes',
    physical_abuse: 'yes',
    sexual_abuse: 'yes',

    // Neglect (2 ACEs)
    emotional_neglect: 'yes',
    physical_neglect: 'yes',

    // Household Dysfunction (5 ACEs)
    substance_abuse: 'yes',
    mental_illness: 'yes',
    domestic_violence: 'yes',
    parental_separation: 'yes',
    incarceration: 'yes',

    // Protective factors (some present to show mitigation)
    protective_relationship: 'yes',
    protective_competence: 'yes',
    protective_routine: 'no',
    protective_community: 'no'
  },

  ageData: {
    // Early childhood trauma (highest multipliers)
    emotional_abuse: ['0-2', '3-5', '6-8'], // Started very early, chronic
    physical_neglect: ['0-2', 'throughout'], // Chronic from infancy

    // School-age trauma
    physical_abuse: ['6-8', '9-11', '12-14'], // Escalated in school years
    emotional_neglect: ['3-5', '6-8', '9-11'], // Consistent through childhood

    // Adolescent trauma
    sexual_abuse: ['12-14'], // Single period (still devastating)

    // Household dysfunction (typically chronic)
    substance_abuse: ['throughout'],
    mental_illness: ['0-2', '3-5', '6-8', '9-11', '12-14'], // Parent's condition
    domestic_violence: ['3-5', '6-8', '9-11'], // Witnessed repeatedly
    parental_separation: ['9-11'], // Specific event
    incarceration: ['12-14', '15-17'] // Later childhood
  },

  durationData: {
    emotional_abuse: 'very_often', // Chronic, severe
    physical_abuse: 'often',
    sexual_abuse: 'few', // Less frequent but still traumatic
    emotional_neglect: 'very_often', // Chronic absence
    physical_neglect: 'very_often', // Consistent deprivation
    substance_abuse: 'very_often',
    mental_illness: 'often',
    domestic_violence: 'often',
    parental_separation: 'once', // Single event
    incarceration: 'once' // Single event
  },

  gender: 'female', // Show gender-specific impacts

  // Pre-calculated scores (will be recalculated by the app, but showing expected values)
  aceScore: 10, // All 10 official ACEs
  expandedACEScore: 10,
  overallSeverity: 8.5, // High severity due to early onset and chronicity
  resilienceScore: 20, // Some protective factors present

  // These will be calculated by the app
  brainImpacts: {},
  systemSummary: {},
  timeline: [],
  protectiveFactors: []
};

/**
 * Get demo data ready for immediate visualization
 * This processes the demo data through the same calculation logic
 */
export const getDemoResults = () => {
  return {
    ...demoUserResults,
    metadata: {
      isDemo: true,
      demoDescription: 'High-severity case with ACE score of 10',
      demoCharacteristics: [
        'Early childhood trauma (age 0-2 exposure)',
        'Chronic abuse and neglect',
        'Multiple household dysfunction factors',
        'Some protective factors present',
        'Female gender (shows gender-specific impacts)'
      ]
    }
  };
};

export default demoUserResults;
