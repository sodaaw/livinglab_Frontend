import PriorityQueue from '../components/admin/PriorityQueue'
import ActionRecommendations from '../components/admin/ActionRecommendations'
import BeforeAfterTracking from '../components/admin/BeforeAfterTracking'
import TimePatternAnalysis from '../components/admin/TimePatternAnalysis'
import BlindSpotDetection from '../components/admin/BlindSpotDetection'
import './AdminDashboard.css'

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="title">관리자 대시보드</h1>
          <p className="body-large text-secondary mt-md">
            도시 편의성 지수를 기반으로 한 우선순위 기반 의사결정 도구
          </p>
        </div>

        <div className="dashboard-content">
          <section className="dashboard-section">
            <PriorityQueue />
          </section>

          <section className="dashboard-section">
            <BlindSpotDetection />
          </section>

          <section className="dashboard-section">
            <TimePatternAnalysis />
          </section>

          <section className="dashboard-section">
            <ActionRecommendations />
          </section>

          <section className="dashboard-section">
            <BeforeAfterTracking />
          </section>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard



