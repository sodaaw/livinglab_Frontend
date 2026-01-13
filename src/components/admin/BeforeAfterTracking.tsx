import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { apiClient } from '../../utils/api'
import './BeforeAfterTracking.css'

interface TrackingData {
  location: string
  interventionDate: string
  interventionType: string
  beforeData: { date: string; index: number }[]
  afterData: { date: string; index: number }[]
  improvement: number
}

const mockTrackingData: TrackingData[] = [
  {
    location: '서울시 강남구 논현동 45-67',
    interventionDate: '2024-01-10',
    interventionType: '구조적 개선',
    beforeData: [
      { date: '2023-11', index: 35 },
      { date: '2023-12', index: 32 },
      { date: '2024-01', index: 30 }
    ],
    afterData: [
      { date: '2024-01', index: 30 },
      { date: '2024-02', index: 58 },
      { date: '2024-03', index: 65 }
    ],
    improvement: 35
  },
  {
    location: '서울시 서초구 반포동 12-34',
    interventionDate: '2023-12-15',
    interventionType: '정기 관리 강화',
    beforeData: [
      { date: '2023-10', index: 48 },
      { date: '2023-11', index: 45 },
      { date: '2023-12', index: 42 }
    ],
    afterData: [
      { date: '2023-12', index: 42 },
      { date: '2024-01', index: 55 },
      { date: '2024-02', index: 62 }
    ],
    improvement: 20
  },
  {
    location: '서울시 용산구 이태원동 78-90',
    interventionDate: '2023-11-20',
    interventionType: '환기 시스템 설치',
    beforeData: [
      { date: '2023-09', index: 40 },
      { date: '2023-10', index: 38 },
      { date: '2023-11', index: 35 }
    ],
    afterData: [
      { date: '2023-11', index: 35 },
      { date: '2023-12', index: 52 },
      { date: '2024-01', index: 68 }
    ],
    improvement: 33
  }
]

// API 응답 타입 정의 (추정 - 실제 API 응답 구조에 맞게 조정 필요)
interface InterventionApiResponse {
  intervention_id: string
  unit_id?: string
  name?: string
  intervention_date?: string
  intervention_type?: string
  status?: 'active' | 'completed'
}

interface InterventionEffectApiResponse {
  baseline_data?: Array<{ date: string; uci_score: number }>
  followup_data?: Array<{ date: string; uci_score: number }>
  improvement?: number
}

// API 응답을 TrackingData로 변환하는 함수
const mapApiResponseToTrackingData = async (
  intervention: InterventionApiResponse
): Promise<TrackingData | null> => {
  try {
    // 개입 효과 데이터 조회
    const effect = await apiClient.getInterventionEffect(
      intervention.intervention_id,
      { baseline_weeks: 4, followup_weeks: 4 }
    ) as InterventionEffectApiResponse
    

    const beforeData = effect.baseline_data?.map(d => ({
      date: d.date.substring(0, 7), // YYYY-MM 형식으로 변환
      index: Math.round(d.uci_score),
    })) || []

    const afterData = effect.followup_data?.map(d => ({
      date: d.date.substring(0, 7),
      index: Math.round(d.uci_score),
    })) || []

    return {
      location: intervention.name || intervention.unit_id || '위치 정보 없음',
      interventionDate: intervention.intervention_date || '',
      interventionType: intervention.intervention_type || '개입',
      beforeData,
      afterData,
      improvement: effect.improvement || 0,
    }
  } catch (err) {
    return null
  }
}

const BeforeAfterTracking = () => {
  const [trackingData, setTrackingData] = useState<TrackingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // API에서 데이터 가져오기
  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 완료된 개입 사업 조회
        const interventions = await apiClient.getInterventions({ status: 'completed' }) as InterventionApiResponse[]
        
        
        if (Array.isArray(interventions) && interventions.length > 0) {
          // 상위 3개 개입만 조회 (성능 고려)
          const topInterventions = interventions.slice(0, 3)
          const trackingPromises = topInterventions.map(async (intervention) => {
            const result = await mapApiResponseToTrackingData(intervention)
            
            
            return result
          })
          const trackingResults = (await Promise.all(trackingPromises)).filter((t): t is TrackingData => t !== null)
          
          if (trackingResults.length > 0) {
            setTrackingData(trackingResults)
          } else {
            // API 응답이 비어있거나 형식이 다를 경우 더미데이터 사용
            setTrackingData(mockTrackingData)
          }
        } else {
          // 개입 사업이 없으면 더미데이터 사용
          setTrackingData(mockTrackingData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.')
        // 에러 발생 시 더미데이터로 fallback
        setTrackingData(mockTrackingData)
      } finally {
        setLoading(false)
      }
    }

    fetchInterventions()
  }, [])

  const getBeforeData = (data: TrackingData) => {
    const interventionDate = data.interventionDate.substring(0, 7)
    return [
      ...data.beforeData,
      // 개입일 시점의 데이터를 개입 전에도 포함
      ...data.afterData.filter(d => d.date === interventionDate)
    ]
  }
  
  const getAfterData = (data: TrackingData) => {
    return data.afterData
  }

  if (loading) {
    return (
      <div className="before-after-tracking">
        <div className="section-header">
          <h2 className="heading-2">개입 전후 효과 추적</h2>
          <p className="body-small text-secondary mt-sm">
            과거 개입 사례를 바탕으로, 개입 효과의 변화 흐름을 확인할 수 있습니다
          </p>
        </div>
        <div className="loading-state">
          <p className="body-medium text-secondary">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="before-after-tracking">
      <div className="section-header">
        <h2 className="heading-2">개입 전후 효과 추적</h2>
        <p className="body-small text-secondary mt-sm">
          과거 개입 사례를 바탕으로, 개입 효과의 변화 흐름을 확인할 수 있습니다
        </p>
      </div>

      {error && (
        <div className="error-state" style={{ padding: '16px', marginBottom: '16px', backgroundColor: 'var(--gray-100)', borderRadius: '4px' }}>
          <p className="body-small" style={{ color: 'var(--chateau-green-600)' }}>
            ⚠️ {error}
          </p>
        </div>
      )}

      <div className="tracking-list">
        {trackingData.map((data, index) => (
          <div key={index} className="tracking-item">
            <div className="tracking-header">
              <div>
                <h3 className="heading-4">{data.location}</h3>
                <div className="tracking-meta">
                  <span className="intervention-date">
                    개입일: {data.interventionDate}
                  </span>
                  <span className="intervention-type-badge">
                    {data.interventionType}
                  </span>
                </div>
              </div>
              <div className="improvement-indicator">
                <span className="improvement-label">개입 이후 변화</span>
                <span className="improvement-value">
                  +{data.improvement}점
                </span>
              </div>
            </div>

            <div className="tracking-chart">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--gray-200)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--gray-600)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="var(--gray-600)"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--white)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="index"
                    data={getBeforeData(data)}
                    stroke="var(--gray-400)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--gray-400)', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="개입 전"
                  />
                  <Line
                    type="monotone"
                    dataKey="index"
                    data={getAfterData(data)}
                    stroke="var(--chateau-green-600)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--chateau-green-600)', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="개입 후"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="tracking-legend">
              <div className="legend-item">
                <div className="legend-line before"></div>
                <span>개입 전</span>
              </div>
              <div className="legend-item">
                <div className="legend-line after"></div>
                <span>개입 후</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BeforeAfterTracking



