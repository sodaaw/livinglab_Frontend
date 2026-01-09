import { useState } from 'react'
import IndexCalculationModal from './IndexCalculationModal'
import './PriorityQueue.css'

interface InspectionItem {
  id: string
  location: string
  lat: number
  lng: number
  comfortIndex: number
  priority: 'high' | 'medium' | 'low'
  humanSignals: {
    complaints: number
    trend: 'increasing' | 'stable' | 'decreasing'
    recurrence: number
    timePattern?: {
      peakHours: number[]
      weekdayPattern: { [key: string]: number }
    }
  }
  geoSignals: {
    alleyStructure: string
    ventilation: string
    accessibility: string
    vulnerabilityScore: number
  }
  populationSignals?: {
    daytime: number
    nighttime: number
    changeRate: number
    trend: 'increasing' | 'stable' | 'decreasing'
  }
  pigeonSignals?: {
    detected: boolean
    intensity: 'high' | 'medium' | 'low' | null
    activityPattern?: {
      peakHours: number[]
      frequency: number
    }
    interpretation?: string
  }
  confounders?: {
    feeding: boolean
    seasonal: boolean
    commercial: boolean
    weather: boolean
    events: boolean
  }
  crossValidation?: {
    humanGeoMatch: number
    humanPopulationMatch: number
    allSignalsMatch: number
    blindSpotRisk: 'high' | 'medium' | 'low'
  }
  priorityReason?: {
    summary: string
    factors: string[]
    signalRiseRate: number
    structuralVulnerability: number
  }
  dataSource?: {
    human: { source: string; reliability: 'high' | 'medium' | 'low'; lastUpdate: string }
    geo: { source: string; reliability: 'high' | 'medium' | 'low'; lastUpdate: string }
    population?: { source: string; reliability: 'high' | 'medium' | 'low'; lastUpdate: string }
    pigeon?: { source: string; reliability: 'high' | 'medium' | 'low'; lastUpdate: string }
  }
  expertValidation?: {
    verified: boolean
    confoundersReviewed: boolean
    source?: string
  }
  lastInspection?: string
}

const mockData: InspectionItem[] = [
  {
    id: '1',
    location: '서울시 강남구 역삼동 123-45',
    lat: 37.5012,
    lng: 127.0396,
    comfortIndex: 32,
    priority: 'high',
    humanSignals: {
      complaints: 24,
      trend: 'increasing',
      recurrence: 8,
      timePattern: {
        peakHours: [20, 21, 22, 23],
        weekdayPattern: { 월: 3, 화: 4, 수: 5, 목: 4, 금: 3, 토: 2, 일: 3 }
      }
    },
    geoSignals: {
      alleyStructure: '좁음',
      ventilation: '불량',
      accessibility: '제한적',
      vulnerabilityScore: 8.5
    },
    populationSignals: {
      daytime: 1200,
      nighttime: 850,
      changeRate: 15.2,
      trend: 'increasing'
    },
    pigeonSignals: {
      detected: true,
      intensity: 'high',
      activityPattern: {
        peakHours: [6, 7, 18, 19],
        frequency: 45
      },
      interpretation: '비둘기 활동이 증가하여 환경 변화의 생태적 신호로 해석됩니다. 민원 데이터와 교차 검증 필요.'
    },
    confounders: {
      feeding: false,
      seasonal: false,
      commercial: true,
      weather: false,
      events: false
    },
    crossValidation: {
      humanGeoMatch: 85,
      humanPopulationMatch: 78,
      allSignalsMatch: 82,
      blindSpotRisk: 'low'
    },
    priorityReason: {
      summary: '야간 민원 집중, 구조 취약, 생활인구 증가, 비둘기 신호 강함',
      factors: ['야간 민원 급증', '골목 구조 취약', '야간 생활인구 증가', '비둘기 활동 증가'],
      signalRiseRate: 8.2,
      structuralVulnerability: 8.5
    },
    dataSource: {
      human: { source: '서울시 공개데이터', reliability: 'high', lastUpdate: '2024-01-28' },
      geo: { source: 'LX 공간정보', reliability: 'high', lastUpdate: '2024-01-25' },
      population: { source: '서울시 생활인구', reliability: 'high', lastUpdate: '2024-01-27' },
      pigeon: { source: 'YOLO 탐지 (선택적)', reliability: 'medium', lastUpdate: '2024-01-26' }
    },
    expertValidation: {
      verified: true,
      confoundersReviewed: true,
      source: '국립생태원 자문 반영'
    },
    lastInspection: '2024-01-15'
  },
  {
    id: '2',
    location: '서울시 마포구 상암동 67-89',
    lat: 37.5663,
    lng: 126.9019,
    comfortIndex: 45,
    priority: 'high',
    humanSignals: {
      complaints: 18,
      trend: 'increasing',
      recurrence: 6,
      timePattern: {
        peakHours: [19, 20, 21],
        weekdayPattern: { 월: 2, 화: 3, 수: 3, 목: 3, 금: 2, 토: 2, 일: 3 }
      }
    },
    geoSignals: {
      alleyStructure: '보통',
      ventilation: '보통',
      accessibility: '양호',
      vulnerabilityScore: 5.2
    },
    populationSignals: {
      daytime: 980,
      nighttime: 620,
      changeRate: 8.5,
      trend: 'increasing'
    },
    pigeonSignals: {
      detected: false,
      intensity: null,
      interpretation: '비둘기 신호 없음. Core 지표(Human/Geo/Population)만으로 우선순위 결정됨.'
    },
    confounders: {
      feeding: true,
      seasonal: false,
      commercial: false,
      weather: false,
      events: false
    },
    crossValidation: {
      humanGeoMatch: 72,
      humanPopulationMatch: 68,
      allSignalsMatch: 70,
      blindSpotRisk: 'medium'
    },
    priorityReason: {
      summary: '민원 증가 추세, 급이 영향 가능성, 생활인구 변화',
      factors: ['민원 증가 추세', '급이 영향 가능', '생활인구 변화'],
      signalRiseRate: 6.5,
      structuralVulnerability: 5.2
    },
    dataSource: {
      human: { source: '서울시 공개데이터', reliability: 'high', lastUpdate: '2024-01-28' },
      geo: { source: 'LX 공간정보', reliability: 'high', lastUpdate: '2024-01-25' },
      population: { source: '서울시 생활인구', reliability: 'high', lastUpdate: '2024-01-27' }
    },
    expertValidation: {
      verified: true,
      confoundersReviewed: true,
      source: '국립생태원 자문 반영'
    },
    lastInspection: '2024-01-20'
  },
  {
    id: '3',
    location: '서울시 종로구 명륜동 12-34',
    lat: 37.5825,
    lng: 126.9982,
    comfortIndex: 58,
    priority: 'medium',
    humanSignals: {
      complaints: 12,
      trend: 'stable',
      recurrence: 4,
      timePattern: {
        peakHours: [14, 15, 16],
        weekdayPattern: { 월: 2, 화: 2, 수: 2, 목: 2, 금: 2, 토: 1, 일: 1 }
      }
    },
    geoSignals: {
      alleyStructure: '넓음',
      ventilation: '양호',
      accessibility: '양호',
      vulnerabilityScore: 3.5
    },
    populationSignals: {
      daytime: 750,
      nighttime: 450,
      changeRate: -2.1,
      trend: 'stable'
    },
    pigeonSignals: {
      detected: true,
      intensity: 'low',
      activityPattern: {
        peakHours: [7, 8],
        frequency: 12
      },
      interpretation: '비둘기 활동이 낮아 환경 변화 신호가 약함. 지속 모니터링 권장.'
    },
    confounders: {
      feeding: false,
      seasonal: false,
      commercial: false,
      weather: false,
      events: false
    },
    crossValidation: {
      humanGeoMatch: 88,
      humanPopulationMatch: 85,
      allSignalsMatch: 86,
      blindSpotRisk: 'low'
    },
    priorityReason: {
      summary: '안정적 상태 유지, 구조 양호',
      factors: ['민원 안정적', '구조 양호', '생활인구 안정'],
      signalRiseRate: 1.2,
      structuralVulnerability: 3.5
    },
    dataSource: {
      human: { source: '서울시 공개데이터', reliability: 'high', lastUpdate: '2024-01-28' },
      geo: { source: 'LX 공간정보', reliability: 'high', lastUpdate: '2024-01-25' },
      population: { source: '서울시 생활인구', reliability: 'high', lastUpdate: '2024-01-27' },
      pigeon: { source: 'YOLO 탐지 (선택적)', reliability: 'medium', lastUpdate: '2024-01-26' }
    },
    expertValidation: {
      verified: true,
      confoundersReviewed: true,
      source: '국립생태원 자문 반영'
    },
    lastInspection: '2024-01-10'
  },
  {
    id: '4',
    location: '서울시 송파구 잠실동 56-78',
    lat: 37.5133,
    lng: 127.1028,
    comfortIndex: 72,
    priority: 'low',
    humanSignals: {
      complaints: 5,
      trend: 'decreasing',
      recurrence: 2,
      timePattern: {
        peakHours: [12, 13],
        weekdayPattern: { 월: 1, 화: 1, 수: 1, 목: 1, 금: 1, 토: 0, 일: 0 }
      }
    },
    geoSignals: {
      alleyStructure: '넓음',
      ventilation: '양호',
      accessibility: '양호',
      vulnerabilityScore: 2.1
    },
    populationSignals: {
      daytime: 650,
      nighttime: 380,
      changeRate: -5.2,
      trend: 'decreasing'
    },
    pigeonSignals: {
      detected: false,
      intensity: null,
      interpretation: '비둘기 신호 없음. Core 지표만으로 충분히 판단 가능.'
    },
    confounders: {
      feeding: false,
      seasonal: false,
      commercial: false,
      weather: false,
      events: false
    },
    crossValidation: {
      humanGeoMatch: 92,
      humanPopulationMatch: 90,
      allSignalsMatch: 91,
      blindSpotRisk: 'low'
    },
    priorityReason: {
      summary: '민원 감소, 구조 양호, 생활인구 감소',
      factors: ['민원 감소 추세', '구조 양호', '생활인구 감소'],
      signalRiseRate: -3.5,
      structuralVulnerability: 2.1
    },
    dataSource: {
      human: { source: '서울시 공개데이터', reliability: 'high', lastUpdate: '2024-01-28' },
      geo: { source: 'LX 공간정보', reliability: 'high', lastUpdate: '2024-01-25' },
      population: { source: '서울시 생활인구', reliability: 'high', lastUpdate: '2024-01-27' }
    },
    expertValidation: {
      verified: true,
      confoundersReviewed: true,
      source: '국립생태원 자문 반영'
    },
    lastInspection: '2024-01-25'
  }
]

