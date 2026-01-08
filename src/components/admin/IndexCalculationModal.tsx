import './IndexCalculationModal.css'

interface InspectionItem {
  id: string
  location: string
  comfortIndex: number
  humanSignals: {
    complaints: number
    trend: 'increasing' | 'stable' | 'decreasing'
    recurrence: number
  }
  geoSignals: {
    alleyStructure: string
    ventilation: string
    accessibility: string
    vulnerabilityScore: number
  }
  populationSignals?: {
    daytime: number
    nighttime: number
    changeRate: number
    trend: 'increasing' | 'stable' | 'decreasing'
  }
  pigeonSignals?: {
    detected: boolean
    intensity: 'high' | 'medium' | 'low' | null
  }
}

interface IndexCalculationModalProps {
  item: InspectionItem
  onClose: () => void
}

const IndexCalculationModal = ({ item, onClose }: IndexCalculationModalProps) => {
  // 가중치 정의 (실제로는 백엔드에서 계산)
  const weights = {
    human: 0.4,
    geo: 0.35,
    population: 0.2,
    pigeon: 0.05 // 비둘기는 불확실성 보정용으로 낮은 가중치
  }

  // 각 신호별 점수 계산 (0-100 스케일)
  const calculateHumanScore = () => {
    const complaintScore = Math.min(item.humanSignals.complaints * 3, 50)
    const trendScore = item.humanSignals.trend === 'increasing' ? 30 : 
                      item.humanSignals.trend === 'stable' ? 50 : 70
    const recurrenceScore = Math.min(item.humanSignals.recurrence * 5, 30)
    return Math.max(0, 100 - (complaintScore + (100 - trendScore) + recurrenceScore))
  }

  const calculateGeoScore = () => {
    const vulnerabilityPenalty = item.geoSignals.vulnerabilityScore * 8
    const structureScore = item.geoSignals.alleyStructure === '넓음' ? 30 :
                          item.geoSignals.alleyStructure === '보통' ? 20 : 10
    const ventilationScore = item.geoSignals.ventilation === '양호' ? 30 :
                             item.geoSignals.ventilation === '보통' ? 20 : 10
    const accessibilityScore = item.geoSignals.accessibility === '양호' ? 30 :
                               item.geoSignals.accessibility === '양호' ? 20 : 10
    return Math.max(0, 100 - (vulnerabilityPenalty + (100 - structureScore - ventilationScore - accessibilityScore)))
  }

  const calculatePopulationScore = () => {
    if (!item.populationSignals) return 70 // 기본값
    const changePenalty = item.populationSignals.changeRate > 0 ? 
                         Math.min(item.populationSignals.changeRate * 2, 30) : 0
    const trendScore = item.populationSignals.trend === 'increasing' ? 30 :
                      item.populationSignals.trend === 'stable' ? 50 : 70
    return Math.max(0, 100 - (changePenalty + (100 - trendScore)))
  }

  const calculatePigeonAdjustment = () => {
    if (!item.pigeonSignals?.detected) return 0
    // 비둘기 신호는 불확실성 보정용 (낮은 가중치)
    const intensityMultiplier = item.pigeonSignals.intensity === 'high' ? -5 :
                                item.pigeonSignals.intensity === 'medium' ? -3 : -1
    return intensityMultiplier
  }

  const humanScore = calculateHumanScore()
  const geoScore = calculateGeoScore()
  const populationScore = calculatePopulationScore()
  const pigeonAdjustment = calculatePigeonAdjustment()

  const finalIndex = Math.round(
    humanScore * weights.human +
    geoScore * weights.geo +
    populationScore * weights.population +
    pigeonAdjustment
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="heading-2">Urban Comfort Index 계산 근거</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="index-summary">
            <div className="final-index-display">
              <span className="index-label">최종 지수</span>
              <span className="index-value">{item.comfortIndex}</span>
            </div>
            <p className="index-location">{item.location}</p>
          </div>

          <div className="calculation-breakdown">
            <h3 className="heading-3">신호별 점수 및 가중치</h3>
            
            <div className="signal-breakdown">
              <div className="signal-item">
                <div className="signal-header">
                  <span className="signal-name">Human-signal (인간 신호)</span>
                  <span className="signal-weight">가중치: {weights.human * 100}%</span>
                </div>
                <div className="signal-details">
                  <div className="score-bar-container">
                    <div className="score-bar">
                      <div 
                        className="score-fill human" 
                        style={{ width: `${humanScore}%` }}
                      />
                      <span className="score-text">{humanScore}점</span>
                    </div>
                  </div>
                  <div className="signal-factors">
                    <span>민원: {item.humanSignals.complaints}건</span>
                    <span>추세: {item.humanSignals.trend === 'increasing' ? '증가' : item.humanSignals.trend === 'stable' ? '유지' : '감소'}</span>
                    <span>재발: {item.humanSignals.recurrence}회</span>
                  </div>
                </div>
              </div>

              <div className="signal-item">
                <div className="signal-header">
                  <span className="signal-name">Geo-signal (지리 신호)</span>
                  <span className="signal-weight">가중치: {weights.geo * 100}%</span>
                </div>
                <div className="signal-details">
                  <div className="score-bar-container">
                    <div className="score-bar">
                      <div 
                        className="score-fill geo" 
                        style={{ width: `${geoScore}%` }}
                      />
                      <span className="score-text">{geoScore}점</span>
                    </div>
                  </div>
                  <div className="signal-factors">
                    <span>골목 구조: {item.geoSignals.alleyStructure}</span>
                    <span>환기: {item.geoSignals.ventilation}</span>
                    <span>접근성: {item.geoSignals.accessibility}</span>
                    <span>취약도: {item.geoSignals.vulnerabilityScore}/10</span>
                  </div>
                </div>
              </div>

              {item.populationSignals && (
                <div className="signal-item">
                  <div className="signal-header">
                    <span className="signal-name">Population-signal (생활인구 신호)</span>
                    <span className="signal-weight">가중치: {weights.population * 100}%</span>
                  </div>
                  <div className="signal-details">
                    <div className="score-bar-container">
                      <div className="score-bar">
                        <div 
                          className="score-fill population" 
                          style={{ width: `${populationScore}%` }}
                        />
                        <span className="score-text">{populationScore}점</span>
                      </div>
                    </div>
                    <div className="signal-factors">
                      <span>주간: {item.populationSignals.daytime.toLocaleString()}명</span>
                      <span>야간: {item.populationSignals.nighttime.toLocaleString()}명</span>
                      <span>변화율: {item.populationSignals.changeRate > 0 ? '+' : ''}{item.populationSignals.changeRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {item.pigeonSignals?.detected && (
                <div className="signal-item pigeon-adjustment">
                  <div className="signal-header">
                    <span className="signal-name">비둘기 신호 (불확실성 보정)</span>
                    <span className="signal-weight">가중치: {weights.pigeon * 100}%</span>
                  </div>
                  <div className="signal-details">
                    <div className="adjustment-info">
                      <span className="adjustment-value">
                        {pigeonAdjustment > 0 ? '+' : ''}{pigeonAdjustment}점 조정
                      </span>
                      <span className="adjustment-note">
                        비둘기 신호는 Core 지표의 불확실성을 보정하는 보조 레이어입니다.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="calculation-formula">
              <h4 className="formula-title">계산식</h4>
              <div className="formula-content">
                <code>
                  {`지수 = (Human × ${weights.human}) + (Geo × ${weights.geo}) + (Population × ${weights.population})${item.pigeonSignals?.detected ? ` + (비둘기 보정 ${pigeonAdjustment})` : ''}`}
                </code>
                <code className="formula-result">
                  {`= (${humanScore} × ${weights.human}) + (${geoScore} × ${weights.geo}) + (${populationScore} × ${weights.population})${item.pigeonSignals?.detected ? ` + ${pigeonAdjustment}` : ''} = ${finalIndex}`}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndexCalculationModal

