import { VerifiedCourse, EducationLevelId, CoursePreferences } from '../types';

export const DEFAULT_COURSE_PREFERENCES: CoursePreferences = {
  targetSkills: ['Artificial Intelligence', 'Data Structures & Algorithms', 'Python Programming', 'Web Development'],
  preferredDuration: 'all',
  preferredProviderType: 'all',
  learningGoal: 'Master curriculum concepts, prepare for upcoming semester exams, and build industry-relevant technical competencies.',
  focusSubjects: ['Computer Science', 'Mathematics']
};

export const VERIFIED_COURSES: VerifiedCourse[] = [
  // =========================================================================
  // 1. HARVARD ONLINE / CS50
  // =========================================================================
  {
    id: 'cs50x-intro-cs',
    name: 'CS50x: Introduction to Computer Science',
    provider: 'Harvard University (CS50)',
    educationLevels: ['higher_secondary', 'diploma', 'btech', 'undergraduate_other', 'mtech', 'postgraduate_other'],
    category: 'Computer Science',
    difficulty: 'Beginner',
    outcome: 'An introduction to the intellectual enterprises of computer science and the art of programming, covering C, Python, SQL, algorithms, and data structures.',
    url: 'https://cs50.harvard.edu/x/',
    pricing: '100% Free',
    duration: '12 weeks (6–18 hrs/week)',
    skills: ['C', 'Python', 'SQL', 'Algorithms', 'Data Structures', 'Memory Management'],
    verifiedProvider: true,
    providerType: 'university'
  },
  {
    id: 'cs50-ai-python',
    name: "CS50's Introduction to Artificial Intelligence with Python",
    provider: 'Harvard University (CS50)',
    educationLevels: ['btech', 'mtech', 'undergraduate_other', 'postgraduate_other'],
    category: 'Artificial Intelligence',
    difficulty: 'Intermediate',
    outcome: 'Explores concepts and algorithms at the foundation of modern AI: graph search, classification, optimization, reinforcement learning, and neural networks.',
    url: 'https://cs50.harvard.edu/ai/',
    pricing: '100% Free',
    duration: '7 weeks (10–30 hrs/week)',
    skills: ['Python', 'Machine Learning', 'Graph Search', 'Bayesian Networks', 'Neural Networks'],
    verifiedProvider: true,
    providerType: 'university'
  },
  {
    id: 'cs50-web-dev',
    name: "CS50's Web Programming with Python and JavaScript",
    provider: 'Harvard University (CS50)',
    educationLevels: ['diploma', 'btech', 'undergraduate_other', 'mtech'],
    category: 'Web Development',
    difficulty: 'Intermediate',
    outcome: 'Deep dive into web application design, database persistence, APIs, user authentication, and responsive client-side JavaScript.',
    url: 'https://cs50.harvard.edu/web/',
    pricing: '100% Free',
    duration: '12 weeks (6–9 hrs/week)',
    skills: ['Python', 'Django', 'JavaScript', 'SQL', 'Git', 'REST APIs'],
    verifiedProvider: true,
    providerType: 'university'
  },

  // =========================================================================
  // 2. MIT OPENCOURSEWARE & MITx
  // =========================================================================
  {
    id: 'mit-6-0001-python',
    name: 'Introduction to Computer Science and Programming in Python (6.0001)',
    provider: 'MIT OpenCourseWare',
    educationLevels: ['higher_secondary', 'diploma', 'btech', 'undergraduate_other'],
    category: 'Computer Science',
    difficulty: 'Beginner',
    outcome: 'Rigorous introduction to computational thinking, problem decomposition, algorithm analysis, recursion, and object-oriented Python design.',
    url: 'https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/',
    pricing: '100% Free',
    duration: '9 weeks (14 hrs/week)',
    skills: ['Python', 'Computational Thinking', 'Object-Oriented Design', 'Testing & Debugging'],
    verifiedProvider: true,
    providerType: 'university'
  },
  {
    id: 'mit-18-01-calculus',
    name: 'Single Variable Calculus (18.01SC)',
    provider: 'MIT OpenCourseWare',
    educationLevels: ['higher_secondary', 'diploma', 'btech', 'undergraduate_other'],
    category: 'Mathematics',
    difficulty: 'Intermediate',
    outcome: 'Master differentiation and integration of functions of one variable, with applications to optimization, graphing, and physics problems.',
    url: 'https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/',
    pricing: '100% Free',
    duration: 'Self-paced (~35 lecture units)',
    skills: ['Calculus', 'Differentiation', 'Integration', 'Limits', 'Optimization'],
    verifiedProvider: true,
    providerType: 'university'
  },
  {
    id: 'mit-18-06-linear-algebra',
    name: 'Linear Algebra (18.06SC by Prof. Gilbert Strang)',
    provider: 'MIT OpenCourseWare',
    educationLevels: ['btech', 'undergraduate_other', 'mtech', 'postgraduate_other'],
    category: 'Mathematics',
    difficulty: 'Intermediate',
    outcome: 'World-renowned foundational lectures on matrix theory, linear equations, vector spaces, orthogonality, determinants, and eigenvalues.',
    url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/',
    pricing: '100% Free',
    duration: 'Self-paced (~35 lecture units)',
    skills: ['Linear Algebra', 'Matrices', 'Eigenvalues', 'Orthogonality', 'SVD Decomposition'],
    verifiedProvider: true,
    providerType: 'university'
  },
  {
    id: 'edx-mit-computational-thinking',
    name: 'Introduction to Computational Thinking and Data Science',
    provider: 'edX (MITx)',
    educationLevels: ['btech', 'undergraduate_other', 'mtech', 'postgraduate_other'],
    category: 'Data Science',
    difficulty: 'Intermediate',
    outcome: 'Use computational techniques to solve real-world problems: optimization models, stochastic programs, Monte Carlo simulations, and data modeling.',
    url: 'https://www.edx.org/learn/computer-science/massachusetts-institute-of-technology-introduction-to-computational-thinking-and-data-science',
    pricing: 'Free to Audit',
    duration: '9 weeks (14–16 hrs/week)',
    skills: ['Data Science', 'Monte Carlo Simulation', 'Optimization', 'Statistical Modeling'],
    verifiedProvider: true,
    providerType: 'university'
  },

  // =========================================================================
  // 3. NPTEL & IITs (National Programme on Technology Enhanced Learning)
  // =========================================================================
  {
    id: 'nptel-dsa-python',
    name: 'Programming, Data Structures and Algorithms in Python',
    provider: 'NPTEL (IIT Madras)',
    educationLevels: ['diploma', 'btech', 'undergraduate_other'],
    category: 'Computer Science',
    difficulty: 'Intermediate',
    outcome: 'Comprehensive curriculum spanning algorithmic complexity, sorting, binary trees, heaps, balanced BSTs, graph traversals, and dynamic programming.',
    url: 'https://nptel.ac.in/courses/106106145',
    pricing: 'Free to Audit',
    duration: '8 weeks (3 hrs/week)',
    skills: ['Data Structures', 'Algorithms', 'Binary Trees', 'Dynamic Programming', 'Graph Theory'],
    verifiedProvider: true,
    providerType: 'university'
  },
  {
    id: 'nptel-dbms-iitkgp',
    name: 'Database Management Systems (DBMS)',
    provider: 'NPTEL (IIT Kharagpur)',
    educationLevels: ['btech', 'undergraduate_other', 'mtech'],
    category: 'Computer Science',
    difficulty: 'Intermediate',
    outcome: 'Covers relational schema design, SQL query formulation, ER models, normalization theory (1NF through BCNF), indexing, and ACID transactions.',
    url: 'https://nptel.ac.in/courses/106105175',
    pricing: 'Free to Audit',
    duration: '8 weeks (3 hrs/week)',
    skills: ['DBMS', 'SQL', 'Database Normalization', 'ER Modeling', 'ACID Transactions'],
    verifiedProvider: true,
    providerType: 'university'
  },
  {
    id: 'nptel-os-iitkgp',
    name: 'Operating System Fundamentals & System Programming',
    provider: 'NPTEL (IIT Kharagpur)',
    educationLevels: ['btech', 'diploma', 'undergraduate_other'],
    category: 'Computer Science',
    difficulty: 'Intermediate',
    outcome: 'In-depth study of process scheduling algorithms (FCFS, SJF, RR), synchronization primitives, semaphores, deadlock avoidance, and virtual memory paging.',
    url: 'https://nptel.ac.in/courses/106105214',
    pricing: 'Free to Audit',
    duration: '12 weeks (3 hrs/week)',
    skills: ['Operating Systems', 'Process Scheduling', 'Deadlocks', 'Paging', 'Virtual Memory'],
    verifiedProvider: true,
    providerType: 'university'
  },
  {
    id: 'nptel-deep-learning-iitm',
    name: 'Deep Learning & Neural Network Architectures',
    provider: 'NPTEL (IIT Ropar / IIT Madras)',
    educationLevels: ['btech', 'mtech', 'postgraduate_other'],
    category: 'Artificial Intelligence',
    difficulty: 'Advanced',
    outcome: 'Mathematical foundations and modern architectures: multilayer perceptrons, backpropagation, CNNs for computer vision, RNNs, and attention transformers.',
    url: 'https://nptel.ac.in/courses/106106184',
    pricing: 'Free to Audit',
    duration: '12 weeks (3 hrs/week)',
    skills: ['Deep Learning', 'PyTorch', 'CNNs', 'Attention Transformers', 'Backpropagation'],
    verifiedProvider: true,
    providerType: 'university'
  },
  {
    id: 'nptel-basic-electrical',
    name: 'Basic Electrical Technology & Circuit Analysis',
    provider: 'NPTEL (IIT Kharagpur)',
    educationLevels: ['diploma', 'btech'],
    category: 'Electrical Engineering',
    difficulty: 'Intermediate',
    outcome: 'Analysis of DC circuits, AC sinusoidal steady-state, phasor representations, single-phase and three-phase circuits, and transformer principles.',
    url: 'https://nptel.ac.in/courses/108105053',
    pricing: 'Free to Audit',
    duration: '12 weeks (3 hrs/week)',
    skills: ['Circuit Analysis', 'AC/DC Systems', 'Transformers', 'Three-Phase Power'],
    verifiedProvider: true,
    providerType: 'university'
  },
  {
    id: 'nptel-engineering-mechanics',
    name: 'Engineering Mechanics: Statics and Dynamics',
    provider: 'NPTEL (IIT Madras)',
    educationLevels: ['diploma', 'btech'],
    category: 'Mechanical Engineering',
    difficulty: 'Intermediate',
    outcome: 'Fundamental principles of rigid body mechanics, static equilibrium, free body diagrams, friction, moments of inertia, and kinematics of particles.',
    url: 'https://nptel.ac.in/courses/112106286',
    pricing: 'Free to Audit',
    duration: '12 weeks (3 hrs/week)',
    skills: ['Statics', 'Dynamics', 'Free Body Diagrams', 'Moment of Inertia', 'Kinematics'],
    verifiedProvider: true,
    providerType: 'university'
  },
  {
    id: 'nptel-research-methodology',
    name: 'Introduction to Research Methodology & Technical Writing',
    provider: 'NPTEL (IIT Madras)',
    educationLevels: ['mtech', 'postgraduate_other'],
    category: 'Research & Academia',
    difficulty: 'Advanced',
    outcome: 'Formulate research hypotheses, conduct systematic literature reviews, design experiments, evaluate statistical significance, and draft publication-ready papers.',
    url: 'https://nptel.ac.in/courses/121106007',
    pricing: 'Free to Audit',
    duration: '8 weeks (3 hrs/week)',
    skills: ['Research Methodology', 'Technical Writing', 'Experimental Design', 'Hypothesis Testing'],
    verifiedProvider: true,
    providerType: 'university'
  },

  // =========================================================================
  // 4. KHAN ACADEMY
  // =========================================================================
  {
    id: 'khan-math-foundations',
    name: 'Early & Middle School Mathematics Foundations',
    provider: 'Khan Academy',
    educationLevels: ['primary_school', 'middle_school'],
    category: 'Mathematics',
    difficulty: 'Beginner',
    outcome: 'Master foundational arithmetic, fractions, decimals, ratios, and introductory geometry through step-by-step interactive practice.',
    url: 'https://www.khanacademy.org/math',
    pricing: '100% Free',
    duration: 'Self-paced (~40 hours)',
    skills: ['Arithmetic', 'Fractions', 'Decimals', 'Basic Geometry'],
    verifiedProvider: true,
    providerType: 'open_learning'
  },
  {
    id: 'khan-algebra-geometry',
    name: 'Class 9 & 10 Mathematics & Linear Algebra',
    provider: 'Khan Academy',
    educationLevels: ['secondary_school'],
    category: 'Mathematics',
    difficulty: 'Intermediate',
    outcome: 'Build confidence in linear equations, quadratic formulas, coordinate geometry, trigonometry, and surface areas according to NCERT benchmarks.',
    url: 'https://www.khanacademy.org/math/in-in-grade-10-ncert',
    pricing: '100% Free',
    duration: 'Self-paced (~50 hours)',
    skills: ['Algebra', 'Quadratic Equations', 'Coordinate Geometry', 'Trigonometry'],
    verifiedProvider: true,
    providerType: 'open_learning'
  },
  {
    id: 'khan-calculus-foundations',
    name: 'Calculus 1 & Precalculus Foundations',
    provider: 'Khan Academy',
    educationLevels: ['higher_secondary', 'diploma'],
    category: 'Mathematics',
    difficulty: 'Intermediate',
    outcome: 'Comprehensive practice in differential calculus, limits, continuity, chain rule, and integral calculus applications for competitive examinations.',
    url: 'https://www.khanacademy.org/math/calculus-1',
    pricing: '100% Free',
    duration: 'Self-paced (~60 hours)',
    skills: ['Calculus', 'Limits', 'Derivatives', 'Definite Integrals'],
    verifiedProvider: true,
    providerType: 'open_learning'
  },
  {
    id: 'khan-statistics-probability',
    name: 'College Statistics and Probability',
    provider: 'Khan Academy',
    educationLevels: ['higher_secondary', 'btech', 'undergraduate_other', 'postgraduate_other'],
    category: 'Mathematics',
    difficulty: 'Intermediate',
    outcome: 'Learn probability rules, random variables, normal distributions, confidence intervals, hypothesis tests, and bivariate regression modeling.',
    url: 'https://www.khanacademy.org/math/statistics-probability',
    pricing: '100% Free',
    duration: 'Self-paced (~45 hours)',
    skills: ['Statistics', 'Probability', 'Hypothesis Testing', 'Regression Analysis'],
    verifiedProvider: true,
    providerType: 'open_learning'
  },

  // =========================================================================
  // 5. SWAYAM & NCERT
  // =========================================================================
  {
    id: 'swayam-secondary-science',
    name: 'Secondary Science: Physics, Chemistry & Biology',
    provider: 'SWAYAM (NCERT)',
    educationLevels: ['middle_school', 'secondary_school'],
    category: 'Science',
    difficulty: 'Intermediate',
    outcome: 'Standard Indian national curriculum covering Newton’s laws of motion, periodic chemical classification, and biological cellular processes.',
    url: 'https://swayam.gov.in',
    pricing: '100% Free',
    duration: '24 weeks',
    skills: ['Physics', 'Chemistry', 'Biology', 'Scientific Inquiry'],
    verifiedProvider: true,
    providerType: 'university'
  },
  {
    id: 'swayam-senior-sec-physics',
    name: 'Senior Secondary Physics (Class 11 & 12)',
    provider: 'SWAYAM (NCERT)',
    educationLevels: ['higher_secondary'],
    category: 'Physics',
    difficulty: 'Intermediate',
    outcome: 'Conceptual mastery of kinematics, rotational dynamics, thermodynamics, electrostatics, electromagnetic induction, and modern physics.',
    url: 'https://swayam.gov.in',
    pricing: '100% Free',
    duration: '24 weeks',
    skills: ['Kinematics', 'Thermodynamics', 'Electromagnetism', 'Optics'],
    verifiedProvider: true,
    providerType: 'university'
  },
  {
    id: 'swayam-senior-sec-accountancy',
    name: 'Higher Secondary Accountancy and Financial Records',
    provider: 'SWAYAM (NCERT)',
    educationLevels: ['higher_secondary', 'undergraduate_other'],
    category: 'Commerce',
    difficulty: 'Intermediate',
    outcome: 'Master double-entry bookkeeping, trial balance preparation, partnership firm accounts, and corporate financial statements.',
    url: 'https://swayam.gov.in',
    pricing: '100% Free',
    duration: '24 weeks',
    skills: ['Accounting', 'Financial Statements', 'Bookkeeping', 'Balance Sheet Analysis'],
    verifiedProvider: true,
    providerType: 'university'
  },

  // =========================================================================
  // 6. STANFORD ONLINE / COURSERA
  // =========================================================================
  {
    id: 'coursera-ml-andrew-ng',
    name: 'Machine Learning Specialization by Andrew Ng',
    provider: 'Coursera (DeepLearning.AI / Stanford)',
    educationLevels: ['btech', 'mtech', 'undergraduate_other', 'postgraduate_other'],
    category: 'Artificial Intelligence',
    difficulty: 'Intermediate',
    outcome: 'Learn foundational machine learning concepts from Andrew Ng: linear regression, logistic classification, neural networks, decision trees, and recommender systems.',
    url: 'https://www.coursera.org/specializations/machine-learning-introduction',
    pricing: 'Free to Audit',
    duration: '3 months (10 hrs/week)',
    skills: ['Machine Learning', 'Python', 'NumPy', 'TensorFlow', 'Neural Networks'],
    verifiedProvider: true,
    providerType: 'university'
  },
  {
    id: 'coursera-algorithms-stanford',
    name: 'Algorithms Specialization by Tim Roughgarden',
    provider: 'Coursera (Stanford Online)',
    educationLevels: ['btech', 'mtech', 'undergraduate_other'],
    category: 'Computer Science',
    difficulty: 'Intermediate',
    outcome: 'Deep algorithm foundations: divide and conquer, Master method, randomized algorithms, graph search, shortest paths, and NP-complete reductions.',
    url: 'https://www.coursera.org/specializations/algorithms',
    pricing: 'Free to Audit',
    duration: '4 months (4 hrs/week)',
    skills: ['Algorithms', 'Divide and Conquer', 'Graph Search', 'Greedy Algorithms', 'Dynamic Programming'],
    verifiedProvider: true,
    providerType: 'university'
  },
  {
    id: 'coursera-wharton-business',
    name: 'Business Foundations Specialization',
    provider: 'Coursera (Wharton School)',
    educationLevels: ['undergraduate_other', 'postgraduate_other', 'btech'],
    category: 'Business & Management',
    difficulty: 'Beginner',
    outcome: 'Foundational business acumen across financial accounting, corporate finance, marketing essentials, and operations management.',
    url: 'https://www.coursera.org/specializations/wharton-business-foundations',
    pricing: 'Free to Audit',
    duration: '6 months (3 hrs/week)',
    skills: ['Financial Accounting', 'Corporate Finance', 'Marketing Strategy', 'Operations Management'],
    verifiedProvider: true,
    providerType: 'university'
  },

  // =========================================================================
  // 7. GOOGLE CLOUD & GOOGLE CAREER CERTIFICATES
  // =========================================================================
  {
    id: 'google-it-support',
    name: 'Google IT Support Professional Certificate',
    provider: 'Google Career Certificates (Coursera)',
    educationLevels: ['diploma', 'undergraduate_other', 'btech'],
    category: 'Information Technology',
    difficulty: 'Beginner',
    outcome: 'Hands-on training in computer networking, operating systems, system administration, IT security defense, and technical troubleshooting.',
    url: 'https://grow.google/certificates/it-support/',
    pricing: 'Free to Audit',
    duration: '3–6 months (5–10 hrs/week)',
    skills: ['IT Support', 'Computer Networking', 'Linux & Windows OS', 'System Administration'],
    verifiedProvider: true,
    providerType: 'industry'
  },
  {
    id: 'google-cloud-foundations',
    name: 'Google Cloud Computing Foundations',
    provider: 'Google Cloud Skills Boost',
    educationLevels: ['btech', 'diploma', 'undergraduate_other'],
    category: 'Cloud Computing',
    difficulty: 'Beginner',
    outcome: 'Fundamental introduction to cloud concepts, virtualization, Google Compute Engine, Cloud Storage, BigQuery, and IAM access controls.',
    url: 'https://www.cloudskillsboost.google/',
    pricing: '100% Free',
    duration: 'Self-paced (~20 hours)',
    skills: ['Google Cloud', 'Compute Engine', 'Cloud Storage', 'BigQuery', 'IAM Security'],
    verifiedProvider: true,
    providerType: 'industry'
  },

  // =========================================================================
  // 8. FREECODECAMP
  // =========================================================================
  {
    id: 'fcc-scientific-python',
    name: 'Scientific Computing with Python Certification',
    provider: 'freeCodeCamp',
    educationLevels: ['higher_secondary', 'diploma', 'btech', 'undergraduate_other'],
    category: 'Computer Science',
    difficulty: 'Beginner',
    outcome: 'Learn Python fundamentals, data structures, algorithms, and complete 5 practical programming certification projects verified by test suites.',
    url: 'https://www.freecodecamp.org/learn/scientific-computing-with-python/',
    pricing: '100% Free',
    duration: 'Self-paced (~300 hours)',
    skills: ['Python', 'Data Structures', 'Algorithm Implementation', 'String Parsing'],
    verifiedProvider: true,
    providerType: 'open_learning'
  },
  {
    id: 'fcc-responsive-web',
    name: 'Responsive Web Design Certification',
    provider: 'freeCodeCamp',
    educationLevels: ['secondary_school', 'higher_secondary', 'diploma', 'btech', 'undergraduate_other'],
    category: 'Web Development',
    difficulty: 'Beginner',
    outcome: 'Learn HTML5 for content, CSS3 for styling, Flexbox, CSS Grid, and media queries to build beautiful responsive web layouts.',
    url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
    pricing: '100% Free',
    duration: 'Self-paced (~300 hours)',
    skills: ['HTML5', 'CSS3', 'Flexbox', 'CSS Grid', 'Responsive Design'],
    verifiedProvider: true,
    providerType: 'open_learning'
  },

  // =========================================================================
  // 9. CISCO NETWORKING ACADEMY
  // =========================================================================
  {
    id: 'cisco-python-essentials-1',
    name: 'Python Essentials 1 (Programming Foundations)',
    provider: 'Cisco Networking Academy',
    educationLevels: ['higher_secondary', 'diploma', 'btech', 'undergraduate_other'],
    category: 'Computer Science',
    difficulty: 'Beginner',
    outcome: 'Learn foundational programming logic in Python: data types, conditionals, iteration loops, functions, lists, and exception handling.',
    url: 'https://www.netacad.com/courses/programming/pcap-programming-essentials-python',
    pricing: '100% Free',
    duration: 'Self-paced (~30 hours)',
    skills: ['Python Syntax', 'Control Flow', 'Functions', 'List Comprehensions'],
    verifiedProvider: true,
    providerType: 'industry'
  },
  {
    id: 'cisco-intro-cybersecurity',
    name: 'Introduction to Cybersecurity & Threat Defense',
    provider: 'Cisco Networking Academy',
    educationLevels: ['diploma', 'undergraduate_other', 'btech', 'other'],
    category: 'Cybersecurity',
    difficulty: 'Beginner',
    outcome: 'Understand personal digital safety, network vulnerabilities, malware types, encryption principles, and corporate security protocols.',
    url: 'https://www.netacad.com/courses/cybersecurity/introduction-cybersecurity',
    pricing: '100% Free',
    duration: 'Self-paced (~15 hours)',
    skills: ['Cybersecurity', 'Network Defense', 'Threat Analysis', 'Data Privacy'],
    verifiedProvider: true,
    providerType: 'industry'
  },
  {
    id: 'cisco-it-hardware-basics',
    name: 'Computer Hardware Basics and Operating Systems',
    provider: 'Cisco Networking Academy',
    educationLevels: ['diploma', 'undergraduate_other'],
    category: 'Information Technology',
    difficulty: 'Beginner',
    outcome: 'Practical overview of PC component assembly, storage interfaces, operating system configuration, and preventative diagnostic maintenance.',
    url: 'https://www.netacad.com/courses/os-it/hardware-basics',
    pricing: '100% Free',
    duration: 'Self-paced (~20 hours)',
    skills: ['Hardware Diagnostics', 'PC Architecture', 'OS Installation', 'Device Drivers'],
    verifiedProvider: true,
    providerType: 'industry'
  },

  // =========================================================================
  // 10. MICROSOFT LEARN & IBM SKILLSBUILD
  // =========================================================================
  {
    id: 'ms-azure-fundamentals',
    name: 'Microsoft Azure Fundamentals (AZ-900 Learning Path)',
    provider: 'Microsoft Learn',
    educationLevels: ['btech', 'undergraduate_other', 'mtech'],
    category: 'Cloud Computing',
    difficulty: 'Beginner',
    outcome: 'Official Microsoft curriculum on cloud architecture, core Azure services, virtual networks, identity governance, and cost management.',
    url: 'https://learn.microsoft.com/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/',
    pricing: '100% Free',
    duration: 'Self-paced (~10 hours)',
    skills: ['Azure Cloud', 'Virtual Machines', 'Cloud Security', 'Azure Resource Manager'],
    verifiedProvider: true,
    providerType: 'industry'
  },
  {
    id: 'ibm-ml-foundations',
    name: 'Machine Learning & AI Foundations',
    provider: 'IBM SkillsBuild',
    educationLevels: ['btech', 'undergraduate_other', 'mtech'],
    category: 'Artificial Intelligence',
    difficulty: 'Intermediate',
    outcome: 'Covers supervised & unsupervised modeling, regression algorithms, decision tree classifiers, cross-validation metrics, and ethical AI stewardship.',
    url: 'https://skillsbuild.org/students/course-catalog',
    pricing: '100% Free',
    duration: 'Self-paced (~12 hours)',
    skills: ['Machine Learning', 'Model Evaluation', 'Regression', 'Classification', 'AI Ethics'],
    verifiedProvider: true,
    providerType: 'industry'
  }
];

