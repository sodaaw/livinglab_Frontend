import { useRef, useMemo } from 'react'
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
    { key: 'priority' as const, label: '우선순위 검사 대기열', highlight: true },
    { key: 'recommendations' as const, label: '개입 권고사항', highlight: true },
    { key: 'blindspot' as const, label: '사각지대 탐지' },
    { key: 'timepattern' as const, label: '시간대별 패턴 분석' },
    { key: 'tracking' as const, label: '개입 전후 효과 추적' }
  ]

  // 핵심 액션 요약 데이터 (실제로는 API에서 가져올 데이터)
  const criticalActions = useMemo(() => {
    const highPriorityCount = 2 // 실제로는 데이터에서 계산
    const immediateActionsCount = 1 // 실제로는 데이터에서 계산
    return {
      highPriorityCount,
      immediateActionsCount,
      topPriority: {
        location: '서울시 강남구 역삼동 123-45',
        index: 32,
        urgency: 'immediate'
      },
      topRecommendation: {
        location: '서울시 강남구 역삼동 123-45',
        type: '구조적 개선',
        impact: '편의성 지수 30점 이상 향상 예상'
      }
    }
  }, [])

  const guideSteps: GuideStep[] = [
    {
      step: 1,
      title: '우선순위 검사 대기열 확인',
      description: '편의성 지수와 위험도를 기준으로 자동 정렬된 검사 대기열을 확인하고, 우선 처리 대상 지역을 검토합니다.',
      sections: [
        '우선순위가 높은 지역의 자동 식별 및 정렬 결과를 조회할 수 있습니다.',
        '지역별 편의성 지수 및 위험도 점수를 확인할 수 있습니다.',
        '검사 상태를 업데이트하고 처리 진행 현황을 관리할 수 있습니다.'
      ]
    },
    {
      step: 2,
      title: '사각지대 탐지',
      description: '데이터가 부족하거나 장기간 모니터링되지 않은 지역을 식별하여 관리 공백을 최소화합니다.',
      sections: [
        '데이터 수집이 충분하지 않은 지역을 확인할 수 있습니다.',
        '장기간 신호가 감지되지 않은 지역을 조회할 수 있습니다.',
        '모니터링 커버리지를 분석하고 개선 방향을 검토할 수 있습니다.'
      ]
    },
    {
      step: 3,
      title: '시간대별 패턴 분석',
      description: '시간대, 요일, 계절별 변화 패턴을 분석하여 효율적인 개입 시점을 도출합니다.',
      sections: [
        '시간대별 편의성 지수 변화 패턴을 확인할 수 있습니다.',
        '요일 및 계절 단위의 장기 트렌드를 분석할 수 있습니다.',
        '개입이 효과적인 시기와 주기를 검토할 수 있습니다.'
      ]
    },
    {
      step: 4,
      title: '개입 권고사항 검토',
      description: '시스템이 제안하는 개입 유형과 예상 효과를 검토하여 실행 여부를 판단합니다.',
      sections: [
        '지역별 맞춤형 개입 권고사항을 확인할 수 있습니다.',
        '예상 효과 및 비용-효과 분석 결과를 검토할 수 있습니다.',
        '권고사항 승인 및 실행 계획 수립을 지원합니다.'
      ]
    },
    {
      step: 5,
      title: '개입 전후 효과 추적',
      description: '개입 전후의 변화를 데이터로 비교·분석하여 향후 의사결정에 반영합니다.',
      sections: [
        '개입 전후 편의성 지수 변화를 조회할 수 있습니다.',
        '개입 효과 분석 리포트를 생성할 수 있습니다.',
        '성공 사례 및 추가 개선이 필요한 사항을 도출할 수 있습니다.'
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
          description="이 대시보드는 도시 편의성 지수를 기반으로 효율적인 의사결정을 지원하기 위해 설계되었습니다. 아래 단계를 따라 순서대로 확인하시면 체계적으로 업무를 진행하실 수 있습니다."
          steps={guideSteps}
        />

        {/* 핵심 액션 요약 섹션 */}
        <div className="critical-actions-summary">
          <div className="critical-actions-header">
            <h2 className="critical-actions-title">지금 바로 확인해야 할 사항</h2>
            <p className="critical-actions-subtitle">시스템이 우선적으로 개입을 권고하는 항목입니다</p>
          </div>
          
          <div className="critical-actions-grid">
            <div 
              className="critical-action-card priority-card"
              onClick={() => scrollToSection('priority')}
            >
              <div className="critical-action-icon priority-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="critical-action-content">
                <div className="critical-action-main">
                  <span className="critical-action-label">우선순위 검사 대기</span>
                  <div className="critical-action-value">
                    <span className="critical-action-number">{criticalActions.highPriorityCount}</span>
                    <span className="critical-action-unit">건</span>
                  </div>
                </div>
                <div className="critical-action-detail">
                  <span className="critical-action-location">{criticalActions.topPriority.location}</span>
                  <span className="critical-action-index">편의성 지수: {criticalActions.topPriority.index}</span>
                </div>
              </div>
              <div className="critical-action-arrow">→</div>
            </div>

            <div 
              className="critical-action-card recommendation-card"
              onClick={() => scrollToSection('recommendations')}
            >
              <div className="critical-action-icon recommendation-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>
              <div className="critical-action-content">
                <div className="critical-action-main">
                  <span className="critical-action-label">즉시 개입 권고</span>
                  <div className="critical-action-value">
                    <span className="critical-action-number">{criticalActions.immediateActionsCount}</span>
                    <span className="critical-action-unit">건</span>
                  </div>
                </div>
                <div className="critical-action-detail">
                  <span className="critical-action-location">{criticalActions.topRecommendation.type}</span>
                  <span className="critical-action-index">{criticalActions.topRecommendation.impact}</span>
                </div>
              </div>
              <div className="critical-action-arrow">→</div>
            </div>
          </div>
        </div>

        <nav className="dashboard-nav">
          <div className="nav-menu">
            {menuItems.map((item) => (
              <button
                key={item.key}
                className={`nav-menu-item ${item.highlight ? 'highlight' : ''}`}
                onClick={() => scrollToSection(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="dashboard-content">
          <section ref={sections.priority} id="priority" className="dashboard-section priority-section">
            <PriorityQueue />
          </section>

          <section ref={sections.recommendations} id="recommendations" className="dashboard-section recommendation-section">
            <ActionRecommendations />
          </section>

          <section ref={sections.blindspot} id="blindspot" className="dashboard-section">
            <BlindSpotDetection />
          </section>

          <section ref={sections.timepattern} id="timepattern" className="dashboard-section">
            <TimePatternAnalysis />
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



