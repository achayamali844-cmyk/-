export type ExamSystem = 'A-Level' | 'IB';
export type QuestionDifficulty = 'foundation' | 'standard' | 'challenge';

export interface QuestionBankItem {
  id: string;
  system: ExamSystem;
  subject: string;
  course: string;
  topic: string;
  difficulty: QuestionDifficulty;
  marks: number;
  commandTerm: string;
  question: string;
  answer: string[];
  examinerNotes: string[];
}

export const QUESTION_BANK: QuestionBankItem[] = [
  {
    id: 'al-math-functions-001',
    system: 'A-Level',
    subject: 'Mathematics',
    course: 'Pure Mathematics',
    topic: 'Functions and graphs',
    difficulty: 'standard',
    marks: 6,
    commandTerm: 'Show that',
    question: 'A function is defined by f(x) = 2x^2 - 8x + 5. Show that the minimum value of f(x) is -3, and state the value of x at which this occurs.',
    answer: [
      'Complete the square: f(x) = 2(x^2 - 4x) + 5 = 2((x - 2)^2 - 4) + 5.',
      'So f(x) = 2(x - 2)^2 - 3.',
      'Since 2(x - 2)^2 >= 0, the minimum value is -3.',
      'This occurs when x = 2.',
    ],
    examinerNotes: [
      'Award method credit for a correct completing-the-square attempt.',
      'The final answer must include both the minimum value and the corresponding x-value.',
    ],
  },
  {
    id: 'al-physics-circuits-001',
    system: 'A-Level',
    subject: 'Physics',
    course: 'A2 Physics',
    topic: 'Electric circuits',
    difficulty: 'standard',
    marks: 5,
    commandTerm: 'Calculate',
    question: 'A 12 V battery is connected to two resistors, 4 ohm and 8 ohm, in series. Calculate the current in the circuit and the potential difference across the 8 ohm resistor.',
    answer: [
      'Total resistance R = 4 + 8 = 12 ohm.',
      'Current I = V / R = 12 / 12 = 1 A.',
      'Potential difference across 8 ohm resistor: V = IR = 1 x 8 = 8 V.',
    ],
    examinerNotes: [
      'Use series resistance before applying Ohm\'s law.',
      'Include units for both current and potential difference.',
    ],
  },
  {
    id: 'al-chem-organic-001',
    system: 'A-Level',
    subject: 'Chemistry',
    course: 'Organic Chemistry',
    topic: 'Alcohol oxidation',
    difficulty: 'foundation',
    marks: 4,
    commandTerm: 'Describe',
    question: 'Describe how propan-1-ol can be oxidised to propanoic acid in the laboratory. Include the reagent and condition required.',
    answer: [
      'Use acidified potassium dichromate(VI), K2Cr2O7/H2SO4.',
      'Heat the mixture under reflux.',
      'The primary alcohol is first oxidised to propanal and then to propanoic acid.',
      'The dichromate colour changes from orange to green.',
    ],
    examinerNotes: [
      'Reflux is needed for full oxidation to the carboxylic acid.',
      'Do not describe distillation if the target product is the acid.',
    ],
  },
  {
    id: 'al-econ-marketfailure-001',
    system: 'A-Level',
    subject: 'Economics',
    course: 'Microeconomics',
    topic: 'Negative externalities',
    difficulty: 'challenge',
    marks: 10,
    commandTerm: 'Evaluate',
    question: 'Evaluate whether an indirect tax is the best policy to reduce the consumption of a good that creates negative externalities.',
    answer: [
      'Define negative externality and explain that marginal social cost exceeds marginal private cost.',
      'An indirect tax can raise price, reduce quantity demanded, and make consumers internalise some external cost.',
      'Effectiveness depends on price elasticity of demand, accuracy of external cost estimation, and how tax revenue is used.',
      'Alternative policies include regulation, tradable permits, information campaigns, or subsidies for substitutes.',
      'Judgement: a tax can be effective, but it is unlikely to be best alone if demand is inelastic or external costs are hard to measure.',
    ],
    examinerNotes: [
      'Evaluation needs conditions, not just advantages and disadvantages.',
      'Use a diagram if this is being developed into a full essay answer.',
    ],
  },
  {
    id: 'ib-mathaa-calculus-001',
    system: 'IB',
    subject: 'Mathematics',
    course: 'Math AA HL',
    topic: 'Differentiation',
    difficulty: 'standard',
    marks: 6,
    commandTerm: 'Find',
    question: 'Let y = x^3 - 6x^2 + 9x + 2. Find the coordinates of the stationary points and determine their nature.',
    answer: [
      'dy/dx = 3x^2 - 12x + 9 = 3(x - 1)(x - 3).',
      'Stationary points occur at x = 1 and x = 3.',
      'y(1) = 1 - 6 + 9 + 2 = 6, so one point is (1, 6).',
      'y(3) = 27 - 54 + 27 + 2 = 2, so one point is (3, 2).',
      'd2y/dx2 = 6x - 12. At x = 1, d2y/dx2 = -6, so local maximum.',
      'At x = 3, d2y/dx2 = 6, so local minimum.',
    ],
    examinerNotes: [
      'IB solutions should state both coordinates and nature.',
      'A sign table is also acceptable if second derivative is not used.',
    ],
  },
  {
    id: 'ib-physics-energy-001',
    system: 'IB',
    subject: 'Physics',
    course: 'Physics SL/HL',
    topic: 'Energy and motion',
    difficulty: 'foundation',
    marks: 5,
    commandTerm: 'Determine',
    question: 'A 0.50 kg object falls from rest through a vertical height of 3.2 m. Ignoring air resistance, determine its speed just before it reaches the ground. Use g = 9.8 m s^-2.',
    answer: [
      'Loss in gravitational potential energy equals gain in kinetic energy.',
      'mgh = 1/2 mv^2, so mass cancels.',
      'v = sqrt(2gh) = sqrt(2 x 9.8 x 3.2).',
      'v = sqrt(62.72) = 7.9 m s^-1 to two significant figures.',
    ],
    examinerNotes: [
      'Mass is not needed in the final calculation.',
      'Unit and sensible significant figures matter.',
    ],
  },
  {
    id: 'ib-biology-membranes-001',
    system: 'IB',
    subject: 'Biology',
    course: 'Biology HL',
    topic: 'Membrane transport',
    difficulty: 'standard',
    marks: 7,
    commandTerm: 'Explain',
    question: 'Explain how the structure of the phospholipid bilayer allows membranes to control the movement of substances into and out of cells.',
    answer: [
      'Phospholipids have hydrophilic heads and hydrophobic tails, forming a bilayer in water.',
      'The hydrophobic core restricts movement of charged and polar substances.',
      'Small non-polar molecules can diffuse through the bilayer more easily.',
      'Channel and carrier proteins allow specific ions and polar molecules to cross.',
      'Protein specificity helps regulate which substances move across the membrane.',
      'Active transport can move substances against a concentration gradient using ATP.',
    ],
    examinerNotes: [
      'Link each structure to a transport function.',
      'Avoid only describing the fluid mosaic model without answering control of movement.',
    ],
  },
  {
    id: 'ib-econ-macro-001',
    system: 'IB',
    subject: 'Economics',
    course: 'Macroeconomics',
    topic: 'Demand-side policies',
    difficulty: 'challenge',
    marks: 10,
    commandTerm: 'Discuss',
    question: 'Discuss the view that expansionary fiscal policy is the most effective way to reduce unemployment during a recession.',
    answer: [
      'Expansionary fiscal policy can increase aggregate demand through higher government spending or lower taxation.',
      'Higher aggregate demand may raise real output and derived demand for labour.',
      'It may be especially useful when private-sector confidence is weak.',
      'Limitations include time lags, crowding out, budget deficits, debt sustainability, and possible inflationary pressure.',
      'Effectiveness depends on the type of unemployment, size of multiplier, spare capacity, and confidence response.',
      'Judgement: it can be effective for cyclical unemployment, but it is not always best for structural unemployment.',
    ],
    examinerNotes: [
      'IB evaluation should consider context and short-run versus long-run effects.',
      'A strong response distinguishes cyclical unemployment from structural unemployment.',
    ],
  },
];

export const QUESTION_BANK_SYSTEMS: ExamSystem[] = ['A-Level', 'IB'];

export const QUESTION_BANK_SUBJECTS = Array.from(
  new Set(QUESTION_BANK.map((question) => question.subject)),
).sort();

export const QUESTION_BANK_DIFFICULTIES: QuestionDifficulty[] = [
  'foundation',
  'standard',
  'challenge',
];