// -------------------------------------------------------------
// Preferences LocalStorage Persistence
// -------------------------------------------------------------
const PREFERENCES_STORAGE_KEY = 'edupredict_course_preferences';

export function loadUserCoursePreferences(): CoursePreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        targetSkills: Array.isArray(parsed.targetSkills) ? parsed.targetSkills : DEFAULT_COURSE_PREFERENCES.targetSkills,
        preferredDuration: parsed.preferredDuration || DEFAULT_COURSE_PREFERENCES.preferredDuration,
        preferredProviderType: parsed.preferredProviderType || DEFAULT_COURSE_PREFERENCES.preferredProviderType,
        learningGoal: parsed.learningGoal || DEFAULT_COURSE_PREFERENCES.learningGoal,
        focusSubjects: Array.isArray(parsed.focusSubjects) ? parsed.focusSubjects : DEFAULT_COURSE_PREFERENCES.focusSubjects
      };
    }
  } catch (err) {
    console.warn('Error reading course preferences from storage:', err);
  }
  return DEFAULT_COURSE_PREFERENCES;
}

export function saveUserCoursePreferences(prefs: CoursePreferences): void {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.warn('Error saving course preferences to storage:', err);
  }
}

// -------------------------------------------------------------
// Personalization Algorithm
// -------------------------------------------------------------
export interface PersonalizationOptions {
  educationLevel?: string;
  courseDegree?: string;
  weakSubjects?: Array<{ name: string; percentage: number; difficult_topics?: string[] }>;
  preferences?: CoursePreferences;
  limit?: number;
}

