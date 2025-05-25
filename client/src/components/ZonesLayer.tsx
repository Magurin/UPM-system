// src/components/ZonesLayer.tsx
import { useContext, useEffect } from "react";
import maplibregl from "maplibre-gl";
import { MapContext }    from "./MapContext";
import type { FeatureCollection } from "geojson";

export default function ZonesLayer() {
  const map = useContext(MapContext);

  useEffect(() => {
    if (!map) return;
    const srcId       = "zones";
    const fillLayerId = "zones-fill";
    const lineLayerId = "zones-line";

    const mount = async () => {
      // 1) Забираем GeoJSON из БД
      const data = (await fetch("/api/zones").then(r => r.json())) as FeatureCollection;

      // 2) Если источник уже есть — обновляем
      if (map.getSource(srcId)) {
        (map.getSource(srcId) as maplibregl.GeoJSONSource).setData(data);
      } else {
        // иначе создаём source + 2 layer’а
        map.addSource(srcId, { type: "geojson", data });
        map.addLayer({
          id: fillLayerId,
          source: srcId,
          type: "fill",
          paint: { "fill-color": "#e60000", "fill-opacity": 0.25 },
        });
        map.addLayer({
          id: lineLayerId,
          source: srcId,
          type: "line",
          paint: { "line-color": "#e60000", "line-width": 2 },
        });
      }
    };

    // Ждём, пока стиль загрузится
    if (map.isStyleLoaded()) {
      mount();
    } else {
      map.once("load", mount);
    }

    // При смене стиля надо заново отрисовать
    map.on("styledata", mount);
    return () => { map.off("styledata", mount); };
  }, [map]);

  return null;
}
