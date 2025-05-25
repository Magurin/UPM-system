import { AppDataSource } from "./config/data-source";
import { Drone }         from "./entities/Drone";
import { Server }        from "socket.io";

type SimDrone = {
  id: number;
  lat: number;
  lon: number;
  bearing: number;
};

const STEP       = 0.0008;
const BOX        = { minLon: 71.25, maxLon: 71.63, minLat: 51.05, maxLat: 51.30 };
const MIN_SEP    = 0.05;  // минимальное расстояние между стартовыми точками

function rnd(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// Евклидово «приближённое» расстояние по градусам
function dist(a: {lat: number; lon: number}, b: {lat: number; lon: number}) {
  return Math.hypot(a.lat - b.lat, a.lon - b.lon);
}

export async function startDroneSimulation(io: Server) {
  const repo     = AppDataSource.getRepository(Drone);
  const dbDrones = await repo.find();
  if (!dbDrones.length) return console.warn("sim: no drones in DB");

  const sim: SimDrone[] = [];

  for (const d of dbDrones) {
    let lat: number, lon: number;
    // ищем свободную точку
    do {
      lat = rnd(BOX.minLat, BOX.maxLat);
      lon = rnd(BOX.minLon, BOX.maxLon);
    } while (sim.some((o) => dist(o, { lat, lon }) < MIN_SEP));

    sim.push({
      id: d.id,
      lat,
      lon,
      bearing: rnd(0, 360),
    });
  }

  console.log(`sim: ${sim.length} drones started`);

  setInterval(async () => {
    for (const d of sim) {
      d.bearing += rnd(-20, 20);
      const rad = (d.bearing * Math.PI) / 180;
      d.lon += Math.cos(rad) * STEP;
      d.lat += Math.sin(rad) * STEP;
      if (d.lon < BOX.minLon || d.lon > BOX.maxLon) d.bearing = 180 - d.bearing;
      if (d.lat < BOX.minLat || d.lat > BOX.maxLat) d.bearing = 360 - d.bearing;

      // обновляем в БД
      await repo
        .createQueryBuilder()
        .update(Drone)
        .set({ pos: () => `ST_SetSRID(ST_MakePoint(${d.lon},${d.lat}),4326)` })
        .where("id = :id", { id: d.id })
        .execute();

      // отсылаем в /live
      io.of("/live").emit("pos", { id: d.id, lat: d.lat, lon: d.lon });
    }
  }, 1000);
}