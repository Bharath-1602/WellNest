const AssessmentTemplate = require('../models/AssessmentTemplate');

const stdOptions = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' }
];

const wellnessOptions = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Slightly' },
  { value: 2, label: 'Moderately' },
  { value: 3, label: 'Quite a bit' },
  { value: 4, label: 'Extremely' }
];

const templates = [
  {
    type: 'PHQ-9',
    name: 'Patient Health Questionnaire',
    shortDescription: 'Screens for signs of depression',
    estimatedMinutes: 3,
    questions: [
      { questionNumber: 1, questionText: 'Little interest or pleasure in doing things', options: stdOptions },
      { questionNumber: 2, questionText: 'Feeling down, depressed, or hopeless', options: stdOptions },
      { questionNumber: 3, questionText: 'Trouble falling or staying asleep, or sleeping too much', options: stdOptions },
      { questionNumber: 4, questionText: 'Feeling tired or having little energy', options: stdOptions },
      { questionNumber: 5, questionText: 'Poor appetite or overeating', options: stdOptions },
      { questionNumber: 6, questionText: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', options: stdOptions },
      { questionNumber: 7, questionText: 'Trouble concentrating on things', options: stdOptions },
      { questionNumber: 8, questionText: 'Moving or speaking so slowly that other people could have noticed — or being so fidgety or restless', options: stdOptions },
      { questionNumber: 9, questionText: 'Thoughts that you would be better off dead or of hurting yourself in some way', options: stdOptions }
    ],
    scoring: {
      maxScore: 27,
      ranges: [
        { min: 0, max: 4, severity: 'Minimal', color: 'green', description: 'Your responses suggest minimal depression symptoms.', recommendations: ['Maintain your current self-care routine', 'Stay connected with friends and family', 'Continue regular physical activity'] },
        { min: 5, max: 9, severity: 'Mild', color: 'yellow', description: 'Your responses suggest mild depression symptoms.', recommendations: ['Consider talking to someone you trust', 'Practice daily mindfulness or meditation', 'Maintain a regular sleep schedule'] },
        { min: 10, max: 14, severity: 'Moderate', color: 'orange', description: 'Your responses suggest moderate depression symptoms.', recommendations: ['We recommend speaking with a mental health professional', 'Consider booking a session with a therapist', 'Reach out to a trusted person in your life'] },
        { min: 15, max: 19, severity: 'Moderately Severe', color: 'red', description: 'Your responses suggest moderately severe symptoms.', recommendations: ['Please consider seeking professional help soon', 'Book a session with one of our therapists', 'Contact a crisis line if you feel unsafe'] },
        { min: 20, max: 27, severity: 'Severe', color: 'red', description: 'Your responses suggest severe depression symptoms.', recommendations: ['Please seek professional help immediately', 'Book an urgent session with a therapist', 'Contact a mental health crisis line if needed'] }
      ]
    }
  },
  {
    type: 'GAD-7',
    name: 'Generalised Anxiety Disorder Scale',
    shortDescription: 'Screens for signs of anxiety',
    estimatedMinutes: 2,
    questions: [
      { questionNumber: 1, questionText: 'Feeling nervous, anxious, or on edge', options: stdOptions },
      { questionNumber: 2, questionText: 'Not being able to stop or control worrying', options: stdOptions },
      { questionNumber: 3, questionText: 'Worrying too much about different things', options: stdOptions },
      { questionNumber: 4, questionText: 'Trouble relaxing', options: stdOptions },
      { questionNumber: 5, questionText: 'Being so restless that it is hard to sit still', options: stdOptions },
      { questionNumber: 6, questionText: 'Becoming easily annoyed or irritable', options: stdOptions },
      { questionNumber: 7, questionText: 'Feeling afraid as if something awful might happen', options: stdOptions }
    ],
    scoring: {
      maxScore: 21,
      ranges: [
        { min: 0, max: 4, severity: 'Minimal', color: 'green', description: 'Minimal anxiety symptoms detected.', recommendations: ['Keep up your current wellness habits', 'Practice deep breathing when stressed'] },
        { min: 5, max: 9, severity: 'Mild', color: 'yellow', description: 'Mild anxiety symptoms detected.', recommendations: ['Try daily relaxation techniques', 'Limit caffeine and screen time before bed', 'Consider journaling your thoughts'] },
        { min: 10, max: 14, severity: 'Moderate', color: 'orange', description: 'Moderate anxiety symptoms detected.', recommendations: ['Consider speaking with a therapist', 'Practice mindfulness meditation daily', 'Talk to someone you trust about your worries'] },
        { min: 15, max: 21, severity: 'Severe', color: 'red', description: 'Severe anxiety symptoms detected.', recommendations: ['Please seek professional support', 'Book a session with an anxiety specialist', 'Contact a crisis line if you feel overwhelmed'] }
      ]
    }
  },
  {
    type: 'WELLNESS',
    name: 'Daily Wellness Check',
    shortDescription: 'A quick check on your overall wellbeing',
    estimatedMinutes: 2,
    questions: [
      { questionNumber: 1, questionText: 'How would you rate your overall mood today?', options: wellnessOptions },
      { questionNumber: 2, questionText: 'How well did you sleep last night?', options: wellnessOptions },
      { questionNumber: 3, questionText: 'Do you feel connected to the people around you?', options: wellnessOptions },
      { questionNumber: 4, questionText: 'How well are you managing your daily stress?', options: wellnessOptions },
      { questionNumber: 5, questionText: 'Do you feel hopeful about the near future?', options: wellnessOptions }
    ],
    scoring: {
      maxScore: 20,
      ranges: [
        { min: 0, max: 7, severity: 'Low', color: 'red', description: 'Your overall wellbeing seems low right now.', recommendations: ['Be gentle with yourself today', 'Reach out to someone you trust', 'Consider speaking with a therapist'] },
        { min: 8, max: 12, severity: 'Fair', color: 'yellow', description: 'Your wellbeing is fair.', recommendations: ['Try to get adequate rest tonight', 'A short walk or light exercise can help', 'Connect with a friend or family member'] },
        { min: 13, max: 17, severity: 'Good', color: 'green', description: 'Your overall wellbeing looks good.', recommendations: ['Keep maintaining your healthy habits', 'Share your positivity with someone today'] },
        { min: 18, max: 20, severity: 'Excellent', color: 'blue', description: 'Excellent wellbeing today!', recommendations: ['Wonderful — keep doing what you are doing', 'Use this positive energy to help others'] }
      ]
    }
  }
];

const seedTemplates = async () => {
  try {
    for (const tmpl of templates) {
      const exists = await AssessmentTemplate.findOne({ type: tmpl.type });
      if (!exists) {
        await AssessmentTemplate.create(tmpl);
        console.log(`Seeded assessment template: ${tmpl.type}`);
      }
    }
    console.log('Assessment templates seed complete.');
  } catch (error) {
    console.error('Template seed error:', error.message);
  }
};

module.exports = { seedTemplates };
