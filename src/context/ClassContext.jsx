import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Class Context - Student's Classes & Assignments
 * 
 * Manages:
 * - Enrolled classes
 * - Assignments per class
 * - Class materials
 * - Announcements
 * - Submission tracking
 */

const ClassContext = createContext();

// Mock data for classes
const MOCK_CLASSES = [
  {
    id: 'chem_101',
    name: 'Chemistry',
    teacher: 'Ms. Madison',
    period: 3,
    color: '#ff66cc',
    room: 'Lab 201'
  },
  {
    id: 'phys_101',
    name: 'Physics',
    teacher: 'Mr. Johnson',
    period: 5,
    color: '#a066ff',
    room: 'Room 305'
  },
  {
    id: 'math_101',
    name: 'Mathematics',
    teacher: 'Mrs. Chen',
    period: 2,
    color: '#00d4ff',
    room: 'Room 102'
  }
];

// Mock assignments
const MOCK_ASSIGNMENTS = [
  {
    id: 'asn_001',
    classId: 'chem_101',
    title: 'Chapter 7 Test',
    description: 'Covers atomic structure and bonding',
    dueDate: '2025-01-25T14:00:00',
    type: 'test',
    points: 100,
    status: 'upcoming',
    submitted: false
  },
  {
    id: 'asn_002',
    classId: 'chem_101',
    title: 'Lab Report: Ionic Compounds',
    description: 'Write up from Tuesday\'s lab',
    dueDate: '2025-01-22T23:59:00',
    type: 'assignment',
    points: 50,
    status: 'upcoming',
    submitted: false
  },
  {
    id: 'asn_003',
    classId: 'phys_101',
    title: 'Kinematics Problem Set',
    description: '20 problems on motion and velocity',
    dueDate: '2025-01-24T14:00:00',
    type: 'homework',
    points: 40,
    status: 'upcoming',
    submitted: false
  },
  {
    id: 'asn_004',
    classId: 'math_101',
    title: 'Calculus Quiz',
    description: 'Derivatives and integrals',
    dueDate: '2025-01-23T10:00:00',
    type: 'quiz',
    points: 25,
    status: 'upcoming',
    submitted: false
  }
];

export const ClassProvider = ({ children }) => {
  const [classes, setClasses] = useState(MOCK_CLASSES);
  const [assignments, setAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  // Load assignments from localStorage or use mock
  useEffect(() => {
    try {
      const saved = localStorage.getItem('studentAssignments');
      if (saved) {
        setAssignments(JSON.parse(saved));
      } else {
        setAssignments(MOCK_ASSIGNMENTS);
        localStorage.setItem('studentAssignments', JSON.stringify(MOCK_ASSIGNMENTS));
      }
    } catch (e) {
      console.warn('Failed to load assignments:', e);
      setAssignments(MOCK_ASSIGNMENTS);
    }
  }, []);

  // Get assignments for a specific class
  const getClassAssignments = (classId) => {
    return assignments.filter(a => a.classId === classId);
  };

  // Get upcoming assignments (due within 7 days)
  const getUpcomingAssignments = () => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return assignments.filter(a => {
      const dueDate = new Date(a.dueDate);
      return dueDate >= now && dueDate <= weekFromNow && !a.submitted;
    });
  };

  // Get overdue assignments
  const getOverdueAssignments = () => {
    const now = new Date();
    return assignments.filter(a => {
      const dueDate = new Date(a.dueDate);
      return dueDate < now && !a.submitted;
    });
  };

  // Submit assignment
  const submitAssignment = (assignmentId) => {
    const updated = assignments.map(a =>
      a.id === assignmentId ? { ...a, submitted: true, submittedAt: new Date().toISOString() } : a
    );
    
    setAssignments(updated);
    try {
      localStorage.setItem('studentAssignments', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save assignments:', e);
    }

    // Trigger LM proud mood
    if (window.setLMMood) {
      window.setLMMood('proud');
    }
  };

  // Add new assignment (teacher-assigned)
  const addAssignment = (assignment) => {
    const updated = [...assignments, { ...assignment, id: `asn_${Date.now()}` }];
    setAssignments(updated);
    
    try {
      localStorage.setItem('studentAssignments', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save assignment:', e);
    }
  };

  // Calculate class completion rate
  const getClassCompletionRate = (classId) => {
    const classAssignments = getClassAssignments(classId);
    if (classAssignments.length === 0) return 100;
    
    const completed = classAssignments.filter(a => a.submitted).length;
    return Math.round((completed / classAssignments.length) * 100);
  };

  // Live roster management
  const [liveRoster, setLiveRoster] = useState([]);

  // Add participant to live roster
  const addParticipant = (participant) => {
    if (!liveRoster.find(p => p.id === participant.id)) {
      setLiveRoster(prev => [...prev, { ...participant, ready: false }]);
      console.log(`✅ ${participant.name} added to live roster`);
    }
  };

  // Set participant ready status
  const setReady = (participantId, ready = true) => {
    setLiveRoster(prev => 
      prev.map(p => p.id === participantId ? { ...p, ready } : p)
    );
  };

  // Clear live roster
  const clearLive = () => {
    setLiveRoster([]);
    console.log('🧹 Live roster cleared');
  };

  const value = {
    // State
    classes,
    assignments,
    selectedClass,
    liveRoster,
    
    // Actions
    setSelectedClass,
    getClassAssignments,
    getUpcomingAssignments,
    getOverdueAssignments,
    submitAssignment,
    addAssignment,
    getClassCompletionRate,
    
    // Live actions
    addParticipant,
    setReady,
    clearLive,
    
    // Mock data
    MOCK_CLASSES,
    MOCK_ASSIGNMENTS
  };

  return <ClassContext.Provider value={value}>{children}</ClassContext.Provider>;
};

export const useClass = () => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClass must be used within ClassProvider');
  }
  return context;
};

export default ClassContext;
