// Stable entry point for the existing Blender viewer.
// v4 retires the unvalidated age/frequency multipliers and buffering formula.
export {REGIONS,SYSTEMS} from './brainSystems.mjs';
export {SECTIONS,ALL_QUESTIONS,FREQUENCIES,QUESTIONNAIRE_VERSION} from './assessmentQuestions.mjs';
export {AGE_PRESETS as AGE_BANDS} from '../utils/assessmentTiming.mjs';
export {calculateProfile} from '../utils/assessmentProfile.mjs';
