import './DashboardFilters.css'

const DashboardFilters = () => {
  const filters = [
    { label: '지역(구) 전체', options: ['전체', '강남구', '마포구', '종로구', '송파구', '용산구', '서초구'] },
    { label: '편의성 지수 범위', options: ['전체', '0-30 (낮음)', '31-50 (보통)', '51-70 (양호)', '71-100 (우수)'] },
    { label: '개선 상태', options: ['전체', '개선 중', '안정적', '모니터링 필요'] },
    { label: '기간', options: ['전체', '최근 1개월', '최근 3개월', '최근 6개월', '최근 1년'] },
    { label: '우선순위', options: ['전체', '높음', '보통', '낮음'] }
  ]

  return (
    <div className="dashboard-filters">
      {filters.map((filter, index) => (
        <div key={index} className="filter-item">
          <select className="filter-select">
            {filter.options.map((option, optIndex) => (
              <option key={optIndex} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}

export default DashboardFilters

