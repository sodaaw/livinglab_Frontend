import { Outlet, Link, useLocation } from 'react-router-dom'
import './Layout.css'

const Layout = () => {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <span className="logo-text">도시 편의성 분석</span>
            </Link>
            <nav className="nav">
              <Link
                to="/admin"
                className={`nav-link ${isAdmin ? 'active' : ''}`}
              >
                관리자 대시보드
              </Link>
              <Link
                to="/public"
                className={`nav-link ${!isAdmin ? 'active' : ''}`}
              >
                시민용 공개 뷰
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout



