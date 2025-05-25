import { Router, Request, Response } from "express";
import { wrap }           from "../utils/wrap";
import { authMiddleware } from "../middleware/auth";
import { AppDataSource }  from "../config/data-source";
import { Drone }          from "../entities/Drone";

const router = Router();

/** PUT /api/drones/:id/pos  — обновить позицию дрона */
router.put(
  "/drones/:id/pos",
  authMiddleware,
  wrap(async (req: Request, res: Response) => {
    const id = +req.params.id;
    const { lat, lon } = req.body;           // ожидаем { lat, lon }

    await AppDataSource.createQueryBuilder()
      .update(Drone)
      .set({ pos: () => `ST_SetSRID(ST_MakePoint(${lon},${lat}),4326)` })
      .where("id = :id", { id })
      .execute();

    // Push «живую» координату всем подписчикам /live
    (req.app.get("io") as any)?.of("/live").emit("pos", { id, lat, lon });

    res.sendStatus(204);
  })
);

export default router;