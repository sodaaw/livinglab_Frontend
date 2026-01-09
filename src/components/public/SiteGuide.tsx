import { useState } from 'react'
import './SiteGuide.css'

export interface GuideStep {
  step: number
  title: string
  description: string
  sections: string[]
}

interface SiteGuideProps {
  title: string
  description: string
  steps: GuideStep[]
}

const SiteGuide = ({ title, description, steps }: SiteGuideProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="site-guide">
      <button
        className="site-guide-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="guide-toggle-content">
          <div className="guide-toggle-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 6.66667V10M10 13.3333H10.0083"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="guide-toggle-text">
            <span className="guide-toggle-title">사이트 활용 가이드</span>
            <span className="guide-toggle-subtitle">{title}</span>
          </div>
        </div>
        <svg
          className={`guide-toggle-arrow ${isOpen ? 'open' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="site-guide-content">
          <div className="guide-header">
            <h2 className="guide-title">{title}</h2>
            <p className="guide-description">{description}</p>
          </div>

          <div className="guide-steps">
            {steps.map((step, index) => (
              <div key={step.step} className="guide-step">
                <div className="step-connector">
                  {index < steps.length - 1 && <div className="step-line" />}
                </div>
                
                <div className="step-content">
                  <div className="step-header">
                    <div className="step-number">{step.step}</div>
                    <div className="step-header-text">
                      <h3 className="step-title">{step.title}</h3>
                      <p className="step-description">{step.description}</p>
                    </div>
                  </div>

                  <div className="step-sections">
                    {step.sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="step-section-item">
                        <div className="section-bullet">
                          <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                            <circle cx="3" cy="3" r="3" fill="currentColor" />
                          </svg>
                        </div>
                        <span className="section-text">{section}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SiteGuide
