import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './TrendIndicators.css'

interface TrendData {
  period: string
  citywide: number
  improvement: number
}

const mockTrendData: TrendData[] = [
  { period: '2023 Q1', citywide: 52, improvement: 0 },
  { period: '2023 Q2', citywide: 55, improvement: 3 },
  { period: '2023 Q3', citywide: 58, improvement: 3 },
  { period: '2023 Q4', citywide: 61, improvement: 3 },
  { period: '2024 Q1', citywide: 64, improvement: 3 }
]

const TrendIndicators = () => {
  const currentIndex = mockTrendData[mockTrendData.length - 1].citywide
  const previousIndex = mockTrendData[mockTrendData.length - 2].citywide
  const change = currentIndex - previousIndex
  const changePercent = ((change / previousIndex) * 100).toFixed(1)

  return (
    <div className="trend-indicators">
      <div className="section-header">
        <h2 className="heading-2">전체 추세 지표</h2>
        <p className="body-small text-secondary mt-sm">
          도시 전역의 편의성 지수 변화 추이
        </p>
      </div>

      <div className="trend-content">
        <div className="trend-summary">
          <div className="summary-card">
            <div className="summary-label">현재 도시 편의성 지수</div>
            <div className="summary-value">{currentIndex}</div>
            <div className="summary-change positive">
              전 분기 대비 +{change}점 ({changePercent}% 증가)
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">지속적 개선</div>
            <div className="summary-description">
              지난 5개 분기 동안 꾸준한 개선 추세를 보이고 있습니다.
            </div>
          </div>
        </div>

        <div className="trend-chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={mockTrendData}>
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
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default TrendIndicators



