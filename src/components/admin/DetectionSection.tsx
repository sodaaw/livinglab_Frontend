import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import LocationMap from './LocationMap'
import AnomalyDetailModal from './AnomalyDetailModal'
import { apiClient, getTodayDateString } from '../../utils/api'
import './DetectionSection.css'

// 공통 타입 정의
type DetectionType = 'blindspot' | 'anomaly'

interface Location {
  id: string
  location: string
  lat: number
  lng: number
  comfortIndex: number
  priority: 'high' | 'medium' | 'low'
}

// BlindSpot 타입
interface BlindSpot {
  id: string
  location: string
  lat: number
  lng: number
  riskLevel: 'high' | 'medium' | 'low'
  detectionReason: string
  signals: {
    human: { value: number; status: 'low' | 'normal' | 'high' }
    geo: { value: number; status: 'low' | 'normal' | 'high' }
    population: { value: number; status: 'low' | 'normal' | 'high' }
    pigeon?: { detected: boolean; intensity: 'high' | 'medium' | 'low' | null }
  }
  recommendedAction: string
}

// Anomaly 타입
interface Anomaly {
  unit_id: string
  date: string
  anomaly_score: number
  anomaly_flag: boolean
  explanation: string
  features?: {
    complaint_change_4w?: number
    complaint_growth_rate?: number
    [key: string]: any
  }
  stats?: {
    z_score?: number
    [key: string]: any
  }
  name?: string
  lat?: number
  lng?: number
}

// API 응답 타입
interface BlindSpotApiResponse {
  unit_id: string
  name?: string
  risk_level: 'high' | 'medium' | 'low'
  detection_reason?: string
  signals?: {
    human?: { value: number; status: 'low' | 'normal' | 'high' }
    geo?: { value: number; status: 'low' | 'normal' | 'high' }
    population?: { value: number; status: 'low' | 'normal' | 'high' }
    pigeon?: { detected: boolean; intensity: 'high' | 'medium' | 'low' | null }
  }
  recommended_action?: string
  lat?: number
  lng?: number
}

// 더미 데이터
const mockBlindSpots: BlindSpot[] = [
  {
    id: 'bs1',
    location: '서울시 강남구 논현동 78-90',
    lat: 37.5120,
    lng: 127.0280,
    riskLevel: 'high',
    detectionReason: '민원 발생은 적으나 비둘기 활동 신호가 급증해, 행정 사각지대일 가능성이 있습니다',
    signals: {
      human: { value: 3, status: 'low' },
      geo: { value: 6.5, status: 'normal' },
      population: { value: 450, status: 'normal' },
      pigeon: { detected: true, intensity: 'high' }
    },
    recommendedAction: '현장 점검을 통해 원인 확인 및 추가 모니터링을 권장합니다'
  },
  {
    id: 'bs2',
    location: '서울시 마포구 합정동 12-34',
    lat: 37.5495,
    lng: 126.9139,
    riskLevel: 'medium',
    detectionReason: '구조는 취약하나 신호가 약함 - 우선순위 재검토 필요',
    signals: {
      human: { value: 2, status: 'low' },
      geo: { value: 8.2, status: 'high' },
      population: { value: 380, status: 'low' },
      pigeon: { detected: false, intensity: null }
    },
    recommendedAction: '구조 취약성과 신호 불일치 원인 분석을 권장합니다'
  }
]

const mockAnomalies: Anomaly[] = [
  {
    unit_id: '11110',
    date: getTodayDateString(),
    anomaly_score: 0.85,
    anomaly_flag: true,
    explanation: '최근 4주 민원이 45% 증가, 통계적 이상치 감지 (Z-score: 3.2) - 급격한 악화 신호',
    features: {
      complaint_change_4w: 0.45,
      complaint_growth_rate: 0.32
    },
    stats: {
      z_score: 3.2
    },
    name: '서울시 종로구',
    lat: 37.5735,
    lng: 126.9788
  },
  {
    unit_id: '11680',
    date: getTodayDateString(),
    anomaly_score: 0.72,
    anomaly_flag: true,
    explanation: '민원 증가율이 평균 대비 2.8배 높게 관측됨 - 주의 필요',
    features: {
      complaint_change_4w: 0.38,
      complaint_growth_rate: 0.28
    },
    stats: {
      z_score: 2.8
    },
    name: '서울시 강남구',
    lat: 37.5172,
    lng: 127.0473
  }
]

