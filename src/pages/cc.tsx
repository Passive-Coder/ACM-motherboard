import React, { useState } from 'react';
import './cc.css';

interface Question {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  memoryLimit: string;
  timeLimit: string;
  ramConcept: string;
  points: number;
}

interface Answer {
  questionId: number;
  code: string;
  explanation: string;
}

const CompetitiveCodingPage: React.FC = () => {
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [activeQuestion, setActiveQuestion] = useState<number>(1);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [submissions, setSubmissions] = useState<Record<number, boolean>>({});

  const questions: Question[] = [
    {
      id: 1,
      title: "Memory Allocation Optimizer",
      description: `You are designing a RAM allocator for a computer system. Given an array of memory requests (in MB) and the total available RAM capacity, write a function that determines the maximum number of requests that can be satisfied.

Input: requests = [4, 8, 2, 6, 3, 10], capacity = 20
Output: Maximum requests that can be allocated

Constraints:
- 1 ≤ requests.length ≤ 1000
- 1 ≤ requests[i] ≤ 1000
- 1 ≤ capacity ≤ 10000`,
      difficulty: 'Easy',
      memoryLimit: '256 MB',
      timeLimit: '1 second',
      ramConcept: 'Memory Allocation',
      points: 100
    },
    {
      id: 2,
      title: "Cache Miss Calculator",
      description: `A CPU cache has a specific replacement policy. Given a sequence of memory addresses accessed and cache size, calculate the number of cache misses.

Implement LRU (Least Recently Used) cache replacement policy.

Input: cache_size = 3, addresses = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]
Output: Number of cache misses

The cache starts empty. Each address access is either a hit (if already in cache) or miss (if not in cache).`,
      difficulty: 'Medium',
      memoryLimit: '512 MB',
      timeLimit: '2 seconds',
      ramConcept: 'Cache Management',
      points: 200
    },
    {
      id: 3,
      title: "RAM Bank Interleaving",
      description: `Modern RAM uses bank interleaving to improve performance. Given memory addresses, determine which RAM bank each address maps to and calculate the optimal access pattern.

You have 4 RAM banks (0, 1, 2, 3). Address X maps to bank (X % 4).
Given a sequence of memory accesses, find the minimum time to complete all accesses if:
- Same bank access takes 3 cycles
- Different bank access takes 1 cycle

Input: addresses = [0, 4, 1, 5, 2, 6, 3, 7, 8]
Output: Minimum cycles needed`,
      difficulty: 'Hard',
      memoryLimit: '1 GB',
      timeLimit: '3 seconds',
      ramConcept: 'Bank Interleaving',
      points: 300
    },
    {
      id: 4,
      title: "Virtual Memory Page Replacement",
      description: `Implement a virtual memory page replacement algorithm. Given page requests and physical memory frames, simulate the FIFO page replacement policy.

Input: frames = 3, pages = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2]
Output: [page_faults, final_frame_state]

When a page fault occurs and all frames are full, remove the oldest page (FIFO).`,
      difficulty: 'Medium',
      memoryLimit: '512 MB',
      timeLimit: '2 seconds',
      ramConcept: 'Virtual Memory',
      points: 250
    },
    {
      id: 5,
      title: "Memory Fragmentation Solver",
      description: `A memory manager needs to allocate blocks of different sizes. Given free memory segments and allocation requests, determine if all requests can be satisfied using first-fit allocation.

Input: 
free_segments = [(0, 100), (200, 50), (300, 75), (500, 200)]
requests = [30, 60, 40, 80, 25]

Each segment is (start_address, size). Return whether all requests can be allocated.`,
      difficulty: 'Hard',
      memoryLimit: '1 GB',
      timeLimit: '3 seconds',
      ramConcept: 'Memory Fragmentation',
      points: 350
    }
  ];

  const updateAnswer = (questionId: number, field: 'code' | 'explanation', value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        code: field === 'code' ? value : prev[questionId]?.code || '',
        explanation: field === 'explanation' ? value : prev[questionId]?.explanation || ''
      }
    }));
  };

  const submitAnswer = (questionId: number) => {
    const answer = answers[questionId];
    if (answer && answer.code.trim() && answer.explanation.trim()) {
      setSubmissions(prev => ({ ...prev, [questionId]: true }));
      const question = questions.find(q => q.id === questionId);
      if (question) {
        setTotalScore(prev => prev + question.points);
      }
      
      // Show success message
      alert(`Solution submitted successfully! +${question?.points} points`);
    } else {
      alert('Please provide both code and explanation before submitting.');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#00ff00';
      case 'Medium': return '#ffa500';
      case 'Hard': return '#ff0000';
      default: return '#ffffff';
    }
  };

  return (
    <div className="cc-container">
      {/* Header */}
      <div className="cc-header">
        <div className="ram-animation">
          <div className="ram-stick"></div>
          <div className="ram-stick"></div>
          <div className="ram-stick"></div>
          <div className="ram-stick"></div>
        </div>
        <h1 className="cc-title">
          <span className="ram-text">RAM</span> Competitive Coding Challenge
        </h1>
        <div className="score-display">
          Score: <span className="score-value">{totalScore}</span> points
        </div>
      </div>

      {/* Navigation */}
      <div className="question-nav">
        {questions.map(q => (
          <button
            key={q.id}
            className={`nav-btn ${activeQuestion === q.id ? 'active' : ''} ${submissions[q.id] ? 'completed' : ''}`}
            onClick={() => setActiveQuestion(q.id)}
          >
            Q{q.id}
            {submissions[q.id] && <span className="checkmark">✓</span>}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="cc-main">
        {questions.map(question => (
          <div
            key={question.id}
            className={`question-container ${activeQuestion === question.id ? 'active' : ''}`}
          >
            {/* Question Header */}
            <div className="question-header">
              <div className="question-title-row">
                <h2 className="question-title">{question.title}</h2>
                <div className="question-meta">
                  <span 
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(question.difficulty) }}
                  >
                    {question.difficulty}
                  </span>
                  <span className="points-badge">+{question.points} pts</span>
                </div>
              </div>
              
              <div className="ram-concept">
                <span className="concept-label">RAM Concept:</span>
                <span className="concept-value">{question.ramConcept}</span>
              </div>

              <div className="constraints">
                <div className="constraint">
                  <span className="constraint-label">Time Limit:</span>
                  <span className="constraint-value">{question.timeLimit}</span>
                </div>
                <div className="constraint">
                  <span className="constraint-label">Memory Limit:</span>
                  <span className="constraint-value">{question.memoryLimit}</span>
                </div>
              </div>
            </div>

            {/* Question Description */}
            <div className="question-description">
              <h3>Problem Statement</h3>
              <pre className="problem-text">{question.description}</pre>
            </div>

            {/* Answer Section */}
            <div className="answer-section">
              <div className="code-section">
                <h3>Your Solution</h3>
                <textarea
                  className="code-textarea"
                  placeholder={`// Write your ${question.ramConcept.toLowerCase()} solution here...\n// Language: JavaScript/Python/C++/Java\n\nfunction solve(input) {\n    // Your code here\n    return result;\n}`}
                  value={answers[question.id]?.code || ''}
                  onChange={(e) => updateAnswer(question.id, 'code', e.target.value)}
                />
              </div>

              <div className="explanation-section">
                <h3>Algorithm Explanation</h3>
                <textarea
                  className="explanation-textarea"
                  placeholder="Explain your approach, time complexity, space complexity, and how it relates to RAM/memory concepts..."
                  value={answers[question.id]?.explanation || ''}
                  onChange={(e) => updateAnswer(question.id, 'explanation', e.target.value)}
                />
              </div>

              <button
                className={`submit-btn ${submissions[question.id] ? 'submitted' : ''}`}
                onClick={() => submitAnswer(question.id)}
                disabled={submissions[question.id]}
              >
                {submissions[question.id] ? 'Submitted ✓' : 'Submit Solution'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-label">
          Progress: {Object.keys(submissions).length} / {questions.length} completed
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(Object.keys(submissions).length / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* RAM Memory Visualization */}
      <div className="memory-visualization">
        <h3>Memory Usage Simulation</h3>
        <div className="memory-blocks">
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              className={`memory-block ${submissions[Math.floor(i / 3) + 1] ? 'allocated' : 'free'}`}
            >
              {submissions[Math.floor(i / 3) + 1] ? '1' : '0'}
            </div>
          ))}
        </div>
        <div className="memory-legend">
          <span className="legend-item">
            <div className="legend-color allocated"></div>
            Allocated (Solution Submitted)
          </span>
          <span className="legend-item">
            <div className="legend-color free"></div>
            Free (Pending)
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveCodingPage;
