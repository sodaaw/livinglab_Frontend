// API Base URL
// 개발 환경에서는 Vite 프록시 사용 (상대 경로)
// 프로덕션 환경에서는 환경 변수 또는 기본 프로덕션 URL 사용
const API_BASE_URL = import.meta.env.DEV
  ? '' // 개발 환경: Vite 프록시 사용 (상대 경로)
  : (import.meta.env.VITE_API_BASE_URL || 'https://backend-rjk3.onrender.com')

// Health Check 응답 타입
interface HealthCheckResponse {
  status: string
  database?: string
  error?: string
}

// Analytics 응답 타입
export interface AnalyticsTrendResponse {
  unit_id: string
  hasData: boolean
  data_quality: string
  current: {
    uci_score: number
    uci_grade: string
  }
  trend: {
    direction: string
    slope: number
    change_rate: string
    confidence: number
  }
  forecast: Array<{
    date: string
    value: number
    confidence: number
  }>
  moving_averages: {
    ma7: number[]
    ma14: number[]
  }
  seasonality: Record<string, any>
  statistics: {
    min: number
    max: number
    mean: number
    std: number
  }
}

export interface ComplaintTrendResponse {
  unit_id: string
  hasData: boolean
  current: {
    total_complaints: number
  }
  trend: {
    direction: string
    slope: number
    confidence: number
  }
  forecast: Array<{
    date: string
    value: number
    confidence?: number
  }>
  seasonality: Record<string, any>
}

export interface DataQualityResponse {
  success: boolean
  report_date: string
  unit_id?: string
  date_range: {
    start: string
    end: string
  }
  completeness_score: number
  missing_data_points: number
  outliers_detected: number
  quality_score: number
  details: {
    human_signals: Record<string, any>
    population_signals: Record<string, any>
    comfort_index: Record<string, any>
  }
}

// API 클라이언트 클래스
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/$/, '') // 마지막 슬래시 제거
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        // 에러 응답 파싱 시도
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          if (errorData.message) {
            errorMessage = errorData.message
          } else if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch {
          // JSON 파싱 실패 시 텍스트로 시도
          try {
            const errorText = await response.text()
            if (errorText) {
              errorMessage = errorText
            }
          } catch {
            // 무시
          }
        }

        // 400 에러인 경우 날짜 파라미터 문제일 가능성
        if (response.status === 400) {
          throw new Error(`잘못된 요청: ${errorMessage}`)
        }

        // 500 에러인 경우 더 자세한 정보 제공
        if (response.status === 500) {
          throw new Error(
            `서버 내부 오류 (500): 백엔드 서버에서 오류가 발생했습니다. ` +
            `백엔드 서버 로그를 확인해주세요. ` +
            `요청 URL: ${url}`
          )
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data as T
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        // 연결 실패는 특별한 에러로 구분
        const errorMessage = `연결 실패: 백엔드 서버(${this.baseURL || '프록시를 통해'})에 연결할 수 없습니다. ` +
          `백엔드 서버가 실행 중인지 확인해주세요. ` +
          `개발 환경에서는 Vite 프록시가 자동으로 처리합니다.`
        const connectionError = new Error(errorMessage)
        // 연결 실패를 구분하기 위한 플래그 추가
        ;(connectionError as any).isConnectionError = true
        throw connectionError
      }
      throw error
    }
  }

  // Health Check
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>('/api/v1/health')
  }

  // Units
  async getUnits(params?: { q?: string; limit?: number }) {
    const queryString = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]).toString()
      : ''
    return this.request(`/api/v1/units${queryString}`)
  }

  async getUnitById(unitId: string) {
    return this.request(`/api/v1/units/${unitId}`)
  }

  async getUnitsWithinGeo(lng: number, lat: number, radiusM?: number) {
    const params = new URLSearchParams({
      lng: lng.toString(),
      lat: lat.toString(),
      ...(radiusM && { radius_m: radiusM.toString() }),
    })
    return this.request(`/api/v1/units/within/geo?${params}`)
  }

  // Comfort Index
  async getComfortIndex(params: {
    date: string
    grade?: string
    top_k?: number
  }) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]
    ).toString()
    return this.request(`/api/v1/comfort-index?${queryString}`)
  }

  async getComfortIndexByUnit(unitId: string, date?: string) {
    const queryString = date ? `?date=${date}` : ''
    return this.request(`/api/v1/comfort-index/${unitId}${queryString}`)
  }

  async computeComfortIndex(params: {
    date: string
    window_weeks?: number
    use_pigeon?: boolean
  }) {
    return this.request('/api/v1/comfort-index/compute', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  // Priority Queue
  async getPriorityQueue(params: { date: string; top_n?: number }) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]
    ).toString()
    return this.request(`/api/v1/priority-queue?${queryString}`)
  }

  // Action Cards
  async getActionCards(params: { date: string; unit_id?: string }) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]
    ).toString()
    return this.request(`/api/v1/action-cards?${queryString}`)
  }

  async generateActionCards(params: {
    date: string
    unit_ids: string[]
    use_pigeon?: boolean
  }) {
    return this.request('/api/v1/action-cards/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  // GeoJSON
  async getComfortIndexGeoJSON(date: string) {
    return this.request(`/api/v1/geo/comfort-index.geojson?date=${date}`)
  }

  async getPriorityGeoJSON(date: string, topN?: number) {
    const params = new URLSearchParams({ date })
    if (topN) params.append('top_n', topN.toString())
    return this.request(`/api/v1/geo/priority.geojson?${params}`)
  }

  // Dashboard
  async getDashboardSummary(params?: { date?: string; unit_id?: string }) {
    const queryString = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]).toString()
      : ''
    return this.request(`/api/v1/dashboard/summary${queryString}`)
  }

  async getHumanSignal(params?: {
    date?: string
    unit_id?: string
    period?: 'day' | 'week' | 'month'
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]).toString()
      : ''
    return this.request(`/api/v1/dashboard/human-signal${queryString}`)
  }

  async getGeoSignal(params?: { unit_id?: string }) {
    const queryString = params?.unit_id ? `?unit_id=${params.unit_id}` : ''
    return this.request(`/api/v1/dashboard/geo-signal${queryString}`)
  }

  async getPopulationSignal(params?: {
    date?: string
    unit_id?: string
    period?: 'day' | 'week' | 'month'
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]).toString()
      : ''
    return this.request(`/api/v1/dashboard/population-signal${queryString}`)
  }

  async getUCI(params?: {
    date?: string
    unit_id?: string
    period?: 'week' | 'month' | 'quarter'
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]).toString()
      : ''
    return this.request(`/api/v1/dashboard/uci${queryString}`)
  }

  async getInterventions(params?: { unit_id?: string; status?: 'active' | 'completed' }) {
    const queryString = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]).toString()
      : ''
    return this.request(`/api/v1/dashboard/interventions${queryString}`)
  }

  async getInterventionEffect(
    interventionId: string,
    params?: { baseline_weeks?: number; followup_weeks?: number }
  ) {
    const queryParams = new URLSearchParams()
    if (params?.baseline_weeks !== undefined) {
      queryParams.append('baseline_weeks', params.baseline_weeks.toString())
    }
    if (params?.followup_weeks !== undefined) {
      queryParams.append('followup_weeks', params.followup_weeks.toString())
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
    return this.request(`/api/v1/dashboard/interventions/${interventionId}/effect${queryString}`)
  }

  // Dashboard Trends (전체 추세 지표)
  async getDashboardTrends(params?: { period?: 'quarter' | 'month' }) {
    const queryString = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]).toString()
      : '?period=quarter'
    return this.request(`/api/v1/dashboard/trends${queryString}`)
  }

  // Regional Trends (지역별 현황)
  async getRegionalTrends(params?: { date?: string }) {
    const queryString = params?.date
      ? `?date=${params.date}`
      : ''
    return this.request(`/api/v1/dashboard/regional-trends${queryString}`)
  }

  // Blind Spots (사각지대 탐지)
  async getBlindSpots(params?: { date?: string; risk_level?: 'high' | 'medium' | 'low' }) {
    const queryString = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]).toString()
      : ''
    return this.request(`/api/v1/dashboard/blind-spots${queryString}`)
  }

  // Time Pattern (시간대별 패턴 분석)
  async getTimePattern(
    unitId: string,
    params?: { date?: string; period?: 'week' | 'month' }
  ) {
    const queryParams = new URLSearchParams()
    queryParams.append('unit_id', unitId)
    if (params?.date) queryParams.append('date', params.date)
    if (params?.period) queryParams.append('period', params.period)
    return this.request(`/api/v1/dashboard/time-pattern?${queryParams.toString()}`)
  }

  // Anomaly (이상 탐지)
  async computeAnomaly(params: { date: string; unit_id?: string }) {
    return this.request('/api/v1/anomaly/compute', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async getAnomalies(params?: {
    date?: string
    unit_id?: string
    anomaly_flag?: boolean
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(
          Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [
            k,
            v === true ? 'true' : v === false ? 'false' : String(v)
          ]) as [string, string][]
        ).toString()
      : ''
    return this.request(`/api/v1/anomaly${queryString}`)
  }

  async getAnomalyByUnit(unitId: string, params?: { date?: string }) {
    const queryString = params?.date ? `?date=${params.date}` : ''
    return this.request(`/api/v1/anomaly/${unitId}${queryString}`)
  }

  // Data Management (데이터 관리)
  async uploadFile(file: File, type?: 'raw' | 'processed' | 'uploads') {
    const formData = new FormData()
    formData.append('file', file)
    if (type) formData.append('type', type)

    const url = `${this.baseURL}/api/v1/data/upload`
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async importData(
    type: 'human' | 'geo' | 'population' | 'spatial_units',
    params: { filename: string; type?: 'raw' | 'processed' | 'uploads' }
  ) {
    return this.request(`/api/v1/data/import/${type}`, {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async getDataFiles(type?: 'raw' | 'processed' | 'uploads') {
    const queryString = type ? `?type=${type}` : ''
    return this.request(`/api/v1/data/files${queryString}`)
  }

  // Analytics
  async getAnalyticsTrend(params: { unit_id: string; days?: number; forecast_days?: number }) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [
        k,
        String(v)
      ]) as [string, string][]
    ).toString()
    return this.request<AnalyticsTrendResponse>(`/api/v1/analytics/trend?${queryString}`)
  }

  async getComplaintTrend(params: { unit_id: string; days?: number; forecast_days?: number }) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [
        k,
        String(v)
      ]) as [string, string][]
    ).toString()
    return this.request<ComplaintTrendResponse>(`/api/v1/analytics/complaint-trend?${queryString}`)
  }

  async getDataQuality(params: { unit_id?: string; start_date: string; end_date: string }) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [
        k,
        String(v)
      ]) as [string, string][]
    ).toString()
    return this.request<DataQualityResponse>(`/api/v1/analytics/data-quality?${queryString}`)
  }
}

// API 클라이언트 인스턴스 생성 및 내보내기
export const apiClient = new ApiClient(API_BASE_URL)

// API 연결 테스트 함수
export async function testApiConnection(): Promise<boolean> {
  try {
    const health = await apiClient.healthCheck()
    
    if (health.status === 'healthy') {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

// 날짜 유틸리티 함수
/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getTodayDateString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 날짜 문자열을 Date 객체로 변환 (YYYY-MM-DD 형식)
 */
export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * 날짜를 n일 전으로 이동
 */
export function subtractDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

/**
 * 최근 n일 재시도 로직을 위한 날짜 배열 생성
 * 오늘부터 시작해서 최대 maxDays일 전까지
 */
export function getDateRangeForRetry(maxDays: number = 7): string[] {
  const dates: string[] = []
  const today = new Date()
  
  for (let i = 0; i < maxDays; i++) {
    const date = subtractDays(today, i)
    dates.push(formatDateToString(date))
  }
  
  return dates
}

export default apiClient

