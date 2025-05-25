// src/hooks/useLiveDrones.ts
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import io from "socket.io-client";
import { booleanPointInPolygon } from "@turf/boolean-point-in-polygon";
import { point }                  from "@turf/helpers";

import { listAllDrones, DroneDto } from "../api/drones";

// Новая типизация для зоны
type ZoneFeature = GeoJSON.Feature<
  GeoJSON.Polygon,
  { id: number; name?: string }
>;

export function useLiveDrones(map?: maplibregl.Map) {
  const markers           = useRef<Record<number, maplibregl.Marker>>({});
  const popups            = useRef<Record<number, maplibregl.Popup>>({});
  const droneZones        = useRef<Record<number, Set<number>>>({});
  const zonesRef          = useRef<ZoneFeature[]>([]);

  useEffect(() => {
    if (!map) return;

    // 1) Подгружаем зоны единожды
    fetch("/api/zones")
      .then(r => r.json())
      .then((geojson: GeoJSON.FeatureCollection) => {
        zonesRef.current = geojson.features as ZoneFeature[];
      })
      .catch(console.error);

    // 2) Подключаемся к сокету
    const socket = io("http://localhost:5000/live", { transports: ["websocket"] });

    // 3) Подгружаем профиль дронов
    listAllDrones().then(drones => {
      const droneMap: Record<number, DroneDto> = {};
      drones.forEach(d => {
        droneMap[d.id] = d;
        droneZones.current[d.id] = new Set(); // ещё в ни одной зоне
      });

      socket.on("pos", ({ id, lat, lon }) => {
        const drone = droneMap[id];
        if (!drone) return;

        // --- маркеры + попапы (ваш уже рабочий код) ---
        if (!markers.current[id]) {
          const el = document.createElement("div");
          el.className = "drone-marker";
          // наведение — показываем инфо-попап
          el.addEventListener("mouseenter", () => {
            if (popups.current[id]) return;
            const p = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 15 })
              .setLngLat([lon, lat])
              .setHTML(`
                <b>Модель:</b> ${drone.model}<br/>
                <b>Борт №:</b> ${drone.serial_number}<br/>
                <b>Владелец:</b> ${drone.pilot?.name || "—"}
              `)
              .addTo(map);
            popups.current[id] = p;
          });
          el.addEventListener("mouseleave", () => {
            popups.current[id]?.remove();
            delete popups.current[id];
          });

          markers.current[id] = new maplibregl.Marker({ element: el })
            .setLngLat([lon, lat])
            .addTo(map);
        } else {
          markers.current[id].setLngLat([lon, lat]);
          popups.current[id]?.setLngLat([lon, lat]);
        }

        // --- проверяем «влет» в зоны ---
        const pt = point([lon, lat]);
        for (const zone of zonesRef.current) {
          const inside = booleanPointInPolygon(pt, zone);
          const wasInside = droneZones.current[id].has(zone.properties.id);

          if (inside && !wasInside) {
            // т олько что влетел
            new maplibregl.Popup({ closeButton: true, closeOnClick: true, offset: 15 })
              .setLngLat([lon, lat])
              .setHTML(`
                <b>Внимание!</b><br/>
                Дрон <i>${drone.model} (${drone.serial_number})</i><br/>
                вошёл в зону ${zone.properties.name || zone.properties.id}
              `)
              .addTo(map);
            droneZones.current[id].add(zone.properties.id);
          }
          if (!inside && wasInside) {
            // вылетел — сбрасываем флаг
            droneZones.current[id].delete(zone.properties.id);
          }
        }
      });
    });

    return () => {
      Object.values(markers.current).forEach(m => m.remove());
      Object.values(popups.current).forEach(p => p.remove());
      socket.disconnect();
    };
  }, [map]);
}