// API 응답을 BlindSpot으로 변환
const mapApiResponseToBlindSpot = (apiItem: BlindSpotApiResponse, index: number): BlindSpot => {
  return {
    id: apiItem.unit_id || `bs-${index}`,
    location: apiItem.name || apiItem.unit_id || '위치 정보 없음',
    lat: apiItem.lat || 37.5665,
    lng: apiItem.lng || 126.978,
    riskLevel: apiItem.risk_level || 'medium',
    detectionReason: apiItem.detection_reason || '신호 간 불일치 감지',
    signals: {
      human: apiItem.signals?.human || { value: 0, status: 'low' },
      geo: apiItem.signals?.geo || { value: 0, status: 'normal' },
      population: apiItem.signals?.population || { value: 0, status: 'normal' },
      pigeon: apiItem.signals?.pigeon,
    },
    recommendedAction: apiItem.recommended_action || '추가 조사 필요',
  }
}

interface DetectionSectionProps {
  initialTab?: DetectionType
}

const DetectionSection = ({ initialTab }: DetectionSectionProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // URL query에서 탭 읽기, 없으면 initialTab 또는 기본값 사용
  const getInitialTab = (): DetectionType => {
    const tabFromUrl = searchParams.get('detection') as DetectionType
    if (tabFromUrl === 'blindspot' || tabFromUrl === 'anomaly') {
      return tabFromUrl
    }
    return initialTab || 'blindspot'
  }
  
  const [activeTab, setActiveTab] = useState<DetectionType>(getInitialTab)
  
  // URL query 변경 감지하여 탭 동기화
  useEffect(() => {
    const tabFromUrl = searchParams.get('detection') as DetectionType
    if (tabFromUrl === 'blindspot' || tabFromUrl === 'anomaly') {
      if (tabFromUrl !== activeTab) {
        setActiveTab(tabFromUrl)
      }
    }
  }, [searchParams])
  
  // BlindSpot 상태
  const [blindSpots, setBlindSpots] = useState<BlindSpot[]>([])
  const [blindSpotLoading, setBlindSpotLoading] = useState(false)
  const [blindSpotError, setBlindSpotError] = useState<string | null>(null)
  
  // Anomaly 상태
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [anomalyLoading, setAnomalyLoading] = useState(false)
  const [anomalyError, setAnomalyError] = useState<string | null>(null)
  const [usingDummyData, setUsingDummyData] = useState(false)
  
  // 모달 상태
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)

  // URL query 업데이트
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams)
    if (activeTab === 'blindspot') {
      newParams.set('detection', 'blindspot')
    } else {
      newParams.set('detection', 'anomaly')
    }
    setSearchParams(newParams, { replace: true })
  }, [activeTab, searchParams, setSearchParams])

  // BlindSpot 데이터 가져오기
  useEffect(() => {
    if (activeTab !== 'blindspot') return

    const fetchBlindSpots = async () => {
      try {
        setBlindSpotLoading(true)
        setBlindSpotError(null)
        const date = getTodayDateString()
        const response = await apiClient.getBlindSpots({ date }) as BlindSpotApiResponse[]
        
        console.log('🔍 [사각지대 탐지] 백엔드 API 응답:', {
          endpoint: '/api/v1/dashboard/blind-spots',
          date,
          responseCount: Array.isArray(response) ? response.length : 0,
          rawData: response,
        })
        
        if (Array.isArray(response) && response.length > 0) {
          const mappedBlindSpots = response.map((item, index) => mapApiResponseToBlindSpot(item, index))
          setBlindSpots(mappedBlindSpots)
        } else {
          console.warn('⚠️ [사각지대 탐지] API 응답이 비어있습니다. 더미데이터를 사용합니다.')
          setBlindSpots(mockBlindSpots)
        }
      } catch (err) {
        console.error('❌ 사각지대 탐지 데이터 로딩 실패:', err)
        setBlindSpotError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.')
        setBlindSpots(mockBlindSpots)
      } finally {
        setBlindSpotLoading(false)
      }
    }

    fetchBlindSpots()
  }, [activeTab])

  // Anomaly 데이터 가져오기
  useEffect(() => {
    if (activeTab !== 'anomaly') return

    const fetchAnomalies = async () => {
      try {
        setAnomalyLoading(true)
        setAnomalyError(null)
        setUsingDummyData(false)
        
        const date = getTodayDateString()
        const response = await apiClient.getAnomalies({ date }) as Anomaly[]
        
        console.log('🔍 [이상 탐지] 백엔드 API 응답:', {
          endpoint: '/api/v1/anomaly',
          date,
          responseCount: Array.isArray(response) ? response.length : 0,
          rawData: response,
        })
        
        if (Array.isArray(response) && response.length > 0) {
          setAnomalies(response)
        } else {
          console.warn('⚠️ [이상 탐지] API 응답이 비어있거나 0입니다. 더미데이터로 보완합니다.')
          setAnomalies(mockAnomalies)
          setUsingDummyData(true)
        }
      } catch (err) {
        console.error('❌ 이상 탐지 데이터 로딩 실패:', err)
        setAnomalyError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.')
        setAnomalies(mockAnomalies)
        setUsingDummyData(true)
      } finally {
        setAnomalyLoading(false)
      }
    }

    fetchAnomalies()
  }, [activeTab])

  // 탭 전환 핸들러 (키보드 접근성)
  const handleTabKeyDown = (e: React.KeyboardEvent, targetTab: DetectionType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setActiveTab(targetTab)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setActiveTab('blindspot')
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setActiveTab('anomaly')
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveTab('blindspot')
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveTab('anomaly')
    }
  }

  const loading = activeTab === 'blindspot' ? blindSpotLoading : anomalyLoading
  const error = activeTab === 'blindspot' ? blindSpotError : anomalyError

  // 지도 위치 데이터 생성
  const mapLocations: Location[] = activeTab === 'blindspot'
    ? blindSpots.map((spot) => ({
        id: spot.id,
        location: spot.location,
        lat: spot.lat,
        lng: spot.lng,
        comfortIndex: 0,
        priority: spot.riskLevel
      }))
    : anomalies
        .filter(anomaly => anomaly.lat && anomaly.lng)
        .map((anomaly) => ({
          id: anomaly.unit_id,
          location: anomaly.name || anomaly.unit_id,
          lat: anomaly.lat!,
          lng: anomaly.lng!,
          comfortIndex: 0,
          priority: anomaly.anomaly_score >= 0.8 ? 'high' : anomaly.anomaly_score >= 0.6 ? 'medium' : 'low'
        }))

  return (
    <div className="detection-section">
      <div className="section-header">
        <h2 className="heading-2">탐지</h2>
        <p className="body-small text-secondary mt-sm">
          {activeTab === 'blindspot' 
            ? '신호 간 불일치를 분석하여 행정 데이터가 놓치는 사각지대를 탐지합니다'
            : '통계적 이상치를 감지하여 급격한 변화가 있는 지역을 식별합니다'}
        </p>
      </div>

      {/* 탭 UI */}
      <div className="detection-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'blindspot'}
          aria-controls="blindspot-panel"
          id="blindspot-tab"
          className={`detection-tab ${activeTab === 'blindspot' ? 'active' : ''}`}
          onClick={() => setActiveTab('blindspot')}
          onKeyDown={(e) => handleTabKeyDown(e, 'blindspot')}
        >
          사각지대 탐지
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'anomaly'}
          aria-controls="anomaly-panel"
          id="anomaly-tab"
          className={`detection-tab ${activeTab === 'anomaly' ? 'active' : ''}`}
          onClick={() => setActiveTab('anomaly')}
          onKeyDown={(e) => handleTabKeyDown(e, 'anomaly')}
        >
          이상치 탐지
        </button>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="detection-content">
        {loading ? (
          <div className="loading-state">
            <p className="body-medium text-secondary">데이터를 불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* 더미 데이터 경고 */}
            {activeTab === 'anomaly' && usingDummyData && (
              <div className="dummy-data-notice">
                <p className="body-small">
                  ⚠️ 현재 더미데이터로 표시 중입니다. API 응답이 비어있거나 0입니다.
                </p>
              </div>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="error-state">
                <p className="body-small">
                  ⚠️ {error} {activeTab === 'anomaly' && usingDummyData && '(더미데이터로 표시 중)'}
                </p>
              </div>
            )}

            {/* 지도 */}
            {mapLocations.length > 0 && (
              <div className="detection-map-section">
                <LocationMap
                  locations={mapLocations}
                  selectedLocationId={selectedUnitId || undefined}
                  onLocationClick={(location) => {
                    if (activeTab === 'anomaly') {
                      const anomaly = anomalies.find(a => a.unit_id === location.id)
                      setSelectedUnitId(location.id)
                      setSelectedDate(anomaly?.date)
                    }
                  }}
                />
              </div>
            )}

            {/* 결과 카드 리스트 */}
            <div className="detection-list">
              {activeTab === 'blindspot' ? (
                blindSpots.length === 0 ? (
                  <div className="empty-state">
                    <p className="body-medium text-secondary">사각지대가 탐지된 지역이 없습니다.</p>
                  </div>
                ) : (
                  <BlindSpotCards 
                    blindSpots={blindSpots}
                  />
                )
              ) : (
                anomalies.length === 0 ? (
                  <div className="empty-state">
                    <p className="body-medium text-secondary">이상 탐지된 지역이 없습니다.</p>
                  </div>
                ) : (
                  <AnomalyCards
                    anomalies={anomalies}
                    onAnomalyClick={(anomaly) => {
                      setSelectedUnitId(anomaly.unit_id)
                      setSelectedDate(anomaly.date)
                    }}
                  />
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* Anomaly 상세 모달 */}
      {activeTab === 'anomaly' && selectedUnitId && (
        <AnomalyDetailModal
          unitId={selectedUnitId}
          date={selectedDate}
          onClose={() => {
            setSelectedUnitId(null)
            setSelectedDate(undefined)
          }}
        />
      )}
    </div>
  )
}

// BlindSpot 카드 컴포넌트
interface BlindSpotCardsProps {
  blindSpots: BlindSpot[]
}

const BlindSpotCards = ({ blindSpots }: BlindSpotCardsProps) => {
  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'high': return '높음'
      case 'medium': return '보통'
      case 'low': return '낮음'
      default: return risk
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'var(--chateau-green-600)'
      case 'medium': return 'var(--chateau-green-500)'
      case 'low': return 'var(--gray-500)'
      default: return 'var(--gray-500)'
    }
  }

  const getSignalStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'var(--chateau-green-600)'
      case 'normal': return 'var(--gray-500)'
      case 'low': return 'var(--gray-400)'
      default: return 'var(--gray-500)'
    }
  }

  return (
    <>
      {blindSpots.map((spot) => (
        <div key={spot.id} className="detection-item blindspot-item">
          <div className="detection-header">
            <div>
              <h3 className="heading-4">{spot.location}</h3>
              <p className="detection-reason">{spot.detectionReason}</p>
            </div>
            <div className="risk-badge-container">
              <span
                className="risk-badge"
                style={{ 
                  backgroundColor: getRiskColor(spot.riskLevel) + '20',
                  color: getRiskColor(spot.riskLevel)
                }}
              >
                점검 필요도: {getRiskLabel(spot.riskLevel)}
              </span>
            </div>
          </div>

          <div className="blindspot-signals">
            <h4 className="signals-title">신호 분석</h4>
            <div className="signals-grid">
              <div className="signal-card">
                <span className="signal-name">Human-signal</span>
                <div className="signal-value-container">
                  <span 
                    className="signal-value"
                    style={{ color: getSignalStatusColor(spot.signals.human.status) }}
                  >
                    {spot.signals.human.value}
                  </span>
                  <span className="signal-status">
                    {spot.signals.human.status === 'low' ? '낮음' : spot.signals.human.status === 'normal' ? '보통' : '높음'}
                  </span>
                </div>
              </div>

              <div className="signal-card">
                <span className="signal-name">Geo-signal</span>
                <div className="signal-value-container">
                  <span 
                    className="signal-value"
                    style={{ color: getSignalStatusColor(spot.signals.geo.status) }}
                  >
                    {spot.signals.geo.value}
                  </span>
                  <span className="signal-status">
                    {spot.signals.geo.status === 'low' ? '낮음' : spot.signals.geo.status === 'normal' ? '보통' : '높음'}
                  </span>
                </div>
              </div>

              <div className="signal-card">
                <span className="signal-name">Population-signal</span>
                <div className="signal-value-container">
                  <span 
                    className="signal-value"
                    style={{ color: getSignalStatusColor(spot.signals.population.status) }}
                  >
                    {spot.signals.population.value}
                  </span>
                  <span className="signal-status">
                    {spot.signals.population.status === 'low' ? '낮음' : spot.signals.population.status === 'normal' ? '보통' : '높음'}
                  </span>
                </div>
              </div>

              {spot.signals.pigeon && (
                <div className="signal-card pigeon-signal">
                  <span className="signal-name">비둘기 신호</span>
                  <div className="signal-value-container">
                    {spot.signals.pigeon.detected ? (
                      <>
                        <span className="signal-value pigeon-detected">
                          {spot.signals.pigeon.intensity === 'high' ? '높음' : 
                           spot.signals.pigeon.intensity === 'medium' ? '보통' : '낮음'}
                        </span>
                        <span className="signal-status">감지됨</span>
                      </>
                    ) : (
                      <span className="signal-value pigeon-not-detected">없음</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="blindspot-action">
            <h4 className="action-title">권고 조치</h4>
            <p className="action-description">{spot.recommendedAction}</p>
          </div>
        </div>
      ))}
    </>
  )
}

// Anomaly 카드 컴포넌트
interface AnomalyCardsProps {
  anomalies: Anomaly[]
  onAnomalyClick: (anomaly: Anomaly) => void
}

const AnomalyCards = ({ anomalies, onAnomalyClick }: AnomalyCardsProps) => {
  const getAnomalyScoreColor = (score: number) => {
    if (score >= 0.8) return 'var(--chateau-green-600)'
    if (score >= 0.6) return 'var(--chateau-green-500)'
    return 'var(--gray-500)'
  }

  const getAnomalyScoreLabel = (score: number) => {
    if (score >= 0.8) return '높음'
    if (score >= 0.6) return '보통'
    return '낮음'
  }

  return (
    <>
      {anomalies.map((anomaly) => (
        <div 
          key={anomaly.unit_id} 
          className="detection-item anomaly-item"
          style={{ cursor: 'pointer' }}
          onClick={() => onAnomalyClick(anomaly)}
        >
          <div className="detection-header">
            <div>
              <h3 className="heading-4">{anomaly.name || anomaly.unit_id}</h3>
              <p className="anomaly-date">날짜: {anomaly.date}</p>
            </div>
            <div className="anomaly-badge-container">
              {anomaly.anomaly_flag && (
                <span
                  className="anomaly-badge"
                  style={{ 
                    backgroundColor: getAnomalyScoreColor(anomaly.anomaly_score) + '20',
                    color: getAnomalyScoreColor(anomaly.anomaly_score)
                  }}
                >
                  이상 탐지: {getAnomalyScoreLabel(anomaly.anomaly_score)}
                </span>
              )}
              <span className="anomaly-score">
                점수: {(anomaly.anomaly_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="anomaly-explanation">
            <h4 className="explanation-title">탐지 설명</h4>
            <p className="explanation-text">{anomaly.explanation}</p>
          </div>

          {(anomaly.features || anomaly.stats) && (
            <div className="anomaly-details">
              {anomaly.features && (
                <div className="detail-section">
                  <h4 className="detail-title">특성</h4>
                  <div className="detail-grid">
                    {anomaly.features.complaint_change_4w !== undefined && (
                      <div className="detail-item">
                        <span className="detail-label">4주간 민원 변화율</span>
                        <span className="detail-value">
                          {(anomaly.features.complaint_change_4w * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {anomaly.features.complaint_growth_rate !== undefined && (
                      <div className="detail-item">
                        <span className="detail-label">민원 증가율</span>
                        <span className="detail-value">
                          {(anomaly.features.complaint_growth_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {anomaly.stats && (
                <div className="detail-section">
                  <h4 className="detail-title">통계</h4>
                  <div className="detail-grid">
                    {anomaly.stats.z_score !== undefined && (
                      <div className="detail-item">
                        <span className="detail-label">Z-score</span>
                        <span className="detail-value">{anomaly.stats.z_score.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </>
  )
}

export default DetectionSection

