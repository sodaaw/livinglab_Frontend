import { useState, useEffect } from 'react'
import LocationMap from './LocationMap'
import AnomalyDetailModal from './AnomalyDetailModal'
import { apiClient, getTodayDateString } from '../../utils/api'
import './AnomalyDetection.css'

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

// 더미 데이터
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
  },
  {
    unit_id: '11200',
    date: getTodayDateString(),
    anomaly_score: 0.68,
    anomaly_flag: true,
    explanation: '비정상적인 패턴 감지 - 추가 조사 권장',
    features: {
      complaint_change_4w: 0.25,
      complaint_growth_rate: 0.18
    },
    stats: {
      z_score: 2.5
    },
    name: '서울시 성동구',
    lat: 37.5634,
    lng: 127.0366
  }
]

const AnomalyDetection = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)

  // API에서 데이터 가져오기
  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const date = getTodayDateString()
        const response = await apiClient.getAnomalies({ date }) as Anomaly[]
        
        if (Array.isArray(response) && response.length > 0) {
          setAnomalies(response)
        } else {
          // API 응답이 비어있거나 0인 경우 더미데이터 사용
          setAnomalies(mockAnomalies)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.')
        // 에러 발생 시 더미데이터로 fallback
        setAnomalies(mockAnomalies)
      } finally {
        setLoading(false)
      }
    }

    fetchAnomalies()
  }, [])

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

  if (loading) {
    return (
      <div className="anomaly-detection">
        <div className="section-header">
          <h2 className="heading-2">이상 탐지 결과</h2>
          <p className="body-small text-secondary mt-sm">
            통계적 이상치를 감지하여 급격한 변화가 있는 지역을 식별합니다
          </p>
        </div>
        <div className="loading-state">
          <p className="body-medium text-secondary">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const mapLocations = anomalies
    .filter(anomaly => anomaly.lat && anomaly.lng)
    .map((anomaly) => ({
      id: anomaly.unit_id,
      location: anomaly.name || anomaly.unit_id,
      lat: anomaly.lat!,
      lng: anomaly.lng!,
      comfortIndex: 0,
      priority: (anomaly.anomaly_score >= 0.8 ? 'high' : anomaly.anomaly_score >= 0.6 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    }))

  return (
    <div className="anomaly-detection">
      <div className="section-header">
        <h2 className="heading-2">이상 탐지 결과</h2>
        <p className="body-small text-secondary mt-sm">
          통계적 이상치를 감지하여 급격한 변화가 있는 지역을 식별합니다
        </p>
      </div>

      {error && (
        <div className="error-state" style={{ 
          padding: '12px 16px', 
          marginBottom: '16px', 
          backgroundColor: 'var(--gray-100)', 
          borderRadius: '4px' 
        }}>
          <p className="body-small" style={{ color: 'var(--chateau-green-600)' }}>
            ⚠️ {error}
          </p>
        </div>
      )}

      {mapLocations.length > 0 && (
        <div className="anomaly-map-section">
          <LocationMap
            locations={mapLocations}
            selectedLocationId={selectedUnitId || undefined}
            onLocationClick={(location) => {
              setSelectedUnitId(location.id)
              setSelectedDate(undefined) // 최신 날짜 사용
            }}
          />
        </div>
      )}

      <div className="anomaly-list">
        {anomalies.length === 0 ? (
          <div className="empty-state">
            <p className="body-medium text-secondary">이상 탐지된 지역이 없습니다.</p>
          </div>
        ) : (
          anomalies.map((anomaly) => (
            <div 
              key={anomaly.unit_id} 
              className="anomaly-item"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setSelectedUnitId(anomaly.unit_id)
                setSelectedDate(anomaly.date)
              }}
            >
              <div className="anomaly-header">
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
          ))
        )}
      </div>

      {selectedUnitId && (
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

export default AnomalyDetection

