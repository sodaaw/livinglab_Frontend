import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './RegionalTrendMap.css'

interface RegionalTrend {
  district: string
  lat: number
  lng: number
  trend: 'improving' | 'stable' | 'monitoring'
  index: number
}

interface RegionalTrendMapProps {
  trends: RegionalTrend[]
}

const RegionalTrendMap = ({ trends }: RegionalTrendMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    mapboxgl.accessToken =
      import.meta.env.VITE_MAPBOX_TOKEN ||
      'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXV4NTFmZ2YzNHF0N3J1N2s1Z3oifQ.rJcFIG214AriISLbB6B5aw'

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [126.978, 37.5665], // 서울 중심
      zoom: 10.5
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
  }, [])

  useEffect(() => {
    if (!map.current || trends.length === 0) return

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // 지역별 트렌드 마커 추가 (모호한 원형 영역으로 표시)
    trends.forEach((trend) => {
      const getTrendColor = (trend: string) => {
        switch (trend) {
          case 'improving':
            return 'var(--chateau-green-400)'
          case 'stable':
            return 'var(--chateau-green-300)'
          case 'monitoring':
            return 'var(--chateau-green-200)'
          default:
            return 'var(--chateau-green-300)'
        }
      }

      const getTrendLabel = (trend: string) => {
        switch (trend) {
          case 'improving':
            return '개선 중'
          case 'stable':
            return '안정적'
          case 'monitoring':
            return '모니터링 중'
          default:
            return '안정적'
        }
      }

      // 큰 반투명 원형 마커 (정확한 위치가 아닌 영역 표시)
      const el = document.createElement('div')
      el.className = 'regional-marker'
      el.style.width = '60px'
      el.style.height = '60px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = getTrendColor(trend.trend)
      el.style.opacity = '0.4'
      el.style.border = `2px solid ${getTrendColor(trend.trend)}`
      el.style.cursor = 'default'
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'

      const marker = new mapboxgl.Marker(el)
        .setLngLat([trend.lng, trend.lat])
        .addTo(map.current!)

      // 툴팁 (구 단위 정보만 표시)
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="map-popup">
          <strong>${trend.district}</strong>
          <div style="margin-top: 8px; font-size: 12px; color: var(--text-secondary);">
            상태: ${getTrendLabel(trend.trend)}
          </div>
          <div style="margin-top: 4px; font-size: 12px; color: var(--text-secondary);">
            편의성 지수: ${trend.index}
          </div>
        </div>
      `)

      marker.setPopup(popup)
      markersRef.current.push(marker)
    })

    // 모든 마커가 보이도록 지도 범위 조정
    if (trends.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      trends.forEach((trend) => {
        bounds.extend([trend.lng, trend.lat])
      })
      map.current.fitBounds(bounds, {
        padding: 100,
        maxZoom: 11
      })
    }
  }, [trends])

  return (
    <div className="regional-trend-map-container">
      <div ref={mapContainer} className="regional-trend-map" />
      <div className="map-legend">
        <div className="legend-title">지역별 상태</div>
        <div className="legend-items">
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: 'var(--chateau-green-400)' }}
            />
            <span>개선 중</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: 'var(--chateau-green-300)' }}
            />
            <span>안정적</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: 'var(--chateau-green-200)' }}
            />
            <span>모니터링 중</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegionalTrendMap



