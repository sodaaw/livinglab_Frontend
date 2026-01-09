import './ActionRecommendations.css'

interface Recommendation {
  id: string
  location: string
  interventionType: string
  description: string
  expectedImpact: string
  urgency: 'immediate' | 'short-term' | 'medium-term'
  estimatedCost?: string
  similarCases?: number
  costEffectiveness?: {
    roi: number
    expectedComplaintReduction: number
    expectedIndexImprovement: number
    paybackPeriod?: string
  }
  timePattern?: {
    recommendedHours: number[]
    recommendedDays: string[]
  }
  relatedSignals?: {
    human: boolean
    geo: boolean
    population: boolean
    pigeon?: boolean
  }
}

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    location: '서울시 강남구 역삼동 123-45',
    interventionType: '구조적 개선',
    description:
      '골목 구조 개선 및 환기 시스템 설치를 통한 근본적 환경 개선이 필요합니다. 좁은 골목 구조로 인한 공기 순환 문제가 주요 원인으로 분석됩니다.',
    expectedImpact: '편의성 지수 30점 이상 향상 예상',
    urgency: 'immediate',
    estimatedCost: '약 5,000만원',
    similarCases: 12,
    costEffectiveness: {
      roi: 185,
      expectedComplaintReduction: 75,
      expectedIndexImprovement: 30,
      paybackPeriod: '약 8개월'
    },
    timePattern: {
      recommendedHours: [20, 21, 22, 23],
      recommendedDays: ['월', '화', '수', '목', '금']
    },
    relatedSignals: {
      human: true,
      geo: true,
      population: true,
      pigeon: true
    }
  },
  {
    id: '2',
    location: '서울시 마포구 상암동 67-89',
    interventionType: '정기 관리 강화',
    description:
      '현재 구조는 양호하나 정기적인 청소 및 관리 주기를 단축하여 재발을 방지할 수 있습니다. 주민 인식 개선 캠페인 병행 권장.',
    expectedImpact: '편의성 지수 15점 이상 향상 예상',
    urgency: 'short-term',
    estimatedCost: '약 500만원',
    similarCases: 8,
    costEffectiveness: {
      roi: 240,
      expectedComplaintReduction: 60,
      expectedIndexImprovement: 15,
      paybackPeriod: '약 3개월'
    },
    timePattern: {
      recommendedHours: [19, 20, 21],
      recommendedDays: ['월', '화', '수', '목', '금']
    },
    relatedSignals: {
      human: true,
      geo: false,
      population: true,
      pigeon: false
    }
  },
  {
    id: '3',
    location: '서울시 종로구 명륜동 12-34',
    interventionType: '모니터링 강화',
    description:
      '현재 상태는 안정적이나 지속적인 모니터링을 통해 악화 징후를 조기에 감지하는 것이 중요합니다. 추가 개입은 불필요해 보입니다.',
    expectedImpact: '현 상태 유지 및 예방적 관리',
    urgency: 'medium-term',
    estimatedCost: '약 100만원',
    similarCases: 5,
    costEffectiveness: {
      roi: 150,
      expectedComplaintReduction: 30,
      expectedIndexImprovement: 5,
      paybackPeriod: '약 6개월'
    },
    timePattern: {
      recommendedHours: [14, 15, 16],
      recommendedDays: ['월', '화', '수', '목', '금']
    },
    relatedSignals: {
      human: true,
      geo: false,
      population: false,
      pigeon: true
    }
  }
]

const ActionRecommendations = () => {
  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'immediate':
        return '즉시'
      case 'short-term':
        return '단기'
      case 'medium-term':
        return '중기'
      default:
        return urgency
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate':
        return 'var(--chateau-green-600)'
      case 'short-term':
        return 'var(--chateau-green-500)'
      case 'medium-term':
        return 'var(--gray-500)'
      default:
        return 'var(--gray-500)'
    }
  }

  return (
    <div className="action-recommendations">
      <div className="section-header recommendation-section-header">
        <div className="section-header-content">
          <div className="section-header-icon recommendation-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <div>
            <h2 className="heading-2 recommendation-heading">개입 권고사항</h2>
            <p className="body-small text-secondary mt-sm">
              데이터 기반 개입 유형 및 예상 효과 분석
            </p>
          </div>
        </div>
        <div className="section-header-badge recommendation-badge-header">
          <span className="badge-label">즉시 검토 권장</span>
        </div>
      </div>

      <div className="recommendations-grid">
        {mockRecommendations.map((rec) => (
          <div key={rec.id} className="recommendation-card">
            <div className="recommendation-header">
              <div className="recommendation-meta">
                <span
                  className="urgency-badge"
                  style={{ color: getUrgencyColor(rec.urgency) }}
                >
                  {getUrgencyLabel(rec.urgency)}
                </span>
                <span className="intervention-type">{rec.interventionType}</span>
              </div>
              {rec.similarCases && (
                <span className="similar-cases">
                  유사 사례 {rec.similarCases}건
                </span>
              )}
            </div>

            <h3 className="recommendation-location">{rec.location}</h3>

            <p className="recommendation-description">{rec.description}</p>

            <div className="recommendation-footer">
              <div className="impact-indicator">
                <span className="impact-label">예상 효과</span>
                <span className="impact-value">{rec.expectedImpact}</span>
              </div>
              {rec.estimatedCost && (
                <div className="cost-indicator">
                  <span className="cost-label">예상 비용</span>
                  <span className="cost-value">{rec.estimatedCost}</span>
                </div>
              )}
              {rec.costEffectiveness && (
                <div className="cost-effectiveness-section">
                  <div className="ce-header">
                    <span className="ce-title">비용-효과 분석</span>
                    <span className="roi-badge">ROI {rec.costEffectiveness.roi}%</span>
                  </div>
                  <div className="ce-details">
                    <div className="ce-item">
                      <span className="ce-label">예상 민원 감소율</span>
                      <span className="ce-value">{rec.costEffectiveness.expectedComplaintReduction}%</span>
                    </div>
                    <div className="ce-item">
                      <span className="ce-label">예상 지수 향상</span>
                      <span className="ce-value">+{rec.costEffectiveness.expectedIndexImprovement}점</span>
                    </div>
                    {rec.costEffectiveness.paybackPeriod && (
                      <div className="ce-item">
                        <span className="ce-label">회수 기간</span>
                        <span className="ce-value">{rec.costEffectiveness.paybackPeriod}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {rec.timePattern && (
                <div className="time-pattern-section">
                  <span className="pattern-label">권장 관리 시간</span>
                  <div className="pattern-info">
                    <span className="pattern-hours">
                      {rec.timePattern.recommendedHours.join(', ')}시
                    </span>
                    <span className="pattern-days">
                      {rec.timePattern.recommendedDays.join(', ')}요일
                    </span>
                  </div>
                </div>
              )}
              {rec.relatedSignals && (
                <div className="related-signals">
                  <span className="signals-label">관련 신호</span>
                  <div className="signals-tags">
                    {rec.relatedSignals.human && <span className="signal-tag human">Human</span>}
                    {rec.relatedSignals.geo && <span className="signal-tag geo">Geo</span>}
                    {rec.relatedSignals.population && <span className="signal-tag population">Population</span>}
                    {rec.relatedSignals.pigeon && <span className="signal-tag pigeon">비둘기</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActionRecommendations



