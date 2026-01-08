import { useState } from 'react'
import './DashboardTabs.css'

const DashboardTabs = () => {
  const [activeTab, setActiveTab] = useState('regional')

  return (
    <div className="dashboard-tabs">
      <button
        className={`dashboard-tab ${activeTab === 'overview' ? 'active' : ''}`}
        onClick={() => setActiveTab('overview')}
      >
        전체 현황
      </button>
      <button
        className={`dashboard-tab ${activeTab === 'regional' ? 'active' : ''}`}
        onClick={() => setActiveTab('regional')}
      >
        지역별 현황
      </button>
    </div>
  )
}

export default DashboardTabs

