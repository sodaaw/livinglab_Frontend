import { useRef, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PriorityQueue from '../components/admin/PriorityQueue'
import ActionRecommendations from '../components/admin/ActionRecommendations'
import BeforeAfterTracking from '../components/admin/BeforeAfterTracking'
import TimePatternAnalysis from '../components/admin/TimePatternAnalysis'
import DetectionSection from '../components/admin/DetectionSection'
import SiteGuide, { GuideStep } from '../components/public/SiteGuide'
import UCIInfoModal from '../components/UCIInfoModal'
import { apiClient, getTodayDateString, formatDateToString, subtractDays, DataQualityResponse } from '../utils/api'
import { useScrollSpy } from '../hooks/useScrollSpy'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const sections = {
    priority: useRef<HTMLElement>(null),
    detection: useRef<HTMLElement>(null),
    timepattern: useRef<HTMLElement>(null),
    recommendations: useRef<HTMLElement>(null),
    tracking: useRef<HTMLElement>(null)
  }

  // Scroll-spy로 현재 활성 섹션 추적
  const activeSection = useScrollSpy({ sections, threshold: 0.25 })

  const scrollToSection = (sectionKey: keyof typeof sections, tab?: 'blindspot' | 'anomaly') => {
    const section = sections[sectionKey].current
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      
      // detection 섹션인 경우 탭 설정
      if (sectionKey === 'detection' && tab) {
        const newParams = new URLSearchParams(searchParams)
        newParams.set('detection', tab)
        setSearchParams(newParams, { replace: true })
      }
    }
  }

  const menuItems = [
    { key: 'priority' as const, label: '우선순위 검사 대기열' },
    { key: 'recommendations' as const, label: '개입 권고사항' },
    { key: 'detection' as const, label: '사각지대 탐지', tab: 'blindspot' as const },
    { key: 'detection' as const, label: '이상 탐지 결과', tab: 'anomaly' as const },
    { key: 'timepattern' as const, label: '시간대별 패턴 분석' },
    { key: 'tracking' as const, label: '개입 전후 효과 추적' }
  ]

  // 핵심 액션 요약 데이터
  const [isUCIInfoOpen, setIsUCIInfoOpen] = useState(false)
  const [dataQuality, setDataQuality] = useState<DataQualityResponse | null>(null)
  const [showDataQualityDetails, setShowDataQualityDetails] = useState(false)

  // 핵심 액션 요약 데이터
  const [criticalActions, setCriticalActions] = useState({
    highPriorityCount: 0,
    immediateActionsCount: 0,
    topPriority: {
      location: '데이터 로딩 중...',
      index: 0,
      urgency: 'immediate' as const
    },
    topRecommendation: {
      location: '데이터 로딩 중...',
      type: '개입 권고',
      impact: '데이터 로딩 중...'
    }
  })

  // API에서 핵심 액션 요약 데이터 가져오기
  useEffect(() => {
    const fetchCriticalActions = async () => {
      try {
        const date = getTodayDateString()
        
        // 우선순위 큐와 액션 카드 동시 조회
        const [priorityQueue, actionCards] = await Promise.all([
          apiClient.getPriorityQueue({ date, top_n: 20 }).catch(() => []),
          apiClient.getActionCards({ date }).catch(() => [])
        ]) as [any[], any[]]

        // 우선순위 큐에서 상위 항목 추출
        const highPriorityItems = Array.isArray(priorityQueue) 
          ? priorityQueue.filter((item: any) => item.uci_grade === 'E' || item.uci_grade === 'D')
          : []
        
        // 액션 카드에서 즉시 개입 항목 추출
        const immediateActions = Array.isArray(actionCards)
          ? actionCards.filter((card: any) => 
              card.tags?.some((tag: string) => tag.includes('immediate') || tag.includes('urgent'))
            )
          : []

        const topPriority = Array.isArray(priorityQueue) && priorityQueue.length > 0
          ? {
              location: priorityQueue[0].name || priorityQueue[0].unit_id || '위치 정보 없음',
              index: Math.round(priorityQueue[0].uci_score || 0),
              urgency: 'immediate' as const
            }
          : {
              location: '데이터 없음',
              index: 0,
              urgency: 'immediate' as const
            }

        const topRecommendation = Array.isArray(actionCards) && actionCards.length > 0
          ? {
              location: actionCards[0].unit_id || '위치 정보 없음',
              type: actionCards[0].recommended_actions?.[0] || actionCards[0].title || '개입 권고',
              impact: `신뢰도: ${((actionCards[0].confidence || 0.5) * 100).toFixed(0)}%`
            }
          : {
              location: '데이터 없음',
              type: '개입 권고',
              impact: '데이터 없음'
            }

        const finalCriticalActions = {
          highPriorityCount: highPriorityItems.length,
          immediateActionsCount: immediateActions.length,
          topPriority,
          topRecommendation
        }
        
        setCriticalActions(finalCriticalActions)
      } catch (err) {
        // 에러 발생 시 기본값 유지
      }
    }

    fetchCriticalActions()
  }, [])

  // 데이터 품질 정보 가져오기
  useEffect(() => {
    const fetchDataQuality = async () => {
      try {
        const endDate = getTodayDateString()
        const startDate = formatDateToString(subtractDays(new Date(), 30))
        
        const quality = await apiClient.getDataQuality({
          start_date: startDate,
          end_date: endDate
        })
        
        setDataQuality(quality)
      } catch (err) {
        // 에러 발생 시 무시 (데이터 품질 배지는 선택적)
      }
    }

    fetchDataQuality()
  }, [])

  const guideSteps: GuideStep[] = [
    {
      step: 1,
      title: '우선순위 검사 대기열 확인',
      description: '지금 가장 먼저 개입이 필요한 지역을 확인하세요.',
      sections: [
        '편의성 지수와 위험도를 기준으로 자동 정렬된 검사 대기열을 통해 우선적으로 검토해야 할 지역을 빠르게 파악할 수 있습니다.',
        '우선순위가 높은 지역을 자동으로 식별한 결과를 확인할 수 있습니다.',
        '지역별 도시 편의성 지수 및 위험도 점수를 비교·검토할 수 있습니다.',
        '검사 상태를 업데이트하며 처리 진행 현황을 관리할 수 있습니다.'
      ]
    },
    {
      step: 2,
      title: '사각지대 탐지',
      description: '관리에서 놓치고 있는 지역이 있는지 점검하세요.',
      sections: [
        '데이터 부족이나 장기간 모니터링 공백이 발생한 지역을 식별하여, 관리 사각지대를 최소화할 수 있습니다.',
        '데이터 수집이 충분하지 않은 지역을 확인할 수 있습니다.',
        '장기간 신호가 감지되지 않은 지역을 조회할 수 있습니다.',
        '전체 모니터링 커버리지를 분석하고 개선이 필요한 지점을 파악할 수 있습니다.'
      ]
    },
    {
      step: 3,
      title: '시간대별 패턴 분석',
      description: '언제 개입하는 것이 가장 효과적인지 판단하세요.',
      sections: [
        '시간대·요일·계절별 변화 패턴을 분석하여 효율적인 개입 시점과 주기를 도출할 수 있습니다.',
        '시간대별 도시 편의성 지수 변화 패턴을 확인할 수 있습니다.',
        '요일 및 계절 단위의 장기 트렌드를 분석할 수 있습니다.',
        '개입 효과가 높을 것으로 예상되는 시점을 검토할 수 있습니다.'
      ]
    },
    {
      step: 4,
      title: '개입 권고사항 검토',
      description: '시스템이 제안한 개입 방안을 검토하고 실행 여부를 결정하세요.',
      sections: [
        '분석 결과를 바탕으로 제안된 개입 유형과 그에 따른 예상 효과를 비교·검토할 수 있습니다.',
        '지역별 맞춤형 개입 권고사항을 확인할 수 있습니다.',
        '예상 효과 및 비용 대비 효과 분석 결과를 검토할 수 있습니다.',
        '개입 승인 여부를 판단하고 실행 계획 수립을 지원합니다.'
      ]
    },
    {
      step: 5,
      title: '개입 전후 효과 추적',
      description: '실제로 효과가 있었는지 데이터로 확인하세요.',
      sections: [
        '개입 전후의 변화를 비교 분석하여 향후 의사결정과 정책 개선에 활용할 수 있습니다.',
        '개입 전후 도시 편의성 지수 변화를 비교할 수 있습니다.',
        '개입 효과 분석 리포트를 생성할 수 있습니다.',
        '성공 사례와 추가 개선이 필요한 요소를 도출할 수 있습니다.'
      ]
    }
  ]

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="title">관리자 대시보드</h1>
          <p className="body-large text-secondary mt-md">
            지금 가장 먼저 개입해야 할 지역을 한눈에 판단하는 관리자 도구
          </p>
        </div>

        <UCIInfoModal
          isOpen={isUCIInfoOpen}
          onClose={() => setIsUCIInfoOpen(false)}
          variant="admin"
        />

        <SiteGuide
          title="관리자 사이트 활용 가이드"
          description="이 대시보드는 도시 편의성 지수(Urban Comfort Index)를 바탕으로, 어디를 먼저 확인하고 개입해야 할지 빠르게 판단할 수 있도록 설계되었습니다. 아래 단계를 따라가며 확인하시면, 의사결정 흐름을 자연스럽게 파악하실 수 있습니다."
          steps={guideSteps}
          onUCIInfoClick={() => setIsUCIInfoOpen(true)}
        />

        {/* 데이터 품질 배지 */}
        {dataQuality && dataQuality.success && (
          <div style={{ 
            marginBottom: '24px',
            padding: '12px 16px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer'
          }} onClick={() => setShowDataQualityDetails(!showDataQualityDetails)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  데이터 품질
                </span>
                {dataQuality.quality_score !== undefined && (
                  <span style={{ 
                    fontSize: 'var(--font-size-base)', 
                    fontWeight: 'var(--font-weight-bold)',
                    color: dataQuality.quality_score >= 80 ? 'var(--status-success-strong)' :
                           dataQuality.quality_score >= 60 ? 'var(--status-warning-text)' :
                           'var(--status-attention-strong)'
                  }}>
                    {dataQuality.quality_score.toFixed(2)}점
                  </span>
                )}
                {dataQuality.missing_data_points !== undefined && (
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    · 결측 {dataQuality.missing_data_points}건
                  </span>
                )}
                {dataQuality.outliers_detected !== undefined && (
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    · 이상치 {dataQuality.outliers_detected}건
                  </span>
                )}
                {dataQuality.date_range?.start && dataQuality.date_range?.end && (
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    ({dataQuality.date_range.start} ~ {dataQuality.date_range.end})
                  </span>
                )}
              </div>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                {showDataQualityDetails ? '▼' : '▶'}
              </span>
            </div>
            {showDataQualityDetails && (
              <div style={{ 
                marginTop: '16px', 
                paddingTop: '16px', 
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {dataQuality.completeness_score !== undefined && (
                    <div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        완전성 점수
                      </div>
                      <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                        {dataQuality.completeness_score.toFixed(2)}점
                      </div>
                    </div>
                  )}
                  {dataQuality.unit_id && (
                    <div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        지역 ID
                      </div>
                      <div style={{ fontSize: 'var(--font-size-base)' }}>
                        {dataQuality.unit_id}
                      </div>
                    </div>
                  )}
                  {dataQuality.report_date && (
                    <div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        리포트 생성일
                      </div>
                      <div style={{ fontSize: 'var(--font-size-base)' }}>
                        {dataQuality.report_date}
                      </div>
                    </div>
                  )}
                </div>
                {dataQuality.details && (dataQuality.details.human_signals || dataQuality.details.population_signals || dataQuality.details.comfort_index) && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      세부 정보
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {JSON.stringify(dataQuality.details, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 핵심 액션 요약 섹션 */}
        <div className="critical-actions-summary">
          <div className="critical-actions-header">
            <h2 className="critical-actions-title">지금 바로 확인이 필요한 항목</h2>
            <p className="critical-actions-subtitle">시스템이 우선적으로 개입을 권고하는 지역입니다</p>
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
                  <span className="critical-action-label">우선 검토가 필요한 지역</span>
                  <div className="critical-action-value">
                    <span className="critical-action-number">{criticalActions.highPriorityCount}</span>
                    <span className="critical-action-unit">건</span>
                  </div>
                </div>
                <div className="critical-action-detail">
                  <span className="critical-action-location">{criticalActions.topPriority.location}</span>
                  <span className="critical-action-index">현재 도시 편의성 지수: {criticalActions.topPriority.index}</span>
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
                  <span className="critical-action-label">즉시 개입이 필요한 항목 없음</span>
                </div>
                <div className="critical-action-detail">
                  <span className="critical-action-location">현재 긴급 개입 대상 지역은 없습니다</span>
                </div>
              </div>
              <div className="critical-action-arrow">→</div>
            </div>
          </div>
        </div>

        <nav className="dashboard-nav">
          <div className="nav-menu">
            {menuItems.map((item, index) => {
              // detection 섹션의 경우, 현재 탭에 따라 활성화 여부 결정
              const isActive = item.key === 'detection'
                ? activeSection === 'detection'
                : activeSection === item.key

              return (
                <button
                  key={`${item.key}-${index}`}
                  className={`nav-menu-item ${isActive ? 'active' : ''}`}
                  onClick={() => scrollToSection(item.key, (item as any).tab)}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </nav>

        <div className="dashboard-content">
          <section ref={sections.priority} id="priority" className="dashboard-section priority-section">
            <PriorityQueue />
          </section>

          <section ref={sections.recommendations} id="recommendations" className="dashboard-section recommendation-section">
            <ActionRecommendations />
          </section>

          <section ref={sections.detection} id="detection" className="dashboard-section">
            <DetectionSection 
              initialTab={searchParams.get('detection') === 'anomaly' ? 'anomaly' : 'blindspot'}
            />
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



