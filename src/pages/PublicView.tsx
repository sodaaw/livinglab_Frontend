import { useRef, useState } from 'react'
import TrendIndicators from '../components/public/TrendIndicators'
import RegionalTrendMap from '../components/public/RegionalTrendMap'
import SignalTrends from '../components/public/SignalTrends'
import ImprovementStatus from '../components/public/ImprovementStatus'
import ReportingGuide from '../components/public/ReportingGuide'
import SiteGuide, { GuideStep } from '../components/public/SiteGuide'
import UCIInfoModal from '../components/UCIInfoModal'
import './PublicView.css'

const PublicView = () => {
  const [isUCIInfoOpen, setIsUCIInfoOpen] = useState(false)

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
      description: '우리 지역의 전반적인 변화 흐름을 먼저 살펴보세요.',
      sections: [
        '도시 편의성 지수를 통해 현재 상태와 최근 변화 방향을 한눈에 확인할 수 있습니다.',
        '현재 도시 편의성 지수 점수를 확인할 수 있습니다.',
        '최근 변화 추세와 증가·감소 패턴을 살펴볼 수 있습니다.',
        '주요 지표별 세부 현황을 함께 확인할 수 있습니다.'
      ]
    },
    {
      step: 2,
      title: '지역별 현황 살펴보기',
      description: '구 단위로 나뉜 지역별 상태를 지도에서 확인해보세요.',
      sections: [
        '지역별 편의성 상태를 시각적으로 비교하며 우리 동네의 현재 위치를 파악할 수 있습니다.',
        '지역별 편의성 등급을 색상으로 직관적으로 확인할 수 있습니다.',
        '개선이 진행 중인 지역이나 안정적인 지역을 살펴볼 수 있습니다.',
        '지역 간 편의성 수준을 비교해볼 수 있습니다.'
      ]
    },
    {
      step: 3,
      title: '지역별 신호 추세 분석',
      description: '각 지역의 변화 신호가 어떻게 달라지고 있는지 살펴보세요.',
      sections: [
        '시간에 따른 변화 추세를 통해 최근 주목할 만한 흐름을 확인할 수 있습니다.',
        '지역별 신호 강도와 변화 방향을 확인할 수 있습니다.',
        '변화가 두드러지는 지역을 쉽게 파악할 수 있습니다.',
        '과거 추세와 현재 상태를 비교해볼 수 있습니다.'
      ]
    },
    {
      step: 4,
      title: '개선 현황 확인',
      description: '실제로 어떤 개선이 이루어지고 있는지 확인해보세요.',
      sections: [
        '진행 중이거나 완료된 개선 내용을 통해 지역 변화가 어떻게 이어지고 있는지 살펴볼 수 있습니다.',
        '현재 진행 중인 개선 사업 현황을 확인할 수 있습니다.',
        '개선 전후 변화를 비교하여 효과를 살펴볼 수 있습니다.',
        '완료된 개선과 향후 계획된 항목을 확인할 수 있습니다.'
      ]
    },
    {
      step: 5,
      title: '민원 신고 및 제안',
      description: '불편한 점이나 아이디어가 있다면 직접 참여해 주세요.',
      sections: [
        '시민의 의견은 더 나은 도시를 만드는 중요한 시작점입니다.',
        '민원 신고 방법과 절차를 확인할 수 있습니다.',
        '개선 제안 방법과 접수 과정을 안내받을 수 있습니다.',
        '내가 남긴 신고·제안의 처리 현황을 확인할 수 있습니다.'
      ]
    }
  ]

  return (
    <div className="public-view">
      <div className="container">
        <div className="public-header">
          <h1 className="title">우리 지역, 지금은 어떤가요?</h1>
          <p className="body-large text-secondary mt-md">
            우리 지역의 도시 편의성 개선 현황을 확인해보세요
          </p>
        </div>

        <UCIInfoModal
          isOpen={isUCIInfoOpen}
          onClose={() => setIsUCIInfoOpen(false)}
          variant="public"
        />

        <SiteGuide
          title="시민용 사이트 활용 가이드"
          description="이 페이지에서는 도시 편의성 지수(Urban Comfort Index)를 통해
                      우리 지역의 생활 환경 현황과 변화 흐름을 누구나 쉽게 이해할 수 있도록 정보를 제공합니다.
                      아래 내용을 따라 살펴보시면, 지표를 어떻게 해석하면 좋을지 자연스럽게 확인하실 수 있습니다."
          steps={guideSteps}
          onUCIInfoClick={() => setIsUCIInfoOpen(true)}
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
                이 지도는 우리 지역의 도시 편의성 지수 흐름을 한눈에 보여줍니다.
              </p>
              <p className="body-small text-secondary mt-xs">
                정확한 위치 대신, 구 단위 변화만 제공하여 개인정보와 지역 낙인을 방지합니다.
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

