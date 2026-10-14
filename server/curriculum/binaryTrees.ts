import { TopicLearningModule } from '../learnPractice';

export const BINARY_TREES_MODULE: TopicLearningModule = {
  topic: 'binary trees',
  topicTitle: 'Binary Trees & Tree Traversals',
  source: 'verified_bank',
  theory: {
    title: 'Binary Trees & Tree Traversals',
    introduction: 'A Binary Tree is a hierarchical non-linear data structure in which each node has at most two children, referred to as the left child and right child. It forms the backbone of file systems, database indexing (B/B+ trees), abstract syntax trees in compilers, and search algorithms.',
    fundamental_concepts: [
      {
        title: 'Node Anatomy & Pointer Linkage',
        explanation: 'Each binary tree node stores a data value alongside two pointers/references: left and right. If a node has no children, its left and right pointers are null (a leaf node). The topmost node is the root.'
      },
      {
        title: 'Tree Types (Full, Complete, Perfect, Balanced)',
        explanation: 'A Full Binary Tree requires every node to have 0 or 2 children. A Complete Binary Tree has all levels completely filled except possibly the last level, filled from left to right. A Perfect Binary Tree has all internal nodes with 2 children and all leaves at the same depth. A Balanced Tree (like AVL or Red-Black) maintains O(log n) height.'
      },
      {
        title: 'Depth-First Traversals (Inorder, Preorder, Postorder)',
        explanation: 'Preorder (Root -> Left -> Right) is ideal for copying or serializing trees. Inorder (Left -> Root -> Right) yields sorted order for Binary Search Trees (BST). Postorder (Left -> Right -> Root) is used for deleting nodes and evaluating postfix expressions.'
      },
      {
        title: 'Breadth-First Traversal (Level-Order)',
        explanation: 'Level-order traversal visits nodes level by level using a Queue (FIFO) data structure, running in O(n) time and O(w) auxiliary space where w is the maximum tree width.'
      }
    ],
    definitions: [
      {
        term: 'Root Node',
        definition: 'The single originating node of a tree with no parent pointers (in-degree 0).'
      },
      {
        term: 'Leaf Node',
        definition: 'A node with no children (both left and right pointers are null).'
      },
      {
        term: 'Height of a Tree',
        definition: 'The number of edges on the longest downward path from the root to a leaf node.'
      },
      {
        term: 'Depth of a Node',
        definition: 'The number of edges from the root node down to the target node.'
      }
    ],
    detailed_explanations: [
      {
        heading: 'Recursive vs Iterative Inorder Traversal',
        body: 'Recursive traversal relies on the call stack, requiring O(h) auxiliary memory. The iterative equivalent simulates the call stack using an explicit Stack data structure.',
        codeOrFormula: `// Inorder traversal: Left -> Root -> Right\nfunction inorder(node) {\n  if (!node) return;\n  inorder(node.left);\n  console.log(node.val);\n  inorder(node.right);\n}`
      },
      {
        heading: 'Mathematical Properties and Bounds',
        body: 'In any non-empty binary tree with n nodes and height h: Maximum nodes at level i is 2^i (root at level 0). A binary tree of height h has at most 2^(h+1) - 1 nodes. For n nodes, minimum height is floor(log2(n)).',
        codeOrFormula: `Max nodes at height h = 2^(h+1) - 1\nLeaves in full binary tree L = Internal Nodes (I) + 1`
      }
    ],
    step_by_step_examples: [
      {
        problem: 'Construct the Inorder and Preorder traversals for tree with root 1, left child 2 (with leaves 4, 5), right child 3 (with right leaf 6).',
        steps: [
          'Step 1: Identify root = 1. Preorder starts with Root: [1].',
          'Step 2: Traverse left subtree of 1 (root 2, leaves 4, 5). Preorder: [1, 2, 4, 5].',
          'Step 3: Traverse right subtree of 1 (root 3, right child 6). Preorder becomes [1, 2, 4, 5, 3, 6].',
          'Step 4: Compute Inorder (Left -> Root -> Right): Left subtree gives [4, 2, 5], visit root [1], right subtree gives [3, 6]. Final Inorder: [4, 2, 5, 1, 3, 6].'
        ],
        solution: 'Preorder = [1, 2, 4, 5, 3, 6]; Inorder = [4, 2, 5, 1, 3, 6].'
      }
    ],
    applications: [
      'Binary Search Trees (BST) for logarithmic search, insertion, and deletion',
      'Abstract Syntax Trees (AST) in modern programming language compilers and linters',
      'Huffman Coding Trees in data compression algorithms (ZIP, JPEG)',
      'Binary Heap priority queues in Dijkstra shortest path and process schedulers'
    ],
    common_mistakes: [
      {
        mistake: 'Assuming a tree with n nodes always has O(log n) height.',
        correction: 'Skewed binary trees degenerate into linked lists with height O(n), causing operations to degrade from O(log n) to O(n).'
      },
      {
        mistake: 'Forgetting to handle null pointer base cases in recursive functions.',
        correction: 'Always verify if (node === null) return at the very top of recursive tree functions.'
      }
    ],
    revision_key_points: [
      'Inorder traversal of a valid BST produces ascending sorted output.',
      'Level-order traversal requires a Queue; Depth-first traversals use a Stack or recursion.',
      'A full binary tree with L leaves always contains L - 1 internal nodes with 2 children.',
      'Tree height determines worst-case lookup time: O(log n) when balanced, O(n) when skewed.'
    ],
    resources: [
      {
        title: 'GeeksforGeeks Binary Tree Data Structure Guide',
        type: 'documentation',
        url: 'https://www.geeksforgeeks.org/binary-tree-data-structure/',
        note: 'Complete theoretical proofs, diagrams, and implementation snippets.'
      },
      {
        title: 'MIT 6.006 Introduction to Algorithms - Binary Trees Lecture',
        type: 'documentation',
        url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-5-binary-search-trees-bst-sort/',
        note: 'Rigorous academic lecture on tree balance and asymptotic limits.'
      },
      {
        title: 'Binary Tree Algorithms & Traversals Video Lecture Series',
        type: 'video_search',
        url: 'https://www.youtube.com/results?search_query=binary+tree+data+structure+traversal+lecture',
        note: 'Verified YouTube search for comprehensive video demonstrations.'
      }
    ]
  },
  questions: [
    {
      id: 1,
      question: 'What is the maximum number of children any node can have in a binary tree?',
      options: ['1', '2', '3', 'Unlimited'],
      correctAnswer: 1,
      explanation: 'By definition, every node in a binary tree has at most two children: left and right.',
      difficulty: 'Easy',
      category: 'Definition'
    },
    {
      id: 2,
      question: 'Which traversal sequence visits nodes in the order: Left Subtree -> Root Node -> Right Subtree?',
      options: ['Preorder', 'Inorder', 'Postorder', 'Level-order'],
      correctAnswer: 1,
      explanation: 'Inorder traversal visits the left subtree first, then the current root node, then the right subtree.',
      difficulty: 'Easy',
      category: 'Fundamentals'
    },
    {
      id: 3,
      question: 'What is a node called if it has no children?',
      options: ['Root node', 'Internal node', 'Leaf node', 'Ancestor node'],
      correctAnswer: 2,
      explanation: 'A leaf node (or external node) has no child nodes (both left and right pointers are null).',
      difficulty: 'Easy',
      category: 'Definition'
    },
    {
      id: 4,
      question: 'What data structure is typically used to implement Level-Order (Breadth-First) traversal?',
      options: ['Stack', 'Queue', 'Priority Queue', 'Hash Table'],
      correctAnswer: 1,
      explanation: 'Level-order traversal processes nodes in FIFO order using a Queue data structure.',
      difficulty: 'Easy',
      category: 'Fundamentals'
    },
    {
      id: 5,
      question: 'What is the maximum number of nodes at level i of a binary tree, where the root is at level 0?',
      options: ['2^i', '2^(i+1)', '2*i', '2^(i-1)'],
      correctAnswer: 0,
      explanation: 'At level 0: 2^0 = 1 (root). At level 1: 2^1 = 2 nodes. At level i: at most 2^i nodes.',
      difficulty: 'Easy',
      category: 'Fundamentals'
    },
    {
      id: 6,
      question: 'In a Binary Search Tree (BST), where are all values smaller than the root node located?',
      options: ['In the right subtree', 'In the left subtree', 'At the deepest leaf level', 'Randomly distributed'],
      correctAnswer: 1,
      explanation: 'In a BST, every node in the left subtree has a key strictly less than the root node.',
      difficulty: 'Easy',
      category: 'Fundamentals'
    },
    {
      id: 7,
      question: 'What does Inorder traversal of a valid Binary Search Tree yield?',
      options: ['Reverse sorted order', 'Ascending sorted order', 'Level-by-level order', 'Random permutation'],
      correctAnswer: 1,
      explanation: 'Because Inorder visits Left (< Root) then Root then Right (> Root), it outputs elements in strictly non-decreasing sorted order.',
      difficulty: 'Easy',
      category: 'Conceptual'
    },
    {
      id: 8,
      question: 'What is the height of a binary tree consisting of only a single root node?',
      options: ['0 edges', '1 edge', '2 edges', '-1 edges'],
      correctAnswer: 0,
      explanation: 'Under the standard edge-based convention, height is the number of edges from root to deepest leaf. A single node has height 0.',
      difficulty: 'Easy',
      category: 'Definition'
    },
    {
      id: 9,
      question: 'Which traversal visits the root node before visiting any of its child subtrees?',
      options: ['Postorder', 'Preorder', 'Inorder', 'Topological sort'],
      correctAnswer: 1,
      explanation: 'Preorder traversal visits the current Root first, then Left subtree, then Right subtree.',
      difficulty: 'Easy',
      category: 'Fundamentals'
    },
    {
      id: 10,
      question: 'In a full binary tree with L leaves, how many internal nodes with two children exist?',
      options: ['L - 1', 'L + 1', '2 * L', 'L / 2'],
      correctAnswer: 0,
      explanation: 'By the handshaking theorem on trees, any full binary tree satisfies I = L - 1.',
      difficulty: 'Easy',
      category: 'Conceptual'
    },
    {
      id: 11,
      question: 'What is the worst-case time complexity of searching for a value in an unbalanced (skewed) binary search tree?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctAnswer: 2,
      explanation: 'When a BST degenerates into a single continuous chain (skewed tree), lookup degrades to O(n) linear search.',
      difficulty: 'Medium',
      category: 'Conceptual'
    },
    {
      id: 12,
      question: 'What is a Complete Binary Tree?',
      options: [
        'Every node has either 0 or 2 children',
        'All levels are completely filled except possibly the last, which is filled from left to right',
        'All leaf nodes are at different depths',
        'A tree where every node has exactly one child'
      ],
      correctAnswer: 1,
      explanation: 'A complete binary tree fills all levels completely except possibly the lowest level, which fills strictly from left to right.',
      difficulty: 'Medium',
      category: 'Definition'
    },
    {
      id: 13,
      question: 'Which tree traversal is best suited for deleting all nodes in a dynamically allocated tree?',
      options: ['Preorder', 'Inorder', 'Postorder', 'Level-order'],
      correctAnswer: 2,
      explanation: 'Postorder visits both child subtrees before the parent node, ensuring children are safely freed before the parent pointer is destroyed.',
      difficulty: 'Medium',
      category: 'Application'
    },
    {
      id: 14,
      question: 'What is the maximum number of nodes in a binary tree of height h (where single root is height 0)?',
      options: ['2^(h+1) - 1', '2^h - 1', '2*h + 1', 'h^2'],
      correctAnswer: 0,
      explanation: 'Summing 2^0 + 2^1 + ... + 2^h gives 2^(h+1) - 1 maximum nodes.',
      difficulty: 'Medium',
      category: 'Problem-Solving'
    },
    {
      id: 15,
      question: 'Given Preorder traversal: [A, B, D, E, C] and Inorder traversal: [D, B, E, A, C], which node is the left child of B?',
      options: ['A', 'D', 'E', 'C'],
      correctAnswer: 1,
      explanation: 'In Preorder, B is root of left subtree. In Inorder, D appears before B, proving D is in B\'s left subtree.',
      difficulty: 'Medium',
      category: 'Problem-Solving'
    },
    {
      id: 16,
      question: 'What is the auxiliary space complexity of recursive inorder traversal on a balanced binary tree with n nodes?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
      correctAnswer: 1,
      explanation: 'On a balanced tree, recursion depth is bounded by the height h = O(log n), consuming O(log n) stack memory.',
      difficulty: 'Medium',
      category: 'Conceptual'
    },
    {
      id: 17,
      question: 'Which binary tree property allows it to be represented compactly inside a contiguous array without explicit pointers?',
      options: ['Degenerate tree', 'Complete binary tree', 'Disjoint forest', 'Skewed binary tree'],
      correctAnswer: 1,
      explanation: 'Complete binary trees (like binary heaps) map directly to array indices: parent at i has children at 2i+1 and 2i+2 without holes.',
      difficulty: 'Medium',
      category: 'Application'
    },
    {
      id: 18,
      question: 'In a binary search tree, what node is the in-order successor of a node with a non-empty right subtree?',
      options: [
        'The leftmost node of the right subtree',
        'The rightmost node of the left subtree',
        'The parent node',
        'The root of the entire tree'
      ],
      correctAnswer: 0,
      explanation: 'The in-order successor is the smallest value greater than the target, which is the minimum (leftmost) node in its right subtree.',
      difficulty: 'Medium',
      category: 'Conceptual'
    },
    {
      id: 19,
      question: 'What is the balance factor of a node in an AVL tree defined as?',
      options: [
        'Height(Left Subtree) - Height(Right Subtree)',
        'Node Value - Parent Value',
        'Total Left Nodes / Total Right Nodes',
        'Depth(Node) - Height(Node)'
      ],
      correctAnswer: 0,
      explanation: 'The AVL balance factor is the difference between left and right subtree heights, which must be in {-1, 0, +1}.',
      difficulty: 'Medium',
      category: 'Definition'
    },
    {
      id: 20,
      question: 'How many distinct binary tree structural shapes can be formed using n = 3 unlabeled nodes?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 2,
      explanation: 'The number of distinct binary tree shapes is given by the Catalan number C(3) = (1/4) * (6! / (3! * 3!)) = 5.',
      difficulty: 'Medium',
      category: 'Problem-Solving'
    },
    {
      id: 21,
      question: 'Morris Inorder Traversal achieves tree traversal without extra recursion stack or memory. How does it work?',
      options: [
        'By utilizing threaded binary tree pointers back to ancestors temporarily',
        'By compressing all nodes into 64-bit integers',
        'By performing random jumps using hardware hash lookups',
        'By running multiple threads on GPU shaders'
      ],
      correctAnswer: 0,
      explanation: 'Morris traversal temporarily modifies null right pointers of predecessor nodes to point back to the current node, achieving O(1) space.',
      difficulty: 'Hard',
      category: 'Advanced'
    },
    {
      id: 22,
      question: 'What is the minimum number of nodes in an AVL tree of height h = 4 (where empty tree has height -1)?',
      options: ['7', '12', '15', '20'],
      correctAnswer: 1,
      explanation: 'Recurrence for min AVL nodes: N(h) = N(h-1) + N(h-2) + 1. N(0)=1, N(1)=2, N(2)=4, N(3)=7, N(4)=7+4+1 = 12 nodes.',
      difficulty: 'Hard',
      category: 'Problem-Solving'
    },
    {
      id: 23,
      question: 'If you are given ONLY the Preorder and Postorder traversals of a tree, can you always reconstruct a unique binary tree?',
      options: [
        'Yes, always',
        'No, unless the binary tree is strictly a Full binary tree',
        'Only if all node values are prime numbers',
        'Yes, provided tree depth is less than 10'
      ],
      correctAnswer: 1,
      explanation: 'Preorder and Postorder alone cannot distinguish between a single left child versus single right child unless the tree is guaranteed to be full.',
      difficulty: 'Hard',
      category: 'Conceptual'
    },
    {
      id: 24,
      question: 'What is the time complexity to find the Lowest Common Ancestor (LCA) of two nodes in a balanced BST with n nodes?',
      options: ['O(1)', 'O(h) which is O(log n)', 'O(n)', 'O(n^2)'],
      correctAnswer: 1,
      explanation: 'In a BST, starting from the root, we walk left if both values are smaller or right if both are larger. This takes O(h) = O(log n) steps.',
      difficulty: 'Hard',
      category: 'Application'
    },
    {
      id: 25,
      question: 'What rotation sequence is required to rebalance an AVL tree when a node has balance factor +2 and its left child has balance factor -1 (LR imbalance)?',
      options: [
        'Single Left Rotation',
        'Single Right Rotation',
        'Left Rotation on child followed by Right Rotation on parent',
        'Right Rotation on child followed by Left Rotation on parent'
      ],
      correctAnswer: 2,
      explanation: 'An LR imbalance requires a Left rotation on the left child, followed by a Right rotation on the unbalanced parent node.',
      difficulty: 'Hard',
      category: 'Problem-Solving'
    },
    {
      id: 26,
      question: 'What is the diameter of a binary tree defined as?',
      options: [
        'The length of the longest path between any two nodes in the tree',
        'The total number of leaf nodes multiplied by height',
        'The number of nodes residing at the widest level',
        'The depth of the root node from the leaves'
      ],
      correctAnswer: 0,
      explanation: 'The diameter (or width) is the number of edges on the longest simple path between any two nodes, which may or may not pass through root.',
      difficulty: 'Hard',
      category: 'Definition'
    },
    {
      id: 27,
      question: 'In a Threaded Binary Tree, what do null left and right pointers store instead of null?',
      options: [
        'Pointers to the in-order predecessor and in-order successor',
        'Pointers back to the root node',
        'Random hash signatures of the child nodes',
        'Pointers to memory allocators'
      ],
      correctAnswer: 0,
      explanation: 'Threaded binary trees utilize wasted null pointers to point to the in-order predecessor and successor to enable stackless traversals.',
      difficulty: 'Hard',
      category: 'Advanced'
    },
    {
      id: 28,
      question: 'What is the amortized cost of inserting an element into a splay tree with n nodes?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctAnswer: 1,
      explanation: 'Through self-balancing splay rotations, splay trees guarantee an amortized O(log n) time per operation over a sequence of operations.',
      difficulty: 'Hard',
      category: 'Advanced'
    },
    {
      id: 29,
      question: 'Which of the following problems on binary trees CANNOT be solved in O(n) time using depth-first search?',
      options: [
        'Finding the maximum depth',
        'Checking if the tree is symmetric',
        'Finding all pairs shortest paths between all pairs of nodes in the tree without preprocessing',
        'Calculating the sum of all node values'
      ],
      correctAnswer: 2,
      explanation: 'All-pairs shortest paths between all pairs of n nodes outputs O(n^2) paths, which fundamentally cannot be output in O(n) time.',
      difficulty: 'Hard',
      category: 'Problem-Solving'
    },
    {
      id: 30,
      question: 'Why are B-trees and B+ trees preferred over standard binary search trees for disk-based databases?',
      options: [
        'Higher branching factor reduces tree height, minimizing expensive disk block I/O operations',
        'Binary search trees consume more total hard drive capacity',
        'B-trees completely eliminate the need for CPU processing',
        'Binary search trees cannot store string keys'
      ],
      correctAnswer: 0,
      explanation: 'Disk reads are orders of magnitude slower than RAM. High branching factors keep tree height to 3-4 levels, requiring very few disk I/Os.',
      difficulty: 'Hard',
      category: 'Advanced'
    }
  ]
};
