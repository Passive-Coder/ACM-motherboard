import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './competitiveCoding.css';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: string;
  memoryLimit: string;
  description: string;
  sampleInput: string;
  sampleOutput: string;
}

const CompetitiveCoding: React.FC = () => {
  const navigate = useNavigate();
  const [currentProblem, setCurrentProblem] = useState(0);
  const [solutions, setSolutions] = useState<string[]>(['', '', '', '', '']);
  const [submittedProblems, setSubmittedProblems] = useState<boolean[]>([false, false, false, false, false]);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [executionTime, setExecutionTime] = useState(0);

  const problems: Problem[] = [
    {
      id: 1,
      title: "Memory Allocation Optimizer",
      difficulty: "Medium",
      timeLimit: "2s",
      memoryLimit: "256MB",
      description: "Implement an algorithm to optimize memory allocation for a system with limited RAM. Given n processes with their memory requirements, find the optimal allocation strategy to minimize fragmentation.",
      sampleInput: "5\n100 200 150 300 250",
      sampleOutput: "Optimal allocation: [100, 150, 200, 250, 300]\nFragmentation: 12%"
    },
    {
      id: 2,
      title: "Cache Miss Minimization",
      difficulty: "Hard",
      timeLimit: "3s",
      memoryLimit: "512MB",
      description: "Design a cache replacement algorithm to minimize cache misses. Implement LRU with frequency-based optimization for a multi-level cache system.",
      sampleInput: "Cache size: 4\nRequests: 1 2 3 4 1 2 5 1 2 3 4 5",
      sampleOutput: "Cache misses: 7\nHit ratio: 41.67%"
    },
    {
      id: 3,
      title: "Virtual Memory Paging",
      difficulty: "Medium",
      timeLimit: "2s",
      memoryLimit: "128MB",
      description: "Simulate virtual memory paging with demand paging. Calculate page faults and implement optimal page replacement for maximum efficiency.",
      sampleInput: "Pages: 3\nReference string: 7 0 1 2 0 3 0 4 2 3 0 3 2",
      sampleOutput: "Page faults: 6\nPage frames: [3, 0, 2]"
    },
    {
      id: 4,
      title: "Memory Pool Management",
      difficulty: "Easy",
      timeLimit: "1s",
      memoryLimit: "64MB",
      description: "Create a memory pool allocator that efficiently manages fixed-size blocks. Implement allocation and deallocation with O(1) complexity.",
      sampleInput: "Block size: 64\nPool size: 1024\nOperations: alloc alloc free alloc",
      sampleOutput: "Block 0 allocated\nBlock 1 allocated\nBlock 1 freed\nBlock 1 allocated"
    },
    {
      id: 5,
      title: "RAM Bandwidth Optimization",
      difficulty: "Hard",
      timeLimit: "4s",
      memoryLimit: "1GB",
      description: "Optimize memory access patterns to maximize RAM bandwidth utilization. Consider NUMA architecture and memory controller limitations.",
      sampleInput: "Memory controllers: 2\nAccess pattern: sequential random sequential\nData size: 1GB",
      sampleOutput: "Bandwidth utilization: 87.3%\nOptimized pattern: interleaved"
    }
  ];

  useEffect(() => {
    // Simulate memory usage calculation
    const totalSolutions = solutions.filter(sol => sol.length > 0).length;
    setMemoryUsage((totalSolutions / 5) * 100);
    setExecutionTime(totalSolutions * 0.8 + Math.random() * 0.4);
  }, [solutions]);

  const handleSolutionChange = (value: string) => {
    const newSolutions = [...solutions];
    newSolutions[currentProblem] = value;
    setSolutions(newSolutions);
  };

  const handleSubmit = () => {
    if (solutions[currentProblem].trim()) {
      const newSubmitted = [...submittedProblems];
      newSubmitted[currentProblem] = true;
      setSubmittedProblems(newSubmitted);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      default: return '#2196F3';
    }
  };

  const getMemoryStatus = () => {
    if (memoryUsage < 30) return 'Low';
    if (memoryUsage < 70) return 'Medium';
    return 'High';
  };

  const solvedProblems = submittedProblems.filter(Boolean).length;
  const accuracy = solutions.length > 0 ? (solvedProblems / 5) * 100 : 0;

  return (
    <div className="competitive-coding-container">
      <div className="ram-module-background">
        {/* RAM Header */}
        <div className="ram-header">
          <div className="dimm-connector">
            <div className="connector-notch">
              <div className="notch-pin"></div>
              <div className="notch-pin"></div>
            </div>
            <div className="ram-label">
              <h1>Competitive Coding</h1>
              <p>High-Performance Problem Solving</p>
            </div>
            <div className="memory-specs">
              <div className="spec-item">
                <span className="spec-label">DDR5</span>
                <span className="spec-value">6400MHz</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Capacity</span>
                <span className="spec-value">32GB</span>
              </div>
            </div>
          </div>
        </div>

        {/* RAM Body */}
        <div className="ram-body">
          <div className="memory-banks">
            {/* Left Memory Bank */}
            <div className="memory-bank left">
              <div className="bank-header">
                <h3>Problem Bank</h3>
                <div className="bank-status">
                  <div className="status-indicator active"></div>
                  <span>Active</span>
                </div>
              </div>
              
              <div className="problem-selector">
                {problems.map((problem, index) => (
                  <div
                    key={problem.id}
                    className={`problem-chip ${currentProblem === index ? 'selected' : ''} ${submittedProblems[index] ? 'solved' : ''}`}
                    onClick={() => setCurrentProblem(index)}
                  >
                    <div className="chip-contacts">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`contact ${submittedProblems[index] ? 'connected' : ''}`}
                        ></div>
                      ))}
                    </div>
                    <div className="chip-info">
                      <div className="chip-id">P{problem.id}</div>
                      <div className="chip-difficulty" style={{ color: getDifficultyColor(problem.difficulty) }}>
                        {problem.difficulty}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="memory-stats">
                <div className="stat-row">
                  <span className="stat-label">Problems Solved:</span>
                  <span className="stat-value">{solvedProblems}/5</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Accuracy:</span>
                  <span className="stat-value">{accuracy.toFixed(1)}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Memory Usage:</span>
                  <span className="stat-value">{memoryUsage.toFixed(1)}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Execution Time:</span>
                  <span className="stat-value">{executionTime.toFixed(2)}s</span>
                </div>
              </div>
            </div>

            {/* Right Memory Bank */}
            <div className="memory-bank right">
              <div className="bank-header">
                <h3>Solution Bank</h3>
                <div className="memory-usage">
                  <div className="usage-bar">
                    <div 
                      className="usage-fill" 
                      style={{ 
                        width: `${memoryUsage}%`,
                        backgroundColor: getMemoryStatus() === 'High' ? '#f44336' : getMemoryStatus() === 'Medium' ? '#ff9800' : '#4caf50'
                      }}
                    ></div>
                  </div>
                  <span className="usage-text">{getMemoryStatus()} Usage</span>
                </div>
              </div>

              <div className="problem-workspace">
                <div className="problem-header">
                  <div className="problem-info">
                    <h4>{problems[currentProblem].title}</h4>
                    <div className="problem-meta">
                      <span className="difficulty-badge" style={{ backgroundColor: getDifficultyColor(problems[currentProblem].difficulty) }}>
                        {problems[currentProblem].difficulty}
                      </span>
                      <span className="time-limit">⏱ {problems[currentProblem].timeLimit}</span>
                      <span className="memory-limit">💾 {problems[currentProblem].memoryLimit}</span>
                    </div>
                  </div>
                  
                  <div className="address-pins">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="address-pin">
                        <div className="pin-contact"></div>
                        <div className="pin-label">A{i}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="problem-description">
                  <div className="description-section">
                    <h5>Problem Description</h5>
                    <p>{problems[currentProblem].description}</p>
                  </div>

                  <div className="io-section">
                    <div className="sample-input">
                      <h6>Sample Input</h6>
                      <pre>{problems[currentProblem].sampleInput}</pre>
                    </div>
                    <div className="sample-output">
                      <h6>Sample Output</h6>
                      <pre>{problems[currentProblem].sampleOutput}</pre>
                    </div>
                  </div>
                </div>

                <div className="solution-area">
                  <div className="data-bus">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`bus-line ${solutions[currentProblem] && i < solutions[currentProblem].length / 10 ? 'active' : ''}`}
                      ></div>
                    ))}
                  </div>
                  
                  <textarea
                    className="solution-editor"
                    placeholder="// Write your solution here...
