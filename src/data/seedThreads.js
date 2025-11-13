/**
 * Seed Threads for Message Boards
 * Sample discussions for development/demo
 */

export const seedThreads = {
  // Class-specific threads
  chem_101: [
    {
      id: 'thread_chem_001',
      title: 'Help with balancing equations?',
      author: 'Alex Chen',
      role: 'student',
      createdAt: '2025-01-20T14:30:00',
      pinned: false,
      locked: false,
      tags: ['homework', 'chapter-7'],
      posts: [
        {
          id: 'post_001',
          author: 'Alex Chen',
          role: 'student',
          text: 'I\'m having trouble balancing chemical equations. Can someone explain the steps?',
          createdAt: '2025-01-20T14:30:00',
          reactions: { '👍': 3, '❤️': 1 }
        },
        {
          id: 'post_002',
          author: 'Ms. Madison',
          role: 'teacher',
          text: 'Great question! Start by counting atoms on each side, then adjust coefficients one at a time. Never change subscripts!',
          createdAt: '2025-01-20T14:35:00',
          reactions: { '👍': 5, '🎯': 2 }
        }
      ]
    },
    {
      id: 'thread_chem_002',
      title: 'Study group for test?',
      author: 'Jordan Lee',
      role: 'student',
      createdAt: '2025-01-19T16:00:00',
      pinned: true,
      locked: false,
      tags: ['study-group', 'test-prep'],
      posts: [
        {
          id: 'post_003',
          author: 'Jordan Lee',
          role: 'student',
          text: 'Anyone want to form a study group for Friday\'s test? We could meet after school.',
          createdAt: '2025-01-19T16:00:00',
          reactions: { '👍': 4, '📚': 3 }
        }
      ]
    }
  ],

  phys_101: [
    {
      id: 'thread_phys_001',
      title: 'Kinematics problem help',
      author: 'Sam Wilson',
      role: 'student',
      createdAt: '2025-01-20T10:00:00',
      pinned: false,
      locked: false,
      tags: ['homework', 'kinematics'],
      posts: [
        {
          id: 'post_004',
          author: 'Sam Wilson',
          role: 'student',
          text: 'Stuck on problem #15 from the homework. How do I find final velocity?',
          createdAt: '2025-01-20T10:00:00',
          reactions: { '❤️': 2 }
        }
      ]
    }
  ],

  // Teacher Lounge threads
  lounge: [
    {
      id: 'thread_lounge_001',
      title: 'Best practices for group work?',
      author: 'Ms. Madison',
      role: 'teacher',
      createdAt: '2025-01-18T12:00:00',
      pinned: true,
      locked: false,
      tags: ['teaching-tips', 'collaboration'],
      posts: [
        {
          id: 'post_005',
          author: 'Ms. Madison',
          role: 'teacher',
          text: 'What strategies do you all use for managing group projects? Looking for ideas!',
          createdAt: '2025-01-18T12:00:00',
          reactions: { '👍': 5, '💡': 3 }
        },
        {
          id: 'post_006',
          author: 'Mr. Johnson',
          role: 'teacher',
          text: 'I assign roles (leader, recorder, presenter) and rotate them each project. Works well!',
          createdAt: '2025-01-18T13:15:00',
          reactions: { '👍': 4, '🎯': 2 }
        }
      ]
    }
  ]
};

export default seedThreads;
