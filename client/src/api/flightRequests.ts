import api from "./auth";

/* ===== payload при создании ===== */
export interface FlightRequestInput {
  droneId:     number;

  name:        string;
  startDate:   string;          // YYYY-MM-DD
  endDate:     string;          // YYYY-MM-DD
  takeoffTime: string;          // HH:mm
  landingTime: string;          // HH:mm

  geomType:    "corridor" | "circle" | "polygon";
  route:       GeoJSON.GeoJSON; // LineString / Polygon / etc.

  maxAltitude: number;
  minAltitude?: number;

  uavType:     string;
  purpose?:    string;
  vlos:        boolean;         // прямая видимость
}

/* ===== объект, который возвращает бэкенд ===== */
export interface FlightRequestDto {
  id: number;

  name:        string;
  startDate:   string;
  endDate:     string;
  takeoffTime: string;
  landingTime: string;

  geomType:    string;
  route:       GeoJSON.GeoJSON;

  maxAltitude: number;
  minAltitude: number;
  uavType:     string;
  purpose?:    string;
  vlos:        boolean;

  status: "pending" | "approved" | "rejected";
  createdAt: string;

  drone: {
    id:    number;
    brand: string;
    model: string;
  };
}

/* ===== HTTP-helpers ===== */
export const listFlightRequests = () =>
  api.get<FlightRequestDto[]>("/flight-requests").then((r) => r.data);

export const createFlightRequest = (data: FlightRequestInput) =>
  api.post<FlightRequestDto>("/flight-requests", data).then((r) => r.data);

export const deleteFlightRequest = (id: number) =>
  api.delete(`/flight-requests/${id}`);