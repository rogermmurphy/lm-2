/**
 * Prebuilt Quiz Questions
 * Ready-to-use quiz content for live sessions
 * Organized by subject and topic
 */

export const quizzes = {
  // CHEMISTRY QUIZZES
  chemistry: [
    {
      id: 'chem_periodic_01',
      title: 'Periodic Table Basics',
      subject: 'chemistry',
      difficulty: 'easy',
      questions: [
        {
          id: 'q1',
          text: 'What is the atomic number of Carbon?',
          options: [
            { id: 'a', text: '6', isCorrect: true },
            { id: 'b', text: '12', isCorrect: false },
            { id: 'c', text: '14', isCorrect: false },
            { id: 'd', text: '8', isCorrect: false }
          ],
          correct: 'a',
          timeLimit: 15,
          points: 10
        },
        {
          id: 'q2',
          text: 'Which element is a noble gas?',
          options: [
            { id: 'a', text: 'Oxygen', isCorrect: false },
            { id: 'b', text: 'Helium', isCorrect: true },
            { id: 'c', text: 'Hydrogen', isCorrect: false },
            { id: 'd', text: 'Nitrogen', isCorrect: false }
          ],
          correct: 'b',
          timeLimit: 15,
          points: 10
        }
      ]
    },
    {
      id: 'chem_kinetics_01',
      title: 'Reaction Rates',
      subject: 'chemistry',
      difficulty: 'medium',
      questions: [
        {
          id: 'q1',
          text: 'What factor generally doubles the reaction rate?',
          options: [
            { id: 'a', text: 'Temperature increase of 10°C', isCorrect: true },
            { id: 'b', text: 'Pressure increase', isCorrect: false },
            { id: 'c', text: 'Adding a catalyst', isCorrect: false },
            { id: 'd', text: 'Increasing surface area', isCorrect: false }
          ],
          correct: 'a',
          timeLimit: 20,
          points: 15
        },
        {
          id: 'q2',
          text: 'What does a catalyst do?',
          options: [
            { id: 'a', text: 'Increases activation energy', isCorrect: false },
            { id: 'b', text: 'Lowers activation energy', isCorrect: true },
            { id: 'c', text: 'Changes products', isCorrect: false },
            { id: 'd', text: 'Stops the reaction', isCorrect: false }
          ],
          correct: 'b',
          timeLimit: 20,
          points: 15
        }
      ]
    },
    {
      id: 'chem_bonding_01',
      title: 'Chemical Bonding',
      subject: 'chemistry',
      difficulty: 'medium',
      questions: [
        {
          id: 'q1',
          text: 'What type of bond is formed when electrons are shared?',
          options: [
            { id: 'a', text: 'Ionic', isCorrect: false },
            { id: 'b', text: 'Covalent', isCorrect: true },
            { id: 'c', text: 'Metallic', isCorrect: false },
            { id: 'd', text: 'Hydrogen', isCorrect: false }
          ],
          correct: 'b',
          timeLimit: 15,
          points: 10
        },
        {
          id: 'q2',
          text: 'Water (H₂O) is an example of what type of compound?',
          options: [
            { id: 'a', text: 'Ionic', isCorrect: false },
            { id: 'b', text: 'Metallic', isCorrect: false },
            { id: 'c', text: 'Covalent', isCorrect: true },
            { id: 'd', text: 'Noble gas', isCorrect: false }
          ],
          correct: 'c',
          timeLimit: 15,
          points: 10
        }
      ]
    }
  ],

  // PHYSICS QUIZZES
  physics: [
    {
      id: 'phys_kinematics_01',
      title: 'Motion Basics',
      subject: 'physics',
      difficulty: 'easy',
      questions: [
        {
          id: 'q1',
          text: 'What is the SI unit of velocity?',
          options: [
            { id: 'a', text: 'm/s', isCorrect: true },
            { id: 'b', text: 'm/s²', isCorrect: false },
            { id: 'c', text: 'km/h', isCorrect: false },
            { id: 'd', text: 'mph', isCorrect: false }
          ],
          correct: 'a',
          timeLimit: 15,
          points: 10
        },
        {
          id: 'q2',
          text: 'Acceleration is the rate of change of what?',
          options: [
            { id: 'a', text: 'Position', isCorrect: false },
            { id: 'b', text: 'Velocity', isCorrect: true },
            { id: 'c', text: 'Time', isCorrect: false },
            { id: 'd', text: 'Distance', isCorrect: false }
          ],
          correct: 'b',
          timeLimit: 15,
          points: 10
        }
      ]
    },
    {
      id: 'phys_forces_01',
      title: 'Forces and Newton\'s Laws',
      subject: 'physics',
      difficulty: 'medium',
      questions: [
        {
          id: 'q1',
          text: 'According to Newton\'s First Law, an object at rest will:',
          options: [
            { id: 'a', text: 'Always move eventually', isCorrect: false },
            { id: 'b', text: 'Stay at rest unless acted upon', isCorrect: true },
            { id: 'c', text: 'Accelerate slowly', isCorrect: false },
            { id: 'd', text: 'Fall down', isCorrect: false }
          ],
          correct: 'b',
          timeLimit: 20,
          points: 15
        }
      ]
    }
  ],

  // MATH QUIZZES
  math: [
    {
      id: 'math_algebra_01',
      title: 'Algebra Basics',
      subject: 'math',
      difficulty: 'easy',
      questions: [
        {
          id: 'q1',
          text: 'Solve for x: 2x + 5 = 15',
          options: [
            { id: 'a', text: 'x = 5', isCorrect: true },
            { id: 'b', text: 'x = 10', isCorrect: false },
            { id: 'c', text: 'x = 7', isCorrect: false },
            { id: 'd', text: 'x = 3', isCorrect: false }
          ],
          correct: 'a',
          timeLimit: 20,
          points: 10
        },
        {
          id: 'q2',
          text: 'What is 25% of 80?',
          options: [
            { id: 'a', text: '15', isCorrect: false },
            { id: 'b', text: '20', isCorrect: true },
            { id: 'c', text: '25', isCorrect: false },
            { id: 'd', text: '30', isCorrect: false }
          ],
          correct: 'b',
          timeLimit: 15,
          points: 10
        }
      ]
    },
    {
      id: 'math_geometry_01',
      title: 'Geometry Fundamentals',
      subject: 'math',
      difficulty: 'medium',
      questions: [
        {
          id: 'q1',
          text: 'What is the sum of angles in a triangle?',
          options: [
            { id: 'a', text: '90°', isCorrect: false },
            { id: 'b', text: '180°', isCorrect: true },
            { id: 'c', text: '270°', isCorrect: false },
            { id: 'd', text: '360°', isCorrect: false }
          ],
          correct: 'b',
          timeLimit: 15,
          points: 10
        },
        {
          id: 'q2',
          text: 'Area of a circle with radius 5?',
          options: [
            { id: 'a', text: '25π', isCorrect: true },
            { id: 'b', text: '10π', isCorrect: false },
            { id: 'c', text: '5π', isCorrect: false },
            { id: 'd', text: '50π', isCorrect: false }
          ],
          correct: 'a',
          timeLimit: 20,
          points: 15
        }
      ]
    }
  ]
};

// Get all quizzes for a subject
export const getQuizzesBySubject = (subject) => {
  return quizzes[subject] || [];
};

// Get quiz by ID
export const getQuizById = (id) => {
  for (const subject in quizzes) {
    const quiz = quizzes[subject].find(q => q.id === id);
    if (quiz) return quiz;
  }
  return null;
};

// Get quizzes by difficulty
export const getQuizzesByDifficulty = (difficulty) => {
  const allQuizzes = Object.values(quizzes).flat();
  return allQuizzes.filter(q => q.difficulty === difficulty);
};

// Get random quiz from subject
export const getRandomQuiz = (subject) => {
  const subjectQuizzes = getQuizzesBySubject(subject);
  if (subjectQuizzes.length === 0) return null;
  return subjectQuizzes[Math.floor(Math.random() * subjectQuizzes.length)];
};

export default quizzes;
