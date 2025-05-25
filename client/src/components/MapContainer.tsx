import React, { useRef, useState, useEffect } from "react";
import maplibregl from "maplibre-gl";
import { MapContext } from "./MapContext";
import { MapBarRight } from "./MapBarRight";
import ZonesLayer from "./ZonesLayer";
import TrackLayer from "./TrackLayer";
import LiveDronesLayer from "./LiveDronesLayer";
import CoordinatesControl from "./CoordinatesControl";
import "../index.css";

interface MapContainerProps {
  children?: React.ReactNode;
}

export function MapContainer({ children }: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const mapInstance = new maplibregl.Map({
      container: containerRef.current,
      style:
        "https://api.maptiler.com/maps/basic-v2/style.json?key=13uJDYePQAdds9bDUBti",
      center: [71.45, 51.16],
      zoom: 10,
    });

    setMap(mapInstance);
    mapInstance.addControl(new maplibregl.NavigationControl(), "top-left");

    return () => {
      mapInstance.remove();
    };
  }, []);

  return (
    <div className="map-wrapper">
      <div ref={containerRef} className="map-container" />
     <MapContext.Provider value={map}>
        <MapBarRight />
        <ZonesLayer />
        <TrackLayer />
        <LiveDronesLayer />     
        <CoordinatesControl />
      </MapContext.Provider>
    </div>
  );
}
