// src/data/questions.ts
export type Option = { text: string; score: number };
export type Question = {
  category: string;
  text: string;
  options: Option[];
};

export const QUESTIONS: Question[] = [
  {
    category: 'Food',
    text: 'How resilient is your food supply chain?',
    options: [
      { text: 'Very fragile', score: 1 },
      { text: 'Somewhat fragile', score: 3 },
      { text: 'Moderately resilient', score: 5 },
      { text: 'Strong', score: 7 },
      { text: 'Very strong', score: 9 },
    ],
  },
  {
    category: 'Water',
    text: 'How secure is your water sourcing?',
    options: [
      { text: 'Very insecure', score: 1 },
      { text: 'Insecure', score: 3 },
      { text: 'Moderate', score: 5 },
      { text: 'Secure', score: 7 },
      { text: 'Very secure', score: 9 },
    ],
  },
  // Add remaining 4 categories similarly (Shelter, Education, Work, Energy)
];