const PriorityQueue = () => {
  const [items] = useState<InspectionItem[]>(mockData)
  const [selectedLocationId, setSelectedLocationId] = useState<string | undefined>(items[0]?.id)
  const [showIndexModal, setShowIndexModal] = useState(false)
  const [selectedItemForModal, setSelectedItemForModal] = useState<InspectionItem | null>(null)

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '높음'
      case 'medium':
        return '보통'
      case 'low':
        return '낮음'
      default:
        return priority
    }
  }

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return '증가'
      case 'stable':
        return '유지'
      case 'decreasing':
        return '감소'
      default:
        return trend
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'var(--chateau-green-600)'
      case 'stable':
        return 'var(--gray-500)'
      case 'decreasing':
        return 'var(--chateau-green-400)'
      default:
        return 'var(--gray-500)'
    }
  }

  const handleIndexClick = (item: InspectionItem) => {
    setSelectedItemForModal(item)
    setShowIndexModal(true)
  }

  const selectedItem = items.find(item => item.id === selectedLocationId)

  return (
    <div className="priority-queue">
      <div className="section-header priority-section-header">
        <div className="section-header-content">
          <div className="section-header-icon priority-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h2 className="heading-2 priority-heading">우선순위 검사 대기열</h2>
            <p className="body-small text-secondary mt-sm">
              도시 편의성 지수와 신호 분석을 기반으로 한 순위별 검사 목록
            </p>
          </div>
        </div>
        <div className="section-header-badge priority-badge-header">
          <span className="badge-label">우선 처리 필요</span>
        </div>
      </div>

      <div className="queue-visualization">
        <div className="queue-cards">
          {items.map((item, index) => {
            const locationParts = item.location.split(' ')
            const district = locationParts.length > 2 ? locationParts[2] : locationParts[1] || item.location
            return (
              <div
                key={item.id}
                className={`queue-card ${selectedLocationId === item.id ? 'active' : ''}`}
                onClick={() => setSelectedLocationId(item.id)}
              >
                <div className="queue-card-rank">{index + 1}</div>
                <div className="queue-card-content">
                  <div className="queue-card-location">{district}</div>
                  <div className="queue-card-info">
                    <span className={`priority-badge priority-${item.priority}`}>
                      {getPriorityLabel(item.priority)}
                    </span>
                    <span className="queue-card-index">지수: {item.comfortIndex}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedItem && (
        <div className="queue-detail-view">
          <div className="queue-detail-header">
            <div className="queue-detail-title">
              <span className="queue-detail-rank">
                {items.findIndex(item => item.id === selectedLocationId) + 1}
              </span>
              <h3 className="heading-4">{selectedItem.location}</h3>
            </div>
            <div className="queue-item-badges">
              <span
                className={`priority-badge priority-${selectedItem.priority}`}
              >
                {getPriorityLabel(selectedItem.priority)}
              </span>
              <span 
                className="index-badge clickable"
                onClick={() => handleIndexClick(selectedItem)}
                title="지수 계산 근거 보기"
              >
                편의성 지수: {selectedItem.comfortIndex}
              </span>
              {selectedItem.expertValidation?.verified && (
                <span className="expert-badge" title={selectedItem.expertValidation.source}>
                  전문가 검증
                </span>
              )}
              {selectedItem.pigeonSignals?.detected && (
                <span className="pigeon-badge" title="비둘기 신호 감지됨">
                  생태 신호
                </span>
              )}
            </div>
          </div>

          <div className="queue-item-details">
            <div className="priority-confounders-row">
              {selectedItem.priorityReason && (
                <div className="detail-group priority-reason">
                  <h4 className="detail-label">우선순위 결정 근거</h4>
                  <p className="priority-summary">{selectedItem.priorityReason.summary}</p>
                  <div className="priority-factors">
                    {selectedItem.priorityReason.factors.map((factor, idx) => (
                      <span key={idx} className="factor-tag">{factor}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.confounders && Object.values(selectedItem.confounders).some(v => v) && (
                <div className="detail-group confounders">
                  <h4 className="detail-label">교란요인</h4>
                  <div className="confounder-tags">
                    {selectedItem.confounders.feeding && <span className="confounder-tag warning">급이</span>}
                    {selectedItem.confounders.seasonal && <span className="confounder-tag warning">계절성</span>}
                    {selectedItem.confounders.commercial && <span className="confounder-tag warning">상권</span>}
                    {selectedItem.confounders.weather && <span className="confounder-tag warning">기상</span>}
                    {selectedItem.confounders.events && <span className="confounder-tag warning">이벤트</span>}
                  </div>
                  {selectedItem.expertValidation?.confoundersReviewed && (
                    <small className="confounder-note">국립생태원 자문 반영됨</small>
                  )}
                </div>
              )}
            </div>

            <div className="signals-container">
              <div className="detail-group">
                <h4 className="detail-label">
                  인간 신호
                  {selectedItem.dataSource?.human && (
                    <span className="data-source-badge" title={`출처: ${selectedItem.dataSource.human.source}, 신뢰도: ${selectedItem.dataSource.human.reliability}`}>
                      {selectedItem.dataSource.human.reliability === 'high' ? '✓' : '○'}
                    </span>
                  )}
                </h4>
                <div className="detail-values">
                  <span className="detail-value">
                    민원: <strong>{selectedItem.humanSignals.complaints}건</strong>
                  </span>
                  <span className="detail-value">
                    추세:{' '}
                    <strong
                      style={{ color: getTrendColor(selectedItem.humanSignals.trend) }}
                    >
                      {getTrendLabel(selectedItem.humanSignals.trend)}
                    </strong>
                  </span>
                  <span className="detail-value">
                    재발: <strong>{selectedItem.humanSignals.recurrence}회</strong>
                  </span>
                  {selectedItem.humanSignals.timePattern && (
                    <span className="detail-value">
                      피크 시간: <strong>{selectedItem.humanSignals.timePattern.peakHours.join(', ')}시</strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="detail-group">
                <h4 className="detail-label">
                  지리 신호
                  {selectedItem.dataSource?.geo && (
                    <span className="data-source-badge" title={`출처: ${selectedItem.dataSource.geo.source}, 신뢰도: ${selectedItem.dataSource.geo.reliability}`}>
                      {selectedItem.dataSource.geo.reliability === 'high' ? '✓' : '○'}
                    </span>
                  )}
                </h4>
                <div className="detail-values">
                  <span className="detail-value">
                    골목 구조: {selectedItem.geoSignals.alleyStructure}
                  </span>
                  <span className="detail-value">
                    환기: {selectedItem.geoSignals.ventilation}
                  </span>
                  <span className="detail-value">
                    접근성: {selectedItem.geoSignals.accessibility}
                  </span>
                  <span className="detail-value">
                    취약도 점수: <strong>{selectedItem.geoSignals.vulnerabilityScore}/10</strong>
                  </span>
                </div>
              </div>

              {selectedItem.populationSignals && (
                <div className="detail-group">
                  <h4 className="detail-label">
                    생활인구 신호
                    {selectedItem.dataSource?.population && (
                      <span className="data-source-badge" title={`출처: ${selectedItem.dataSource.population.source}, 신뢰도: ${selectedItem.dataSource.population.reliability}`}>
                        {selectedItem.dataSource.population.reliability === 'high' ? '✓' : '○'}
                      </span>
                    )}
                  </h4>
                  <div className="detail-values">
                    <span className="detail-value">
                      주간: <strong>{selectedItem.populationSignals.daytime.toLocaleString()}명</strong>
                    </span>
                    <span className="detail-value">
                      야간: <strong>{selectedItem.populationSignals.nighttime.toLocaleString()}명</strong>
                    </span>
                    <span className="detail-value">
                      변화율: <strong style={{ color: selectedItem.populationSignals.changeRate > 0 ? 'var(--chateau-green-600)' : 'var(--gray-500)' }}>
                        {selectedItem.populationSignals.changeRate > 0 ? '+' : ''}{selectedItem.populationSignals.changeRate.toFixed(1)}%
                      </strong>
                    </span>
                    <span className="detail-value">
                      추세:{' '}
                      <strong
                        style={{ color: getTrendColor(selectedItem.populationSignals.trend) }}
                      >
                        {getTrendLabel(selectedItem.populationSignals.trend)}
                      </strong>
                    </span>
                  </div>
                </div>
              )}

              {selectedItem.pigeonSignals && (
                <div className="detail-group pigeon-signals">
                  <h4 className="detail-label">
                    비둘기 신호 (해석 레이어)
                    {selectedItem.dataSource?.pigeon && (
                      <span className="data-source-badge" title={`출처: ${selectedItem.dataSource.pigeon.source}, 신뢰도: ${selectedItem.dataSource.pigeon.reliability}`}>
                        {selectedItem.dataSource.pigeon.reliability === 'high' ? '✓' : '○'}
                      </span>
                    )}
                  </h4>
                  {selectedItem.pigeonSignals.detected ? (
                    <div className="pigeon-detected">
                      <div className="pigeon-status">
                        <span className="pigeon-intensity">
                          강도: <strong>{selectedItem.pigeonSignals.intensity === 'high' ? '높음' : selectedItem.pigeonSignals.intensity === 'medium' ? '보통' : '낮음'}</strong>
                        </span>
                        {selectedItem.pigeonSignals.activityPattern && (
                          <span className="pigeon-frequency">
                            활동 빈도: <strong>{selectedItem.pigeonSignals.activityPattern.frequency}회/일</strong>
                          </span>
                        )}
                      </div>
                      {selectedItem.pigeonSignals.interpretation && (
                        <p className="pigeon-interpretation">{selectedItem.pigeonSignals.interpretation}</p>
                      )}
                      <div className="pigeon-note">
                        <small>비둘기 신호는 Core 지표의 보조 검증 레이어로 활용됩니다.</small>
                      </div>
                    </div>
                  ) : (
                    <div className="pigeon-not-detected">
                      <p className="pigeon-interpretation">
                        {selectedItem.pigeonSignals.interpretation || '비둘기 신호 없음. Core 지표만으로 우선순위 결정됨.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedItem.crossValidation && (
              <div className="detail-group cross-validation">
                <h4 className="detail-label">신호 교차 검증</h4>
                <div className="validation-scores">
                  <div className="validation-score">
                    <span className="score-label">Human-Geo 일치도</span>
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{ width: `${selectedItem.crossValidation.humanGeoMatch}%` }}
                      />
                      <span className="score-value">{selectedItem.crossValidation.humanGeoMatch}%</span>
                    </div>
                  </div>
                  <div className="validation-score">
                    <span className="score-label">Human-Population 일치도</span>
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{ width: `${selectedItem.crossValidation.humanPopulationMatch}%` }}
                      />
                      <span className="score-value">{selectedItem.crossValidation.humanPopulationMatch}%</span>
                    </div>
                  </div>
                  <div className="validation-score">
                    <span className="score-label">전체 신호 일치도</span>
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{ width: `${selectedItem.crossValidation.allSignalsMatch}%` }}
                      />
                      <span className="score-value">{selectedItem.crossValidation.allSignalsMatch}%</span>
                    </div>
                  </div>
                </div>
                {selectedItem.crossValidation.blindSpotRisk === 'high' && (
                  <div className="blindspot-warning">
                    <strong>사각지대 위험 높음</strong> - 추가 조사 권장
                  </div>
                )}
              </div>
            )}

            {selectedItem.lastInspection && (
              <div className="detail-group">
                <span className="detail-value text-tertiary">
                  최종 검사: {selectedItem.lastInspection}
                </span>
              </div>
            )}

            {selectedItem.humanSignals.timePattern && (
              <div className="expanded-details">
                <div className="time-pattern-section">
                  <h5 className="pattern-title">시간대별 패턴</h5>
                  <div className="time-pattern-chart">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} className="hour-bar">
                        <div 
                          className={`hour-fill ${selectedItem.humanSignals.timePattern!.peakHours.includes(i) ? 'peak' : ''}`}
                          style={{ 
                            height: selectedItem.humanSignals.timePattern!.peakHours.includes(i) ? '100%' : '30%' 
                          }}
                        />
                        <span className="hour-label">{i}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showIndexModal && selectedItemForModal && (
        <IndexCalculationModal
          item={selectedItemForModal}
          onClose={() => {
            setShowIndexModal(false)
            setSelectedItemForModal(null)
          }}
        />
      )}
    </div>
  )
}

export default PriorityQueue

