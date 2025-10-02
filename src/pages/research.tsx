import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './research.css';

interface Question {
  id: number;
  question: string;
  placeholder: string;
}

const researchQuestions: Question[] = [
  {
    id: 1,
    question: "What is the main advantage of PCIe 5.0 over PCIe 4.0 in terms of bandwidth?",
    placeholder: "Enter your research findings..."
  },
  {
    id: 2,
    question: "How does the lane configuration (x1, x4, x8, x16) affect PCIe slot performance?",
    placeholder: "Describe the relationship between lanes and performance..."
  },
  {
    id: 3,
    question: "What are the key differences between PCIe and legacy PCI bus architecture?",
    placeholder: "Compare and contrast the two architectures..."
  },
  {
    id: 4,
    question: "In what scenarios would you choose a PCIe x8 slot over a PCIe x16 slot?",
    placeholder: "Explain your reasoning with examples..."
  },
  {
    id: 5,
    question: "How does PCIe hot-swapping technology work and what are its applications?",
    placeholder: "Describe the mechanism and use cases..."
  }
];

const ResearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitAnswer = (questionId: number) => {
    if (answers[questionId]?.trim()) {
      setSubmittedQuestions(prev => new Set([...prev, questionId]));
      // You can add logic here to save the answer to a backend or local storage
      console.log(`Research Question ${questionId} submitted:`, answers[questionId]);
    }
  };

  const handleReturnToMotherboard = () => {
    navigate('/');
  };

  return (
    <div className="research-container">
      <div className="pcie-slot-background">
        <div className="pcie-header">
          <div className="pcie-connector-top">
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} className="pcie-pin" />
            ))}
          </div>
          <div className="pcie-label">
            <h1>PCIe x16 Research Lab</h1>
            <p>High-Performance Research Interface</p>
          </div>
        </div>

        <div className="pcie-body">
          <div className="pcie-slot-rails">
            <div className="slot-rail left-rail"></div>
            <div className="research-content">
              <div className="research-header">
                <h2>Research Questions</h2>
                <p>Explore the depths of PCIe technology</p>
              </div>

              <div className="questions-grid">
                {researchQuestions.map((question) => (
                  <div 
                    key={question.id} 
                    className={`question-card ${submittedQuestions.has(question.id) ? 'submitted' : ''}`}
                  >
                    <div className="question-header">
                      <div className="question-indicator">
                        <div className="pcie-lane-indicator">
                          {Array.from({ length: 4 }, (_, i) => (
                            <div 
                              key={i} 
                              className={`lane ${submittedQuestions.has(question.id) ? 'active' : ''}`}
                            />
                          ))}
                        </div>
                        <span className="question-number">Q{question.id}</span>
                      </div>
                      <h3>{question.question}</h3>
                    </div>
                    
                    <div className="answer-section">
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
                        {submittedQuestions.has(question.id) ? '✓ Submitted' : 'Submit Research'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="research-summary">
                <div className="bandwidth-meter">
                  <div className="meter-label">Research Progress</div>
                  <div className="bandwidth-bar">
                    <div 
                      className="bandwidth-fill"
                      style={{ width: `${(submittedQuestions.size / researchQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="bandwidth-text">
                    {submittedQuestions.size}/{researchQuestions.length} Questions Completed
                  </div>
                </div>
              </div>
            </div>
            <div className="slot-rail right-rail"></div>
          </div>

          <div className="pcie-connector-bottom">
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} className="pcie-pin bottom" />
            ))}
          </div>
        </div>

        <div className="pcie-footer">
          <div className="pcie-specs">
            <span>PCIe 5.0 | 32 GT/s | x16 Lanes</span>
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

export default ResearchPage;
