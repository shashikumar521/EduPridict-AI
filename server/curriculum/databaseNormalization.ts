import { TopicLearningModule } from '../learnPractice';

export const DATABASE_NORMALIZATION_MODULE: TopicLearningModule = {
  topic: 'database normalization',
  topicTitle: 'Database Normalization (1NF, 2NF, 3NF, BCNF)',
  source: 'verified_bank',
  theory: {
    title: 'Database Normalization (1NF, 2NF, 3NF, BCNF)',
    introduction: 'Database Normalization is the systematic process of organizing fields and tables in a relational database management system (RDBMS) to minimize data redundancy and eliminate anomalies during data modification (Insert, Update, and Delete anomalies). Developed by Edgar F. Codd, it decomposes relations based on Functional Dependencies (FDs) while preserving dependencies and lossless-join properties.',
    fundamental_concepts: [
      {
        title: 'Modification Anomalies (Insert, Update, Delete)',
        explanation: 'Unnormalized tables suffer from Insertion Anomalies (cannot record certain facts without adding unrelated attributes), Update Anomalies (inconsistent records when a shared attribute is updated in some tuples but not all), and Deletion Anomalies (unintended loss of critical information when deleting a tuple).'
      },
      {
        title: 'Functional Dependency (FD) & Candidate Keys',
        explanation: 'An FD denoted X -> Y asserts that value of attribute set X uniquely determines value of attribute set Y. A Candidate Key is a minimal superkey that functionally determines every attribute in the relation.'
      },
      {
        title: 'Normal Forms Hierarchy (1NF, 2NF, 3NF, BCNF)',
        explanation: '1NF: Atomic values only, no repeating groups. 2NF: In 1NF and no partial dependencies (every non-prime attribute is fully functionally dependent on every candidate key). 3NF: In 2NF and no transitive dependencies (for every non-trivial X -> Y, X is superkey or Y is prime attribute). BCNF: For every non-trivial X -> Y, X must strictly be a superkey.'
      },
      {
        title: 'Lossless Join & Dependency Preservation',
        explanation: 'A decomposition is Lossless Join if joining the decomposed tables via natural join reconstructs the original relation with zero spurious tuples. Dependency Preservation ensures all original FDs can be verified without computing cross-table joins.'
      }
    ],
    definitions: [
      {
        term: 'Prime Attribute',
        definition: 'An attribute that is a member of at least one candidate key for the relation.'
      },
      {
        term: 'Partial Dependency',
        definition: 'A functional dependency where a non-prime attribute is determined by a strict subset of a composite candidate key.'
      },
      {
        term: 'Transitive Dependency',
        definition: 'A functional dependency X -> Z that exists via an intermediate non-prime attribute Y (i.e. X -> Y and Y -> Z where Y does not determine X).'
      },
      {
        term: 'Boyce-Codd Normal Form (BCNF)',
        definition: 'A stricter version of 3NF where for EVERY functional dependency X -> Y, X must be a superkey of the relation.'
      }
    ],
    detailed_explanations: [
      {
        heading: 'Decomposition from 1NF to 3NF and BCNF',
        body: 'To eliminate partial dependencies in 2NF, separate the partial dependency attributes into a new relation keyed by the offending subset. To eliminate transitive dependencies in 3NF, create a new relation whose primary key is the determinant of the transitive dependency.',
        codeOrFormula: `R(A, B, C, D) with FDs: {A, B} -> C, B -> D\nCandidate Key: {A, B}\nViolation: B -> D is a partial dependency!\nDecompose into: R1(A, B, C) and R2(B, D)`
      },
      {
        heading: 'Armstrong\'s Axioms for Functional Dependencies',
        body: 'Sound and complete rules for deriving all implied functional dependencies from a given set F: Reflexivity (if Y subset of X, then X -> Y), Augmentation (if X -> Y, then XZ -> YZ), Transitivity (if X -> Y and Y -> Z, then X -> Z).',
        codeOrFormula: `Closure of attribute set X under F (denoted X+) computes all attributes functionally determined by X.`
      }
    ],
    step_by_step_examples: [
      {
        problem: 'Given Relation R(StudentID, CourseID, StudentName, CourseInstructor) with FDs: StudentID -> StudentName, CourseID -> CourseInstructor, determine the highest normal form.',
        steps: [
          'Step 1: Compute candidate key: {StudentID, CourseID} is needed to determine all attributes.',
          'Step 2: Check 1NF: All attributes are atomic -> Satisfies 1NF.',
          'Step 3: Check 2NF: Candidate key is composite {StudentID, CourseID}. Non-prime attribute StudentName depends only on StudentID (a proper subset).',
          'Step 4: Identify violation: StudentID -> StudentName is a Partial Dependency. Thus, R violates 2NF.'
        ],
        solution: 'The relation is in 1NF only. Decompose into R1(StudentID, StudentName), R2(CourseID, CourseInstructor), and R3(StudentID, CourseID) for 2NF/3NF/BCNF.'
      }
    ],
    applications: [
      'Enterprise relational database schema design (PostgreSQL, MySQL, Oracle, SQL Server)',
      'E-commerce order processing systems requiring high ACID integrity and zero duplicate data',
      'Banking transaction ledgers preventing update anomalies during balance calculations',
      'Healthcare and electronic medical record (EMR) databases enforcing compliance and referential integrity'
    ],
    common_mistakes: [
      {
        mistake: 'Confusing 3NF with BCNF.',
        correction: 'In 3NF, the right-hand side can be a prime attribute even if X is not a superkey. In BCNF, X must ALWAYS be a superkey without exception.'
      },
      {
        mistake: 'Over-normalizing read-heavy analytics databases.',
        correction: 'While 3NF/BCNF prevents anomalies in transactional OLTP systems, analytical data warehouses (OLAP) deliberately use denormalized star schemas to minimize expensive multi-table joins.'
      }
    ],
    revision_key_points: [
      '1NF = Atomic attributes; 2NF = No partial dependencies; 3NF = No transitive dependencies.',
      'BCNF decomposes any relation where the determinant of a functional dependency is not a superkey.',
      '3NF guarantees both Lossless Join AND Dependency Preservation; BCNF guarantees Lossless Join but may not preserve all dependencies.',
      'Closure of an attribute set X+ determines whether X is a candidate key.'
    ],
    resources: [
      {
        title: 'Stanford University CS145 Database Normalization Lecture',
        type: 'documentation',
        url: 'https://web.stanford.edu/class/cs145/',
        note: 'Comprehensive academic slides and proofs on functional dependencies and BCNF.'
      },
      {
        title: 'Database System Concepts (Silberschatz, Korth, Sudarshan)',
        type: 'documentation',
        url: 'https://db-book.com/',
        note: 'Definitive textbook chapter on relational design and normalization theory.'
      },
      {
        title: 'Database Normalization Explained (1NF, 2NF, 3NF, BCNF)',
        type: 'video_search',
        url: 'https://www.youtube.com/results?search_query=database+normalization+1NF+2NF+3NF+BCNF+full+course',
        note: 'Verified YouTube search for comprehensive video walkthroughs and solved exam problems.'
      }
    ]
  },
  questions: [
    {
      id: 1,
      question: 'What is the primary objective of Database Normalization?',
      options: [
        'To eliminate data redundancy and modification anomalies (insert, update, delete)',
        'To encrypt all tables using public key cryptography',
        'To speed up CPU clock speeds during sorting',
        'To increase the physical size of database backup files'
      ],
      correctAnswer: 0,
      explanation: 'Normalization reduces unwanted duplication and ensures data modifications do not produce inconsistencies or anomalies.',
      difficulty: 'Easy',
      category: 'Definition'
    },
    {
      id: 2,
      question: 'A table satisfies First Normal Form (1NF) if and only if:',
      options: [
        'Every attribute contains only atomic (indivisible) values and there are no repeating groups',
        'Every non-prime attribute depends on the primary key',
        'It has at least three foreign keys',
        'The table contains fewer than 100 rows'
      ],
      correctAnswer: 0,
      explanation: '1NF requires values to be atomic (no arrays or comma-separated lists) and no repeating column groups.',
      difficulty: 'Easy',
      category: 'Definition'
    },
    {
      id: 3,
      question: 'What constitutes an Update Anomaly in an unnormalized database?',
      options: [
        'Changing data in one place leaves duplicate records with conflicting, inconsistent values',
        'A SQL syntax error when executing UPDATE commands',
        'The database running out of disk space during updates',
        'When an update takes longer than 1 millisecond'
      ],
      correctAnswer: 0,
      explanation: 'If redundant data exists across multiple rows, updating one record while missing others causes data inconsistency.',
      difficulty: 'Easy',
      category: 'Conceptual'
    },
    {
      id: 4,
      question: 'What is a Candidate Key in a relational schema?',
      options: [
        'A minimal superkey that uniquely identifies each tuple in the relation',
        'Any column that contains integer numbers',
        'A key that can only be used during candidate job interviews',
        'The foreign key referencing an external table'
      ],
      correctAnswer: 0,
      explanation: 'A candidate key is a minimal set of attributes that uniquely identifies all tuples in the relation without redundant attributes.',
      difficulty: 'Easy',
      category: 'Definition'
    },
    {
      id: 5,
      question: 'Second Normal Form (2NF) is violated when which of the following dependencies exists?',
      options: ['Partial Dependency', 'Transitive Dependency', 'Trivial Dependency', 'Multi-valued Dependency'],
      correctAnswer: 0,
      explanation: '2NF requires relations to be in 1NF and have NO partial dependencies (non-prime attributes depending on a proper subset of candidate key).',
      difficulty: 'Easy',
      category: 'Fundamentals'
    },
    {
      id: 6,
      question: 'What is a Prime Attribute in normalization terminology?',
      options: [
        'An attribute that is part of ANY candidate key',
        'An attribute whose value is a prime number',
        'The first column listed in the CREATE TABLE statement',
        'An attribute that cannot be updated'
      ],
      correctAnswer: 0,
      explanation: 'An attribute is prime if it belongs to at least one candidate key of the relation.',
      difficulty: 'Easy',
      category: 'Definition'
    },
    {
      id: 7,
      question: 'Third Normal Form (3NF) strictly eliminates which type of dependency?',
      options: ['Transitive Dependency', 'Partial Dependency', 'Reflexive Dependency', 'Cyclic Dependency'],
      correctAnswer: 0,
      explanation: '3NF removes transitive dependencies (where a non-prime attribute depends on another non-prime attribute).',
      difficulty: 'Easy',
      category: 'Fundamentals'
    },
    {
      id: 8,
      question: 'What condition must hold for every non-trivial functional dependency X -> Y in Boyce-Codd Normal Form (BCNF)?',
      options: [
        'X must be a superkey of the relation',
        'Y must be a superkey of the relation',
        'X and Y must be identical',
        'Y must be a prime attribute'
      ],
      correctAnswer: 0,
      explanation: 'In BCNF, the determinant X must strictly be a superkey for every non-trivial dependency.',
      difficulty: 'Easy',
      category: 'Fundamentals'
    },
    {
      id: 9,
      question: 'If a relation has ONLY simple (single-attribute) candidate keys and is in 1NF, what can be concluded about 2NF?',
      options: [
        'It is automatically in 2NF',
        'It cannot be in 2NF',
        'It must also be in BCNF',
        'It violates 1NF'
      ],
      correctAnswer: 0,
      explanation: 'A partial dependency requires a proper subset of a composite candidate key. If all candidate keys are single attributes, no partial subsets exist, so 2NF holds automatically.',
      difficulty: 'Easy',
      category: 'Conceptual'
    },
    {
      id: 10,
      question: 'What is a Deletion Anomaly?',
      options: [
        'Deleting one piece of information unintentionally causes unrelated critical information to be lost',
        'When DELETE commands fail due to foreign key constraints',
        'Accidentally dropping the entire database schema',
        'Slow disk deletion speed'
      ],
      correctAnswer: 0,
      explanation: 'A deletion anomaly occurs when removing a fact causes the inadvertent loss of completely unrelated data stored in the same tuple.',
      difficulty: 'Easy',
      category: 'Definition'
    },
    {
      id: 11,
      question: 'Which of the following is an Armstrong Axiom stating: "If Y is a subset of X, then X -> Y"?',
      options: ['Reflexivity', 'Augmentation', 'Transitivity', 'Decomposition'],
      correctAnswer: 0,
      explanation: 'The axiom of Reflexivity states that any attribute set functionally determines its own subsets (trivial functional dependency).',
      difficulty: 'Medium',
      category: 'Fundamentals'
    },
    {
      id: 12,
      question: 'Given relation R(A, B, C) with FD: A -> B and B -> C, candidate key is A. Why does this violate 3NF?',
      options: [
        'Because A -> C is a transitive dependency mediated by non-prime attribute B',
        'Because the relation is not in 1NF',
        'Because B is a prime attribute',
        'Because C cannot be an integer'
      ],
      correctAnswer: 0,
      explanation: 'C depends on B, which depends on A. Since B is neither a superkey nor is C prime, B -> C is an illegal transitive dependency in 3NF.',
      difficulty: 'Medium',
      category: 'Problem-Solving'
    },
    {
      id: 13,
      question: 'What is a Lossless Join Decomposition?',
      options: [
        'Joining the decomposed relations via Natural Join guarantees reconstructing the original relation without spurious tuples',
        'A join that never consumes CPU cycles',
        'A join between two databases on different physical servers',
        'When foreign keys are omitted from relations'
      ],
      correctAnswer: 0,
      explanation: 'A decomposition is lossless if R1 natural join R2 equals original relation R without generating false/spurious rows.',
      difficulty: 'Medium',
      category: 'Definition'
    },
    {
      id: 14,
      question: 'What is the condition for decomposition of R into R1 and R2 to be lossless join with respect to functional dependencies F?',
      options: [
        '(R1 intersect R2) -> R1 OR (R1 intersect R2) -> R2',
        '(R1 union R2) -> R1',
        '(R1 intersect R2) must be empty',
        'R1 must contain twice as many columns as R2'
      ],
      correctAnswer: 0,
      explanation: 'The shared attributes between R1 and R2 must functionally determine at least one of the decomposed relations.',
      difficulty: 'Medium',
      category: 'Problem-Solving'
    },
    {
      id: 15,
      question: 'Which normal form guarantees BOTH Lossless Join AND Dependency Preservation always?',
      options: ['Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)', 'Fourth Normal Form (4NF)', 'Fifth Normal Form (5NF)'],
      correctAnswer: 0,
      explanation: 'A 3NF synthesis algorithm is guaranteed to produce a lossless join and dependency-preserving decomposition. BCNF cannot always preserve all FDs.',
      difficulty: 'Medium',
      category: 'Conceptual'
    },
    {
      id: 16,
      question: 'Given R(A, B, C, D) with FDs: {A -> B, B -> C, C -> D}. What is the closure of attribute A, denoted A+?',
      options: ['{A, B, C, D}', '{A, B}', '{A, B, C}', '{A}'],
      correctAnswer: 0,
      explanation: 'A -> B adds B. B -> C adds C. C -> D adds D. Thus A+ = {A, B, C, D}, making A a candidate key.',
      difficulty: 'Medium',
      category: 'Problem-Solving'
    },
    {
      id: 17,
      question: 'How does 3NF allow a functional dependency X -> Y where X is NOT a superkey?',
      options: [
        'Only if Y is a prime attribute (part of some candidate key)',
        'Only if Y contains duplicate values',
        'Only if X is null',
        '3NF never allows X to not be a superkey'
      ],
      correctAnswer: 0,
      explanation: '3NF permits non-superkey determinants X provided every attribute in Y is a prime attribute.',
      difficulty: 'Medium',
      category: 'Conceptual'
    },
    {
      id: 18,
      question: 'What is Fourth Normal Form (4NF) specifically designed to address?',
      options: [
        'Multi-Valued Dependencies (MVD)',
        'Partial Dependencies',
        'Transitive Dependencies',
        'Primary Key indexing'
      ],
      correctAnswer: 0,
      explanation: '4NF eliminates multi-valued dependencies (X ->-> Y) where independent multiple facts are stored about an entity.',
      difficulty: 'Medium',
      category: 'Definition'
    },
    {
      id: 19,
      question: 'In which scenario is deliberate Denormalization justified in production software engineering?',
      options: [
        'In read-heavy reporting / data warehousing (OLAP) to minimize expensive multi-table joins',
        'In banking OLTP transaction tables to save disk space',
        'When designing primary keys',
        'To bypass table access security permissions'
      ],
      correctAnswer: 0,
      explanation: 'Denormalization improves read throughput in analytical workloads by pre-joining tables into star/snowflake schemas.',
      difficulty: 'Medium',
      category: 'Application'
    },
    {
      id: 20,
      question: 'What is a Canonical Cover (or Minimal Cover) of a set of functional dependencies?',
      options: [
        'A minimal equivalent set of FDs with standard single right-hand attributes and zero redundant FDs or extraneous attributes',
        'An encryption key applied to table columns',
        'The total row count of the database',
        'The list of all indexes created on the database'
      ],
      correctAnswer: 0,
      explanation: 'A canonical cover Fc has no extraneous attributes, single attributes on RHS, and implies the same closures as original set F.',
      difficulty: 'Medium',
      category: 'Definition'
    },
    {
      id: 21,
      question: 'Given relation R(A, B, C) with candidate keys AB and AC, and FD: B -> C. Why is R in 3NF but NOT in BCNF?',
      options: [
        'Because C is a prime attribute (part of candidate key AC), satisfying 3NF, but B is not a superkey, violating BCNF',
        'Because R violates 1NF',
        'Because A is not a key',
        'Because B is a foreign key'
      ],
      correctAnswer: 0,
      explanation: 'In B -> C, C is prime (belongs to key AC) so 3NF is satisfied. However, B alone is not a superkey, violating BCNF.',
      difficulty: 'Hard',
      category: 'Problem-Solving'
    },
    {
      id: 22,
      question: 'What is Fifth Normal Form (5NF / Project-Join Normal Form) concerned with?',
      options: [
        'Join Dependencies that cannot be inferred from key constraints',
        'Replacing relational tables with graph databases',
        'Ensuring floating point precision',
        'Sorting rows alphabetically'
      ],
      correctAnswer: 0,
      explanation: '5NF deals with relations that can only be decomposed losslessly into 3 or more tables due to cyclic join dependencies.',
      difficulty: 'Hard',
      category: 'Advanced'
    },
    {
      id: 23,
      question: 'If decomposing a relation into BCNF does NOT preserve functional dependencies, how can the database enforce integrity?',
      options: [
        'By using cross-table database triggers or application transaction logic',
        'By disabling normalization entirely',
        'By restarting the database server daily',
        'By converting all primary keys to strings'
      ],
      correctAnswer: 0,
      explanation: 'When an FD spans decomposed BCNF tables, it cannot be checked simply with primary/unique constraints, requiring triggers or assertion checks.',
      difficulty: 'Hard',
      category: 'Application'
    },
    {
      id: 24,
      question: 'Given R(A, B, C, D, E) with FDs: A -> BC, CD -> E, B -> D, E -> A. How many candidate keys does R have?',
      options: ['1', '2', '3', '4'],
      correctAnswer: 3,
      explanation: 'Computing closures: A+ = {A,B,C,D,E}, E+ = {A,B,C,D,E}, CD+ = {A,B,C,D,E}, and BC+ = {B,C,D,E,A}. Thus A, E, CD, and BC are candidate keys (total 4).',
      difficulty: 'Hard',
      category: 'Problem-Solving'
    },
    {
      id: 25,
      question: 'What algorithm is used to test whether a decomposition is Lossless Join in polynomial time?',
      options: [
        'The Chase Algorithm (Tableau testing method)',
        'Dijkstra\'s Algorithm',
        'Prim\'s Minimum Spanning Tree Algorithm',
        'Breadth First Search'
      ],
      correctAnswer: 0,
      explanation: 'The Chase algorithm constructs a tableau matrix with alpha/beta symbols and applies FDs iteratively until an all-alpha row emerges.',
      difficulty: 'Hard',
      category: 'Advanced'
    },
    {
      id: 26,
      question: 'What does the Pseudo-transitivity rule in functional dependencies state?',
      options: [
        'If X -> Y and WY -> Z, then WX -> Z',
        'If X -> Y, then Y -> X',
        'If X -> Y, then X -> Z',
        'If X -> Y and Y -> Z, then Z -> X'
      ],
      correctAnswer: 0,
      explanation: 'By augmentation of X -> Y with W we get WX -> WY. Since WY -> Z, by transitivity WX -> Z.',
      difficulty: 'Hard',
      category: 'Advanced'
    },
    {
      id: 27,
      question: 'What is an Extraneous Attribute in a set of functional dependencies F?',
      options: [
        'An attribute whose removal from an FD does not change the closure of the functional dependency set F',
        'An attribute that contains null values',
        'An attribute that is not indexed',
        'A column added during table migration'
      ],
      correctAnswer: 0,
      explanation: 'An attribute is extraneous if removing it from the LHS or RHS of an FD yields an equivalent set of dependencies.',
      difficulty: 'Hard',
      category: 'Definition'
    },
    {
      id: 28,
      question: 'Why does 3NF synthesis algorithm guarantee a dependency-preserving, lossless decomposition in polynomial time?',
      options: [
        'By finding a minimal cover, creating a relation for each FD in the cover, and adding a candidate key relation if none exists',
        'By random partitioning of table columns',
        'By deleting all composite candidate keys',
        'By converting all numbers to strings'
      ],
      correctAnswer: 0,
      explanation: 'Bernstein\'s 3NF synthesis constructs relations directly from the canonical cover and includes a candidate key to ensure lossless join.',
      difficulty: 'Hard',
      category: 'Advanced'
    },
    {
      id: 29,
      question: 'Which of the following database anomalies occurs when inserting a new student cannot be completed because they have not yet enrolled in any course in a joint Student-Course table?',
      options: ['Insertion Anomaly', 'Update Anomaly', 'Deletion Anomaly', 'Deadlock Anomaly'],
      correctAnswer: 0,
      explanation: 'If CourseID is part of primary key, inserting a student without a course violates entity integrity (nulls in primary key), an Insertion Anomaly.',
      difficulty: 'Hard',
      category: 'Conceptual'
    },
    {
      id: 30,
      question: 'In a real-world high-traffic system (e.g. Amazon checkout), why is an unnormalized table dangerous during concurrent updates?',
      options: [
        'Race conditions and lost updates can produce conflicting state, causing orders to reference stale customer addresses or prices',
        'It causes the CPU clock frequency to desynchronize',
        'It prevents network cables from transmitting bits',
        'It disables database login authentication'
      ],
      correctAnswer: 0,
      explanation: 'Redundant attributes updated in parallel transactions create update anomalies where rows conflict, causing financial or shipping errors.',
      difficulty: 'Hard',
      category: 'Advanced'
    }
  ]
};