export function getPersonalizedCourses(options: PersonalizationOptions = {}): VerifiedCourse[] {
  const {
    educationLevel = 'btech',
    courseDegree = '',
    weakSubjects = [],
    preferences = loadUserCoursePreferences(),
    limit = 3
  } = options;

  const userEduLevel = (educationLevel || 'btech') as EducationLevelId;

  // Score each course based on real matching evidence
  const scoredCourses = VERIFIED_COURSES.map((course) => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Education level alignment (+25 points)
    const matchesEduLevel = course.educationLevels.includes(userEduLevel);
    if (matchesEduLevel) {
      score += 25;
    }

    // 2. Direct Weak Subject Alignment (+40 points) - HIGH PRIORITY
    // Checks if course matches a subject where the student is scoring < 60%
    if (weakSubjects.length > 0) {
      for (const weak of weakSubjects) {
        const weakName = weak.name.toLowerCase();
        const courseName = course.name.toLowerCase();
        const courseCat = course.category.toLowerCase();
        const courseOutcome = course.outcome.toLowerCase();

        const isMatch =
          courseName.includes(weakName) ||
          courseCat.includes(weakName) ||
          courseOutcome.includes(weakName) ||
          (weak.difficult_topics &&
            weak.difficult_topics.some((dt) =>
              courseOutcome.toLowerCase().includes(dt.toLowerCase()) ||
              course.skills?.some((s) => s.toLowerCase().includes(dt.toLowerCase()))
            ));

        if (isMatch) {
          score += 45;
          reasons.push(`Targeted intervention for weak subject: ${weak.name} (${weak.percentage}%)`);
          break;
        }
      }
    }

    // 3. User Target Skills Match (+20 points)
    if (preferences.targetSkills && preferences.targetSkills.length > 0) {
      const matchedSkill = preferences.targetSkills.find((prefSkill) => {
        const pSkill = prefSkill.toLowerCase();
        return (
          course.category.toLowerCase().includes(pSkill) ||
          course.skills?.some((s) => s.toLowerCase().includes(pSkill)) ||
          course.name.toLowerCase().includes(pSkill)
        );
      });

      if (matchedSkill) {
        score += 25;
        reasons.push(`Aligns with your target skill: ${matchedSkill}`);
      }
    }

    // 4. Focus Subject Match (+15 points)
    if (preferences.focusSubjects && preferences.focusSubjects.length > 0) {
      const matchedSubject = preferences.focusSubjects.find((fSub) =>
        course.category.toLowerCase() === fSub.toLowerCase()
      );
      if (matchedSubject) {
        score += 15;
      }
    }

    // 5. Degree / Curriculum context match (+15 points)
    if (courseDegree) {
      const deg = courseDegree.toLowerCase();
      if (
        (deg.includes('computer') || deg.includes('cse') || deg.includes('information')) &&
        (course.category === 'Computer Science' || course.category === 'Artificial Intelligence' || course.category === 'Web Development')
      ) {
        score += 15;
        if (reasons.length === 0) {
          reasons.push(`Recommended for your ${courseDegree} curriculum`);
        }
      } else if (deg.includes('electrical') && course.category === 'Electrical Engineering') {
        score += 20;
        if (reasons.length === 0) {
          reasons.push(`Core curriculum course for ${courseDegree}`);
        }
      } else if (deg.includes('mechanical') && course.category === 'Mechanical Engineering') {
        score += 20;
        if (reasons.length === 0) {
          reasons.push(`Core curriculum course for ${courseDegree}`);
        }
      }
    }

    // 6. Provider type preference filter/boost (+10 points)
    if (preferences.preferredProviderType !== 'all') {
      if (
        (preferences.preferredProviderType === 'university' && course.providerType === 'university') ||
        (preferences.preferredProviderType === 'tech_industry' && course.providerType === 'industry')
      ) {
        score += 10;
      }
    }

    // Determine final match reason transparently
    let finalReason = '';
    if (reasons.length > 0) {
      finalReason = reasons[0];
    } else if (matchesEduLevel) {
      finalReason = `Foundational curriculum course for your educational stage`;
    } else {
      finalReason = `Broad open-access foundational course`;
    }

    return {
      course: {
        ...course,
        matchReason: finalReason
      },
      score
    };
  });

  // Sort descending by calculated score
  scoredCourses.sort((a, b) => b.score - a.score);

  return scoredCourses.slice(0, limit).map((item) => item.course);
}

export function getCoursesForLevel(levelId: EducationLevelId): VerifiedCourse[] {
  return VERIFIED_COURSES.filter((course) => course.educationLevels.includes(levelId));
}

export function getRecommendedCoursesForWeaknesses(
  levelId: EducationLevelId,
  weaknesses: string[]
): VerifiedCourse[] {
  return getPersonalizedCourses({
    educationLevel: levelId,
    weakSubjects: weaknesses.map((w) => ({ name: w, percentage: 50 }))
  });
}
