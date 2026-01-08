import './DashboardContent.css'

const DashboardContent = () => {
  return (
    <div className="dashboard-content">
      <div className="content-header">
        <h1 className="content-title">지역 프로파일(Where) - 어디가 문제인가?</h1>
        <h2 className="content-section-title">지역별 특성</h2>
      </div>

      <div className="content-charts">
        <div className="chart-section">
          <div className="chart-header">
            <h3 className="chart-title">편의성 지수별 지역 분포</h3>
          </div>
          <div className="chart-container">
            <div className="age-gender-chart">
              <div className="chart-y-axis">
                <div className="y-axis-label">71-100</div>
                <div className="y-axis-label">51-70</div>
                <div className="y-axis-label">31-50</div>
                <div className="y-axis-label">0-30</div>
              </div>
              <div className="chart-bars-wrapper">
                <div className="chart-x-axis-left">
                  <span>50%</span>
                  <span>15%</span>
                </div>
                <div className="chart-bars">
                  <div className="bar-group">
                    <div className="bar-male" style={{ width: '0%' }}></div>
                    <div className="bar-female" style={{ width: '25%' }}></div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-male" style={{ width: '0%' }}></div>
                    <div className="bar-female" style={{ width: '35%' }}></div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-male" style={{ width: '0%' }}></div>
                    <div className="bar-female" style={{ width: '30%' }}></div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-male" style={{ width: '0%' }}></div>
                    <div className="bar-female" style={{ width: '10%' }}></div>
                  </div>
                </div>
                <div className="chart-x-axis-right">
                  <span>15%</span>
                  <span>50%</span>
                </div>
              </div>
            </div>
            <div className="chart-legend">
              <span>지역 전체</span>
              <span>우수 25%</span>
              <span>양호 35%</span>
              <span>보통 30%</span>
              <span>낮음 10%</span>
            </div>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-header">
            <h3 className="chart-title">구별 분포</h3>
          </div>
          <div className="chart-container">
            <div className="region-map-placeholder">
              <div className="map-region seoul">강남구</div>
              <div className="map-region gyeonggi">마포구</div>
              <div className="map-region incheon">종로구</div>
              <div className="map-region other">송파구</div>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color seoul"></span>
                <span>강남구 24.3%</span>
              </div>
              <div className="legend-item">
                <span className="legend-color gyeonggi"></span>
                <span>마포구 21.4%</span>
              </div>
              <div className="legend-item">
                <span className="legend-color incheon"></span>
                <span>종로구 19.9%</span>
              </div>
              <div className="legend-item">
                <span className="legend-color other"></span>
                <span>송파구 18.1%</span>
              </div>
              <div className="legend-item">
                <span className="legend-color other"></span>
                <span>기타 16.3%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-header">
            <h3 className="chart-title">개선 상태 분포</h3>
          </div>
          <div className="chart-container">
            <div className="occupation-chart">
              <div className="occupation-item" style={{ width: '44.4%', backgroundColor: 'var(--primary)' }}>
                <span>개선 중 44.4%</span>
              </div>
              <div className="occupation-item" style={{ width: '25.2%', backgroundColor: 'var(--primary-light)' }}>
                <span>안정적 25.2%</span>
              </div>
              <div className="occupation-item" style={{ width: '19.9%', backgroundColor: 'var(--primary-light)' }}>
                <span>모니터링 필요 19.9%</span>
              </div>
              <div className="occupation-item" style={{ width: '10.5%', backgroundColor: 'var(--primary-light)' }}>
                <span>긴급 조치 10.5%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-header">
            <h3 className="chart-title">편의성 지수 범위</h3>
          </div>
          <div className="chart-container">
            <div className="income-chart">
              <div className="income-ring"></div>
            </div>
            <div className="chart-legend income-legend">
              <div className="legend-item">
                <span className="legend-dot"></span>
                <span>0-30 (낮음) 10.3%</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot"></span>
                <span>31-50 (보통) 30.8%</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot"></span>
                <span>51-70 (양호) 35.5%</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot"></span>
                <span>71-100 (우수) 23.4%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-footer">
        <div className="footer-section">
          <h3 className="footer-title">
            주요 개선 지역
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 6V8M8 10H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </h3>
        </div>
        <div className="footer-section">
          <button className="footer-button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            상세 분석 (Beta)
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardContent

