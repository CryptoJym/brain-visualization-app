// Validation script for ACEs questionnaire
import fs from 'fs';

const questionnaire = fs.readFileSync('./src/components/OfficialACEsQuestionnaire.jsx', 'utf8');

// Official ACE questions from Kaiser/CDC study
const officialQuestions = [
  {
    category: "Emotional Abuse",
    question: "Did a parent or other adult in the household often or very often swear at you, insult you, put you down, or humiliate you? OR act in a way that made you afraid that you might be physically hurt?"
  },
  {
    category: "Physical Abuse", 
    question: "Did a parent or other adult in the household often or very often push, grab, slap, or throw something at you? OR ever hit you so hard that you had marks or were injured?"
  },
  {
    category: "Sexual Abuse",
    question: "Did an adult or person at least 5 years older than you ever touch or fondle you or have you touch their body in a sexual way? OR attempt or actually have oral, anal, or vaginal intercourse with you?"
  },
  {
    category: "Emotional Neglect",
    question: "Did you often or very often feel that no one in your family loved you or thought you were important or special? OR your family didn't look out for each other, feel close to each other, or support each other?"
  },
  {
    category: "Physical Neglect",
    question: "Did you often or very often feel that you didn't have enough to eat, had to wear dirty clothes, and had no one to protect you? OR your parents were too drunk or high to take care of you or take you to the doctor if you needed it?"
  },
  {
    category: "Mother Treated Violently",
    question: "Was your mother or stepmother often or very often pushed, grabbed, slapped, or had something thrown at her? OR sometimes, often, or very often kicked, bitten, hit with a fist, or hit with something hard? OR ever repeatedly hit over at least a few minutes or threatened with a gun or knife?"
  },
  {
    category: "Household Substance Abuse",
    question: "Did you live with anyone who was a problem drinker or alcoholic, or who used street drugs?"
  },
  {
    category: "Mental Illness in Household",
    question: "Was a household member depressed or mentally ill, or did a household member attempt suicide?"
  },
  {
    category: "Parental Separation or Divorce",
    question: "Were your parents ever separated or divorced?"
  },
  {
    category: "Incarcerated Household Member",
    question: "Did a household member go to prison?"
  }
];

console.log('ACEs Questionnaire Validation Report\n');
console.log('=====================================\n');

// Check each official question
let allCorrect = true;
officialQuestions.forEach((official, index) => {
  const escapedQuestion = official.question.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const found = questionnaire.includes(official.question);
  
  if (found) {
    console.log(`✓ Question ${index + 1} (${official.category}): CORRECT`);
  } else {
    console.log(`✗ Question ${index + 1} (${official.category}): NOT FOUND or INCORRECT WORDING`);
    console.log(`  Expected: "${official.question}"`);
    allCorrect = false;
  }
});

console.log('\n');

// Check for expanded ACE questions
const expandedCategories = [
  'witnessed_violence',
  'felt_unsafe', 
  'bullied',
  'discrimination',
  'food_insecurity',
  'homeless',
  'foster_care',
  'parent_deported'
];

console.log('Expanded ACE Questions:');
expandedCategories.forEach(id => {
  if (questionnaire.includes(`id: '${id}'`)) {
    console.log(`✓ ${id}`);
  } else {
    console.log(`✗ ${id} - NOT FOUND`);
  }
});

console.log('\n');

// Check for protective factors
const protectiveFactors = [
  'protective_adult',
  'protective_friend',
  'protective_community',
  'protective_competence',
  'protective_routine'
];

console.log('Protective Factors:');
protectiveFactors.forEach(id => {
  if (questionnaire.includes(`id: '${id}'`)) {
    console.log(`✓ ${id}`);
  } else {
    console.log(`✗ ${id} - NOT FOUND`);
  }
});

console.log('\n');

// Check brain impact mappings
console.log('Brain Impact Verification:');
const brainRegions = [
  'Prefrontal Cortex',
  'Medial Prefrontal Cortex',
  'Amygdala',
  'Hippocampus',
  'Corpus Callosum',
  'Anterior Cingulate',
  'Insula',
  'Visual Cortex',
  'Sensory Cortex'
];

brainRegions.forEach(region => {
  const count = (questionnaire.match(new RegExp(region, 'g')) || []).length;
  if (count > 0) {
    console.log(`✓ ${region}: Referenced ${count} times`);
  }
});

console.log('\n');
console.log(allCorrect ? '✅ All official ACE questions are correctly worded!' : '❌ Some questions need correction');
console.log('\nTotal questions in component:', (questionnaire.match(/question:/g) || []).length);