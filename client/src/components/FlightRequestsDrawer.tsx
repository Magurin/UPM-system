import { useEffect, useState, FormEvent } from "react";
import { Drawer } from "./Drawer";
import {
  listFlightRequests,
  createFlightRequest,
  deleteFlightRequest,
  FlightRequestDto,
  FlightRequestInput,
} from "../api/flightRequests";
import { listDrones } from "../api/drones";

interface Drone {
  id: number;
  brand: string;
  model: string;
}

export function FlightRequestsDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  /* ─────── state ─────────────────────────────────────────── */
  const [requests, setRequests] = useState<FlightRequestDto[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  /* поля формы */
  const [droneId, setDroneId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [takeoffTime, setTakeoffTime] = useState("");
  const [landingTime, setLandingTime] = useState("");
  const [geomType, setGeomType] =
    useState<"circle" | "polygon" | "line" | "kml">("line");
  const [routeJson, setRouteJson] = useState("");
  const [maxAlt, setMaxAlt] = useState("");
  const [minAlt, setMinAlt] = useState("0");
  const [uavType, setUavType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [vlos, setVlos] = useState(true);

  /* ─────── загрузка ───────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    setIsAdding(false);
    Promise.all([listFlightRequests(), listDrones()])
      .then(([reqs, drs]) => {
        setRequests(reqs);
        setDrones(drs);
      })
      .catch(() => {
        setRequests([]);
        setDrones([]);
      });
  }, [isOpen]);

  /* если пользователь сразу жмёт "Создать", а дроны ещё не пришли */
  const ensureDronesLoaded = async () => {
    if (drones.length) return;
    try {
      const fresh = await listDrones();
      setDrones(fresh);
    } catch {/* ignore */}
  };

  /* ─────── «нарисовать маршрут» – заглушка ───────────────── */
  const openDrawTool = () => {
    const demo: GeoJSON.LineString = {
      type: "LineString",
      coordinates: [
        [71.45, 51.16],
        [71.5, 51.17],
      ],
    };
    setRouteJson(JSON.stringify(demo));
    setGeomType("line");
    alert(
      "Маршрут сгенерирован демо-данными.\nПозже заменим на рисование на карте."
    );
  };

  /* ─────── создание заявки ───────────────────────────────── */
  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();

    if (
      droneId === "" ||
      !name ||
      !startDate ||
      !endDate ||
      !takeoffTime ||
      !landingTime ||
      !routeJson ||
      !maxAlt ||
      !uavType
    )
      return;

    let route: GeoJSON.GeoJSON;
    try {
      route = JSON.parse(routeJson);
    } catch {
      return alert("Route должен быть валидным GeoJSON");
    }

    const data: FlightRequestInput = {
      droneId: +droneId,
      name,
      startDate,
      endDate,
      takeoffTime,
      landingTime,
      geomType,
      route,
      maxAltitude: Number(maxAlt),
      minAltitude: Number(minAlt) || 0,
      uavType,
      purpose,
      vlos,
    };

    try {
      await createFlightRequest(data);
      setRequests(await listFlightRequests());
      setIsAdding(false);
      /* очистка */
      setDroneId("");
      setName("");
      setStartDate("");
      setEndDate("");
      setTakeoffTime("");
      setLandingTime("");
      setGeomType("line");
      setRouteJson("");
      setMaxAlt("");
      setMinAlt("0");
      setUavType("");
      setPurpose("");
      setVlos(true);
    } catch (err: any) {
      alert(err.response?.data?.error ?? "Ошибка создания заявки");
    }
  };

  /* ─────── удаление ───────────────────────────────────────── */
  const handleDelete = async (id: number) => {
    if (!confirm("Удалить заявку?")) return;
    try {
      await deleteFlightRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Не получилось удалить заявку");
    }
  };

  /* ─────── рендер ─────────────────────────────────────────── */
  return (
    <Drawer title="Заявки на полёт" isOpen={isOpen} onClose={onClose}>
      {/* ===== список ===== */}
      {!isAdding && (
        <>
          {requests.length ? (
            <ul className="space-y-1">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <div className="leading-tight">
                    <p className="text-sm font-medium">
                      {r.name || "Без названия"} – {r.drone.brand}{" "}
                      {r.drone.model}
                    </p>
                    <p className="text-xs text-gray-600">
                      {r.startDate} → {r.endDate} • {r.status}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600"
                    title="Удалить"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Заявок пока нет.</p>
          )}

          <button
            onClick={async () => {
              await ensureDronesLoaded();
              setIsAdding(true);
            }}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-1 text-sm rounded"
          >
            Создать заявку
          </button>
        </>
      )}

      {/* ===== форма ===== */}
      {isAdding && (
        <form onSubmit={handleAdd} className="space-y-3">
          <h3 className="font-medium text-lg">Новая заявка</h3>

          {/* Название плана */}
          <input
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название плана"
            required
          />

          {/* Дрон */}
          <select
            className="w-full border p-2 rounded"
            value={droneId}
            onChange={(e) =>
              setDroneId(e.target.value === "" ? "" : +e.target.value)
            }
            required
          >
            <option value="">Выберите дрон</option>
            {drones.map((d) => (
              <option key={d.id} value={d.id}>
                {d.brand} {d.model}
              </option>
            ))}
          </select>

          {/* Даты и время */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              className="border p-2 rounded"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <input
              type="time"
              className="border p-2 rounded"
              value={takeoffTime}
              onChange={(e) => setTakeoffTime(e.target.value)}
              required
            />

            <input
              type="date"
              className="border p-2 rounded"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
            <input
              type="time"
              className="border p-2 rounded"
              value={landingTime}
              onChange={(e) => setLandingTime(e.target.value)}
              required
            />
          </div>

          {/* Тип геометрии – кнопки-иконки */}
          <div className="flex items-center gap-3 text-sm mt-2">
            <span>Тип маршрута:</span>
            {(["circle", "polygon", "line", "kml"] as const).map((t) => (
              <button
                type="button"
                key={t}
                aria-label={t}
                onClick={() => setGeomType(t)}
                className={`w-9 h-9 rounded flex items-center justify-center border
                  ${
                    geomType === t
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                {t === "circle" && (
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <circle cx="12" cy="12" r="8" />
                  </svg>
                )}
                {t === "polygon" && (
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <polygon points="5,5 19,5 17,19 7,19" />
                  </svg>
                )}
                {t === "line" && (
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <line
                      x1="4"
                      y1="20"
                      x2="20"
                      y2="4"
                      strokeWidth="2"
                      stroke="currentColor"
                    />
                  </svg>
                )}
                {t === "kml" && (
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <rect x="6" y="4" width="12" height="16" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Рисование маршрута */}
          <div className="flex gap-2 items-start">
            <textarea
              className="flex-1 border p-2 rounded h-20 text-xs font-mono resize-y"
              value={routeJson}
              onChange={(e) => setRouteJson(e.target.value)}
              placeholder="GeoJSON маршрута"
              required
            />
            <button
              type="button"
              onClick={openDrawTool}
              className="h-20 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
            >
              Нарисовать
            </button>
          </div>

          {/* Высоты */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={0}
              className="border p-2 rounded"
              placeholder="Максимум высоты (м)"
              value={maxAlt}
              onChange={(e) => setMaxAlt(e.target.value)}
              required
            />
            <input
              type="number"
              min={0}
              className="border p-2 rounded"
              placeholder="Минимум высоты (м)"
              value={minAlt}
              onChange={(e) => setMinAlt(e.target.value)}
            />
          </div>

          {/* БВС / цель */}
          <input
            className="w-full border p-2 rounded"
            placeholder="БВС (тип/класс)"
            value={uavType}
            onChange={(e) => setUavType(e.target.value)}
            required
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Цель полёта"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />

          {/* Прямая видимость */}
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={vlos}
              onChange={(e) => setVlos(e.target.checked)}
            />
            <span className="text-sm">В пределах прямой видимости</span>
          </label>

          {/* Кнопки */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 text-sm rounded"
            >
              Создать
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 py-1 text-sm rounded"
            >
              Отмена
            </button>
          </div>
        </form>
      )}
    </Drawer>
  );
}
