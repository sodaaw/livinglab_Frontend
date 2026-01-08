import LocationMap from './LocationMap'
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
    detectionReason: '민원은 적으나 비둘기 활동이 급증하여 사각지대 가능성',
    signals: {
      human: { value: 3, status: 'low' },
      geo: { value: 6.5, status: 'normal' },
      population: { value: 450, status: 'normal' },
      pigeon: { detected: true, intensity: 'high' }
    },
    recommendedAction: '현장 점검 및 추가 모니터링 필요'
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
    recommendedAction: '구조 취약성과 신호 불일치 원인 분석 필요'
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

const BlindSpotDetection = () => {
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

  const mapLocations = mockBlindSpots.map((spot) => ({
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

      <div className="blindspot-list">
        {mockBlindSpots.map((spot) => (
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
                  위험도: {getRiskLabel(spot.riskLevel)}
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

