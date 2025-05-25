import { useContext, useEffect } from 'react'
import maplibregl from 'maplibre-gl'
// подтягиваем правильные интерфейсы из geojson-пакета
import type { Feature, FeatureCollection, LineString } from 'geojson'
import { MapContext } from './MapContext'
import { listFlightRequests, FlightRequestDto } from '../api/flightRequests'

export default function TrackLayer() {
  const map = useContext(MapContext)

  useEffect(() => {
    if (!map) return

    const addTracks = async () => {
      try {
        // забираем заявки
        const reqs: FlightRequestDto[] = await listFlightRequests()

        // строим массив Feature<LineString
        const features: Feature<
          LineString,
          { id: number; status: FlightRequestDto['status'] }
        >[] = reqs.map(r => ({
          type: 'Feature',
          properties: { id: r.id, status: r.status },
          geometry: r.route as LineString,
        }))

        // упаковываем в FeatureCollection<LineString
        const geojson: FeatureCollection<
          LineString,
          { id: number; status: FlightRequestDto['status'] }
        > = {
          type: 'FeatureCollection',
          features,
        }

        const srcId = 'tracks'

        // если source уже есть — просто обновляем данные
        if (map.getSource(srcId)) {
          ;(map.getSource(srcId) as maplibregl.GeoJSONSource).setData(geojson)
        } else {
          // иначе создаём его сразу вместе со слоем
          map.addSource(srcId, {
            type: 'geojson',
            data: geojson,
          })
          map.addLayer({
            id: 'tracks-line',
            source: srcId,
            type: 'line',
            paint: {
              'line-color': '#0077ff',
              'line-width': 3,
            },
          })
        }
      } catch (err) {
        console.error('❌ TrackLayer failed:', err)
      }
    }

    // ждём, пока стиль загрузится, и только потом добавляем треки
    if (map.isStyleLoaded()) {
      addTracks()
    } else {
      map.once('load', addTracks)
    }
  }, [map])

  return null
}