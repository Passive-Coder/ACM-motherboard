import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './design.css';

interface Question {
  id: number;
  question: string;
  placeholder: string;
}

const designQuestions: Question[] = [
  {
    id: 1,
    question: "What are the key principles of user-centered design and how do they impact product development?",
    placeholder: "Discuss usability, accessibility, and user experience principles..."
  },
  {
    id: 2,
    question: "How does responsive design ensure optimal user experience across different devices?",
    placeholder: "Explain adaptive layouts, breakpoints, and mobile-first approach..."
  },
  {
    id: 3,
    question: "What role does color theory play in creating effective user interfaces?",
    placeholder: "Describe color psychology, contrast ratios, and accessibility considerations..."
  },
  {
    id: 4,
    question: "How do you approach designing for performance and loading optimization?",
    placeholder: "Discuss image optimization, lazy loading, and performance metrics..."
  },
  {
    id: 5,
    question: "What are the best practices for creating accessible and inclusive designs?",
    placeholder: "Cover WCAG guidelines, screen readers, and universal design principles..."
  }
];

const DesignPage: React.FC = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());
  const [designProgress, setDesignProgress] = useState(0);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitAnswer = (questionId: number) => {
    if (answers[questionId]?.trim()) {
      setSubmittedQuestions(prev => new Set([...prev, questionId]));
      setDesignProgress((prev) => Math.min(100, prev + 20));
      console.log(`Design Question ${questionId} submitted:`, answers[questionId]);
    }
  };

  const handleReturnToMotherboard = () => {
    navigate('/');
  };

  return (
    <div className="design-container">
      <div className="pci-slot-background">
        {/* PCI Slot Header */}
        <div className="pci-header">
          <div className="pci-bracket">
            <div className="bracket-holes">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="bracket-hole"></div>
              ))}
            </div>
            <div className="pci-label">
              <h1>Design Studio</h1>
              <p>Creative Interface Development Lab</p>
            </div>
          </div>
        </div>

        {/* PCI Slot Body */}
        <div className="pci-body">
          <div className="slot-connector">
            <div className="connector-pins">
              {Array.from({ length: 12 }, (_, i) => (
                <div 
                  key={i} 
                  className={`connector-pin ${submittedQuestions.size > Math.floor(i / 2.4) ? 'active' : ''}`}
                ></div>
              ))}
            </div>
            
            <div className="design-content">
              <div className="design-header">
                <div className="voltage-indicator">
                  <span className="voltage-label">Design Voltage</span>
                  <span className="voltage-value">{designProgress}%</span>
                </div>
                <h2>Design Challenges</h2>
                <p>Architect beautiful and functional user experiences</p>
              </div>

              <div className="questions-grid">
                {designQuestions.map((question) => (
                  <div 
                    key={question.id} 
                    className={`question-card ${submittedQuestions.has(question.id) ? 'submitted' : ''}`}
                  >
                    <div className="card-edge-connector">
                      <div className="edge-pins">
                        {Array.from({ length: 8 }, (_, i) => (
                          <div 
                            key={i} 
                            className={`edge-pin ${submittedQuestions.has(question.id) ? 'connected' : ''}`}
                          ></div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="question-pcb">
                      <div className="question-header">
                        <div className="component-marker">
                          <div className={`status-led ${submittedQuestions.has(question.id) ? 'green' : 'orange'}`}></div>
                          <span className="question-id">D{question.id}</span>
                        </div>
                        <h3>{question.question}</h3>
                      </div>
                      
                      <div className="answer-section">
                        <div className="pcb-traces">
                          <div className="trace horizontal"></div>
                          <div className="trace vertical"></div>
                        </div>
                        
                        <textarea
                          className="answer-input"
                          placeholder={question.placeholder}
                          value={answers[question.id] || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          disabled={submittedQuestions.has(question.id)}
                        />
                        
                        <button
                          className={`submit-btn ${submittedQuestions.has(question.id) ? 'submitted' : ''}`}
                          onClick={() => handleSubmitAnswer(question.id)}
                          disabled={!answers[question.id]?.trim() || submittedQuestions.has(question.id)}
                        >
                          {submittedQuestions.has(question.id) ? '✓ Designed' : 'Submit Design'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="design-summary">
                <div className="bandwidth-display">
                  <div className="bandwidth-label">Design Bandwidth</div>
                  <div className="bandwidth-meter">
                    <div 
                      className="bandwidth-fill"
                      style={{ width: `${(submittedQuestions.size / designQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="bandwidth-text">
                    {submittedQuestions.size * 33} Mbps Design Throughput
                  </div>
                </div>
              </div>
            </div>

            <div className="slot-notch">
              <div className="notch-indicator">
                <span>PCI 2.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* PCI Slot Footer */}
        <div className="pci-footer">
          <div className="pci-specs">
            <div className="spec-item">
              <span className="spec-label">Bus Width</span>
              <span className="spec-value">32-bit</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Transfer Rate</span>
              <span className="spec-value">133 MB/s</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Design Progress</span>
              <span className="spec-value">{submittedQuestions.size}/{designQuestions.length}</span>
            </div>
          </div>
          
          <button 
            className="return-btn"
            onClick={handleReturnToMotherboard}
          >
            ← Return to Motherboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignPage;
