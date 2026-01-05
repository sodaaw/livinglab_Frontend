import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './LocationMap.css'

interface Location {
  id: string
  location: string
  lat: number
  lng: number
  comfortIndex: number
  priority: 'high' | 'medium' | 'low'
}

interface LocationMapProps {
  locations: Location[]
  selectedLocationId?: string
  onLocationClick?: (location: Location) => void
}

const LocationMap = ({
  locations,
  selectedLocationId,
  onLocationClick
}: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Mapbox 토큰은 환경변수로 관리 (개발용으로는 공개 토큰 사용 가능)
    mapboxgl.accessToken =
      import.meta.env.VITE_MAPBOX_TOKEN ||
      'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXV4NTFmZ2YzNHF0N3J1N2s1Z3oifQ.rJcFIG214AriISLbB6B5aw'

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [126.978, 37.5665], // 서울 중심
      zoom: 11
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
  }, [])

  useEffect(() => {
    if (!map.current || locations.length === 0) return

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // 새 마커 추가
    locations.forEach((location) => {
      const getPriorityColor = (priority: string) => {
        switch (priority) {
          case 'high':
            return '#308952' // chateau-green-600
          case 'medium':
            return '#41aa69' // chateau-green-500
          case 'low':
            return '#65c388' // chateau-green-400
          default:
            return '#308952'
        }
      }

      const isSelected = location.id === selectedLocationId

      const el = document.createElement('div')
      el.className = 'custom-marker'
      el.style.width = isSelected ? '32px' : '24px'
      el.style.height = isSelected ? '32px' : '24px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = getPriorityColor(location.priority)
      el.style.border = isSelected
        ? '3px solid var(--chateau-green-700)'
        : '2px solid white'
      el.style.cursor = 'pointer'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'
      el.style.display = 'flex'
      el.style.alignItems = 'center'
      el.style.justifyContent = 'center'
      el.style.color = 'white'
      el.style.fontSize = isSelected ? '14px' : '12px'
      el.style.fontWeight = 'bold'

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.lng, location.lat])
        .addTo(map.current!)

      el.addEventListener('click', () => {
        if (onLocationClick) {
          onLocationClick(location)
        }
      })

      // 툴팁 추가
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="map-popup">
          <strong>${location.location}</strong>
          <div style="margin-top: 4px; font-size: 12px; color: #666;">
            편의성 지수: ${location.comfortIndex}
          </div>
        </div>
      `)

      marker.setPopup(popup)

      markersRef.current.push(marker)
    })

    // 모든 마커가 보이도록 지도 범위 조정
    if (locations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      locations.forEach((location) => {
        bounds.extend([location.lng, location.lat])
      })
      map.current.fitBounds(bounds, {
        padding: 100,
        maxZoom: 14
      })
    }
  }, [locations, selectedLocationId, onLocationClick])

  return (
    <div className="location-map-container">
      <div ref={mapContainer} className="location-map" />
    </div>
  )
}

export default LocationMap



