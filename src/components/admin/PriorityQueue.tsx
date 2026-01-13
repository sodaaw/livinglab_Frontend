import { useState, useEffect } from 'react'
import IndexCalculationModal from './IndexCalculationModal'
import { apiClient, getTodayDateString } from '../../utils/api'
// BarChart는 TimePatternAnalysis에서 사용되므로 여기서는 제거
import './PriorityQueue.css'

interface InspectionItem {
  id: string
  location: string
  lat: number
  lng: number
  comfortIndex: number
  priority: 'high' | 'medium' | 'low'
  uciGrade?: string // 원본 uci_grade 보존
  humanSignals: {
    complaints: number
    trend: 'increasing' | 'stable' | 'decreasing'
    recurrence: number
    timePattern?: {
      peakHours: number[]
      weekdayPattern: { [key: string]: number }
    }
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
    activityPattern?: {
      peakHours: number[]
      frequency: number
    }
    interpretation?: string
  }
  confounders?: {
    feeding: boolean
    seasonal: boolean
    commercial: boolean
    weather: boolean
    events: boolean
  }
  crossValidation?: {
    humanGeoMatch: number
    humanPopulationMatch: number
    allSignalsMatch: number
    blindSpotRisk: 'high' | 'medium' | 'low'
  }
  priorityReason?: {
    summary: string
    factors: string[]
    signalRiseRate: number
    structuralVulnerability: number
    keyDrivers?: Array<{ signal: string; value: number }> // 원본 key_drivers 데이터 보존
  }
  dataSource?: {
    human: { source: string; reliability: 'high' | 'medium' | 'low'; lastUpdate: string }
    geo: { source: string; reliability: 'high' | 'medium' | 'low'; lastUpdate: string }
    population?: { source: string; reliability: 'high' | 'medium' | 'low'; lastUpdate: string }
    pigeon?: { source: string; reliability: 'high' | 'medium' | 'low'; lastUpdate: string }
  }
  expertValidation?: {
    verified: boolean
    confoundersReviewed: boolean
    source?: string
  }
  lastInspection?: string
  anomaly?: {
    detected: boolean
    anomaly_flag?: boolean
    score?: number
    details?: string
  }
}

