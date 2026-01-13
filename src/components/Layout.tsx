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
              <span className="logo-text">PigeonSense</span>
            </Link>
            <nav className="nav">
              <Link
                to="/admin"
                className={`nav-link ${isAdmin ? 'active' : ''}`}
              >
                <span className="nav-link-text">
                  <span>관리자</span>
                  <span>대시보드</span>
                </span>
              </Link>
              <Link
                to="/public"
                className={`nav-link ${!isAdmin ? 'active' : ''}`}
              >
                <span className="nav-link-text">
                  <span>시민용</span>
                  <span>대시보드</span>
                </span>
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



