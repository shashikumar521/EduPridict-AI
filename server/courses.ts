export interface VerifiedCourse {
  id: string;
  name: string;
  provider: string;
  educationLevels: string[];
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  outcome: string;
  url: string;
  pricing: '100% Free' | 'Free to Audit' | 'Free Official Courseware';
}

export const VERIFIED_COURSES: VerifiedCourse[] = [
  // --- SCHOOL COURSES (Primary, Middle, Secondary) ---
  {
    id: 'khan-math-foundations',
    name: 'Early & Middle School Mathematics Foundations',
    provider: 'Khan Academy',
    educationLevels: ['primary_school', 'middle_school'],
    category: 'Mathematics',
    difficulty: 'Beginner',
    outcome: 'Master foundational arithmetic, fractions, decimals, and basic geometry through interactive practice.',
    url: 'https://www.khanacademy.org/math',
    pricing: '100% Free'
  },
  {
    id: 'khan-algebra-geometry',
    name: 'Class 9 & 10 Mathematics & Linear Algebra',
    provider: 'Khan Academy',
    educationLevels: ['secondary_school'],
    category: 'Mathematics',
    difficulty: 'Intermediate',
    outcome: 'Build confidence in quadratic equations, coordinate geometry, trigonometry, and surface areas.',
    url: 'https://www.khanacademy.org/math/in-in-grade-10-ncert',
    pricing: '100% Free'
  },
  {
    id: 'khan-high-school-science',
    name: 'Secondary Science: Physics, Chemistry & Biology',
    provider: 'Khan Academy',
    educationLevels: ['middle_school', 'secondary_school'],
    category: 'Science',
    difficulty: 'Intermediate',
    outcome: 'Understand Newton’s laws, chemical reactions, periodic table trends, and cell biology.',
    url: 'https://www.khanacademy.org/science',
    pricing: '100% Free'
  },
  {
    id: 'swayam-secondary-english',
    name: 'Secondary English Communication and Writing Skills',
    provider: 'SWAYAM (NCERT)',
    educationLevels: ['middle_school', 'secondary_school'],
    category: 'Language & Communication',
    difficulty: 'Beginner',
    outcome: 'Strengthen reading comprehension, formal essay writing, and grammar fundamentals.',
    url: 'https://swayam.gov.in',
    pricing: '100% Free'
  },

  // --- HIGHER SECONDARY / INTERMEDIATE (Classes 11–12) ---
  {
    id: 'khan-calculus-foundations',
    name: 'Calculus 1 & Precalculus Foundations',
    provider: 'Khan Academy',
    educationLevels: ['higher_secondary', 'diploma'],
    category: 'Mathematics',
    difficulty: 'Intermediate',
    outcome: 'Master differentiation, limits, continuity, and integral calculus applications for competitive exams.',
    url: 'https://www.khanacademy.org/math/calculus-1',
    pricing: '100% Free'
  },
  {
    id: 'swayam-senior-sec-physics',
    name: 'Senior Secondary Physics (Class 11 & 12)',
    provider: 'SWAYAM (NCERT)',
    educationLevels: ['higher_secondary'],
    category: 'Physics',
    difficulty: 'Intermediate',
    outcome: 'Comprehensive conceptual understanding of kinematics, thermodynamics, electromagnetism, and optics.',
    url: 'https://swayam.gov.in',
    pricing: '100% Free'
  },
  {
    id: 'swayam-senior-sec-accountancy',
    name: 'Higher Secondary Accountancy and Financial Records',
    provider: 'SWAYAM (NCERT)',
    educationLevels: ['higher_secondary'],
    category: 'Commerce',
    difficulty: 'Intermediate',
    outcome: 'Learn double-entry bookkeeping, partnership accounts, and company financial statements.',
    url: 'https://swayam.gov.in',
    pricing: '100% Free'
  },
  {
    id: 'cisco-python-essentials-1',
    name: 'Python Essentials 1 (Programming Foundations)',
    provider: 'Cisco Networking Academy',
    educationLevels: ['higher_secondary', 'diploma', 'btech', 'undergraduate_other'],
    category: 'Computer Science',
    difficulty: 'Beginner',
    outcome: 'Learn foundational Python syntax, conditional logic, loops, functions, and algorithmic thinking.',
    url: 'https://www.netacad.com/courses/programming/pcap-programming-essentials-python',
    pricing: '100% Free'
  },

  // --- DIPLOMA & UNDERGRADUATE TECHNICAL ---
  {
    id: 'nptel-basic-electrical',
    name: 'Basic Electrical Technology and Circuit Analysis',
    provider: 'NPTEL (IIT Kharagpur)',
    educationLevels: ['diploma', 'btech'],
    category: 'Electrical Engineering',
    difficulty: 'Intermediate',
    outcome: 'Analyze AC/DC circuits, three-phase power, transformers, and electrical machines with standard practice.',
    url: 'https://nptel.ac.in/courses/108105053',
    pricing: 'Free to Audit'
  },
  {
    id: 'nptel-engineering-mechanics',
    name: 'Engineering Mechanics: Statics and Dynamics',
    provider: 'NPTEL (IIT Madras)',
    educationLevels: ['diploma', 'btech'],
    category: 'Mechanical Engineering',
    difficulty: 'Intermediate',
    outcome: 'Solve equilibrium problems, friction, moments of inertia, and dynamic energy conservation equations.',
    url: 'https://nptel.ac.in/courses/112106286',
    pricing: 'Free to Audit'
  },
  {
    id: 'cisco-it-hardware-basics',
    name: 'Computer Hardware Basics and Operating Systems',
    provider: 'Cisco Networking Academy',
    educationLevels: ['diploma', 'undergraduate_other'],
    category: 'Information Technology',
    difficulty: 'Beginner',
    outcome: 'Hands-on troubleshooting of computer hardware, peripherals, operating system installation, and networks.',
    url: 'https://www.netacad.com/courses/os-it/hardware-basics',
    pricing: '100% Free'
  },

  // --- B.TECH / B.E. & UNDERGRADUATE DEGREES ---
  {
    id: 'nptel-dsa-python',
    name: 'Programming, Data Structures and Algorithms in Python',
    provider: 'NPTEL (IIT Madras)',
    educationLevels: ['btech', 'undergraduate_other', 'diploma'],
    category: 'Computer Science',
    difficulty: 'Intermediate',
    outcome: 'Implement linked lists, trees, heaps, graph traversals, and dynamic programming algorithms.',
    url: 'https://nptel.ac.in/courses/106106145',
    pricing: 'Free to Audit'
  },
  {
    id: 'nptel-dbms-iitkgp',
    name: 'Database Management Systems (DBMS)',
    provider: 'NPTEL (IIT Kharagpur)',
    educationLevels: ['btech', 'undergraduate_other', 'postgraduate_other'],
    category: 'Computer Science',
    difficulty: 'Intermediate',
    outcome: 'Design relational schemas, write complex SQL queries, and implement indexing, normalization, and ACID transactions.',
    url: 'https://nptel.ac.in/courses/106105175',
    pricing: 'Free to Audit'
  },
  {
    id: 'ms-azure-fundamentals',
    name: 'Microsoft Azure Fundamentals (AZ-900 Learning Path)',
    provider: 'Microsoft Learn',
    educationLevels: ['btech', 'undergraduate_other', 'mtech'],
    category: 'Cloud Computing',
    difficulty: 'Beginner',
    outcome: 'Understand core cloud architecture concepts, virtual machines, networking, security, and governance.',
    url: 'https://learn.microsoft.com/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/',
    pricing: '100% Free'
  },
  {
    id: 'ibm-ml-foundations',
    name: 'Machine Learning & AI Foundations',
    provider: 'IBM SkillsBuild',
    educationLevels: ['btech', 'undergraduate_other', 'mtech'],
    category: 'Artificial Intelligence',
    difficulty: 'Intermediate',
    outcome: 'Learn supervised & unsupervised modeling, regression, decision trees, and model evaluation metrics.',
    url: 'https://skillsbuild.org/students/course-catalog',
    pricing: '100% Free'
  },
  {
    id: 'coursera-ml-specialization',
    name: 'Machine Learning Specialization by Andrew Ng',
    provider: 'Coursera (DeepLearning.AI / Stanford)',
    educationLevels: ['btech', 'mtech', 'undergraduate_other'],
    category: 'Artificial Intelligence',
    difficulty: 'Intermediate',
    outcome: 'Implement logistic regression, neural networks, decision trees, and recommender systems with NumPy & TensorFlow.',
    url: 'https://www.coursera.org/specializations/machine-learning-introduction',
    pricing: 'Free to Audit'
  },

  // --- POSTGRADUATE M.TECH / M.E. & RESEARCH ---
  {
    id: 'nptel-deep-learning-iitm',
    name: 'Deep Learning and Neural Network Architectures',
    provider: 'NPTEL (IIT Ropar / IIT Madras)',
    educationLevels: ['mtech', 'btech', 'postgraduate_other'],
    category: 'Artificial Intelligence',
    difficulty: 'Advanced',
    outcome: 'Design CNNs, RNNs, attention mechanisms, and Transformers for computer vision and sequence modeling.',
    url: 'https://nptel.ac.in/courses/106106184',
    pricing: 'Free to Audit'
  },
  {
    id: 'edx-cs50-ai',
    name: 'CS50’s Introduction to Artificial Intelligence with Python',
    provider: 'edX (Harvard University)',
    educationLevels: ['mtech', 'btech', 'postgraduate_other'],
    category: 'Computer Science',
    difficulty: 'Advanced',
    outcome: 'Master search algorithms, knowledge representation, Bayesian networks, and reinforcement learning.',
    url: 'https://www.edx.org/learn/artificial-intelligence/harvard-university-cs50-s-introduction-to-artificial-intelligence-with-python',
    pricing: 'Free to Audit'
  },
  {
    id: 'nptel-research-methodology',
    name: 'Introduction to Research Methodology & Technical Writing',
    provider: 'NPTEL (IIT Madras)',
    educationLevels: ['mtech', 'postgraduate_other'],
    category: 'Research & Academia',
    difficulty: 'Advanced',
    outcome: 'Formulate research hypotheses, conduct rigorous literature reviews, design experiments, and draft peer-reviewed papers.',
    url: 'https://nptel.ac.in/courses/121106007',
    pricing: 'Free to Audit'
  },

  // --- OTHER UNDERGRADUATE & POSTGRADUATE (B.Sc., BCA, B.Com, MBA, MCA) ---
  {
    id: 'coursera-wharton-business',
    name: 'Business Foundations Specialization',
    provider: 'Coursera (Wharton School)',
    educationLevels: ['undergraduate_other', 'postgraduate_other'],
    category: 'Business & Management',
    difficulty: 'Beginner',
    outcome: 'Gain foundational acumen in corporate finance, financial accounting, marketing, and operations management.',
    url: 'https://www.coursera.org/specializations/wharton-business-foundations',
    pricing: 'Free to Audit'
  },
  {
    id: 'khan-statistics-probability',
    name: 'College Statistics and Probability',
    provider: 'Khan Academy',
    educationLevels: ['undergraduate_other', 'btech', 'postgraduate_other'],
    category: 'Mathematics',
    difficulty: 'Intermediate',
    outcome: 'Master probability distributions, hypothesis testing, confidence intervals, and regression analysis.',
    url: 'https://www.khanacademy.org/math/statistics-probability',
    pricing: '100% Free'
  },
  {
    id: 'cisco-intro-cybersecurity',
    name: 'Introduction to Cybersecurity & Threat Defense',
    provider: 'Cisco Networking Academy',
    educationLevels: ['diploma', 'undergraduate_other', 'btech', 'other'],
    category: 'Cybersecurity',
    difficulty: 'Beginner',
    outcome: 'Understand personal data privacy, common security exploits, malware defense, and enterprise safety.',
    url: 'https://www.netacad.com/courses/cybersecurity/introduction-cybersecurity',
    pricing: '100% Free'
  },
  {
    id: 'edx-mit-computational-thinking',
    name: 'Introduction to Computational Thinking and Data Science',
    provider: 'edX (MITx)',
    educationLevels: ['undergraduate_other', 'btech', 'postgraduate_other', 'other'],
    category: 'Data Science',
    difficulty: 'Intermediate',
    outcome: 'Apply computational problem solving, Monte Carlo simulations, and data modeling in Python.',
    url: 'https://www.edx.org/learn/computer-science/massachusetts-institute-of-technology-introduction-to-computational-thinking-and-data-science',
    pricing: 'Free to Audit'
  }
];

export function getCoursesForEducationLevel(levelId: string): VerifiedCourse[] {
  return VERIFIED_COURSES.filter((c) => c.educationLevels.includes(levelId));
}
