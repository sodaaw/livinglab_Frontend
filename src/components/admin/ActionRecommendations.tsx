import { useState, useEffect } from 'react'
import { apiClient, getTodayDateString } from '../../utils/api'
import './ActionRecommendations.css'

interface Recommendation {
  id: string
  location: string
  interventionType: string
  description: string
  expectedImpact: string
  urgency: 'immediate' | 'short-term' | 'medium-term'
  estimatedCost?: string
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
      '골목 구조와 환기 문제로 인한 불편이 반복적으로 관측되어, 구조적 개선을 우선 검토할 필요가 있습니다.',
    expectedImpact: '도시 편의성 지수 약 30점 이상 개선 예상',
    urgency: 'immediate',
    estimatedCost: '약 5,000만원',
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
      '현재 구조는 비교적 안정적이나, 관리 주기 단축을 통해 재발 가능성을 낮출 수 있습니다.',
    expectedImpact: '도시 편의성 지수 약 15점 이상 개선 예상',
    urgency: 'short-term',
    estimatedCost: '약 500만원',
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
      '현재 상태는 안정적이나 지속적인 모니터링을 통해 악화 징후를 조기에 감지하는 것이 중요합니다. 현 시점에서는 추가 개입보다 지속적인 모니터링이 적절해 보입니다.',
    expectedImpact: '현 상태 유지 및 예방적 관리',
    urgency: 'medium-term',
    estimatedCost: '약 100만원',
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

// API 응답 타입 정의
interface ActionCardApiResponse {
  card_id: string
  title: string
  recommended_actions: string[]
  tags?: string[]
  confidence?: number
  unit_id?: string
  date?: string
}

// API 응답을 Recommendation으로 변환하는 함수
const mapApiResponseToRecommendation = (apiItem: ActionCardApiResponse, index: number): Recommendation => {
  // urgency는 tags에서 추론 (immediate, short-term, medium-term)
  let urgency: 'immediate' | 'short-term' | 'medium-term' = 'medium-term'
  if (apiItem.tags?.some(tag => tag.includes('immediate') || tag.includes('urgent'))) {
    urgency = 'immediate'
  } else if (apiItem.tags?.some(tag => tag.includes('short'))) {
    urgency = 'short-term'
  }

  return {
    id: apiItem.card_id || `rec-${index}`,
    location: apiItem.unit_id || '위치 정보 없음',
    interventionType: apiItem.recommended_actions?.[0] || '개입 권고',
    description: apiItem.title || apiItem.recommended_actions?.join(', ') || '',
    expectedImpact: `신뢰도: ${((apiItem.confidence || 0.5) * 100).toFixed(0)}%`,
    urgency,
    relatedSignals: {
      human: apiItem.tags?.some(tag => tag.includes('human') || tag.includes('complaint')) || false,
      geo: apiItem.tags?.some(tag => tag.includes('geo') || tag.includes('structure')) || false,
      population: apiItem.tags?.some(tag => tag.includes('population')) || false,
      pigeon: apiItem.tags?.some(tag => tag.includes('pigeon')) || false,
    },
  }
}

const ActionRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // API에서 데이터 가져오기
  useEffect(() => {
    const fetchActionCards = async () => {
      try {
        setLoading(true)
        setError(null)
        const date = getTodayDateString()
        const response = await apiClient.getActionCards({ date }) as ActionCardApiResponse[]
        
        if (Array.isArray(response) && response.length > 0) {
          const mappedRecommendations = response.map((item, index) => mapApiResponseToRecommendation(item, index))
          
          setRecommendations(mappedRecommendations)
        } else {
          // API 응답이 비어있거나 형식이 다를 경우 더미데이터 사용
          setRecommendations(mockRecommendations)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.')
        // 에러 발생 시 더미데이터로 fallback
        setRecommendations(mockRecommendations)
      } finally {
        setLoading(false)
      }
    }

    fetchActionCards()
  }, [])

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

  if (loading) {
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
        </div>
        <div className="loading-state">
          <p className="body-medium text-secondary">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
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
            <h2 className="heading-2 recommendation-heading">개입 권고안 요약</h2>
            <p className="body-small text-secondary mt-sm">
              데이터 분석을 바탕으로 검토가 필요한 개입 방안을 제안합니다
            </p>
          </div>
        </div>
        <div className="section-header-badge recommendation-badge-header">
          <span className="badge-label">우선 검토 권장</span>
        </div>
      </div>

      {error && (
        <div className="error-state" style={{ padding: '16px', marginBottom: '16px', backgroundColor: 'var(--gray-100)', borderRadius: '4px' }}>
          <p className="body-small" style={{ color: 'var(--chateau-green-600)' }}>
            ⚠️ {error}
          </p>
        </div>
      )}

      <div className="recommendations-grid">
        {recommendations.map((rec) => (
          <div key={rec.id} className="recommendation-card">
            <div className="recommendation-header">
              <div className="recommendation-meta">
                <span
                  className="urgency-badge"
                  data-variant="severity"
                  data-level={rec.urgency === 'immediate' ? 'immediate' : rec.urgency === 'short-term' ? 'short' : 'mid'}
                  data-urgency={rec.urgency}
                >
                  {getUrgencyLabel(rec.urgency)}
                </span>
                <span className="intervention-type">{rec.interventionType}</span>
              </div>
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
                    <span className="ce-title">비용 대비 효과 분석</span>
                    <span className="roi-badge">예상 ROI {rec.costEffectiveness.roi}%</span>
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



