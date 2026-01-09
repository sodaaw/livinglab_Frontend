import { useRef } from 'react'
import TrendIndicators from '../components/public/TrendIndicators'
import RegionalTrendMap from '../components/public/RegionalTrendMap'
import SignalTrends from '../components/public/SignalTrends'
import ImprovementStatus from '../components/public/ImprovementStatus'
import ReportingGuide from '../components/public/ReportingGuide'
import SiteGuide, { GuideStep } from '../components/public/SiteGuide'
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

  const guideSteps: GuideStep[] = [
    {
      step: 1,
      title: '전체 추세 지표 확인',
      description: '우리 지역의 전반적인 도시 편의성 현황을 한눈에 파악하세요',
      sections: [
        '현재 도시 편의성 지수 점수 확인',
        '최근 변화 추세 및 증가/감소 패턴 파악',
        '주요 지표별 세부 현황 확인'
      ]
    },
    {
      step: 2,
      title: '지역별 현황 살펴보기',
      description: '구 단위로 세분화된 지역별 편의성 상태를 지도에서 확인하세요',
      sections: [
        '지역별 편의성 등급 및 색상으로 시각적 확인',
        '주요 개선 지역 및 우수 지역 식별',
        '지역 간 비교 분석'
      ]
    },
    {
      step: 3,
      title: '지역별 신호 추세 분석',
      description: '각 지역의 편의성 변화 신호를 시간에 따라 추적하세요',
      sections: [
        '지역별 신호 강도 및 변화 방향 확인',
        '주목해야 할 지역 우선순위 파악',
        '과거 추세와 현재 상태 비교'
      ]
    },
    {
      step: 4,
      title: '개선 현황 확인',
      description: '실제로 진행 중인 개선 사업과 그 효과를 확인하세요',
      sections: [
        '진행 중인 개선 사업 현황 확인',
        '개선 전후 비교 및 효과 측정',
        '개선 완료 및 계획 중인 항목 확인'
      ]
    },
    {
      step: 5,
      title: '민원 신고 및 제안',
      description: '발견한 문제나 개선 아이디어가 있다면 신고하거나 제안하세요',
      sections: [
        '민원 신고 방법 및 절차 안내',
        '제안 방법 및 접수 절차 확인',
        '신고/제안 처리 현황 조회'
      ]
    }
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

        <SiteGuide
          title="시민용 사이트 활용 가이드"
          description="이 페이지는 우리 지역의 도시 편의성 현황을 확인하고 필요한 정보를 쉽게 찾을 수 있도록 구성되었습니다. 아래 단계를 따라 순서대로 확인하시면 더 효율적으로 정보를 활용하실 수 있습니다."
          steps={guideSteps}
        />

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

