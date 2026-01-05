import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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

const BeforeAfterTracking = () => {
  const formatChartData = (data: TrackingData) => {
    const combined = [
      ...data.beforeData.map((d) => ({ ...d, type: '개입 전' })),
      ...data.afterData.map((d) => ({ ...d, type: '개입 후' }))
    ]
    return combined
  }

  return (
    <div className="before-after-tracking">
      <div className="section-header">
        <h2 className="heading-2">개입 전후 효과 추적</h2>
        <p className="body-small text-secondary mt-sm">
          과거 개입 사례의 효과 측정 및 검증 결과
        </p>
      </div>

      <div className="tracking-list">
        {mockTrackingData.map((data, index) => (
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
                <span className="improvement-label">개선 효과</span>
                <span className="improvement-value">
                  +{data.improvement}점
                </span>
              </div>
            </div>

            <div className="tracking-chart">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formatChartData(data)}>
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
                    stroke="var(--chateau-green-600)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--chateau-green-600)', r: 4 }}
                    activeDot={{ r: 6 }}
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



