import './SignalTrends.css'

interface SignalTrend {
  district: string
  trend: 'improving' | 'stable' | 'monitoring' | 'attention'
  signals: {
    human: 'increasing' | 'stable' | 'decreasing'
    population?: 'increasing' | 'stable' | 'decreasing'
  }
  description: string
  note?: string
}

const mockSignalTrends: SignalTrend[] = [
  {
    district: '강남구',
    trend: 'improving',
    signals: {
      human: 'decreasing',
      population: 'stable'
    },
    description: '민원이 감소 추세이며 생활인구는 안정적입니다.',
    note: '지속적인 개선이 이루어지고 있습니다.'
  },
  {
    district: '마포구',
    trend: 'improving',
    signals: {
      human: 'decreasing',
      population: 'stable'
    },
    description: '민원이 감소하고 있으며 생활인구는 안정적입니다.',
  },
  {
    district: '종로구',
    trend: 'stable',
    signals: {
      human: 'stable',
      population: 'stable'
    },
    description: '민원과 생활인구 모두 안정적인 상태입니다.',
  },
  {
    district: '송파구',
    trend: 'stable',
    signals: {
      human: 'stable',
      population: 'decreasing'
    },
    description: '민원은 안정적이며 생활인구는 감소 추세입니다.',
  },
  {
    district: '용산구',
    trend: 'monitoring',
    signals: {
      human: 'increasing',
      population: 'increasing'
    },
    description: '민원과 생활인구가 증가하고 있어 모니터링 중입니다.',
    note: '관리 강화가 진행 중입니다.'
  }
]

const SignalTrends = () => {
  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '개선 중'
      case 'stable':
        return '안정적'
      case 'monitoring':
        return '모니터링 중'
      case 'attention':
        return '주의 필요'
      default:
        return trend
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'stable':
        return 'var(--status-success-text)'
      case 'monitoring':
        return 'var(--status-warning-text)'
      case 'attention':
        return 'var(--status-attention-text)'
      case 'danger':
        return 'var(--status-danger-text)'
      case 'improving':
      default:
        return 'var(--status-success-text)'
    }
  }

  const getTrendBackgroundColor = (trend: string) => {
    switch (trend) {
      case 'stable':
        return 'var(--status-success-background)'
      case 'monitoring':
        return 'var(--status-warning-background)'
      case 'attention':
        return 'var(--status-attention-background)'
      case 'danger':
        return 'var(--status-danger-background)'
      case 'improving':
      default:
        return 'var(--status-success-background)'
    }
  }

  const getSignalLabel = (signal: string) => {
    switch (signal) {
      case 'increasing':
        return '증가'
      case 'stable':
        return '유지'
      case 'decreasing':
        return '감소'
      default:
        return signal
    }
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'increasing':
        return 'var(--status-attention-strong)'
      case 'stable':
        return 'var(--gray-500)'
      case 'decreasing':
        return 'var(--status-success-strong)'
      default:
        return 'var(--gray-500)'
    }
  }

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'increasing':
        return '▲'
      case 'stable':
        return '—'
      case 'decreasing':
        return '▼'
      default:
        return ''
    }
  }

  return (
    <div className="signal-trends">
      <div className="section-header">
        <h2 className="heading-2">지역별 신호 추세</h2>
        <p className="body-small text-secondary mt-sm">
          구 단위 지역별 신호 변화 추이 (정확한 위치 정보는 공개되지 않습니다)
        </p>
      </div>

      <div className="trends-grid">
        {mockSignalTrends.map((trend, index) => (
          <div key={index} className="trend-card">
            <div className="trend-header">
              <h3 className="trend-district">{trend.district}</h3>
              <span
                className="trend-badge"
                data-variant={trend.trend === 'attention' ? 'info' : undefined}
                style={{
                  backgroundColor: getTrendBackgroundColor(trend.trend),
                  color: getTrendColor(trend.trend)
                }}
              >
                {getTrendLabel(trend.trend)}
              </span>
            </div>

            <p className="trend-description">{trend.description}</p>

            <div className="trend-signals">
              <div className="signal-item">
                <span className="signal-label">민원 신호</span>
                <span
                  className="signal-value"
                  style={{ color: getSignalColor(trend.signals.human) }}
                >
                  {getSignalIcon(trend.signals.human)} {getSignalLabel(trend.signals.human)}
                </span>
              </div>
              {trend.signals.population && (
                <div className="signal-item">
                  <span className="signal-label">생활인구 신호</span>
                  <span
                    className="signal-value"
                    style={{ color: getSignalColor(trend.signals.population) }}
                  >
                    {getSignalIcon(trend.signals.population)} {getSignalLabel(trend.signals.population)}
                  </span>
                </div>
              )}
            </div>

            {trend.note && (
              <div className="trend-note">
                <small>{trend.note}</small>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SignalTrends

