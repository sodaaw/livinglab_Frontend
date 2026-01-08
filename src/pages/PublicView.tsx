import { useRef } from 'react'
import TrendIndicators from '../components/public/TrendIndicators'
import RegionalTrendMap from '../components/public/RegionalTrendMap'
import SignalTrends from '../components/public/SignalTrends'
import ImprovementStatus from '../components/public/ImprovementStatus'
import ReportingGuide from '../components/public/ReportingGuide'
import './PublicView.css'

const PublicView = () => {
  const sections = {
    trends: useRef<HTMLElement>(null),
    regional: useRef<HTMLElement>(null),
    signals: useRef<HTMLElement>(null),
    improvement: useRef<HTMLElement>(null),
    reporting: useRef<HTMLElement>(null)
  }

  const scrollToSection = (sectionKey: keyof typeof sections) => {
    const section = sections[sectionKey].current
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const menuItems = [
    { key: 'trends' as const, label: '전체 추세 지표' },
    { key: 'regional' as const, label: '지역별 현황' },
    { key: 'signals' as const, label: '지역별 신호 추세' },
    { key: 'improvement' as const, label: '개선 현황' },
    { key: 'reporting' as const, label: '민원 신고 안내' }
  ]

  return (
    <div className="public-view">
      <div className="container">
        <div className="public-header">
          <h1 className="title">도시 편의성 현황</h1>
          <p className="body-large text-secondary mt-md">
            우리 지역의 도시 편의성 개선 현황을 확인하세요
          </p>
        </div>

        <nav className="public-nav">
          <div className="nav-menu">
            {menuItems.map((item) => (
              <button
                key={item.key}
                className="nav-menu-item"
                onClick={() => scrollToSection(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="public-content">
          <section ref={sections.trends} id="trends" className="public-section">
            <TrendIndicators />
          </section>

          <section ref={sections.regional} id="regional" className="public-section">
            <div className="section-header">
              <h2 className="heading-2">지역별 현황</h2>
              <p className="body-small text-secondary mt-sm">
                구 단위 지역별 도시 편의성 상태 (정확한 위치 정보는 공개되지 않습니다)
              </p>
            </div>
            <RegionalTrendMap
              trends={[
                {
                  district: '강남구',
                  lat: 37.5172,
                  lng: 127.0473,
                  trend: 'improving',
                  index: 64
                },
                {
                  district: '마포구',
                  lat: 37.5663,
                  lng: 126.9019,
                  trend: 'improving',
                  index: 58
                },
                {
                  district: '종로구',
                  lat: 37.5735,
                  lng: 126.9788,
                  trend: 'stable',
                  index: 72
                },
                {
                  district: '송파구',
                  lat: 37.5145,
                  lng: 127.1058,
                  trend: 'stable',
                  index: 68
                },
                {
                  district: '용산구',
                  lat: 37.5326,
                  lng: 126.9907,
                  trend: 'monitoring',
                  index: 55
                }
              ]}
            />
          </section>

          <section ref={sections.signals} id="signals" className="public-section">
            <SignalTrends />
          </section>

          <section ref={sections.improvement} id="improvement" className="public-section">
            <ImprovementStatus />
          </section>

          <section ref={sections.reporting} id="reporting" className="public-section">
            <ReportingGuide />
          </section>
        </div>
      </div>
    </div>
  )
}

export default PublicView

