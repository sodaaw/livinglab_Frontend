import { useEffect } from 'react'
import './UCIInfoModal.css'

interface UCIInfoModalProps {
  isOpen: boolean
  onClose: () => void
  variant: 'admin' | 'public'
}

const UCIInfoModal = ({ isOpen, onClose, variant }: UCIInfoModalProps) => {
  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    // 모달이 열릴 때 body 스크롤 방지
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isAdmin = variant === 'admin'

  return (
    <div className="uci-modal-overlay" onClick={onClose}>
      <div className="uci-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="uci-modal-header">
          <h2 className="uci-modal-title">Urban Comfort Index</h2>
          <button className="uci-modal-close" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>

        <div className="uci-modal-body">
          {isAdmin ? (
            <>
              {/* 관리자용 설명 */}
              <div className="uci-section">
                <h3 className="uci-section-title">Urban Comfort Index란?</h3>
                <p className="uci-section-text">
                  도시 환경 데이터를 종합해 어디를 먼저 개입해야 할지 판단하기 위한 의사결정 보조 지표입니다.
                </p>
              </div>

              <div className="uci-section">
                <h3 className="uci-section-title">어떻게 계산되나요?</h3>
                <p className="uci-section-text">
                  시민 체감 신호를 중심으로, 지역 환경 특성과 인구 규모를 함께 고려해 점수를 산출합니다.
                </p>
                
                <div className="uci-formula-container">
                  <div className="uci-formula">
                    <code>UCI = (Human × 0.5) + (Geo × 0.3) + (Population × 0.2)</code>
                  </div>
                </div>

                <div className="uci-factors">
                  <div className="uci-factor-item">
                    <strong>시민 체감 신호:</strong> 실제 불편을 가장 직접적으로 반영
                  </div>
                  <div className="uci-factor-item">
                    <strong>지역 환경 특성:</strong> 구조적·지속적 위험 요인 고려
                  </div>
                  <div className="uci-factor-item">
                    <strong>생활 인구 규모:</strong> 영향 범위 참고
                  </div>
                </div>

                <p className="uci-note">
                  ※ 가중치는 정책 목적에 따라 조정 가능한 구조입니다.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* 시민용 설명 */}
              <div className="uci-section">
                <h3 className="uci-section-title">Urban Comfort Index란?</h3>
                <p className="uci-section-text">
                  우리 지역의 생활 환경을 여러 요소를 종합해 변화 흐름을 살펴보기 위한 참고 지표입니다.
                </p>
              </div>

              <div className="uci-section">
                <h3 className="uci-section-title">이 지표는 이렇게 만들어집니다</h3>
                <div className="uci-factors-public">
                  <div className="uci-factor-item-public">
                    <div className="uci-factor-icon">📊</div>
                    <div className="uci-factor-content">
                      <strong>시민 불편 신호</strong>
                    </div>
                  </div>
                  <div className="uci-factor-item-public">
                    <div className="uci-factor-icon">🏘️</div>
                    <div className="uci-factor-content">
                      <strong>지역 환경 특성</strong>
                    </div>
                  </div>
                  <div className="uci-factor-item-public">
                    <div className="uci-factor-icon">👥</div>
                    <div className="uci-factor-content">
                      <strong>생활 인구 규모</strong>
                    </div>
                  </div>
                </div>
                <p className="uci-section-text" style={{ marginTop: 'var(--spacing-lg)' }}>
                  이 세 가지를 함께 고려해, 도시 편의성의 전반적인 흐름을 보여줍니다.
                </p>
              </div>

              <div className="uci-section">
                <h3 className="uci-section-title">어떻게 보면 좋을까요?</h3>
                <p className="uci-section-text">
                  이 지표는 지역을 평가하기 위한 점수가 아니라,
                  <br />
                  시간에 따른 변화와 개선 흐름을 이해하기 위한 지표입니다.
                </p>
                <p className="uci-section-text" style={{ marginTop: 'var(--spacing-md)' }}>
                  점수 자체보다 <strong>증가·감소 추세</strong>를 중심으로 살펴보세요.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default UCIInfoModal



