import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './management.css';

interface Question {
  id: number;
  question: string;
  category: string;
  points: number;
}

const managementQuestions: Question[] = [
  {
    id: 1,
    question: "What is the primary responsibility of a CPU in computer architecture?",
    category: "CPU Fundamentals",
    points: 10
  },
  {
    id: 2,
    question: "Explain the concept of CPU cache hierarchy and its impact on performance.",
    category: "Performance Management",
    points: 15
  },
  {
    id: 3,
    question: "How does CPU scheduling work in operating systems?",
    category: "Process Management",
    points: 20
  },
  {
    id: 4,
    question: "What are the key differences between RISC and CISC architectures?",
    category: "Architecture Design",
    points: 25
  },
  {
    id: 5,
    question: "Describe the role of CPU cores in modern multi-threading applications.",
    category: "Multi-Core Management",
    points: 30
  },
  {
    id: 6,
    question: "How do you optimize CPU utilization in high-performance computing?",
    category: "Performance Optimization",
    points: 35
  }
];

export default function ManagementPage() {
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const navigate = useNavigate();

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitAnswer = (questionId: number) => {
    const answer = answers[questionId];
    if (answer && answer.trim().length > 10) {
      const question = managementQuestions.find(q => q.id === questionId);
      if (question) {
        setTotalScore(prev => prev + question.points);
      }
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < managementQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  return (
    <div className="cpu-container">
      {/* CPU Die/Chip Background */}
      <div className="cpu-die">
        
        {/* CPU Brand Label */}
        <div className="cpu-brand">
          <div className="brand-text">MANAGEMENT CORE</div>
          <div className="cpu-model">Executive Processor X1</div>
        </div>

        {/* CPU Pin Grid (Decorative) */}
        <div className="pin-grid">
          {Array.from({ length: 400 }).map((_, i) => (
            <div key={i} className="cpu-pin"></div>
          ))}
        </div>

        {/* Heat Spreader */}
        <div className="heat-spreader">
          
          {/* Core Performance Metrics */}
          <div className="performance-metrics">
            <div className="metric">
              <span className="metric-label">Questions</span>
              <span className="metric-value">{currentQuestion + 1}/{managementQuestions.length}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Score</span>
              <span className="metric-value">{totalScore}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Progress</span>
              <span className="metric-value">{Math.round(((currentQuestion + 1) / managementQuestions.length) * 100)}%</span>
            </div>
          </div>

          {/* Question Display Area (CPU Core) */}
          <div className="cpu-core">
            <div className="core-ring">
              <div className="question-container">
                <div className="question-category">
                  {managementQuestions[currentQuestion]?.category}
                </div>
                <div className="question-text">
                  {managementQuestions[currentQuestion]?.question}
                </div>
                <div className="question-points">
                  Points: {managementQuestions[currentQuestion]?.points}
                </div>
              </div>
            </div>
          </div>

          {/* Answer Input Area */}
          <div className="answer-section">
            <div className="cache-label">L1 CACHE - ANSWER BUFFER</div>
            <textarea
              className="answer-input"
              placeholder="Enter your management solution here..."
              value={answers[managementQuestions[currentQuestion]?.id] || ''}
              onChange={(e) => handleAnswerChange(managementQuestions[currentQuestion]?.id, e.target.value)}
              rows={4}
            />
            <div className="answer-controls">
              <button 
                className="submit-btn"
                onClick={() => submitAnswer(managementQuestions[currentQuestion]?.id)}
                disabled={!answers[managementQuestions[currentQuestion]?.id]?.trim()}
              >
                PROCESS
              </button>
              <div className="character-count">
                {answers[managementQuestions[currentQuestion]?.id]?.length || 0} characters
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="cpu-controls">
            <button 
              className="nav-btn prev-btn"
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
            >
              ← PREV CORE
            </button>
            
            <div className="core-indicator">
              {managementQuestions.map((_, index) => (
                <div 
                  key={index}
                  className={`core-dot ${index === currentQuestion ? 'active' : ''} ${answers[managementQuestions[index].id] ? 'completed' : ''}`}
                  onClick={() => setCurrentQuestion(index)}
                ></div>
              ))}
            </div>
            
            <button 
              className="nav-btn next-btn"
              onClick={nextQuestion}
              disabled={currentQuestion === managementQuestions.length - 1}
            >
              NEXT CORE →
            </button>
          </div>

        </div>

        {/* CPU Socket Pins (Bottom) */}
        <div className="socket-pins">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="socket-pin"></div>
          ))}
        </div>

        {/* CPU Temperature and Status */}
        <div className="cpu-status">
          <div className="temp-reading">
            <span className="temp-label">CORE TEMP</span>
            <span className="temp-value">42°C</span>
          </div>
          <div className="frequency">
            <span className="freq-label">FREQUENCY</span>
            <span className="freq-value">3.7 GHz</span>
          </div>
          <div className="status-indicator">
            <span className="status-label">STATUS</span>
            <span className="status-value active">ACTIVE</span>
          </div>
        </div>

      </div>

      {/* Return to Motherboard */}
      <button 
        className="return-btn"
        onClick={() => navigate('/')}
      >
        ← RETURN TO MOTHERBOARD
      </button>
    </div>
  );
}