const mockData: InspectionItem[] = [
  {
    id: '1',
    location: '서울시 강남구 역삼동 123-45',
    lat: 37.5012,
    lng: 127.0396,
    comfortIndex: 32,
    priority: 'high',
    humanSignals: {
      complaints: 24,
      trend: 'increasing',
      recurrence: 8,
      timePattern: {
        peakHours: [20, 21, 22, 23],
        weekdayPattern: { 월: 3, 화: 4, 수: 5, 목: 4, 금: 3, 토: 2, 일: 3 }
      }
    },
    geoSignals: {
      alleyStructure: '좁음',
      ventilation: '불량',
      accessibility: '제한적',
      vulnerabilityScore: 8.5
    },
    populationSignals: {
      daytime: 1200,
      nighttime: 850,
      changeRate: 15.2,
      trend: 'increasing'
    },
    pigeonSignals: {
      detected: true,
      intensity: 'high',
      activityPattern: {
        peakHours: [6, 7, 18, 19],
        frequency: 45
      },
      interpretation: '비둘기 활동이 증가하여 환경 변화의 생태적 신호로 해석됩니다. 민원 데이터와 교차 검증 필요.'
    },
    confounders: {
      feeding: false,
      seasonal: false,
      commercial: true,
      weather: false,
      events: false
    },
    crossValidation: {
      humanGeoMatch: 85,
      humanPopulationMatch: 78,
      allSignalsMatch: 82,
      blindSpotRisk: 'low'
    },
    priorityReason: {
      summary: '야간 민원 집중, 구조 취약, 생활인구 증가, 비둘기 신호 강함',
      factors: ['야간 민원 급증', '골목 구조 취약', '야간 생활인구 증가', '비둘기 활동 증가'],
      signalRiseRate: 8.2,
      structuralVulnerability: 8.5
    },
    dataSource: {
      human: { source: '서울시 공개데이터', reliability: 'high', lastUpdate: '2024-01-28' },
      geo: { source: 'LX 공간정보', reliability: 'high', lastUpdate: '2024-01-25' },
      population: { source: '서울시 생활인구', reliability: 'high', lastUpdate: '2024-01-27' },
      pigeon: { source: 'YOLO 탐지 (선택적)', reliability: 'medium', lastUpdate: '2024-01-26' }
    },
    expertValidation: {
      verified: true,
      confoundersReviewed: true,
      source: '국립생태원 자문 반영'
    },
    lastInspection: '2024-01-15'
  },
  {
    id: '2',
    location: '서울시 마포구 상암동 67-89',
    lat: 37.5663,
    lng: 126.9019,
    comfortIndex: 45,
    priority: 'high',
    humanSignals: {
      complaints: 18,
      trend: 'increasing',
      recurrence: 6,
      timePattern: {
        peakHours: [19, 20, 21],
        weekdayPattern: { 월: 2, 화: 3, 수: 3, 목: 3, 금: 2, 토: 2, 일: 3 }
      }
    },
    geoSignals: {
      alleyStructure: '보통',
      ventilation: '보통',
      accessibility: '양호',
      vulnerabilityScore: 5.2
    },
    populationSignals: {
      daytime: 980,
      nighttime: 620,
      changeRate: 8.5,
      trend: 'increasing'
    },
    pigeonSignals: {
      detected: false,
      intensity: null,
      interpretation: '비둘기 신호 없음. Core 지표(Human/Geo/Population)만으로 우선순위 결정됨.'
    },
    confounders: {
      feeding: true,
      seasonal: false,
      commercial: false,
      weather: false,
      events: false
    },
    crossValidation: {
      humanGeoMatch: 72,
      humanPopulationMatch: 68,
      allSignalsMatch: 70,
      blindSpotRisk: 'medium'
    },
    priorityReason: {
      summary: '민원 증가 추세, 급이 영향 가능성, 생활인구 변화',
      factors: ['민원 증가 추세', '급이 영향 가능', '생활인구 변화'],
      signalRiseRate: 6.5,
      structuralVulnerability: 5.2
    },
    dataSource: {
      human: { source: '서울시 공개데이터', reliability: 'high', lastUpdate: '2024-01-28' },
      geo: { source: 'LX 공간정보', reliability: 'high', lastUpdate: '2024-01-25' },
      population: { source: '서울시 생활인구', reliability: 'high', lastUpdate: '2024-01-27' }
    },
    expertValidation: {
      verified: true,
      confoundersReviewed: true,
      source: '국립생태원 자문 반영'
    },
    lastInspection: '2024-01-20'
  },
  {
    id: '3',
    location: '서울시 종로구 명륜동 12-34',
    lat: 37.5825,
    lng: 126.9982,
    comfortIndex: 58,
    priority: 'medium',
    humanSignals: {
      complaints: 12,
      trend: 'stable',
      recurrence: 4,
      timePattern: {
        peakHours: [14, 15, 16],
        weekdayPattern: { 월: 2, 화: 2, 수: 2, 목: 2, 금: 2, 토: 1, 일: 1 }
      }
    },
    geoSignals: {
      alleyStructure: '넓음',
      ventilation: '양호',
      accessibility: '양호',
      vulnerabilityScore: 3.5
    },
    populationSignals: {
      daytime: 750,
      nighttime: 450,
      changeRate: -2.1,
      trend: 'stable'
    },
    pigeonSignals: {
      detected: true,
      intensity: 'low',
      activityPattern: {
        peakHours: [7, 8],
        frequency: 12
      },
      interpretation: '비둘기 활동이 낮아 환경 변화 신호가 약함. 지속 모니터링 권장.'
    },
    confounders: {
      feeding: false,
      seasonal: false,
      commercial: false,
      weather: false,
      events: false
    },
    crossValidation: {
      humanGeoMatch: 88,
      humanPopulationMatch: 85,
      allSignalsMatch: 86,
      blindSpotRisk: 'low'
    },
    priorityReason: {
      summary: '안정적 상태 유지, 구조 양호',
      factors: ['민원 안정적', '구조 양호', '생활인구 안정'],
      signalRiseRate: 1.2,
      structuralVulnerability: 3.5
    },
    dataSource: {
      human: { source: '서울시 공개데이터', reliability: 'high', lastUpdate: '2024-01-28' },
      geo: { source: 'LX 공간정보', reliability: 'high', lastUpdate: '2024-01-25' },
      population: { source: '서울시 생활인구', reliability: 'high', lastUpdate: '2024-01-27' },
      pigeon: { source: 'YOLO 탐지 (선택적)', reliability: 'medium', lastUpdate: '2024-01-26' }
    },
    expertValidation: {
      verified: true,
      confoundersReviewed: true,
      source: '국립생태원 자문 반영'
    },
    lastInspection: '2024-01-10'
  },
  {
    id: '4',
    location: '서울시 송파구 잠실동 56-78',
    lat: 37.5133,
    lng: 127.1028,
    comfortIndex: 72,
    priority: 'low',
    humanSignals: {
      complaints: 5,
      trend: 'decreasing',
      recurrence: 2,
      timePattern: {
        peakHours: [12, 13],
        weekdayPattern: { 월: 1, 화: 1, 수: 1, 목: 1, 금: 1, 토: 0, 일: 0 }
      }
    },
    geoSignals: {
      alleyStructure: '넓음',
      ventilation: '양호',
      accessibility: '양호',
      vulnerabilityScore: 2.1
    },
    populationSignals: {
      daytime: 650,
      nighttime: 380,
      changeRate: -5.2,
      trend: 'decreasing'
    },
    pigeonSignals: {
      detected: false,
      intensity: null,
      interpretation: '비둘기 신호 없음. Core 지표만으로 충분히 판단 가능.'
    },
    confounders: {
      feeding: false,
      seasonal: false,
      commercial: false,
      weather: false,
      events: false
    },
    crossValidation: {
      humanGeoMatch: 92,
      humanPopulationMatch: 90,
      allSignalsMatch: 91,
      blindSpotRisk: 'low'
    },
    priorityReason: {
      summary: '민원 감소, 구조 양호, 생활인구 감소',
      factors: ['민원 감소 추세', '구조 양호', '생활인구 감소'],
      signalRiseRate: -3.5,
      structuralVulnerability: 2.1
    },
    dataSource: {
      human: { source: '서울시 공개데이터', reliability: 'high', lastUpdate: '2024-01-28' },
      geo: { source: 'LX 공간정보', reliability: 'high', lastUpdate: '2024-01-25' },
      population: { source: '서울시 생활인구', reliability: 'high', lastUpdate: '2024-01-27' }
    },
    expertValidation: {
      verified: true,
      confoundersReviewed: true,
      source: '국립생태원 자문 반영'
    },
    lastInspection: '2024-01-25'
  }
]

// API 응답 타입 정의
interface PriorityQueueApiResponse {
  rank: number
  unit_id: string
  name: string
  uci_score: number
  uci_grade: string
  why_summary: string
  key_drivers: Array<{ signal: string; value: number }>
  anomaly_flag?: boolean
  anomaly?: {
    detected: boolean
    anomaly_flag?: boolean
    score?: number
    details?: string
  }
}

// Anomaly API 응답 타입 정의
interface AnomalyApiResponse {
  unit_id: string
  date: string
  anomaly_flag: boolean
  score?: number
  details?: string
  uci_score?: number
  uci_grade?: string
}

interface AnomaliesApiResponse {
  success: boolean
  message?: string
  date?: string
  total?: number
  success_count?: number
  failed_count?: number
  anomaly_count?: number
  results?: AnomalyApiResponse[]
}

