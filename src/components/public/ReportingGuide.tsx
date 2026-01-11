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
    description: '문제가 발생한 지역의 대략적인 위치를 선택하세요.'
  },
  {
    step: 2,
    title: '상황 설명',
    description:
      '발견한 문제에 대해 간단히 설명해주세요. 구체적인 날짜와 시간 정보가 있으면 도움이 됩니다.'
  },
  {
    step: 3,
    title: '제출',
    description:
      '제출하시면 담당 부서에서 검토 후 적절한 조치를 취하겠습니다.'
  }
]

const ReportingGuide = () => {
  return (
    <div className="reporting-guide">
      <div className="section-header">
        <h2 className="heading-2">민원 신고 안내</h2>
        <p className="body-small text-secondary mt-sm">
          도시 편의성과 관련된 문제를 발견하셨나요? 간단한 절차로 신고해주세요.
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
                <strong>정확한 신고를 위한 팁:</strong>
                <ul>
                  <li>문제 발생 위치의 대략적인 주소 또는 건물명</li>
                  <li>발견한 날짜와 시간</li>
                  <li>문제의 구체적인 내용 (악취, 쓰레기, 불법투기 등)</li>
                  <li>가능하면 사진 첨부 (선택사항)</li>
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
            <strong>참고사항</strong>
            <p>
              신고하신 내용은 데이터 분석에 활용되어 도시 편의성 개선에
              기여합니다. 개인정보는 보호되며, 신고 지역의 정확한 주소는
              공개되지 않습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportingGuide

