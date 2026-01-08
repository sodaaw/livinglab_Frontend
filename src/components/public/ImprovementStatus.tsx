import './ImprovementStatus.css'

interface ImprovementArea {
  category: string
  description: string
  status: 'improving' | 'stable' | 'monitoring' | 'completed'
  progress: number
  lastUpdate: string
  location?: string
  completedDate?: string
}

const mockImprovements: ImprovementArea[] = [
  {
    category: '환경 개선',
    description:
      '주요 지역의 공기 질 및 환기 시스템 개선 작업이 진행 중입니다.',
    status: 'improving',
    progress: 75,
    lastUpdate: '2024-01-25',
    location: '강남구, 마포구 일대'
  },
  {
    category: '접근성 향상',
    description:
      '골목 구조 개선을 통한 보행자 접근성 향상 프로젝트가 진행 중입니다.',
    status: 'improving',
    progress: 60,
    lastUpdate: '2024-01-20',
    location: '종로구, 송파구 일대'
  },
  {
    category: '정기 관리',
    description:
      '정기적인 청소 및 관리 체계가 안정적으로 운영되고 있습니다.',
    status: 'stable',
    progress: 100,
    lastUpdate: '2024-01-28',
    location: '전 지역'
  },
  {
    category: '모니터링 강화',
    description:
      '지속적인 모니터링을 통한 예방적 관리가 이루어지고 있습니다.',
    status: 'monitoring',
    progress: 90,
    lastUpdate: '2024-01-22',
    location: '용산구 일대'
  },
  {
    category: '구조 개선 완료',
    description:
      '골목 구조 개선 및 환기 시스템 설치가 완료되었습니다.',
    status: 'completed',
    progress: 100,
    lastUpdate: '2024-01-15',
    location: '강남구 논현동 일대',
    completedDate: '2024-01-15'
  },
  {
    category: '야간 관리 체계 구축',
    description:
      '야간 집중 관리 체계가 구축되어 운영 중입니다.',
    status: 'completed',
    progress: 100,
    lastUpdate: '2024-01-10',
    location: '마포구 상암동 일대',
    completedDate: '2024-01-10'
  }
]

const ImprovementStatus = () => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'improving':
        return '개선 중'
      case 'stable':
        return '안정적'
      case 'monitoring':
        return '모니터링 중'
      case 'completed':
        return '완료'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'improving':
        return 'var(--chateau-green-600)'
      case 'stable':
        return 'var(--chateau-green-500)'
      case 'monitoring':
        return 'var(--gray-500)'
      case 'completed':
        return 'var(--chateau-green-700)'
      default:
        return 'var(--gray-500)'
    }
  }

  return (
    <div className="improvement-status">
      <div className="section-header">
        <h2 className="heading-2">개선 현황</h2>
        <p className="body-small text-secondary mt-sm">
          진행 중인 도시 편의성 개선 사업 현황
        </p>
      </div>

      <div className="improvements-grid">
        {mockImprovements.map((item, index) => (
          <div key={index} className="improvement-card">
            <div className="improvement-header">
              <h3 className="improvement-category">{item.category}</h3>
              <span
                className="status-badge"
                style={{ color: getStatusColor(item.status) }}
              >
                {getStatusLabel(item.status)}
              </span>
            </div>

            <p className="improvement-description">{item.description}</p>

            <div className="improvement-progress">
              <div className="progress-header">
                <span className="progress-label">진행률</span>
                <span className="progress-value">{item.progress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${item.progress}%`,
                    backgroundColor: getStatusColor(item.status)
                  }}
                />
              </div>
            </div>

            <div className="improvement-footer">
              {item.location && (
                <span className="improvement-location">{item.location}</span>
              )}
              <span className="last-update">최종 업데이트: {item.lastUpdate}</span>
              {item.completedDate && (
                <span className="completed-date">완료일: {item.completedDate}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImprovementStatus



