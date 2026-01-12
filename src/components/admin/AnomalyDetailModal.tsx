import { useState, useEffect } from 'react'
import { apiClient, getTodayDateString } from '../../utils/api'
import './AnomalyDetailModal.css'

interface AnomalyDetail {
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
}

interface AnomalyDetailModalProps {
  unitId: string
  date?: string
  onClose: () => void
}

const AnomalyDetailModal = ({ unitId, date, onClose }: AnomalyDetailModalProps) => {
  const [anomaly, setAnomaly] = useState<AnomalyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 더미 데이터
  const mockAnomalyDetail: AnomalyDetail = {
    unit_id: unitId,
    date: date || getTodayDateString(),
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
    name: `지역 ${unitId}`
  }

  useEffect(() => {
    const fetchAnomalyDetail = async () => {
      try {
        setLoading(true)
        setError(null)

        const queryDate = date || getTodayDateString()
        const response = await apiClient.getAnomalyByUnit(unitId, { date: queryDate }) as AnomalyDetail

        console.log('🔍 [이상 탐지 상세] 백엔드 API 응답:', {
          endpoint: `/api/v1/anomaly/${unitId}`,
          unitId,
          date: queryDate,
          rawData: response
        })

        if (response && response.unit_id) {
          setAnomaly(response)
          console.log('✅ [이상 탐지 상세] API 데이터 사용:', response)
        } else {
          // API 응답이 비어있거나 유효하지 않은 경우 더미데이터 사용
          console.warn('⚠️ [이상 탐지 상세] API 응답이 비어있거나 유효하지 않습니다. 더미데이터로 보완합니다.', {
            response: response
          })
          setAnomaly(mockAnomalyDetail)
        }
      } catch (err) {
        console.error('❌ 이상 탐지 상세 데이터 로딩 실패:', err)
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.')
        // 에러 발생 시 더미데이터로 fallback
        console.warn('⚠️ [이상 탐지 상세] 에러 발생으로 인해 더미데이터로 보완합니다.')
        setAnomaly(mockAnomalyDetail)
      } finally {
        setLoading(false)
      }
    }

    fetchAnomalyDetail()
  }, [unitId, date])

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
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="heading-2">이상 탐지 상세 정보</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="loading-state">
              <p className="body-medium text-secondary">데이터를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!anomaly) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="heading-2">이상 탐지 상세 정보</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="empty-state">
              <p className="body-medium text-secondary">이상 탐지 결과를 찾을 수 없습니다.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="heading-2">이상 탐지 상세 정보</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-state">
              <p className="body-small" style={{ color: 'var(--chateau-green-600)' }}>
                ⚠️ {error}
              </p>
            </div>
          )}

          <div className="anomaly-summary">
            <div className="anomaly-header-info">
              <h3 className="heading-3">{anomaly.name || anomaly.unit_id}</h3>
              <p className="anomaly-date">날짜: {anomaly.date}</p>
            </div>
            <div className="anomaly-score-display">
              <div className="score-main">
                <span className="score-label">이상 탐지 점수</span>
                <span 
                  className="score-value"
                  style={{ color: getAnomalyScoreColor(anomaly.anomaly_score) }}
                >
                  {(anomaly.anomaly_score * 100).toFixed(1)}%
                </span>
              </div>
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
            </div>
          </div>

          <div className="anomaly-explanation-section">
            <h4 className="section-title">탐지 설명</h4>
            <p className="explanation-text">{anomaly.explanation}</p>
          </div>

          {anomaly.features && Object.keys(anomaly.features).length > 0 && (
            <div className="anomaly-features-section">
              <h4 className="section-title">특성 분석</h4>
              <div className="features-grid">
                {anomaly.features.complaint_change_4w !== undefined && (
                  <div className="feature-item">
                    <span className="feature-label">4주간 민원 변화율</span>
                    <span className="feature-value">
                      {(anomaly.features.complaint_change_4w * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
                {anomaly.features.complaint_growth_rate !== undefined && (
                  <div className="feature-item">
                    <span className="feature-label">민원 증가율</span>
                    <span className="feature-value">
                      {(anomaly.features.complaint_growth_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
                {Object.entries(anomaly.features)
                  .filter(([key]) => key !== 'complaint_change_4w' && key !== 'complaint_growth_rate')
                  .map(([key, value]) => (
                    <div key={key} className="feature-item">
                      <span className="feature-label">{key}</span>
                      <span className="feature-value">
                        {typeof value === 'number' ? value.toFixed(2) : String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {anomaly.stats && Object.keys(anomaly.stats).length > 0 && (
            <div className="anomaly-stats-section">
              <h4 className="section-title">통계 정보</h4>
              <div className="stats-grid">
                {anomaly.stats.z_score !== undefined && (
                  <div className="stat-item">
                    <span className="stat-label">Z-score</span>
                    <span className="stat-value">{anomaly.stats.z_score.toFixed(2)}</span>
                  </div>
                )}
                {Object.entries(anomaly.stats)
                  .filter(([key]) => key !== 'z_score')
                  .map(([key, value]) => (
                    <div key={key} className="stat-item">
                      <span className="stat-label">{key}</span>
                      <span className="stat-value">
                        {typeof value === 'number' ? value.toFixed(2) : String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnomalyDetailModal

