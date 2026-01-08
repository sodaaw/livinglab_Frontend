import './DashboardBreadcrumb.css'

const DashboardBreadcrumb = () => {
  return (
    <nav className="dashboard-breadcrumb">
      <span className="breadcrumb-item">도시 편의성 분석</span>
      <span className="breadcrumb-separator">/</span>
      <span className="breadcrumb-item">지역별 현황</span>
      <span className="breadcrumb-separator">/</span>
      <span className="breadcrumb-item active">2024년 1월</span>
    </nav>
  )
}

export default DashboardBreadcrumb