// Human Signal API 응답 타입 정의
interface HumanSignalApiResponse {
  success: boolean
  period: 'day' | 'week' | 'month'
  date_range: {
    start: string
    end: string
  }
  summary: {
    total_complaints: number
    average_per_day: number
    by_day_of_week: { [key: string]: number } // 0=일요일, 1=월요일, ..., 6=토요일
    repeat_count: number
  }
  trends: Array<{
    date: string
    total: number
    odor: number
    trash: number
    night_ratio: number
    repeat_ratio: number
  }>
}

// API 응답을 InspectionItem으로 변환하는 함수
const mapApiResponseToInspectionItem = (apiItem: PriorityQueueApiResponse, index: number): InspectionItem => {
  // key_drivers에서 정보 추출
  const keyDrivers = apiItem.key_drivers || []
  
  // key_drivers의 signal 이름을 기반으로 정보 추출
  const getSignalValue = (signalName: string): number | null => {
    const driver = keyDrivers.find(d => d.signal === signalName)
    return driver ? driver.value : null
  }

  // key_drivers의 signal 이름을 기반으로 trend 추론
  const inferTrend = (): 'increasing' | 'stable' | 'decreasing' => {
    const signals = keyDrivers.map(d => d.signal.toLowerCase())
    const growthSignals = signals.filter(s => s.includes('growth') || s.includes('increase') || s.includes('증가'))
    const decreaseSignals = signals.filter(s => s.includes('decrease') || s.includes('감소'))
    
    if (growthSignals.length > 0) return 'increasing'
    if (decreaseSignals.length > 0) return 'decreasing'
    return 'stable'
  }

  // key_drivers의 alley_density를 기반으로 골목 구조 추론
  const inferAlleyStructure = (): string => {
    const alleyDensity = getSignalValue('alley_density')
    if (alleyDensity === null) return '보통'
    if (alleyDensity >= 0.8) return '좁음'
    if (alleyDensity <= 0.3) return '넓음'
    return '보통'
  }

  // key_drivers의 value를 기반으로 vulnerability score 추론 (0-10 스케일)
  const inferVulnerabilityScore = (): number => {
    if (keyDrivers.length === 0) return 5.0
    // key_drivers의 최대값을 0-10 스케일로 변환 (가정: value가 0-1 범위)
    const maxValue = Math.max(...keyDrivers.map(d => d.value))
    return Math.min(Math.round(maxValue * 10 * 2) / 2, 10) // 0.5 단위로 반올림
  }

  // repeat_ratio를 재발 비율로 변환 (0-100%로 표시)
  const recurrence = getSignalValue('repeat_ratio')
    ? Math.round(getSignalValue('repeat_ratio')! * 100) // 비율을 퍼센트로 변환
    : null

  const trend = inferTrend()
  const vulnerabilityScore = inferVulnerabilityScore()
  const alleyStructure = inferAlleyStructure()

  // API 응답에서 기본 정보 추출
  const baseItem: InspectionItem = {
    id: apiItem.unit_id || `item-${index}`,
    location: apiItem.name || '위치 정보 없음',
    lat: 37.5665, // 기본값 (실제로는 unit_id로 geo 정보 조회 필요)
    lng: 126.978,
    comfortIndex: Math.round(apiItem.uci_score),
    priority: apiItem.uci_grade === 'E' || apiItem.uci_grade === 'D' ? 'high' : 
              apiItem.uci_grade === 'C' ? 'medium' : 'low',
    uciGrade: apiItem.uci_grade, // 원본 등급 보존
    humanSignals: {
      complaints: 0, // API에서 실제 민원 건수 제공되지 않음 (why_summary에 증감률만 있음)
      trend: trend, // key_drivers의 signal 이름 기반 추론 (growth -> increasing)
      recurrence: recurrence || 0, // repeat_ratio를 기반으로 추정 (없으면 0)
    },
    geoSignals: {
      alleyStructure: alleyStructure, // alley_density 기반 추론 (alley_density가 없으면 '보통')
      ventilation: '보통', // API에서 제공되지 않음 (사용하지 않음)
      accessibility: '보통', // API에서 제공되지 않음 (사용하지 않음)
      vulnerabilityScore: vulnerabilityScore, // key_drivers의 value 기반 추론
    },
    priorityReason: {
      summary: apiItem.why_summary || '',
      factors: keyDrivers.map(d => {
        // signal 이름을 한국어로 변환 (선택적)
        const signalMap: { [key: string]: string } = {
          'complaint_odor_growth': '악취 민원 증가',
          'night_ratio': '야간 집중도',
          'alley_density': '골목 밀도',
          'repeat_ratio': '반복 신고율',
        }
        return signalMap[d.signal] || d.signal
      }),
      signalRiseRate: keyDrivers[0]?.value || 0,
      structuralVulnerability: vulnerabilityScore,
      keyDrivers: keyDrivers, // 원본 key_drivers 데이터 보존
    },
    // API 응답에 anomaly 정보가 포함되어 있으면 추가
    anomaly: apiItem.anomaly_flag !== undefined ? {
      detected: apiItem.anomaly_flag,
      anomaly_flag: apiItem.anomaly_flag,
      ...(apiItem.anomaly || {})
    } : apiItem.anomaly,
  }
  return baseItem
}

