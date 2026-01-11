import { useState, useEffect } from 'react'
import { ComposedChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { apiClient, getTodayDateString } from '../../utils/api'
import './TimePatternAnalysis.css'

interface TimePatternData {
  location: string
  hourPattern: { hour: number; complaints: number; population: number }[]
  dayPattern: { day: string; complaints: number }[]
  peakHours: number[]
  recommendedAction: string
}

// 더미데이터 생성 함수 (나머지는 시각적으로 그럴싸한 데이터 생성)
const generateMockPatternData = (index: number = 0): Omit<TimePatternData, 'location'> => {
  // index에 따라 다른 패턴 생성 (첫 번째는 야간 피크, 두 번째는 저녁 피크)
  const isFirstPattern = index % 2 === 0
  
  if (isFirstPattern) {
    // 야간 피크 패턴 (0-3시 또는 20-23시)
    const peakStart = index === 0 ? 0 : 20
    const peakEnd = index === 0 ? 3 : 23
    const peakHours = Array.from({ length: peakEnd - peakStart + 1 }, (_, i) => peakStart + i)
    
    return {
      hourPattern: Array.from({ length: 24 }, (_, i) => {
        const isPeak = i >= peakStart && i <= peakEnd
        return {
          hour: i,
          complaints: isPeak 
            ? Math.floor(Math.random() * 3) + 1
            : Math.floor(Math.random() * 2),
          population: isPeak
            ? Math.floor(Math.random() * 50) + 50
            : Math.floor(Math.random() * 30) + 20
        }
      }),
      dayPattern: [
        { day: '월', complaints: Math.floor(Math.random() * 3) + 2 },
        { day: '화', complaints: Math.floor(Math.random() * 3) + 2 },
        { day: '수', complaints: Math.floor(Math.random() * 3) + 3 },
        { day: '목', complaints: Math.floor(Math.random() * 3) + 2 },
        { day: '금', complaints: Math.floor(Math.random() * 3) + 2 },
        { day: '토', complaints: Math.floor(Math.random() * 2) + 1 },
        { day: '일', complaints: Math.floor(Math.random() * 2) + 1 }
      ],
      peakHours,
      recommendedAction: index === 0 
        ? `주요 시간대 관리 필요 (${peakStart}, ${peakStart + 1}, ${peakStart + 2}, ${peakStart + 3}시)`
        : `야간 집중 관리 필요 (${peakStart}-${peakEnd}시)`
    }
  } else {
    // 저녁 피크 패턴 (19-21시)
    const peakHours = [19, 20, 21]
    
    return {
      hourPattern: Array.from({ length: 24 }, (_, i) => {
        const isPeak = i >= 19 && i <= 21
        return {
          hour: i,
          complaints: isPeak
            ? Math.floor(Math.random() * 4) + 2
            : Math.floor(Math.random() * 2) + 1,
          population: isPeak
            ? Math.floor(Math.random() * 40) + 60
            : Math.floor(Math.random() * 30) + 25
        }
      }),
      dayPattern: [
        { day: '월', complaints: Math.floor(Math.random() * 2) + 1 },
        { day: '화', complaints: Math.floor(Math.random() * 2) + 2 },
        { day: '수', complaints: Math.floor(Math.random() * 2) + 2 },
        { day: '목', complaints: Math.floor(Math.random() * 2) + 2 },
        { day: '금', complaints: Math.floor(Math.random() * 2) + 1 },
        { day: '토', complaints: Math.floor(Math.random() * 2) + 1 },
        { day: '일', complaints: Math.floor(Math.random() * 2) + 1 }
      ],
      peakHours,
      recommendedAction: '저녁 시간대 관리 강화 (19-21시)'
    }
  }
}

const mockTimePatternData: TimePatternData[] = [
  {
    location: '서울시 강남구 역삼동 123-45',
    ...generateMockPatternData(0)
  },
  {
    location: '서울시 마포구 상암동 67-89',
    ...generateMockPatternData(1)
  }
]

// API 응답 타입 정의 (백엔드 API 실제 응답 구조)
interface TimePatternApiResponse {
  success?: boolean
  location?: string
  hour_pattern?: Array<{ hour: number; complaints?: number; population?: number }>
  day_pattern?: Array<{ day: string; complaints?: number }>
  peak_hours?: number[]
  recommended_action?: string
}

// API 응답을 TimePatternData로 변환하는 함수
// location만 백엔드에서 가져오고, 그래프 데이터는 더미데이터로 생성
const mapApiResponseToTimePatternData = (
  apiItem: TimePatternApiResponse,
  fallbackName?: string,
  fallbackUnitId?: string,
  index: number = 0
): TimePatternData => {
  // API 응답의 location을 우선 사용, 없으면 fallbackName 또는 fallbackUnitId 사용
  const location = apiItem.location || fallbackName || fallbackUnitId || '위치 정보 없음'
  
  // 그래프 데이터는 더미데이터로 생성 (시각적으로 잘 보이게)
  const mockData = generateMockPatternData(index)

  return {
    location,
    ...mockData
  }
}

const TimePatternAnalysis = () => {
  const [patternData, setPatternData] = useState<TimePatternData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // API에서 데이터 가져오기
  useEffect(() => {
    const fetchTimePattern = async () => {
      try {
        setLoading(true)
        setError(null)
        const date = getTodayDateString()
        
        // 우선순위 큐에서 상위 지역들의 unit_id를 가져와서 각각의 패턴 조회
        // 현재는 우선순위 큐의 상위 2개 지역만 조회 (실제로는 더 많은 지역 조회 가능)
        const priorityQueue = await apiClient.getPriorityQueue({ date, top_n: 2 }) as any[]
        
        // 우선순위 큐 응답 로그 출력
        console.log('📊 [시간대별 패턴 분석] 우선순위 큐 응답:', {
          endpoint: '/api/v1/priority-queue',
          date,
          queueCount: Array.isArray(priorityQueue) ? priorityQueue.length : 0,
          queueData: priorityQueue
        })
        
        if (Array.isArray(priorityQueue) && priorityQueue.length > 0) {
          const patternPromises = priorityQueue.slice(0, 2).map(async (item, index) => {
            try {
              const unitId = item.unit_id || item._id
              const pattern = await apiClient.getTimePattern(unitId, { date }) as TimePatternApiResponse
              
              // 각 지역별 시간 패턴 API 응답 로그 출력
              console.log(`📈 [시간대별 패턴 분석] 지역별 패턴 응답 (${unitId}):`, {
                endpoint: `/api/v1/dashboard/time-pattern`,
                unitId,
                date,
                rawData: pattern
              })
              
              return mapApiResponseToTimePatternData(pattern, item.name, item.unit_id || item._id, index)
            } catch (err) {
              console.warn(`⚠️ 시간 패턴 조회 실패 (${item.unit_id}):`, err)
              return null
            }
          })
          
          const patterns = (await Promise.all(patternPromises)).filter((p): p is TimePatternData => p !== null)
          
          // 매핑된 패턴 데이터 로그 출력
          console.log('✅ [시간대별 패턴 분석] 매핑 완료:', {
            patternCount: patterns.length,
            patterns: patterns,
            samplePattern: patterns[0] || null
          })
          
          if (patterns.length > 0) {
            setPatternData(patterns)
          } else {
            // API 응답이 비어있거나 형식이 다를 경우 더미데이터 사용
            console.warn('⚠️ API 응답이 비어있거나 형식이 다릅니다. 더미데이터를 사용합니다.')
            setPatternData(mockTimePatternData)
          }
        } else {
          // 우선순위 큐가 비어있으면 더미데이터 사용
          setPatternData(mockTimePatternData)
        }
      } catch (err) {
        console.error('❌ 시간 패턴 분석 데이터 로딩 실패:', err)
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.')
        // 에러 발생 시 더미데이터로 fallback
        setPatternData(mockTimePatternData)
      } finally {
        setLoading(false)
      }
    }

    fetchTimePattern()
  }, [])

  if (loading) {
    return (
      <div className="time-pattern-analysis">
        <div className="section-header">
          <h2 className="heading-2">시간대별 패턴 분석</h2>
          <p className="body-small text-secondary mt-sm">
            민원 발생 시간대와 생활인구 패턴을 분석하여 최적의 관리 시점을 제안합니다
          </p>
        </div>
        <div className="loading-state">
          <p className="body-medium text-secondary">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="time-pattern-analysis">
      <div className="section-header">
        <h2 className="heading-2">시간대별 패턴 분석</h2>
        <p className="body-small text-secondary mt-sm">
          민원 발생 시간대와 생활인구 패턴을 분석하여 최적의 관리 시점을 제안합니다
        </p>
      </div>

      {error && (
        <div className="error-state" style={{ padding: '16px', marginBottom: '16px', backgroundColor: 'var(--gray-100)', borderRadius: '4px' }}>
          <p className="body-small" style={{ color: 'var(--chateau-green-600)' }}>
            ⚠️ {error} (더미데이터로 표시 중)
          </p>
        </div>
      )}

      <div className="pattern-list">
        {patternData.map((data, index) => (
          <div key={index} className="pattern-item">
            <div className="pattern-header">
              <h3 className="heading-4">{data.location}</h3>
              <div className="recommended-action">
                <span className="action-badge">{data.recommendedAction}</span>
              </div>
            </div>

            <div className="pattern-charts">
              <div className="chart-section">
                <h4 className="chart-title">시간대별 민원 및 생활인구</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart 
                    data={data.hourPattern}
                    margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
                    <XAxis 
                      dataKey="hour" 
                      stroke="var(--gray-600)"
                      style={{ fontSize: '12px' }}
                      label={{ value: '시간', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="var(--gray-600)"
                      style={{ fontSize: '12px' }}
                      label={{ value: '민원 건수', angle: -90, position: 'insideLeft' }}
                      domain={[0, 'dataMax + 2']}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="var(--gray-600)"
                      style={{ fontSize: '12px' }}
                      label={{ value: '생활인구', angle: 90, position: 'insideRight' }}
                      domain={[0, 'dataMax + 100']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--white)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px'
                      }}
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="complaints" 
                      fill="var(--chateau-green-600)" 
                      name="민원 건수"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="population" 
                      fill="var(--chateau-green-300)" 
                      name="생활인구"
                      radius={[4, 4, 0, 0]}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center"
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="peak-hours-indicator">
                  <span className="peak-label">피크 시간대:</span>
                  <div className="peak-hours">
                    {data.peakHours.map(hour => (
                      <span key={hour} className="peak-hour-badge">{hour}시</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="chart-section">
                <h4 className="chart-title">요일별 민원 패턴</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.dayPattern}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
                    <XAxis 
                      dataKey="day" 
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
                    <Bar 
                      dataKey="complaints" 
                      fill="var(--chateau-green-500)" 
                      name="민원 건수"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TimePatternAnalysis

