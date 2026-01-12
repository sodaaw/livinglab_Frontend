import './DashboardTopNav.css'

const DashboardTopNav = () => {
  return (
    <header className="dashboard-top-nav">
      <div className="top-nav-left">
        <a href="#" className="top-nav-link">
          블로그
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </a>
        <a href="#" className="top-nav-link">
          이용가이드
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </a>
      </div>
      
      <div className="top-nav-center">
        <div className="logo-bt">Bt</div>
      </div>
      
      <div className="top-nav-right">
        <button className="top-nav-button">회원가입</button>
        <button className="top-nav-button">로그인</button>
        <button className="top-nav-button">상품 안내</button>
        <button className="top-nav-icon-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M15 15L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <button className="top-nav-icon-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 16C5 13 7 11 10 11C13 11 15 13 15 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <button className="top-nav-icon-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 3V17M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </header>
  )
}

export default DashboardTopNav



