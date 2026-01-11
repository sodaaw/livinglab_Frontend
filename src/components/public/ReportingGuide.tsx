import './ReportingGuide.css'

interface GuideStep {
  step: number
  title: string
  description: string
}

const guideSteps: GuideStep[] = [
  {
    step: 1,
    title: '위치 선택',
    description: '정확한 주소가 아니어도 괜찮습니다. 대략적인 위치만 선택해주세요.'
  },
  {
    step: 2,
    title: '상황 설명',
    description: '불편을 느낀 상황을 편하게 적어주세요. 짧아도 충분합니다.'
  },
  {
    step: 3,
    title: '제출',
    description: '제출하시면 담당 부서에서 검토 후 적절한 조치를 취하겠습니다.'
  }
]

const ReportingGuide = () => {
  return (
    <div className="reporting-guide">
      <div className="section-header">
        <h2 className="heading-2">민원 신고 안내</h2>
        <p className="body-small text-secondary mt-sm">
          작은 불편도 도시를 더 나아지게 만드는 중요한 정보입니다.
        </p>
      </div>

      <div className="guide-content">
        <div className="guide-steps">
          {guideSteps.map((step) => (
            <div key={step.step} className="guide-step">
              <div className="step-number">{step.step}</div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="guide-actions">
            <div className="action-card">
              <h3 className="action-title">온라인 신고</h3>
              <p className="action-description">
                공식 민원 포털을 통해 24시간 신고가 가능합니다.
              </p>
              <div className="reporting-tips">
                <strong>참고하시면 좋은 정보:</strong>
                <ul>
                  <li>대략적인 위치 또는 건물명</li>
                  <li>발견한 날짜와 시간 (가능하면)</li>
                  <li>불편했던 상황 (악취, 쓰레기 등)</li>
                  <li>사진 첨부는 선택사항입니다</li>
                </ul>
              </div>
              <a 
                href="https://minwon.seoul.go.kr/icisuser/main.do" 
                target="_blank" 
                rel="noopener noreferrer"
                className="action-button primary"
              >
                민원 포털로 이동
              </a>
            </div>

            <div className="action-card phone-card">
              <h3 className="action-title">전화 신고</h3>
              <p className="action-description">
                긴급한 상황이나 즉시 조치가 필요한 경우 전화로 신고하세요.
              </p>
              <div className="phone-info">
                <div className="phone-number">120 다산콜센터</div>
                <div className="phone-hours">운영시간: 24시간</div>
              </div>
            </div>
        </div>

        <div className="guide-note">
          <div className="note-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="var(--chateau-green-600)"
              />
              <path
                d="M12 16V12M12 8H12.01"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="note-content">
            <strong>안심하고 신고해주세요</strong>
            <p>
              신고 내용은 통계 분석에만 활용되며, 개인을 식별할 수 있는 정보는 공개되지 않습니다.
              특정 지역이나 개인이 불이익을 받지 않도록 보호됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportingGuide

