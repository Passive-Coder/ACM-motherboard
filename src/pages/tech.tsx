import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './tech.css';

interface Question {
  id: number;
  question: string;
  placeholder: string;
}

const techQuestions: Question[] = [
  {
    id: 1,
    question: "What are the key differences between air cooling and liquid cooling systems?",
    placeholder: "Compare thermal efficiency, cost, and maintenance..."
  },
  {
    id: 2,
    question: "How does thermal conductivity affect heat sink performance?",
    placeholder: "Explain the relationship between materials and heat transfer..."
  },
  {
    id: 3,
    question: "What role do heat pipes play in modern CPU cooling solutions?",
    placeholder: "Describe the working principle and advantages..."
  },
  {
    id: 4,
    question: "How does fin density impact cooling efficiency in heat sinks?",
    placeholder: "Analyze the trade-offs between surface area and airflow..."
  },
  {
    id: 5,
    question: "What are the latest innovations in thermal interface materials (TIM)?",
    placeholder: "Discuss recent developments and their impact on cooling..."
  }
];

const TechPage: React.FC = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());
  const [fanSpeed, setFanSpeed] = useState(60);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitAnswer = (questionId: number) => {
    if (answers[questionId]?.trim()) {
      setSubmittedQuestions(prev => new Set([...prev, questionId]));
      // Increase fan speed with each submitted answer
      setFanSpeed(prev => Math.min(100, prev + 8));
      console.log(`Tech Question ${questionId} submitted:`, answers[questionId]);
    }
  };

  const handleReturnToMotherboard = () => {
    navigate('/');
  };

  return (
    <div className="tech-container">
      <div className="heatsink-background">
        {/* Heat Sink Base */}
        <div className="heatsink-base">
          <div className="cpu-contact-plate">
            <div className="thermal-paste"></div>
            <h1>Thermal Management Lab</h1>
            <p>Advanced Cooling Technology Center</p>
          </div>
        </div>

        {/* Heat Sink Fins */}
        <div className="heatsink-fins-container">
          <div className="temperature-display">
            <span className="temp-value">{Math.max(85 - submittedQuestions.size * 8, 45)}°C</span>
            <span className="temp-label">CPU TEMP</span>
          </div>

          <div className="heatsink-fins">
            {techQuestions.map((question) => (
              <div 
                key={question.id} 
                className={`fin-section ${submittedQuestions.has(question.id) ? 'cooled' : ''}`}
              >
                <div className="fin-structure">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="heat-fin"></div>
                  ))}
                </div>
                
                <div className="question-chamber">
                  <div className="question-header">
                    <div className="thermal-sensor">
                      <div className={`sensor-led ${submittedQuestions.has(question.id) ? 'green' : 'red'}`}></div>
                      <span>Q{question.id}</span>
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
                      {submittedQuestions.has(question.id) ? '✓ Cooled' : 'Submit Tech'}
                    </button>
                  </div>
                </div>

                <div className="fin-structure">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="heat-fin"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cooling Fan */}
          <div className="cooling-fan">
            <div 
              className="fan-blades"
              style={{ 
                animationDuration: `${2 - (fanSpeed / 100)}s`,
                animationPlayState: fanSpeed > 0 ? 'running' : 'paused'
              }}
            >
              {Array.from({ length: 6 }, (_, i) => (
                <div 
                  key={i} 
                  className="fan-blade"
                  style={{ transform: `rotate(${i * 60}deg)` }}
                ></div>
              ))}
            </div>
            <div className="fan-center">
              <div className="fan-speed-display">
                <span>{Math.round(fanSpeed * 30)} RPM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Heat Sink Footer */}
        <div className="heatsink-footer">
          <div className="thermal-stats">
            <div className="stat-item">
              <span className="stat-label">Thermal Resistance</span>
              <span className="stat-value">{(0.25 - submittedQuestions.size * 0.03).toFixed(2)} °C/W</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Progress</span>
              <span className="stat-value">{submittedQuestions.size}/{techQuestions.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Cooling Efficiency</span>
              <span className="stat-value">{Math.round((submittedQuestions.size / techQuestions.length) * 100)}%</span>
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

export default TechPage;
