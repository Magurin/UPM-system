import { createContext } from "react";
import type { Map } from "maplibre-gl";

export const MapContext = createContext<Map | null>(null);
