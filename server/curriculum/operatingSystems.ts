import { TopicLearningModule } from '../learnPractice';

export const OPERATING_SYSTEMS_MODULE: TopicLearningModule = {
  topic: 'operating systems',
  topicTitle: 'Operating Systems & Process Management',
  source: 'verified_bank',
  theory: {
    title: 'Operating Systems & Process Management',
    introduction: 'An Operating System (OS) is the foundational system software that acts as an intermediary between computer hardware and user applications. It manages CPU scheduling, virtual memory, concurrency, file systems, and hardware devices, providing a secure, abstract, and multitasking execution environment.',
    fundamental_concepts: [
      {
        title: 'Processes vs Threads & Execution Context',
        explanation: 'A Process is an active program instance with its own independent address space (text, data, heap, stack, PCB). A Thread is a lightweight execution unit inside a process that shares code, data, and OS resources with peer threads while retaining private registers, stack, and program counter.'
      },
      {
        title: 'CPU Scheduling Algorithms',
        explanation: 'The CPU scheduler decides which ready process receives the CPU next. Core algorithms include First-Come First-Served (FCFS), Shortest Job First (SJF - provably optimal average waiting time), Priority Scheduling, and Round Robin (RR - preemptive with time quantum).'
      },
      {
        title: 'Concurrency, Synchronization & Deadlocks',
        explanation: 'When multiple threads access shared resources, race conditions occur unless protected by synchronization primitives (mutexes, semaphores, monitors). Deadlock occurs when 4 Coffman conditions hold: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.'
      },
      {
        title: 'Virtual Memory & Paging',
        explanation: 'Virtual memory isolates processes and permits execution of programs larger than physical RAM. The Memory Management Unit (MMU) translates virtual addresses to physical frames using page tables and the Translation Lookaside Buffer (TLB).'
      }
    ],
    definitions: [
      {
        term: 'Process Control Block (PCB)',
        definition: 'The data structure maintained by the OS kernel containing process state, program counter, CPU registers, memory limits, and open file descriptors.'
      },
      {
        term: 'Context Switch',
        definition: 'The operational mechanism of saving the state of the active process and restoring the saved state of another process to resume execution on the CPU.'
      },
      {
        term: 'Critical Section',
        definition: 'A code segment that accesses shared variables or resources that must not be concurrently accessed by more than one process.'
      },
      {
        term: 'Thrashing',
        definition: 'A pathological condition where the CPU spends more time swapping pages in and out of secondary storage than executing actual application instructions.'
      }
    ],
    detailed_explanations: [
      {
        heading: 'Banker\'s Algorithm for Deadlock Avoidance',
        body: 'Dijkstra\'s Banker\'s Algorithm evaluates whether granting a resource request leaves the system in a safe state, where a sequence of all processes can finish without deadlock.',
        codeOrFormula: `Need[i][j] = Max[i][j] - Allocation[i][j]\nSafe state exists if: Available >= Need[p] for some process sequence`
      },
      {
        heading: 'Page Replacement Algorithms (FIFO, LRU, Optimal)',
        body: 'When physical memory is full and a page fault occurs, a page replacement algorithm picks a victim frame. Belady\'s Anomaly can cause FIFO to yield more page faults when allocated more physical frames.',
        codeOrFormula: `Effective Access Time (EAT) = (1 - p) * Memory Access Time + p * Page Fault Overhead`
      }
    ],
    step_by_step_examples: [
      {
        problem: 'Given processes P1 (burst 6ms, arrival 0ms) and P2 (burst 4ms, arrival 1ms) with Shortest Remaining Time First (SRTF), find total waiting time.',
        steps: [
          'At t = 0: Only P1 is available. P1 executes for 1ms. Remaining for P1 = 5ms.',
          'At t = 1: P2 arrives with burst 4ms. Since 4ms < 5ms, P2 preempts P1.',
          'From t = 1 to 5: P2 runs to completion (4ms). P2 completes at t = 5.',
          'From t = 5 to 10: P1 resumes and finishes remaining 5ms. P1 completes at t = 10.',
          'Waiting times: P2 waited (1 - 1) = 0ms. P1 waited (5 - 1) = 4ms. Average waiting time = 2.0ms.'
        ],
        solution: 'Average Waiting Time = 2.0 ms.'
      }
    ],
    applications: [
      'Kernel architecture in Linux, macOS (Darwin), Windows NT, and Android',
      'Hypervisors and container runtimes (Docker, KVM, Kubernetes cgroups & namespaces)',
      'High-throughput web servers with asynchronous non-blocking event loops (epoll/kqueue)',
      'Embedded and hard real-time systems (RTOS) in avionics, automotive, and medical robotics'
    ],
    common_mistakes: [
      {
        mistake: 'Confusing user mode with kernel mode privileges.',
        correction: 'User applications run in unprivileged user mode and must trigger a software trap (syscall) to execute privileged hardware instructions in kernel mode.'
      },
      {
        mistake: 'Assuming semaphores and mutexes are identical.',
        correction: 'A mutex is an ownership lock (only the thread that locked it can unlock it). A counting semaphore is a signaling mechanism without ownership constraints.'
      }
    ],
    revision_key_points: [
      'Four Coffman conditions for deadlock: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.',
      'Belady\'s Anomaly occurs in FIFO page replacement, not in stack algorithms like LRU.',
      'SJF/SRTF gives the mathematically minimum average waiting time for any fixed set of processes.',
      'TLB hit ratio directly determines Effective Access Time (EAT) in paged memory systems.'
    ],
    resources: [
      {
        title: 'Operating System Concepts (Silberschatz, Galvin, Gagne)',
        type: 'documentation',
        url: 'https://os-book.com/',
        note: 'Standard collegiate textbook reference for operating systems worldwide.'
      },
      {
        title: 'MIT 6.828 Operating System Engineering',
        type: 'documentation',
        url: 'https://pdos.csail.mit.edu/6.828/',
        note: 'Hands-on kernel design, scheduling, and memory architecture lectures.'
      },
      {
        title: 'Operating Systems Full Course & Process Scheduling',
        type: 'video_search',
        url: 'https://www.youtube.com/results?search_query=operating+system+course+process+scheduling+paging',
        note: 'Verified YouTube search for comprehensive collegiate operating system courses.'
      }
    ]
  },
  questions: [
    {
      id: 1,
      question: 'What is the primary role of the Operating System kernel?',
      options: [
        'The core engine managing hardware resources, memory, and process execution',
        'A graphical web browser used to display HTML documents',
        'A compiler that translates C code into machine assembly',
        'An external peripheral device connected via USB'
      ],
      correctAnswer: 0,
      explanation: 'The kernel is the foundational heart of the OS with complete control over all hardware and execution subsystems.',
      difficulty: 'Easy',
      category: 'Definition'
    },
    {
      id: 2,
      question: 'What information is NOT stored inside a Process Control Block (PCB)?',
      options: ['Process ID and State', 'Program Counter', 'CPU Register contents', 'The complete hardware BIOS firmware'],
      correctAnswer: 3,
      explanation: 'The BIOS firmware resides on motherboard ROM/flash memory, not inside a kernel process control block.',
      difficulty: 'Easy',
      category: 'Fundamentals'
    },
    {
      id: 3,
      question: 'What transition moves a process from the Running state to the Ready state in a preemptive OS?',
      options: ['I/O completion', 'Timer interrupt / Quantum expiration', 'Process termination', 'Memory allocation request'],
      correctAnswer: 1,
      explanation: 'A timer interrupt signals the scheduler that the allocated time quantum has expired, returning the process to the ready queue.',
      difficulty: 'Easy',
      category: 'Conceptual'
    },
    {
      id: 4,
      question: 'Which CPU scheduling algorithm gives the minimum average waiting time for a given set of processes?',
      options: ['First-Come First-Served (FCFS)', 'Shortest Job First (SJF)', 'Round Robin (RR)', 'Priority Scheduling'],
      correctAnswer: 1,
      explanation: 'SJF is provably optimal because scheduling the shortest job first minimizes the waiting times of all subsequent processes.',
      difficulty: 'Easy',
      category: 'Fundamentals'
    },
    {
      id: 5,
      question: 'What is a race condition in concurrent programming?',
      options: [
        'A bug where system output depends on the non-deterministic execution order of concurrent threads',
        'A competition between two computer networks for bandwidth',
        'When CPU clock frequency exceeds rated thermal limits',
        'An intentional benchmark to measure cache latency'
      ],
      correctAnswer: 0,
      explanation: 'A race condition occurs when concurrent processes read/write shared data without synchronization, causing unpredictable output.',
      difficulty: 'Easy',
      category: 'Definition'
    },
    {
      id: 6,
      question: 'How many of the four Coffman conditions must hold simultaneously for a deadlock to occur?',
      options: ['At least 1', 'At least 2', 'Exactly 3', 'All 4 conditions'],
      correctAnswer: 3,
      explanation: 'Deadlock cannot occur unless all four Coffman conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait) hold simultaneously.',
      difficulty: 'Easy',
      category: 'Fundamentals'
    },
    {
      id: 7,
      question: 'What is virtual memory primarily designed to achieve?',
      options: [
        'To allow programs larger than physical RAM to execute and isolate process address spaces',
        'To speed up CPU clock cycles',
        'To replace hard drives with optical discs',
        'To eliminate the need for an operating system kernel'
      ],
      correctAnswer: 0,
      explanation: 'Virtual memory creates an illusion of a large contiguous address space while isolating private process memory.',
      difficulty: 'Easy',
      category: 'Conceptual'
    },
    {
      id: 8,
      question: 'What hardware component translates virtual memory addresses to physical memory addresses?',
      options: ['ALU', 'Memory Management Unit (MMU)', 'PCIe Controller', 'DMA Controller'],
      correctAnswer: 1,
      explanation: 'The Memory Management Unit (MMU) uses page tables and TLBs to translate virtual addresses to physical RAM frames on the fly.',
      difficulty: 'Easy',
      category: 'Definition'
    },
    {
      id: 9,
      question: 'What causes a page fault in an operating system?',
      options: [
        'An attempt to access a virtual page whose valid bit is 0 (not loaded in physical RAM)',
        'A hardware failure in the power supply unit',
        'A disk fragmentation threshold exceeded',
        'A syntax error in user code'
      ],
      correctAnswer: 0,
      explanation: 'A page fault is an architectural interrupt raised when a program accesses a virtual page that currently resides on disk rather than physical RAM.',
      difficulty: 'Easy',
      category: 'Conceptual'
    },
    {
      id: 10,
      question: 'What happens during a context switch?',
      options: [
        'The kernel saves the register state of the running process and loads the saved state of another process',
        'The computer restarts into safe mode',
        'All physical RAM is overwritten with zeros',
        'The display monitor changes resolution'
      ],
      correctAnswer: 0,
      explanation: 'Context switching preserves the active process registers/stack pointers and restores the incoming process context.',
      difficulty: 'Easy',
      category: 'Fundamentals'
    },
    {
      id: 11,
      question: 'What is Belady\'s Anomaly in operating systems?',
      options: [
        'Allocating more page frames results in more page faults under certain algorithms like FIFO',
        'Faster CPUs cause memory bus clock drift',
        'Adding more threads always slows down execution',
        'Disk drives spin in reverse during recovery'
      ],
      correctAnswer: 0,
      explanation: 'Belady\'s Anomaly demonstrates that increasing the number of page frames can counter-intuitively increase page faults under FIFO.',
      difficulty: 'Medium',
      category: 'Conceptual'
    },
    {
      id: 12,
      question: 'What is the purpose of the Translation Lookaside Buffer (TLB)?',
      options: [
        'A high-speed hardware cache of recent virtual-to-physical address translations',
        'A temporary queue for network packets',
        'A backup battery for CMOS memory',
        'A graphics buffer for rendering UI windows'
      ],
      correctAnswer: 0,
      explanation: 'The TLB caches recent page table translations, avoiding multiple slow main-memory accesses for every memory instruction.',
      difficulty: 'Medium',
      category: 'Definition'
    },
    {
      id: 13,
      question: 'Which of the following resources is SHARED between threads of the same process?',
      options: ['Stack space', 'Register set', 'Heap memory and open file descriptors', 'Program Counter'],
      correctAnswer: 2,
      explanation: 'Threads of the same process share the heap, global variables, and open files, but maintain private stacks and register sets.',
      difficulty: 'Medium',
      category: 'Fundamentals'
    },
    {
      id: 14,
      question: 'What is Thrashing in an operating system?',
      options: [
        'A state where the system spends significantly more time paging memory to/from disk than executing code',
        'A virus that corrupts user files',
        'A thermal throttling condition on modern GPUs',
        'When multiple CPUs compete for bus arbitration'
      ],
      correctAnswer: 0,
      explanation: 'Thrashing occurs when the working sets of active processes exceed physical memory, causing continuous page swapping and near-zero CPU throughput.',
      difficulty: 'Medium',
      category: 'Definition'
    },
    {
      id: 15,
      question: 'Which scheduling algorithm is vulnerable to the "Convoy Effect"?',
      options: ['Round Robin (RR)', 'First-Come First-Served (FCFS)', 'Multi-level Feedback Queue (MLFQ)', 'Shortest Remaining Time First (SRTF)'],
      correctAnswer: 1,
      explanation: 'Under FCFS, when a long CPU-bound process holds the CPU, all short I/O-bound processes wait behind it like cars behind a slow truck.',
      difficulty: 'Medium',
      category: 'Conceptual'
    },
    {
      id: 16,
      question: 'What algorithm is used for Deadlock Avoidance by verifying that resource allocations maintain a safe state?',
      options: ['Dijkstra\'s Banker\'s Algorithm', 'Kruskal\'s Algorithm', 'Page Rank Algorithm', 'RSA Encryption'],
      correctAnswer: 0,
      explanation: 'The Banker\'s Algorithm evaluates maximum resource claims and allocations to ensure a safe execution sequence always exists before granting requests.',
      difficulty: 'Medium',
      category: 'Application'
    },
    {
      id: 17,
      question: 'What is an Orphan process in Unix-like operating systems?',
      options: [
        'A process whose parent has terminated while the child continues executing',
        'A process that has finished execution but still has an entry in the process table',
        'A process running without a network connection',
        'A background daemon that has no open files'
      ],
      correctAnswer: 0,
      explanation: 'When a parent process terminates before its child, the child becomes an orphan and is adopted by the init / systemd process (PID 1).',
      difficulty: 'Medium',
      category: 'Definition'
    },
    {
      id: 18,
      question: 'What is a Zombie (defunct) process?',
      options: [
        'A completed process whose exit status has not yet been read by its parent via wait()',
        'A process stuck in an infinite loop',
        'A process communicating with external botnets',
        'A process paused by the debugger'
      ],
      correctAnswer: 0,
      explanation: 'A zombie has finished execution and released its memory, but retains its PCB entry until the parent calls wait() to read its termination status.',
      difficulty: 'Medium',
      category: 'Definition'
    },
    {
      id: 19,
      question: 'In Peterson\'s solution for mutual exclusion between two processes, what two variables are used?',
      options: ['turn and flag array', 'semaphore and mutex', 'semaphore and condition variable', 'lock and key'],
      correctAnswer: 0,
      explanation: 'Peterson\'s classical algorithmic solution uses an integer variable `turn` and a boolean array `flag[2]` to ensure mutual exclusion, progress, and bounded waiting.',
      difficulty: 'Medium',
      category: 'Problem-Solving'
    },
    {
      id: 20,
      question: 'What is the main advantage of Multi-Level Feedback Queue (MLFQ) scheduling?',
      options: [
        'It prioritizes interactive short jobs automatically without requiring prior knowledge of burst times',
        'It completely avoids context switching overhead',
        'It eliminates the need for timer interrupts',
        'It guarantees zero memory usage for process queues'
      ],
      correctAnswer: 0,
      explanation: 'MLFQ dynamically adjusts priority based on past CPU usage, rewarding interactive I/O jobs and demoting long CPU-heavy jobs.',
      difficulty: 'Medium',
      category: 'Conceptual'
    },
    {
      id: 21,
      question: 'What is the Inverted Page Table designed to reduce?',
      options: [
        'The total physical memory consumed by storing page tables for large virtual address spaces',
        'The speed of memory reads',
        'The number of registers on the CPU',
        'The latency of disk seek operations'
      ],
      correctAnswer: 0,
      explanation: 'An inverted page table has one entry per physical frame rather than per virtual page, keeping page table size strictly proportional to physical RAM.',
      difficulty: 'Hard',
      category: 'Advanced'
    },
    {
      id: 22,
      question: 'Under what condition does Priority Inversion become dangerous, and how is it resolved?',
      options: [
        'When a medium priority thread delays a high priority thread waiting on a low priority thread lock; resolved by Priority Inheritance',
        'When CPU voltage drops below threshold; resolved by overclocking',
        'When threads cannot allocate heap memory; resolved by garbage collection',
        'When process priority equals PID; resolved by process renumbering'
      ],
      correctAnswer: 0,
      explanation: 'Priority inheritance temporarily elevates the low-priority thread\'s priority to match the highest waiting thread until it releases the shared lock.',
      difficulty: 'Hard',
      category: 'Problem-Solving'
    },
    {
      id: 23,
      question: 'What is the difference between internal and external fragmentation?',
      options: [
        'Internal: wasted space inside an allocated block; External: free space exists in total but is partitioned into blocks too small to satisfy requests',
        'Internal happens on disk; External happens in CPU cache',
        'Internal affects threads; External affects processes',
        'Internal is caused by compilers; External is caused by user input'
      ],
      correctAnswer: 0,
      explanation: 'Paging eliminates external fragmentation through fixed page sizes, but can suffer from internal fragmentation within the final page.',
      difficulty: 'Hard',
      category: 'Conceptual'
    },
    {
      id: 24,
      question: 'How does Copy-on-Write (COW) optimize the fork() system call in Unix/Linux?',
      options: [
        'Parent and child share the same physical pages read-only until either process writes to a page, triggering a private frame copy',
        'It writes all process memory to disk before spawning the child',
        'It doubles physical memory allocation instantly',
        'It compiles the child code directly into kernel space'
      ],
      correctAnswer: 0,
      explanation: 'COW avoids copying entire process address spaces when fork() is followed immediately by exec(), copying only modified pages on demand.',
      difficulty: 'Hard',
      category: 'Advanced'
    },
    {
      id: 25,
      question: 'What is the Working Set Model used for in memory management?',
      options: [
        'To calculate the set of pages a process has actively referenced in time window Delta to prevent thrashing',
        'To measure the physical dimensions of RAM chips',
        'To schedule backup copies of database logs',
        'To count how many keyboard inputs occurred'
      ],
      correctAnswer: 0,
      explanation: 'The working set model approximates process locality; if total working set demand exceeds physical RAM, the OS suspends a process to prevent thrashing.',
      difficulty: 'Hard',
      category: 'Conceptual'
    },
    {
      id: 26,
      question: 'What hardware instruction provides atomic read-modify-write support for user-space synchronization locks?',
      options: ['Test-and-Set / Compare-and-Swap (CAS)', 'MOV and ADD', 'JMP and CALL', 'NOP and HLT'],
      correctAnswer: 0,
      explanation: 'Hardware atomic primitives like CAS or Test-and-Set execute indivisibly across bus architectures, forming the basis of spinlocks and mutexes.',
      difficulty: 'Hard',
      category: 'Advanced'
    },
    {
      id: 27,
      question: 'Which page replacement algorithm is provably optimal (OPT/Bélády\'s Optimal), and why is it impossible to implement in general operating systems?',
      options: [
        'It replaces the page that will not be used for the longest period in the future; requires future knowledge',
        'It replaces the largest page by byte count; requires too much arithmetic',
        'It replaces random pages; unpredictable behavior',
        'It replaces pages based on file creation date; timestamps are unreliable'
      ],
      correctAnswer: 0,
      explanation: 'Bélády\'s Optimal algorithm requires predicting the future access trace of all running applications, which is computationally undecidable.',
      difficulty: 'Hard',
      category: 'Conceptual'
    },
    {
      id: 28,
      question: 'What is a spinlock, and when is it preferred over a sleeping mutex?',
      options: [
        'A lock where the waiting thread repeatedly checks a condition in a loop; preferred when lock hold time is shorter than context switch cost on multi-core systems',
        'A lock that rotates between hard drives',
        'A lock used only during system shutdown',
        'A software lock that forces the CPU fan to spin'
      ],
      correctAnswer: 0,
      explanation: 'Spinlocks busy-wait without putting the thread to sleep, avoiding expensive context switches when the lock is held for just a few CPU cycles.',
      difficulty: 'Hard',
      category: 'Problem-Solving'
    },
    {
      id: 29,
      question: 'In disk scheduling, what is the key difference between SCAN (Elevator algorithm) and C-SCAN (Circular SCAN)?',
      options: [
        'C-SCAN returns immediately to the beginning of the disk without servicing requests on the reverse trip, providing more uniform wait times',
        'SCAN only works on solid state drives while C-SCAN works on magnetic platters',
        'C-SCAN spins the disk in reverse',
        'SCAN reads sectors in random order'
      ],
      correctAnswer: 0,
      explanation: 'C-SCAN treats cylinders as a circular list, returning to the start without servicing requests on return, eliminating bias towards middle tracks.',
      difficulty: 'Hard',
      category: 'Advanced'
    },
    {
      id: 30,
      question: 'What security mechanism does an Operating System use to protect kernel memory from unauthorized user application tampering?',
      options: [
        'Dual-mode CPU execution (Ring 0 Kernel Mode vs Ring 3 User Mode) enforced by page table supervisor privilege bits',
        'Software password prompts inside every while loop',
        'Encrypting the source code files with AES-256',
        'Disconnecting the Ethernet cable when user programs run'
      ],
      correctAnswer: 0,
      explanation: 'Hardware privilege rings ensure CPU instructions accessing kernel page tables trap to an exception unless execution mode is Ring 0.',
      difficulty: 'Hard',
      category: 'Advanced'
    }
  ]
};
