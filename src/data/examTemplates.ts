import { ExamSubject, StudyAvailability } from '../types';

export interface ExamPresetTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  subjects: ExamSubject[];
  availability: StudyAvailability;
}

// Helpers to generate dynamic dates relative to today
const getDateInDays = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const EXAM_PRESET_TEMPLATES: ExamPresetTemplate[] = [
  {
    id: 'btech-cs-finals',
    name: 'B.Tech CS / IT Semester Finals',
    category: 'Engineering & Technology',
    description: 'Data Structures, Engineering Mathematics, and Computer Architecture with realistic unit weightage and mixed difficulty.',
    availability: {
      dailyHoursWeekday: 3.5,
      dailyHoursWeekend: 5.0,
      preferredTimeSlot: 'evening',
      restDays: ['Sunday'],
      revisionBufferDays: 2
    },
    subjects: [
      {
        id: 'sub-dsa',
        name: 'Data Structures & Algorithms',
        examDate: getDateInDays(14),
        topics: [
          {
            id: 'top-dsa-1',
            name: 'Graph Traversal (BFS, DFS, Dijkstra, Prim)',
            unitOrChapter: 'Unit 4: Advanced Graphs',
            difficulty: 'Hard',
            confidence: 'Weak',
            weightage: 'High',
            estimatedMinutes: 60
          },
          {
            id: 'top-dsa-2',
            name: 'Dynamic Programming (Knapsack, LCS, LIS)',
            unitOrChapter: 'Unit 5: DP & Greedy Paradigms',
            difficulty: 'Hard',
            confidence: 'Weak',
            weightage: 'High',
            estimatedMinutes: 75
          },
          {
            id: 'top-dsa-3',
            name: 'Binary Search Trees & AVL Balancing',
            unitOrChapter: 'Unit 3: Non-Linear Structures',
            difficulty: 'Medium',
            confidence: 'Average',
            weightage: 'High',
            estimatedMinutes: 50
          },
          {
            id: 'top-dsa-4',
            name: 'Hash Tables, Collision Handling & Probing',
            unitOrChapter: 'Unit 2: Searching & Hashing',
            difficulty: 'Medium',
            confidence: 'Good',
            weightage: 'Medium',
            estimatedMinutes: 45
          },
          {
            id: 'top-dsa-5',
            name: 'Asymptotic Analysis & Master Theorem',
            unitOrChapter: 'Unit 1: Fundamentals',
            difficulty: 'Easy',
            confidence: 'Good',
            weightage: 'Medium',
            estimatedMinutes: 40
          }
        ]
      },
      {
        id: 'sub-math',
        name: 'Engineering Mathematics & Calculus',
        examDate: getDateInDays(19),
        topics: [
          {
            id: 'top-math-1',
            name: 'Eigenvalues, Eigenvectors & Cayley-Hamilton',
            unitOrChapter: 'Unit 1: Linear Algebra',
            difficulty: 'Hard',
            confidence: 'Weak',
            weightage: 'High',
            estimatedMinutes: 60
          },
          {
            id: 'top-math-2',
            name: 'Differential Equations & Laplace Transforms',
            unitOrChapter: 'Unit 3: Transforms & Calculus',
            difficulty: 'Hard',
            confidence: 'Average',
            weightage: 'High',
            estimatedMinutes: 70
          },
          {
            id: 'top-math-3',
            name: 'Multiple Integrals (Double & Triple Integrals)',
            unitOrChapter: 'Unit 2: Multivariable Calculus',
            difficulty: 'Medium',
            confidence: 'Average',
            weightage: 'Medium',
            estimatedMinutes: 50
          },
          {
            id: 'top-math-4',
            name: 'Probability Distributions & Bayes Theorem',
            unitOrChapter: 'Unit 4: Applied Statistics',
            difficulty: 'Easy',
            confidence: 'Good',
            weightage: 'Medium',
            estimatedMinutes: 45
          }
        ]
      },
      {
        id: 'sub-coa',
        name: 'Computer Organization & Architecture',
        examDate: getDateInDays(24),
        topics: [
          {
            id: 'top-coa-1',
            name: 'Pipelining, Data Hazards & Branch Prediction',
            unitOrChapter: 'Unit 3: Processor Design',
            difficulty: 'Hard',
            confidence: 'Weak',
            weightage: 'High',
            estimatedMinutes: 60
          },
          {
            id: 'top-coa-2',
            name: 'Cache Memory Mapping (Direct, Set-Associative)',
            unitOrChapter: 'Unit 4: Memory Hierarchy',
            difficulty: 'Medium',
            confidence: 'Average',
            weightage: 'High',
            estimatedMinutes: 55
          },
          {
            id: 'top-coa-3',
            name: 'Instruction Cycle, Micro-operations & Control Unit',
            unitOrChapter: 'Unit 2: CPU Architecture',
            difficulty: 'Medium',
            confidence: 'Good',
            weightage: 'Medium',
            estimatedMinutes: 45
          },
          {
            id: 'top-coa-4',
            name: 'Interrupt Handling & DMA Controllers',
            unitOrChapter: 'Unit 5: I/O Organization',
            difficulty: 'Easy',
            confidence: 'Good',
            weightage: 'Low',
            estimatedMinutes: 40
          }
        ]
      }
    ]
  },
  {
    id: 'class12-science',
    name: 'Class 12 / Higher Secondary Board Examination',
    category: 'Senior Secondary (Science)',
    description: 'Physics, Chemistry, and Mathematics for senior secondary board exams and entrance preparations.',
    availability: {
      dailyHoursWeekday: 4.0,
      dailyHoursWeekend: 5.5,
      preferredTimeSlot: 'morning',
      restDays: ['Sunday'],
      revisionBufferDays: 3
    },
    subjects: [
      {
        id: 'sub-phy',
        name: 'Physics (Class 12)',
        examDate: getDateInDays(16),
        topics: [
          {
            id: 'top-phy-1',
            name: 'Electromagnetic Induction & AC Circuits',
            unitOrChapter: 'Chapter 6 & 7: Electromagnetism',
            difficulty: 'Hard',
            confidence: 'Weak',
            weightage: 'High',
            estimatedMinutes: 60
          },
          {
            id: 'top-phy-2',
            name: 'Ray & Wave Optics (Interference & Diffraction)',
            unitOrChapter: 'Chapter 9 & 10: Optics',
            difficulty: 'Hard',
            confidence: 'Average',
            weightage: 'High',
            estimatedMinutes: 65
          },
          {
            id: 'top-phy-3',
            name: 'Semiconductors & Logic Gate Applications',
            unitOrChapter: 'Chapter 14: Electronic Devices',
            difficulty: 'Medium',
            confidence: 'Good',
            weightage: 'Medium',
            estimatedMinutes: 45
          },
          {
            id: 'top-phy-4',
            name: 'Electric Charges, Fields & Gauss Law',
            unitOrChapter: 'Chapter 1: Electrostatics',
            difficulty: 'Easy',
            confidence: 'Good',
            weightage: 'High',
            estimatedMinutes: 45
          }
        ]
      },
      {
        id: 'sub-chem',
        name: 'Chemistry (Class 12)',
        examDate: getDateInDays(21),
        topics: [
          {
            id: 'top-chem-1',
            name: 'Aldehydes, Ketones & Carboxylic Acid Mechanisms',
            unitOrChapter: 'Chapter 8: Organic Chemistry',
            difficulty: 'Hard',
            confidence: 'Weak',
            weightage: 'High',
            estimatedMinutes: 70
          },
          {
            id: 'top-chem-2',
            name: 'Electrochemistry & Nernst Equation Numericals',
            unitOrChapter: 'Chapter 2: Physical Chemistry',
            difficulty: 'Medium',
            confidence: 'Average',
            weightage: 'High',
            estimatedMinutes: 55
          },
          {
            id: 'top-chem-3',
            name: 'Coordination Compounds & Crystal Field Theory',
            unitOrChapter: 'Chapter 5: Inorganic Chemistry',
            difficulty: 'Medium',
            confidence: 'Good',
            weightage: 'Medium',
            estimatedMinutes: 45
          }
        ]
      },
      {
        id: 'sub-math12',
        name: 'Mathematics (Class 12)',
        examDate: getDateInDays(26),
        topics: [
          {
            id: 'top-math12-1',
            name: 'Definite Integrals & Areas under Curves',
            unitOrChapter: 'Chapter 7 & 8: Integral Calculus',
            difficulty: 'Hard',
            confidence: 'Weak',
            weightage: 'High',
            estimatedMinutes: 60
          },
          {
            id: 'top-math12-2',
            name: 'Vectors & Three Dimensional Geometry',
            unitOrChapter: 'Chapter 10 & 11: 3D Geometry',
            difficulty: 'Medium',
            confidence: 'Average',
            weightage: 'High',
            estimatedMinutes: 50
          },
          {
            id: 'top-math12-3',
            name: 'Matrices & Determinants (System of Equations)',
            unitOrChapter: 'Chapter 3 & 4: Algebra',
            difficulty: 'Easy',
            confidence: 'Good',
            weightage: 'Medium',
            estimatedMinutes: 40
          }
        ]
      }
    ]
  },
  {
    id: 'midterm-intensive',
    name: 'Midterm 2-Subject Fast Track (10 Days)',
    category: 'University Midterms',
    description: 'High-yield 10-day intensive study sprint covering Core Database Systems and Web Development.',
    availability: {
      dailyHoursWeekday: 3.0,
      dailyHoursWeekend: 4.5,
      preferredTimeSlot: 'night',
      restDays: [],
      revisionBufferDays: 1
    },
    subjects: [
      {
        id: 'sub-dbms',
        name: 'Database Management Systems',
        examDate: getDateInDays(7),
        topics: [
          {
            id: 'top-dbms-1',
            name: 'Normalization (1NF, 2NF, 3NF, BCNF) & Dependencies',
            unitOrChapter: 'Module 3: Relational Design',
            difficulty: 'Hard',
            confidence: 'Weak',
            weightage: 'High',
            estimatedMinutes: 60
          },
          {
            id: 'top-dbms-2',
            name: 'Transactions, ACID & Concurrency Protocols',
            unitOrChapter: 'Module 4: Transaction Processing',
            difficulty: 'Medium',
            confidence: 'Average',
            weightage: 'High',
            estimatedMinutes: 50
          },
          {
            id: 'top-dbms-3',
            name: 'Complex SQL Queries, Nested Joins & Views',
            unitOrChapter: 'Module 2: SQL Mastery',
            difficulty: 'Easy',
            confidence: 'Good',
            weightage: 'Medium',
            estimatedMinutes: 45
          }
        ]
      },
      {
        id: 'sub-web',
        name: 'Full Stack Web Architecture',
        examDate: getDateInDays(10),
        topics: [
          {
            id: 'top-web-1',
            name: 'Asynchronous JavaScript, Event Loop & Promises',
            unitOrChapter: 'Module 2: Client Architecture',
            difficulty: 'Hard',
            confidence: 'Weak',
            weightage: 'High',
            estimatedMinutes: 60
          },
          {
            id: 'top-web-2',
            name: 'RESTful API Design & Authentication (JWT/OAuth)',
            unitOrChapter: 'Module 4: Server Engineering',
            difficulty: 'Medium',
            confidence: 'Average',
            weightage: 'High',
            estimatedMinutes: 50
          },
          {
            id: 'top-web-3',
            name: 'State Management & Component Lifecycle',
            unitOrChapter: 'Module 3: Frontend Frameworks',
            difficulty: 'Medium',
            confidence: 'Good',
            weightage: 'Medium',
            estimatedMinutes: 45
          }
        ]
      }
    ]
  }
];
