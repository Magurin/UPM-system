import { useContext, useEffect } from "react";
import maplibregl from "maplibre-gl";
import { MapContext } from "./MapContext";

export default function ZonesLayer() {
  const map = useContext(MapContext);

  useEffect(() => {
    if (!map) return;
    const src = "zones";

    const mount = async () => {
      const data = await fetch("/api/zones").then((r) => r.json());
      if (map.getSource(src)) {
        (map.getSource(src) as maplibregl.GeoJSONSource).setData(data);
      } else {
        map.addSource(src, { type: "geojson", data });
        map.addLayer({
          id: "zones-fill",
          source: src,
          type: "fill",
          paint: { "fill-color": "#e60000", "fill-opacity": 0.25 },
        });
        map.addLayer({
          id: "zones-line",
          source: src,
          type: "line",
          paint: { "line-color": "#e60000", "line-width": 2 },
        });
      }
    };

    // на initial load
    map.isStyleLoaded() ? mount() : map.once("load", mount);
    // и после каждой смены стиля
    map.on("styledata", mount);

    return () => {
      map.off("styledata", mount);
    };
  }, [map]);

  return null;
}
