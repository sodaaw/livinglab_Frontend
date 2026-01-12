import { useState, useEffect } from 'react'
import LocationMap from './LocationMap'
import { apiClient, getTodayDateString } from '../../utils/api'
import './BlindSpotDetection.css'

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
  },
  {
    id: 'bs3',
    location: '서울시 종로구 혜화동 56-78',
    lat: 37.5860,
    lng: 127.0015,
    riskLevel: 'low',
    detectionReason: '모든 신호가 일치하나 비둘기 신호만 약함',
    signals: {
      human: { value: 8, status: 'normal' },
      geo: { value: 4.5, status: 'normal' },
      population: { value: 520, status: 'normal' },
      pigeon: { detected: true, intensity: 'low' }
    },
    recommendedAction: '지속 모니터링 권장'
  }
]

// API 응답 타입 정의 (추정 - 실제 API 응답 구조에 맞게 조정 필요)
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

// API 응답을 BlindSpot으로 변환하는 함수
const mapApiResponseToBlindSpot = (apiItem: BlindSpotApiResponse, index: number): BlindSpot => {
  return {
    id: apiItem.unit_id || `bs-${index}`,
    location: apiItem.name || apiItem.unit_id || '위치 정보 없음',
    lat: apiItem.lat || 37.5665, // 기본값
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

const BlindSpotDetection = () => {
  const [blindSpots, setBlindSpots] = useState<BlindSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // API에서 데이터 가져오기
  useEffect(() => {
    const fetchBlindSpots = async () => {
      try {
        setLoading(true)
        setError(null)
        const date = getTodayDateString()
        const response = await apiClient.getBlindSpots({ date }) as BlindSpotApiResponse[]
        
        // 백엔드에서 받은 원본 데이터 로그 출력
        console.log('🔍 [사각지대 탐지] 백엔드 API 응답:', {
          endpoint: '/api/v1/dashboard/blind-spots',
          date,
          responseCount: Array.isArray(response) ? response.length : 0,
          rawData: response,
          sampleItem: Array.isArray(response) && response.length > 0 ? response[0] : null
        })
        
        if (Array.isArray(response) && response.length > 0) {
          const mappedBlindSpots = response.map((item, index) => mapApiResponseToBlindSpot(item, index))
          
          // 매핑된 데이터 로그 출력
          console.log('✅ [사각지대 탐지] 매핑 완료:', {
            mappedCount: mappedBlindSpots.length,
            mappedBlindSpots: mappedBlindSpots,
            sampleMappedItem: mappedBlindSpots[0] || null
          })
          
          setBlindSpots(mappedBlindSpots)
        } else {
          // API 응답이 비어있거나 형식이 다를 경우 더미데이터 사용
          console.warn('⚠️ API 응답이 비어있거나 형식이 다릅니다. 더미데이터를 사용합니다.')
          setBlindSpots(mockBlindSpots)
        }
      } catch (err) {
        console.error('❌ 사각지대 탐지 데이터 로딩 실패:', err)
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.')
        // 에러 발생 시 더미데이터로 fallback
        setBlindSpots(mockBlindSpots)
      } finally {
        setLoading(false)
      }
    }

    fetchBlindSpots()
  }, [])

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'high':
        return '높음'
      case 'medium':
        return '보통'
      case 'low':
        return '낮음'
      default:
        return risk
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'var(--chateau-green-600)'
      case 'medium':
        return 'var(--chateau-green-500)'
      case 'low':
        return 'var(--gray-500)'
      default:
        return 'var(--gray-500)'
    }
  }

  const getSignalStatusColor = (status: string) => {
    switch (status) {
      case 'high':
        return 'var(--chateau-green-600)'
      case 'normal':
        return 'var(--gray-500)'
      case 'low':
        return 'var(--gray-400)'
      default:
        return 'var(--gray-500)'
    }
  }

  if (loading) {
    return (
      <div className="blindspot-detection">
        <div className="section-header">
          <h2 className="heading-2">사각지대 탐지</h2>
          <p className="body-small text-secondary mt-sm">
            서로 다른 신호 간 차이를 분석해, 추가 점검이 필요한 지역을 식별합니다
          </p>
        </div>
        <div className="loading-state">
          <p className="body-medium text-secondary">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const mapLocations = blindSpots.map((spot) => ({
    id: spot.id,
    location: spot.location,
    lat: spot.lat,
    lng: spot.lng,
    comfortIndex: 0, // 사각지대는 지수 없음
    priority: spot.riskLevel as 'high' | 'medium' | 'low'
  }))

  return (
    <div className="blindspot-detection">
      <div className="section-header">
        <h2 className="heading-2">사각지대 탐지</h2>
        <p className="body-small text-secondary mt-sm">
          신호 간 불일치를 분석하여 행정 데이터가 놓치는 사각지대를 탐지합니다
        </p>
      </div>

      <div className="blindspot-map-section">
        <LocationMap
          locations={mapLocations}
          selectedLocationId={undefined}
          onLocationClick={() => {}}
        />
      </div>

      {error && (
        <div className="error-state" style={{ padding: '16px', marginBottom: '16px', backgroundColor: 'var(--gray-100)', borderRadius: '4px' }}>
          <p className="body-small" style={{ color: 'var(--chateau-green-600)' }}>
            ⚠️ {error}
          </p>
        </div>
      )}

      <div className="blindspot-list">
        {blindSpots.map((spot) => (
          <div key={spot.id} className="blindspot-item">
            <div className="blindspot-header">
              <div>
                <h3 className="heading-4">{spot.location}</h3>
                <p className="blindspot-reason">{spot.detectionReason}</p>
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
                    <span className="signal-status">{spot.signals.human.status === 'low' ? '낮음' : spot.signals.human.status === 'normal' ? '보통' : '높음'}</span>
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
                    <span className="signal-status">{spot.signals.geo.status === 'low' ? '낮음' : spot.signals.geo.status === 'normal' ? '보통' : '높음'}</span>
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
                    <span className="signal-status">{spot.signals.population.status === 'low' ? '낮음' : spot.signals.population.status === 'normal' ? '보통' : '높음'}</span>
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
      </div>
    </div>
  )
}

export default BlindSpotDetection

