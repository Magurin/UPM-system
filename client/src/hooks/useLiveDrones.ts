// hooks/useLiveDrones.ts
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import io from "socket.io-client";
import { listDrones, DroneDto } from "../api/drones";

export function useLiveDrones(map: maplibregl.Map | undefined) {
  const markers = useRef<Record<number, maplibregl.Marker>>({});
  const popups = useRef<Record<number, maplibregl.Popup>>({});

  useEffect(() => {
    if (!map) return;

    let droneMap: Record<number, DroneDto> = {};
    let socket: ReturnType<typeof io> | null = null;

    // Загрузка списка дронов (один раз, чтобы знать "профиль" дрона)
    listDrones().then((drones: DroneDto[]) => {
      for (const d of drones) {
        droneMap[d.id] = d;
      }

      // Подключаемся к сокету
      socket = io("http://localhost:5000/live");

      socket.on("pos", ({ id, lat, lon }: { id: number; lat: number; lon: number }) => {
        const drone = droneMap[id];
        if (!drone) return; // если инфы о дроне нет

        // Если маркера нет — создаём
        if (!markers.current[id]) {
          // Создаем иконку
          const el = document.createElement("div");
          el.className = "drone-marker";

          // Наведение
          el.onmouseenter = () => {
            // Если уже есть попап — не показываем второй
            if (popups.current[id]) return;

            const popup = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 15,
            })
              .setLngLat([lon, lat])
              .setHTML(`
                <b>Модель:</b> ${drone.model}<br/>
                <b>Борт №:</b> ${drone.serial_number}<br/>
                <b>Владелец:</b> ${drone.pilot?.name || "—"}
              `)
              .addTo(map);

            popups.current[id] = popup;

            // Если увести мышь — убираем попап
            el.onmouseleave = () => {
              popup.remove();
              delete popups.current[id];
            };
          };

          markers.current[id] = new maplibregl.Marker({ element: el })
            .setLngLat([lon, lat])
            .addTo(map);
        } else {
          // Двигаем маркер
          markers.current[id].setLngLat([lon, lat]);
        }
      });
    });

    return () => {
      // Чистим всё
      Object.values(markers.current).forEach(m => m.remove());
      Object.values(popups.current).forEach(p => p.remove());
      socket?.disconnect();
    };
  }, [map]);
}