// Consider time and space complexity
// Optimize for the given constraints

function solve() {
    // Your implementation
}"
                    value={solutions[currentProblem]}
                    onChange={(e) => handleSolutionChange(e.target.value)}
                    disabled={submittedProblems[currentProblem]}
                  />

                  <div className="solution-controls">
                    <button 
                      className={`submit-solution ${submittedProblems[currentProblem] ? 'submitted' : ''}`}
                      onClick={handleSubmit}
                      disabled={!solutions[currentProblem].trim() || submittedProblems[currentProblem]}
                    >
                      {submittedProblems[currentProblem] ? '✓ Submitted' : 'Submit Solution'}
                    </button>
                    
                    <div className="performance-indicator">
                      <div className="indicator-light"></div>
                      <span>Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RAM Footer */}
        <div className="ram-footer">
          <div className="heat-spreader">
            <div className="thermal-pads">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="thermal-pad"></div>
              ))}
            </div>
            
            <div className="performance-metrics">
              <div className="metric">
                <span className="metric-label">Bandwidth</span>
                <span className="metric-value">{(memoryUsage * 0.512).toFixed(1)} GB/s</span>
              </div>
              <div className="metric">
                <span className="metric-label">Latency</span>
                <span className="metric-value">{(15 - memoryUsage * 0.1).toFixed(0)} ns</span>
              </div>
              <div className="metric">
                <span className="metric-label">Temperature</span>
                <span className="metric-value">{(45 + memoryUsage * 0.3).toFixed(0)}°C</span>
              </div>
            </div>

            <button className="return-btn" onClick={() => navigate('/')}>
              Return to Motherboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveCoding;