import { ComposedChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import './TimePatternAnalysis.css'

interface TimePatternData {
  location: string
  hourPattern: { hour: number; complaints: number; population: number }[]
  dayPattern: { day: string; complaints: number }[]
  peakHours: number[]
  recommendedAction: string
}

const mockTimePatternData: TimePatternData[] = [
  {
    location: '서울시 강남구 역삼동 123-45',
    hourPattern: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      complaints: i >= 20 && i <= 23 ? Math.floor(Math.random() * 8) + 5 : Math.floor(Math.random() * 3),
      population: i >= 20 && i <= 23 ? Math.floor(Math.random() * 200) + 800 : Math.floor(Math.random() * 100) + 200
    })),
    dayPattern: [
      { day: '월', complaints: 3 },
      { day: '화', complaints: 4 },
      { day: '수', complaints: 5 },
      { day: '목', complaints: 4 },
      { day: '금', complaints: 3 },
      { day: '토', complaints: 2 },
      { day: '일', complaints: 3 }
    ],
    peakHours: [20, 21, 22, 23],
    recommendedAction: '야간 집중 관리 필요 (20-23시)'
  },
  {
    location: '서울시 마포구 상암동 67-89',
    hourPattern: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      complaints: i >= 19 && i <= 21 ? Math.floor(Math.random() * 6) + 3 : Math.floor(Math.random() * 2),
      population: i >= 19 && i <= 21 ? Math.floor(Math.random() * 150) + 600 : Math.floor(Math.random() * 80) + 150
    })),
    dayPattern: [
      { day: '월', complaints: 2 },
      { day: '화', complaints: 3 },
      { day: '수', complaints: 3 },
      { day: '목', complaints: 3 },
      { day: '금', complaints: 2 },
      { day: '토', complaints: 2 },
      { day: '일', complaints: 3 }
    ],
    peakHours: [19, 20, 21],
    recommendedAction: '저녁 시간대 관리 강화 (19-21시)'
  }
]

const TimePatternAnalysis = () => {
  return (
    <div className="time-pattern-analysis">
      <div className="section-header">
        <h2 className="heading-2">시간대별 패턴 분석</h2>
        <p className="body-small text-secondary mt-sm">
          민원 발생 시간대와 생활인구 패턴을 분석하여 최적의 관리 시점을 제안합니다
        </p>
      </div>

      <div className="pattern-list">
        {mockTimePatternData.map((data, index) => (
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
                    margin={{ top: 5, right: 80, left: 20, bottom: 5 }}
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
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="var(--gray-600)"
                      style={{ fontSize: '12px' }}
                      label={{ value: '생활인구', angle: 90, position: 'insideRight' }}
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
                      verticalAlign="middle" 
                      align="left"
                      wrapperStyle={{ paddingRight: '20px', left: 0 }}
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

