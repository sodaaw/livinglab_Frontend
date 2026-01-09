import { useRef } from 'react'
import PriorityQueue from '../components/admin/PriorityQueue'
import ActionRecommendations from '../components/admin/ActionRecommendations'
import BeforeAfterTracking from '../components/admin/BeforeAfterTracking'
import TimePatternAnalysis from '../components/admin/TimePatternAnalysis'
import BlindSpotDetection from '../components/admin/BlindSpotDetection'
import SiteGuide, { GuideStep } from '../components/public/SiteGuide'
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

  const guideSteps: GuideStep[] = [
    {
      step: 1,
      title: '우선순위 검사 대기열 확인',
      description: '편의성 지수와 위험도에 따라 자동 정렬된 검사 대기열을 확인하고 처리하세요',
      sections: [
        '우선순위 높은 지역 자동 식별 및 정렬',
        '각 지역의 편의성 지수 및 위험도 점수 확인',
        '검사 상태 업데이트 및 처리 진행 상황 관리'
      ]
    },
    {
      step: 2,
      title: '사각지대 탐지',
      description: '데이터가 부족하거나 모니터링되지 않는 지역을 찾아 누락을 방지하세요',
      sections: [
        '데이터 수집이 부족한 지역 식별',
        '장기간 신호가 없는 지역 확인',
        '모니터링 커버리지 분석 및 개선 계획 수립'
      ]
    },
    {
      step: 3,
      title: '시간대별 패턴 분석',
      description: '시간대, 요일, 계절별로 나타나는 패턴을 분석하여 효과적인 개입 시점을 파악하세요',
      sections: [
        '시간대별 편의성 변화 패턴 확인',
        '요일/계절별 트렌드 분석',
        '최적 개입 시기 및 주기 결정'
      ]
    },
    {
      step: 4,
      title: '개입 권고사항 검토',
      description: '시스템이 제안하는 구체적인 개입 방법과 예상 효과를 확인하세요',
      sections: [
        '지역별 맞춤형 개입 권고사항 확인',
        '예상 효과 및 비용-효과 분석 검토',
        '권고사항 승인 및 실행 계획 수립'
      ]
    },
    {
      step: 5,
      title: '개입 전후 효과 추적',
      description: '실행한 개입의 효과를 측정하고 데이터로 검증하여 다음 의사결정에 반영하세요',
      sections: [
        '개입 전후 편의성 지수 변화 확인',
        '개입 효과 측정 및 분석 리포트 생성',
        '성공 사례 및 개선 필요 사항 도출'
      ]
    }
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

        <SiteGuide
          title="관리자용 사이트 활용 가이드"
          description="이 대시보드는 도시 편의성 지수를 기반으로 효율적인 의사결정을 돕기 위해 설계되었습니다. 아래 단계를 따라 순서대로 확인하고 처리하시면 체계적으로 업무를 진행하실 수 있습니다."
          steps={guideSteps}
        />

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



