import DashboardTopNav from '../components/public/DashboardTopNav'
import DashboardBreadcrumb from '../components/public/DashboardBreadcrumb'
import DashboardSidebar from '../components/public/DashboardSidebar'
import DashboardRightSidebar from '../components/public/DashboardRightSidebar'
import DashboardTabs from '../components/public/DashboardTabs'
import DashboardFilters from '../components/public/DashboardFilters'
import DashboardContent from '../components/public/DashboardContent'
import './PublicView.css'

const PublicView = () => {
  return (
    <div className="public-view">
      <DashboardTopNav />
      <DashboardBreadcrumb />
      <div className="dashboard-layout">
        <DashboardSidebar />
        <div className="dashboard-main">
          <DashboardTabs />
          <DashboardFilters />
          <DashboardContent />
        </div>
        <DashboardRightSidebar />
      </div>
    </div>
  )
}

export default PublicView