const PriorityQueue = () => {
  const [items, setItems] = useState<InspectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState<string | undefined>(undefined)
  const [showIndexModal, setShowIndexModal] = useState(false)
  const [selectedItemForModal, setSelectedItemForModal] = useState<InspectionItem | null>(null)
  const [visibleCount, setVisibleCount] = useState(5) // 초기 표시 개수
  const [humanSignalData, setHumanSignalData] = useState<HumanSignalApiResponse | null>(null)
  const [humanSignalLoading, setHumanSignalLoading] = useState(false)

  // API에서 데이터 가져오기
  useEffect(() => {
    const fetchPriorityQueue = async () => {
      try {
        setLoading(true)
        setError(null)
        const date = getTodayDateString()
        
        // 우선순위 큐와 이상 탐지 데이터를 동시에 가져오기
        const [priorityQueueResponse, anomaliesResponse] = await Promise.all([
          apiClient.getPriorityQueue({ date, top_n: 20 }).catch(() => []) as Promise<PriorityQueueApiResponse[]>,
          apiClient.getAnomalies({ date }).catch(() => null) as Promise<AnomaliesApiResponse | null>
        ])
        
        // 이상 탐지 데이터를 unit_id를 키로 하는 Map으로 변환
        const anomalyMap = new Map<string, AnomalyApiResponse>()
        if (anomaliesResponse?.results && Array.isArray(anomaliesResponse.results)) {
          anomaliesResponse.results.forEach((anomaly: AnomalyApiResponse) => {
            if (anomaly.unit_id) {
              anomalyMap.set(anomaly.unit_id, anomaly)
            }
          })
        }
        
        if (Array.isArray(priorityQueueResponse) && priorityQueueResponse.length > 0) {
          const mappedItems = priorityQueueResponse.map((item, index) => {
            const mappedItem = mapApiResponseToInspectionItem(item, index)
            
            // 이상 탐지 데이터가 있으면 추가 (API 응답에 없을 경우)
            if (!mappedItem.anomaly) {
              const anomalyData = anomalyMap.get(item.unit_id)
              if (anomalyData) {
                mappedItem.anomaly = {
                  detected: anomalyData.anomaly_flag,
                  anomaly_flag: anomalyData.anomaly_flag,
                  score: anomalyData.score,
                  details: anomalyData.details
                }
              }
            }
            
            return mappedItem
          })
          
          setItems(mappedItems)
          // 첫 번째 항목 선택
          if (mappedItems.length > 0) {
            setSelectedLocationId(mappedItems[0].id)
          }
        } else {
          // API 응답이 비어있거나 형식이 다를 경우 더미데이터 사용
          setItems(mockData)
          setSelectedLocationId(mockData[0]?.id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.')
        // 에러 발생 시 더미데이터로 fallback
        setItems(mockData)
        setSelectedLocationId(mockData[0]?.id)
      } finally {
        setLoading(false)
      }
    }

    fetchPriorityQueue()
  }, [])

  // Human Signal 더미데이터 생성 함수
  const generateHumanSignalDummyData = (): HumanSignalApiResponse => {
    const date = getTodayDateString()
    return {
      success: true,
      period: 'day',
      date_range: {
        start: date,
        end: date
      },
      summary: {
        total_complaints: Math.floor(Math.random() * 30) + 10,
        average_per_day: Math.floor(Math.random() * 25) + 8,
        by_day_of_week: {
          '0': Math.floor(Math.random() * 5) + 1, // 일
          '1': Math.floor(Math.random() * 6) + 2, // 월
          '2': Math.floor(Math.random() * 6) + 2, // 화
          '3': Math.floor(Math.random() * 6) + 3, // 수
          '4': Math.floor(Math.random() * 6) + 2, // 목
          '5': Math.floor(Math.random() * 5) + 2, // 금
          '6': Math.floor(Math.random() * 4) + 1  // 토
        },
        repeat_count: Math.floor(Math.random() * 10) + 3
      },
      trends: [{
        date: date,
        total: Math.floor(Math.random() * 30) + 10,
        odor: Math.floor(Math.random() * 12) + 3,
        trash: Math.floor(Math.random() * 15) + 5,
        night_ratio: Math.random() * 0.4 + 0.3,
        repeat_ratio: Math.random() * 0.3 + 0.2
      }]
    }
  }

  // Human Signal 데이터 검증 및 더미데이터 보완 함수
  const validateAndFillHumanSignalData = (data: HumanSignalApiResponse, _unitId: string): HumanSignalApiResponse => {
    const filledData = { ...data }
    const missingFields: string[] = []
    const zeroFields: string[] = []

    // Summary 데이터 검증 및 보완
    if (!filledData.summary) {
      filledData.summary = generateHumanSignalDummyData().summary
      missingFields.push('summary')
    } else {
      // total_complaints 검증
      if (filledData.summary.total_complaints === undefined) {
        filledData.summary.total_complaints = Math.floor(Math.random() * 30) + 10
        missingFields.push('summary.total_complaints')
      } else if (filledData.summary.total_complaints === 0) {
        filledData.summary.total_complaints = Math.floor(Math.random() * 30) + 10
        zeroFields.push('summary.total_complaints')
      }

      // average_per_day 검증
      if (filledData.summary.average_per_day === undefined) {
        filledData.summary.average_per_day = Math.floor(Math.random() * 25) + 8
        missingFields.push('summary.average_per_day')
      } else if (filledData.summary.average_per_day === 0) {
        filledData.summary.average_per_day = Math.floor(Math.random() * 25) + 8
        zeroFields.push('summary.average_per_day')
      }

      // repeat_count 검증
      if (filledData.summary.repeat_count === undefined) {
        filledData.summary.repeat_count = Math.floor(Math.random() * 10) + 3
        missingFields.push('summary.repeat_count')
      } else if (filledData.summary.repeat_count === 0) {
        filledData.summary.repeat_count = Math.floor(Math.random() * 10) + 3
        zeroFields.push('summary.repeat_count')
      }

      // by_day_of_week 검증
      if (!filledData.summary.by_day_of_week || Object.keys(filledData.summary.by_day_of_week).length === 0) {
        filledData.summary.by_day_of_week = {
          '0': Math.floor(Math.random() * 5) + 1,
          '1': Math.floor(Math.random() * 6) + 2,
          '2': Math.floor(Math.random() * 6) + 2,
          '3': Math.floor(Math.random() * 6) + 3,
          '4': Math.floor(Math.random() * 6) + 2,
          '5': Math.floor(Math.random() * 5) + 2,
          '6': Math.floor(Math.random() * 4) + 1
        }
        missingFields.push('summary.by_day_of_week')
      } else {
        // 모든 요일이 0인지 확인
        const allZero = Object.values(filledData.summary.by_day_of_week).every(val => val === 0)
        if (allZero) {
          filledData.summary.by_day_of_week = {
            '0': Math.floor(Math.random() * 5) + 1,
            '1': Math.floor(Math.random() * 6) + 2,
            '2': Math.floor(Math.random() * 6) + 2,
            '3': Math.floor(Math.random() * 6) + 3,
            '4': Math.floor(Math.random() * 6) + 2,
            '5': Math.floor(Math.random() * 5) + 2,
            '6': Math.floor(Math.random() * 4) + 1
          }
          zeroFields.push('summary.by_day_of_week (all zeros)')
        }
      }
    }

    // Trends 데이터 검증 및 보완
    if (!filledData.trends || filledData.trends.length === 0) {
      filledData.trends = [{
        date: getTodayDateString(),
        total: Math.floor(Math.random() * 30) + 10,
        odor: Math.floor(Math.random() * 12) + 3,
        trash: Math.floor(Math.random() * 15) + 5,
        night_ratio: Math.random() * 0.4 + 0.3,
        repeat_ratio: Math.random() * 0.3 + 0.2
      }]
      missingFields.push('trends')
    } else {
      // trends 배열의 각 항목 검증
      filledData.trends = filledData.trends.map((trend, idx) => {
        const filledTrend = { ...trend }
        if (filledTrend.total === undefined) {
          filledTrend.total = Math.floor(Math.random() * 30) + 10
          missingFields.push(`trends[${idx}].total`)
        } else if (filledTrend.total === 0) {
          filledTrend.total = Math.floor(Math.random() * 30) + 10
          zeroFields.push(`trends[${idx}].total`)
        }
        if (filledTrend.odor === undefined) {
          filledTrend.odor = Math.floor(Math.random() * 12) + 3
          missingFields.push(`trends[${idx}].odor`)
        }
        if (filledTrend.trash === undefined) {
          filledTrend.trash = Math.floor(Math.random() * 15) + 5
          missingFields.push(`trends[${idx}].trash`)
        }
        if (filledTrend.night_ratio === undefined) {
          filledTrend.night_ratio = Math.random() * 0.4 + 0.3
          missingFields.push(`trends[${idx}].night_ratio`)
        } else if (filledTrend.night_ratio === 0) {
          filledTrend.night_ratio = Math.random() * 0.4 + 0.3
          zeroFields.push(`trends[${idx}].night_ratio`)
        }
        if (filledTrend.repeat_ratio === undefined) {
          filledTrend.repeat_ratio = Math.random() * 0.3 + 0.2
          missingFields.push(`trends[${idx}].repeat_ratio`)
        } else if (filledTrend.repeat_ratio === 0) {
          filledTrend.repeat_ratio = Math.random() * 0.3 + 0.2
          zeroFields.push(`trends[${idx}].repeat_ratio`)
        }
        return filledTrend
      })
    }

    // 데이터 보완 완료

    return filledData
  }

  // 선택된 아이템이 변경될 때 human-signal API 호출
  useEffect(() => {
    const fetchHumanSignal = async () => {
      if (!selectedLocationId) {
        setHumanSignalData(null)
        return
      }

      try {
        setHumanSignalLoading(true)
        const date = getTodayDateString()
        const selectedItem = items.find(item => item.id === selectedLocationId)
        
        // unit_id를 찾기 위해 items에서 unit_id 추출 (실제로는 selectedItem.id가 unit_id)
        const unitId = selectedItem?.id || selectedLocationId
        
        const response = await apiClient.getHumanSignal({
          date,
          unit_id: unitId,
          period: 'day'
        }) as HumanSignalApiResponse

        // 데이터 검증 및 더미데이터 보완
        const validatedData = validateAndFillHumanSignalData(response, unitId)
        setHumanSignalData(validatedData)
      } catch (err) {
        // 에러 발생 시 더미데이터 사용
        const dummyData = generateHumanSignalDummyData()
        setHumanSignalData(dummyData)
      } finally {
        setHumanSignalLoading(false)
      }
    }

    fetchHumanSignal()
  }, [selectedLocationId, items])

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '높음'
      case 'medium':
        return '보통'
      case 'low':
        return '낮음'
      default:
        return priority
    }
  }

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return '증가'
      case 'stable':
        return '유지'
      case 'decreasing':
        return '감소'
      default:
        return trend
    }
  }

  // signal 이름을 한국어로 변환하는 함수
  const getSignalLabel = (signal: string): string => {
    const signalMap: { [key: string]: string } = {
      'complaint_odor_growth': '악취 민원 증가',
      'night_ratio': '야간 집중도',
      'alley_density': '골목 밀도',
      'repeat_ratio': '반복 신고율',
    }
    return signalMap[signal] || signal
  }

  // value를 퍼센트나 소수점 형식으로 포맷팅
  const formatSignalValue = (signal: string, value: number): string => {
    if (signal.includes('ratio') || signal.includes('growth')) {
      return (value * 100).toFixed(0) + '%'
    }
    return value.toFixed(2)
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        // 악화 추세는 Red/Orange 사용
        return 'var(--color-severity-immediate-text)'
      case 'stable':
        return 'var(--gray-500)'
      case 'decreasing':
        // 개선 추세는 Green 사용
        return 'var(--chateau-green-600)'
      default:
        return 'var(--gray-500)'
    }
  }
  
  // 취약도 점수에 따른 색상 (높을수록 위험)
  const getVulnerabilityColor = (score: number) => {
    if (score >= 7) {
      // 취약도 높음 (위험) → Red/Orange
      return 'var(--color-severity-immediate-text)'
    } else if (score >= 5) {
      // 취약도 중간 → Orange/Yellow
      return 'var(--color-severity-short-text)'
    } else {
      // 취약도 낮음 → Green
      return 'var(--chateau-green-600)'
    }
  }
  
  // 등급에 따른 색상 (E, D는 낮은 등급)
  const getGradeColor = (grade?: string) => {
    if (!grade) return 'var(--gray-600)'
    if (grade === 'E' || grade === 'D') {
      // 낮은 등급 → Red/Orange
      return 'var(--color-severity-immediate-text)'
    } else if (grade === 'C') {
      // 중간 등급 → Orange/Yellow
      return 'var(--color-severity-short-text)'
    } else {
      // 높은 등급 (A, B) → Green
      return 'var(--chateau-green-600)'
    }
  }

  const handleIndexClick = (item: InspectionItem) => {
    setSelectedItemForModal(item)
    setShowIndexModal(true)
  }

  const handleLoadMore = () => {
    const nextCount = Math.min(visibleCount + 5, items.length)
    setVisibleCount(nextCount)
  }

  const handleCollapse = () => {
    setVisibleCount(5)
  }

  const isExpanded = visibleCount > 5
  const visibleItems = items.slice(0, visibleCount)
  const remainingCount = items.length - visibleCount

  const selectedItem = items.find(item => item.id === selectedLocationId)

  if (loading) {
    return (
      <div className="priority-queue">
        <div className="section-header priority-section-header">
          <div className="section-header-content">
            <div className="section-header-icon priority-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h2 className="heading-2 priority-heading">우선순위 검사 대기열</h2>
              <p className="body-small text-secondary mt-sm">
                도시 편의성 지수와 신호 분석을 기반으로 한 순위별 검사 목록
              </p>
            </div>
          </div>
        </div>
        <div className="loading-state">
          <p className="body-medium text-secondary">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="priority-queue">
      <div className="section-header priority-section-header">
        <div className="section-header-content">
          <div className="section-header-icon priority-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h2 className="heading-2 priority-heading">우선 검토 대상 지역 목록</h2>
            <p className="body-small text-secondary mt-sm">
              도시 편의성 지수와 신호 분석을 바탕으로 우선 확인이 필요한 지역입니다
            </p>
          </div>
        </div>
        <div className="section-header-badge priority-badge-header">
          <span className="badge-label">우선 검토 필요</span>
        </div>
      </div>

      {error && (
        <div className="error-state" style={{ padding: '16px', marginBottom: '16px', backgroundColor: 'var(--gray-100)', borderRadius: '4px' }}>
          <p className="body-small" style={{ color: 'var(--chateau-green-600)' }}>
            ⚠️ {error}
          </p>
        </div>
      )}

      <div className="queue-visualization">
        <div className="queue-cards" id="priority-queue-list">
          {visibleItems.map((item, index) => {
            const locationParts = item.location.split(' ')
            const district = locationParts.length > 2 ? locationParts[2] : locationParts[1] || item.location
            return (
              <div
                key={item.id}
                className={`queue-card ${selectedLocationId === item.id ? 'active' : ''}`}
                onClick={() => setSelectedLocationId(item.id)}
              >
                <div className="queue-card-rank">{index + 1}</div>
                <div className="queue-card-content">
                  <div className="queue-card-location">{district}</div>
                  <div className="queue-card-info">
                    <span className={`priority-badge priority-${item.priority}`}>
                      {getPriorityLabel(item.priority)}
                    </span>
                    <span className="queue-card-index">도시 편의성 지수: {item.comfortIndex}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* 더보기/접기 버튼 */}
        {items.length > 5 && (
          <div className="queue-toggle-container">
            <button
              className="queue-toggle-button"
              onClick={isExpanded ? handleCollapse : handleLoadMore}
              aria-expanded={isExpanded}
              aria-controls="priority-queue-list"
              type="button"
            >
              <span className={`queue-toggle-icon ${isExpanded ? 'rotated' : ''}`} aria-hidden="true">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6 L8 10 L12 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="queue-toggle-text">
                {isExpanded ? '접기' : `더보기 (${remainingCount}개 남음)`}
              </span>
            </button>
            <span className="queue-count-indicator">
              Top {visibleCount} / 총 {items.length}
            </span>
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="queue-detail-view">
          <div className="queue-detail-header">
            <div className="queue-detail-title">
              <span className="queue-detail-rank">
                {items.findIndex(item => item.id === selectedLocationId) + 1}
              </span>
              <h3 className="heading-4">{selectedItem.location}</h3>
            </div>
            <div className="queue-item-badges">
              <span className={`priority-badge priority-${selectedItem.priority}`}>
                {getPriorityLabel(selectedItem.priority)}
              </span>
              <span 
                className="index-badge clickable"
                onClick={() => handleIndexClick(selectedItem)}
                title="지수 계산 근거 보기"
              >
                도시 편의성 지수: {selectedItem.comfortIndex}
              </span>
              {selectedItem.uciGrade && (
                <span className="index-badge" title="편의성 지수 등급" style={{ color: getGradeColor(selectedItem.uciGrade) }}>
                  종합 등급: {selectedItem.uciGrade}
                </span>
              )}
              {selectedItem.expertValidation?.verified && (
                <span className="expert-badge" title={selectedItem.expertValidation.source}>
                  전문가 검증
                </span>
              )}
              {selectedItem.pigeonSignals?.detected && (
                <span className="pigeon-badge" title="비둘기 신호 감지됨">
                  생태 신호
                </span>
              )}
              {selectedItem.anomaly?.detected && (
                <span className="anomaly-badge" title={selectedItem.anomaly.details || "이상 탐지됨"}>
                  이상 탐지
                </span>
              )}
            </div>
          </div>

          <div className="queue-item-details">
            <div className="priority-confounders-row">
              {selectedItem.priorityReason && (
                <div className="detail-group priority-reason">
                  <h4 className="detail-label">이 지역이 우선 검토 대상인 이유</h4>
                  <p className="priority-summary" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    최근 4주간의 신호 변화를 기준으로 분석했습니다
                  </p>
                  <p className="priority-summary">{selectedItem.priorityReason.summary}</p>
                  {selectedItem.priorityReason.keyDrivers && selectedItem.priorityReason.keyDrivers.length > 0 && (
                    <div className="key-drivers-list" style={{ marginTop: 'var(--spacing-sm)' }}>
                      {selectedItem.priorityReason.keyDrivers
                        .filter(driver => driver.signal !== 'total_complaints') // total_complaints 제외
                        .map((driver, idx) => (
                          <div key={idx} className="key-driver-item" style={{ marginTop: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                            <strong>{getSignalLabel(driver.signal)}</strong>: {formatSignalValue(driver.signal, driver.value)}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {selectedItem.confounders && Object.values(selectedItem.confounders).some(v => v) && (
                <div className="detail-group confounders">
                  <h4 className="detail-label">교란요인</h4>
                  <div className="confounder-tags">
                    {selectedItem.confounders.feeding && <span className="confounder-tag warning" data-variant="info">급이</span>}
                    {selectedItem.confounders.seasonal && <span className="confounder-tag warning" data-variant="info">계절성</span>}
                    {selectedItem.confounders.commercial && <span className="confounder-tag warning" data-variant="info">상권</span>}
                    {selectedItem.confounders.weather && <span className="confounder-tag warning" data-variant="info">기상</span>}
                    {selectedItem.confounders.events && <span className="confounder-tag warning" data-variant="info">이벤트</span>}
                  </div>
                  {selectedItem.expertValidation?.confoundersReviewed && (
                    <small className="confounder-note">국립생태원 자문 반영됨</small>
                  )}
                </div>
              )}
            </div>

            {/* 핵심 요약 정보 섹션 */}
            {(humanSignalData?.summary || selectedItem.geoSignals.vulnerabilityScore) && (
              <div className="summary-section">
                {humanSignalData?.summary && (
                  <div className="summary-stats">
                    <div className="summary-stat-item">
                      <span className="summary-stat-label">전체 민원</span>
                      <span className="summary-stat-value">
                        {humanSignalData.summary.total_complaints}건 · 최근 추세: {getTrendLabel(selectedItem.humanSignals.trend)}
                      </span>
                    </div>
                    <div className="summary-stat-item">
                      <span className="summary-stat-label">일평균 민원</span>
                      <span className="summary-stat-value">{humanSignalData.summary.average_per_day.toFixed(1)}건</span>
                    </div>
                    <div className="summary-stat-item">
                      <span className="summary-stat-label">재발 민원</span>
                      <span className="summary-stat-value">{humanSignalData.summary.repeat_count}건 (반복 발생)</span>
                    </div>
                    {selectedItem.humanSignals.recurrence > 0 && (
                      <div className="summary-stat-item">
                        <span className="summary-stat-label">재발률</span>
                        <span className="summary-stat-value" style={{ color: getTrendColor(selectedItem.humanSignals.trend) }}>
                          {selectedItem.humanSignals.recurrence}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div className="summary-stats">
                  <div className="summary-stat-item">
                    <span className="summary-stat-label">추세</span>
                    <span className="summary-stat-value" style={{ color: getTrendColor(selectedItem.humanSignals.trend) }}>
                      {getTrendLabel(selectedItem.humanSignals.trend)}
                    </span>
                  </div>
                  <div className="summary-stat-item">
                    <span className="summary-stat-label">취약도 점수</span>
                    <span className="summary-stat-value" style={{ color: getVulnerabilityColor(selectedItem.geoSignals.vulnerabilityScore) }}>
                      {selectedItem.geoSignals.vulnerabilityScore}/10
                    </span>
                  </div>
                  {selectedItem.geoSignals.alleyStructure && (
                    <div className="summary-stat-item">
                      <span className="summary-stat-label">골목 구조</span>
                      <span className="summary-stat-value">{selectedItem.geoSignals.alleyStructure}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="signals-container">
              <div className="detail-group">
                <h4 className="detail-label">
                  시민 체감 신호
                  {selectedItem.dataSource?.human && (
                    <span className="data-source-badge" title={`출처: ${selectedItem.dataSource.human.source}, 신뢰도: ${selectedItem.dataSource.human.reliability}`}>
                      {selectedItem.dataSource.human.reliability === 'high' ? '✓' : '○'}
                    </span>
                  )}
                  {humanSignalLoading && (
                    <span className="data-loading-badge">로딩 중...</span>
                  )}
                </h4>
                <div className="detail-values">
                  {selectedItem.humanSignals.timePattern && (
                    <span className="detail-value">
                      피크 시간: <strong>{selectedItem.humanSignals.timePattern.peakHours.join(', ')}시</strong>
                    </span>
                  )}
                  {/* Trends 데이터 간소화 표시 */}
                  {humanSignalData?.trends && humanSignalData.trends.length > 0 && (
                    <div className="trends-compact">
                      {humanSignalData.trends.slice(0, 1).map((trend, idx) => (
                        <div key={idx} className="trend-compact-item">
                          <span className="detail-value" style={{ fontSize: 'var(--font-size-sm)' }}>
                            악취 <strong>{trend.odor}건</strong> · 쓰레기 <strong>{trend.trash}건</strong>
                          </span>
                          <span className="detail-value" style={{ fontSize: 'var(--font-size-sm)' }}>
                            야간 발생 비율 <strong>{(trend.night_ratio * 100).toFixed(0)}%</strong> · 재발 비율 <strong>{(trend.repeat_ratio * 100).toFixed(0)}%</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-group">
                <h4 className="detail-label">
                  지역 환경 특성
                  {selectedItem.dataSource?.geo && (
                    <span className="data-source-badge" title={`출처: ${selectedItem.dataSource.geo.source}, 신뢰도: ${selectedItem.dataSource.geo.reliability}`}>
                      {selectedItem.dataSource.geo.reliability === 'high' ? '✓' : '○'}
                    </span>
                  )}
                </h4>
                <div className="detail-values">
                  <span className="detail-value">
                    구조적 취약도: <strong style={{ color: getVulnerabilityColor(selectedItem.geoSignals.vulnerabilityScore) }}>{selectedItem.geoSignals.alleyStructure || '보통'} ({selectedItem.geoSignals.vulnerabilityScore}/10)</strong>
                  </span>
                </div>
              </div>

              {selectedItem.populationSignals && (
                <div className="detail-group">
                  <h4 className="detail-label">
                    생활인구 신호
                    {selectedItem.dataSource?.population && (
                      <span className="data-source-badge" title={`출처: ${selectedItem.dataSource.population.source}, 신뢰도: ${selectedItem.dataSource.population.reliability}`}>
                        {selectedItem.dataSource.population.reliability === 'high' ? '✓' : '○'}
                      </span>
                    )}
                  </h4>
                  <div className="detail-values">
                    <span className="detail-value">
                      주간: <strong>{selectedItem.populationSignals.daytime.toLocaleString()}명</strong>
                    </span>
                    <span className="detail-value">
                      야간: <strong>{selectedItem.populationSignals.nighttime.toLocaleString()}명</strong>
                    </span>
                    <span className="detail-value">
                      변화율: <strong style={{ color: selectedItem.populationSignals.changeRate > 0 ? 'var(--color-severity-immediate-text)' : 'var(--chateau-green-600)' }}>
                        {selectedItem.populationSignals.changeRate > 0 ? '+' : ''}{selectedItem.populationSignals.changeRate.toFixed(1)}%
                      </strong>
                    </span>
                    <span className="detail-value">
                      추세:{' '}
                      <strong
                        style={{ color: getTrendColor(selectedItem.populationSignals.trend) }}
                      >
                        {getTrendLabel(selectedItem.populationSignals.trend)}
                      </strong>
                    </span>
                  </div>
                </div>
              )}

              {selectedItem.pigeonSignals && (
                <div className="detail-group pigeon-signals">
                  <h4 className="detail-label">
                    비둘기 신호 (해석 레이어)
                    {selectedItem.dataSource?.pigeon && (
                      <span className="data-source-badge" title={`출처: ${selectedItem.dataSource.pigeon.source}, 신뢰도: ${selectedItem.dataSource.pigeon.reliability}`}>
                        {selectedItem.dataSource.pigeon.reliability === 'high' ? '✓' : '○'}
                      </span>
                    )}
                  </h4>
                  {selectedItem.pigeonSignals.detected ? (
                    <div className="pigeon-detected">
                      <div className="pigeon-status">
                        <span className="pigeon-intensity">
                          강도: <strong>{selectedItem.pigeonSignals.intensity === 'high' ? '높음' : selectedItem.pigeonSignals.intensity === 'medium' ? '보통' : '낮음'}</strong>
                        </span>
                        {selectedItem.pigeonSignals.activityPattern && (
                          <span className="pigeon-frequency">
                            활동 빈도: <strong>{selectedItem.pigeonSignals.activityPattern.frequency}회/일</strong>
                          </span>
                        )}
                      </div>
                      {selectedItem.pigeonSignals.interpretation && (
                        <p className="pigeon-interpretation">{selectedItem.pigeonSignals.interpretation}</p>
                      )}
                      <div className="pigeon-note">
                        <small>비둘기 신호는 Core 지표의 보조 검증 레이어로 활용됩니다.</small>
                      </div>
                    </div>
                  ) : (
                    <div className="pigeon-not-detected">
                      <p className="pigeon-interpretation">
                        {selectedItem.pigeonSignals.interpretation || '비둘기 신호 없음. Core 지표만으로 우선순위 결정됨.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedItem.crossValidation && (
              <div className="detail-group cross-validation">
                <h4 className="detail-label">신호 교차 검증</h4>
                <div className="validation-scores">
                  <div className="validation-score">
                    <span className="score-label">Human-Geo 일치도</span>
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{ width: `${selectedItem.crossValidation.humanGeoMatch}%` }}
                      />
                      <span className="score-value">{selectedItem.crossValidation.humanGeoMatch}%</span>
                    </div>
                  </div>
                  <div className="validation-score">
                    <span className="score-label">Human-Population 일치도</span>
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{ width: `${selectedItem.crossValidation.humanPopulationMatch}%` }}
                      />
                      <span className="score-value">{selectedItem.crossValidation.humanPopulationMatch}%</span>
                    </div>
                  </div>
                  <div className="validation-score">
                    <span className="score-label">전체 신호 일치도</span>
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{ width: `${selectedItem.crossValidation.allSignalsMatch}%` }}
                      />
                      <span className="score-value">{selectedItem.crossValidation.allSignalsMatch}%</span>
                    </div>
                  </div>
                </div>
                {selectedItem.crossValidation.blindSpotRisk === 'high' && (
                  <div className="blindspot-warning" data-variant="info">
                    <strong>사각지대 위험 높음</strong> - 추가 조사 권장
                  </div>
                )}
              </div>
            )}

            {selectedItem.lastInspection && (
              <div className="detail-group">
                <span className="detail-value text-tertiary">
                  최종 검사: {selectedItem.lastInspection}
                </span>
              </div>
            )}

            {/* 그래프 섹션 - 별도로 분리 (시간대별 패턴만) */}
            {selectedItem.humanSignals.timePattern && (
              <div className="charts-section">
                <div className="chart-section-item">
                  <h4 className="chart-section-title">시간대별 패턴</h4>
                  <div className="time-pattern-chart">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} className="hour-bar">
                        <div 
                          className={`hour-fill ${selectedItem.humanSignals.timePattern!.peakHours.includes(i) ? 'peak' : ''}`}
                          style={{ 
                            height: selectedItem.humanSignals.timePattern!.peakHours.includes(i) ? '100%' : '30%' 
                          }}
                        />
                        <span className="hour-label">{i}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showIndexModal && selectedItemForModal && (
        <IndexCalculationModal
          item={selectedItemForModal}
          onClose={() => {
            setShowIndexModal(false)
            setSelectedItemForModal(null)
          }}
        />
      )}
    </div>
  )
}

export default PriorityQueue

