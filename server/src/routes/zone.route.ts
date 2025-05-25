import { Router } from "express";
import { AppDataSource } from "../config/data-source";
import { Zone } from "../entities/Zone";

const router = Router();

router.get("/", async (_, res) => {
  const zones = await AppDataSource
    .getRepository(Zone)
    .createQueryBuilder("z")
    .select([
      "z.id   AS id",
      "z.name AS name",
      "ST_AsGeoJSON(z.geom)::json AS geom"
    ])
    .getRawMany();

  res.json({
    type: "FeatureCollection",
    features: zones.map(z => ({
      type: "Feature",
      properties: { id: z.id, name: z.name },
      geometry:   z.geom
    }))
  });
});

export default router;
