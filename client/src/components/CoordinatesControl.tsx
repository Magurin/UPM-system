import { useContext, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import { MapContext } from "./MapContext";

export default function CoordinatesControl() {
  const map = useContext(MapContext);
  const [coord, setCoord] = useState({ lng: 0, lat: 0 });

  useEffect(() => {
    if (!map) return;

    const update = () => {
      const c = map.getCenter();
      setCoord({ lng: c.lng, lat: c.lat });
    };

    // аналогично ждём стиль, а после вешаем слушатель
    if (map.isStyleLoaded()) {
      map.on("move", update);
    } else {
      map.once("load", () => map.on("move", update));
    }

    return () => {
      map.off("move", update);
    };
  }, [map]);

  return (
    <div className="coordinates-overlay">
      {coord.lat.toFixed(5)}, {coord.lng.toFixed(5)}
    </div>
  );
}
