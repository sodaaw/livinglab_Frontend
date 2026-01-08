import { useState } from 'react'
import './DashboardRightSidebar.css'

const DashboardRightSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  const menuItems = [
    '지역 프로파일(Where) - 어디가 문제인가?',
    '지역별 특성',
    '주요 개선 지역',
    '편의성 지수 구조(What) - 무엇이 문제인가?',
    '환경/접근성 균형',
    '환경 개선 우선순위',
    '접근성 개선 우선순위',
    '주요 지역 지표 비교',
    '이용 행동 분석(How) - 어떻게 이용하는가?',
    '신고 요인 순위',
    '월간 신고 빈도',
    '평균 개선 소요 기간'
  ]

  return (
    <aside className="dashboard-right-sidebar">
      <button 
        className="right-sidebar-filter-button"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>상세 필터 옵션</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <div className="right-sidebar-content">
        <h3 className="right-sidebar-title">내용 바로가기</h3>
        <nav className="right-sidebar-nav">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={`#section-${index}`}
              className={`right-sidebar-nav-item ${index === 1 ? 'active' : ''}`}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}

export default DashboardRightSidebar

