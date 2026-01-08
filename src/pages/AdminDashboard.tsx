import { useRef } from 'react'
import PriorityQueue from '../components/admin/PriorityQueue'
import ActionRecommendations from '../components/admin/ActionRecommendations'
import BeforeAfterTracking from '../components/admin/BeforeAfterTracking'
import TimePatternAnalysis from '../components/admin/TimePatternAnalysis'
import BlindSpotDetection from '../components/admin/BlindSpotDetection'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const sections = {
    priority: useRef<HTMLElement>(null),
    blindspot: useRef<HTMLElement>(null),
    timepattern: useRef<HTMLElement>(null),
    recommendations: useRef<HTMLElement>(null),
    tracking: useRef<HTMLElement>(null)
  }

  const scrollToSection = (sectionKey: keyof typeof sections) => {
    const section = sections[sectionKey].current
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const menuItems = [
    { key: 'priority' as const, label: '우선순위 검사 대기열' },
    { key: 'blindspot' as const, label: '사각지대 탐지' },
    { key: 'timepattern' as const, label: '시간대별 패턴 분석' },
    { key: 'recommendations' as const, label: '개입 권고사항' },
    { key: 'tracking' as const, label: '개입 전후 효과 추적' }
  ]

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="title">관리자 대시보드</h1>
          <p className="body-large text-secondary mt-md">
            도시 편의성 지수를 기반으로 한 우선순위 기반 의사결정 도구
          </p>
        </div>

        <nav className="dashboard-nav">
          <div className="nav-menu">
            {menuItems.map((item) => (
              <button
                key={item.key}
                className="nav-menu-item"
                onClick={() => scrollToSection(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="dashboard-content">
          <section ref={sections.priority} id="priority" className="dashboard-section">
            <PriorityQueue />
          </section>

          <section ref={sections.blindspot} id="blindspot" className="dashboard-section">
            <BlindSpotDetection />
          </section>

          <section ref={sections.timepattern} id="timepattern" className="dashboard-section">
            <TimePatternAnalysis />
          </section>

          <section ref={sections.recommendations} id="recommendations" className="dashboard-section">
            <ActionRecommendations />
          </section>

          <section ref={sections.tracking} id="tracking" className="dashboard-section">
            <BeforeAfterTracking />
          </section>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard



