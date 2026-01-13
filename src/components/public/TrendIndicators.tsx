import { useState, useEffect } from 'react'
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { apiClient, AnalyticsTrendResponse } from '../../utils/api'
import './TrendIndicators.css'

interface TrendIndicatorsProps {
  unitId?: string
}

interface TrendData {
  period: string
  citywide: number
  forecast?: number
  ma7?: number
  ma14?: number
}

const TrendIndicators = ({ unitId = '11110' }: TrendIndicatorsProps) => {
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsTrendResponse | null>(null)
  const [showMovingAverages, setShowMovingAverages] = useState(false)

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await apiClient.getAnalyticsTrend({
          unit_id: unitId,
          days: 30,
          forecast_days: 7
        })
        
        if (!response.hasData) {
          setError('데이터가 없습니다.')
          setLoading(false)
          return
        }
        
        setAnalyticsData(response)
        
        // moving_averages 데이터를 기반으로 차트 데이터 생성
        const ma7Data = response.moving_averages?.ma7 || []
        const ma14Data = response.moving_averages?.ma14 || []
        const forecastData = response.forecast || []
        
        // 날짜 범위 생성 (최근 30일 + 예측 7일)
        const today = new Date()
        const chartData: TrendData[] = []
        
        // 과거 데이터 (moving_averages 기준)
        const maxLength = Math.max(ma7Data.length, ma14Data.length, 30)
        for (let i = maxLength - 1; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
          
          chartData.push({
            period: dateStr,
            citywide: ma7Data[ma7Data.length - 1 - i] || 0,
            ma7: ma7Data[ma7Data.length - 1 - i],
            ma14: ma14Data[ma14Data.length - 1 - i]
          })
        }
        
        // 예측 데이터 추가
        forecastData.forEach((forecast) => {
          const forecastDate = new Date(forecast.date)
          const dateStr = `${forecastDate.getMonth() + 1}/${forecastDate.getDate()}`
          chartData.push({
            period: dateStr,
            citywide: forecast.value,
            forecast: forecast.value
          })
        })
        
        setTrendData(chartData)
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchTrendData()
  }, [unitId])

  // 등급별 설명
  const getGradeDescription = (grade: string): string => {
    switch (grade) {
      case 'A':
        return '매우 안정적이에요'
      case 'B':
        return '전반적으로 괜찮은 상태예요'
      case 'C':
        return '지켜볼 필요가 있어요'
      case 'D':
        return '불편이 늘고 있어요'
      case 'E':
        return '빠른 관리가 필요해요'
      default:
        return '확인 중이에요'
    }
  }

  // 추세 설명 문구 생성
  const getTrendDescription = (direction: string, changeRate: number): string => {
    if (direction === 'increasing') {
      if (changeRate > 50) {
        return '최근 수치 기준 빠르게 개선되고 있어요'
      } else if (changeRate > 20) {
        return '최근 들어 개선되고 있어요'
      } else {
        return '조금씩 개선되고 있어요'
      }
    } else if (direction === 'decreasing') {
      if (changeRate < -50) {
        return '최근 수치 기준 빠르게 악화되고 있어요'
      } else if (changeRate < -20) {
        return '최근 들어 악화되고 있어요'
      } else {
        return '조금씩 악화되고 있어요'
      }
    } else {
      return '전반적으로 유지되고 있어요'
    }
  }

  // 신뢰도 설명
  const getConfidenceDescription = (confidence: number): string => {
    if (confidence >= 0.8) {
      return '높음'
    } else if (confidence >= 0.6) {
      return '보통'
    } else {
      return '낮음'
    }
  }

  // 예측 등급 설명
  const getForecastGradeDescription = (value: number): string => {
    if (value >= 80) {
      return '매우 양호'
    } else if (value >= 70) {
      return '양호'
    } else if (value >= 60) {
      return '보통'
    } else if (value >= 50) {
      return '주의 필요'
    } else {
      return '관리 필요'
    }
  }

  if (loading) {
    return (
      <div className="trend-indicators">
        <div className="section-header">
          <h2 className="heading-2">지금 우리 지역은 어떤 흐름인가요?</h2>
          <p className="body-small text-secondary mt-sm">
            최근 도시 환경의 변화 방향을 한눈에 보여드립니다.
          </p>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p className="body-medium text-secondary">정보를 불러오는 중이에요...</p>
        </div>
      </div>
    )
  }

  if (error || !analyticsData) {
    return (
      <div className="trend-indicators">
        <div className="section-header">
          <h2 className="heading-2">지금 우리 지역은 어떤 흐름인가요?</h2>
          <p className="body-small text-secondary mt-sm">
            최근 도시 환경의 변화 방향을 한눈에 보여드립니다.
          </p>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p className="body-medium text-secondary">
            {error || '정보를 불러올 수 없어요. 잠시 후 다시 시도해 주세요.'}
          </p>
        </div>
      </div>
    )
  }

  const currentIndex = analyticsData.current.uci_score
  const changeRate = parseFloat(analyticsData.trend.change_rate || '0')
  const changeType = analyticsData.trend.direction === 'increasing' ? 'positive' : 
                     analyticsData.trend.direction === 'decreasing' ? 'negative' : 'neutral'
  
  // 데이터 품질 경고
  const dataQualityWarning = analyticsData.data_quality === 'insufficient' ? 
    '최근 데이터가 충분하지 않아 예측이 부정확할 수 있어요.' : null

  const trendDescription = getTrendDescription(analyticsData.trend.direction, changeRate)
  const confidenceDescription = getConfidenceDescription(analyticsData.trend.confidence)

  return (
    <div className="trend-indicators">
      <div className="section-header">
        <h2 className="heading-2">지금 우리 지역은 어떤 흐름인가요?</h2>
        <p className="body-small text-secondary mt-sm">
          최근 도시 환경의 변화 방향을 한눈에 보여드립니다.
        </p>
      </div>

      {dataQualityWarning && (
        <div style={{ 
          padding: '12px 16px', 
          marginBottom: '16px', 
          backgroundColor: 'var(--status-warning-background)', 
          borderRadius: '4px',
          border: '1px solid var(--status-warning-text)'
        }}>
          <p className="body-small" style={{ color: 'var(--status-warning-text)' }}>
            ⚠️ {dataQualityWarning}
          </p>
        </div>
      )}

      <div className="trend-content">
        <div className="trend-summary">
          <div className="summary-card">
            <div className="summary-label">현재 우리 지역 상태</div>
            <div className="summary-value">{Math.round(currentIndex)}</div>
            <div style={{ 
              marginTop: '8px', 
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)'
            }}>
              종합 지수: {currentIndex.toFixed(1)}점
            </div>
            <div className="summary-grade" style={{ 
              marginTop: '8px', 
              fontSize: 'var(--font-size-base)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <span>등급: {analyticsData.current.uci_grade}</span>
              <span 
                title={getGradeDescription(analyticsData.current.uci_grade)}
                style={{ 
                  cursor: 'help',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--chateau-green-600)',
                  fontWeight: 'var(--font-weight-medium)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--chateau-green-300)'
                }}
              >
                ?
              </span>
              <span style={{ 
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-secondary)',
                fontStyle: 'italic'
              }}>
                ({getGradeDescription(analyticsData.current.uci_grade)})
              </span>
            </div>
            <div className={`summary-change ${changeType}`} style={{ marginTop: '12px' }}>
              <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', marginBottom: '4px' }}>
                전반적인 흐름: {trendDescription}
              </div>
              <div style={{ 
                fontSize: 'var(--font-size-sm)', 
                color: 'var(--text-secondary)',
                marginTop: '4px'
              }}>
                분석 신뢰도: {confidenceDescription}
                <span style={{ marginLeft: '8px', opacity: 0.7 }}>
                  ({changeRate > 0 ? '+' : ''}{changeRate.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">앞으로 1주일간 이렇게 바뀔 수 있어요</div>
            <div className="summary-description">
              {analyticsData.forecast && analyticsData.forecast.length > 0 ? (
                <>
                  <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: '8px' }}>
                    약 {Math.round(analyticsData.forecast[analyticsData.forecast.length - 1].value)}점
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    예상 상태: {getForecastGradeDescription(analyticsData.forecast[analyticsData.forecast.length - 1].value)}
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-xs)', 
                    color: 'var(--text-secondary)',
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontStyle: 'italic'
                  }}>
                    ※ 이 예측은 최근 데이터 흐름을 기반으로 한 참고 정보예요.
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  예측 정보를 준비하는 중이에요.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="trend-chart-container">
          {/* 차트 해석 문구 */}
          <div style={{ 
            marginBottom: '16px', 
            padding: '12px 16px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 'var(--line-height-relaxed)',
            color: 'var(--text-primary)'
          }}>
            {analyticsData.trend.direction === 'increasing' ? (
              <span>
                최근 며칠 사이 지수가 빠르게 상승하고 있어, 당분간은 전반적인 환경이 더 좋아질 가능성이 있어요.
              </span>
            ) : analyticsData.trend.direction === 'decreasing' ? (
              <span>
                최근 며칠 사이 지수가 하락하고 있어, 주의 깊게 지켜볼 필요가 있어요.
              </span>
            ) : (
              <span>
                최근 며칠 사이 지수가 안정적으로 유지되고 있어, 전반적인 환경이 일정한 수준을 보이고 있어요.
              </span>
            )}
          </div>
          
          <div style={{ marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showMovingAverages}
                onChange={(e) => setShowMovingAverages(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span>평균 흐름 보기</span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                (최근 변화 추세를 부드럽게 확인할 수 있어요)
              </span>
            </label>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorCitywide" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chateau-green-400)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chateau-green-400)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--gray-200)"
              />
              <XAxis
                dataKey="period"
                stroke="var(--gray-600)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="var(--gray-600)"
                style={{ fontSize: '12px' }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px'
                }}
              />
              <Area
                type="monotone"
                dataKey="citywide"
                stroke="var(--chateau-green-600)"
                strokeWidth={2}
                fill="url(#colorCitywide)"
                name="종합 지수"
              />
              {showMovingAverages && (
                <>
                  <Line
                    type="monotone"
                    dataKey="ma7"
                    stroke="var(--chateau-green-500)"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                    name="7일 평균"
                  />
                  <Line
                    type="monotone"
                    dataKey="ma14"
                    stroke="var(--chateau-green-400)"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                    name="14일 평균"
                  />
                </>
              )}
              {trendData.some(d => d.forecast !== undefined) && (
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="var(--gray-400)"
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={{ fill: 'var(--gray-400)', r: 3 }}
                  name="앞으로 1주일 예상"
                />
              )}
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default TrendIndicators



