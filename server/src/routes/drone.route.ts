import { Router } from 'express';
import { wrap } from '../utils/wrap';
import { authMiddleware } from '../middleware/auth';
import { DroneController } from '../controllers/drone.controller';

const router = Router();

// 1) Rоут для **всех** дронов (карта) — до `/:id`
router.get('/all', wrap(DroneController.listAll));

// 2) “Мои дроны” — только после проверки JWT
router.get('/', authMiddleware, wrap(DroneController.list));

// 3) Получить один дрон по ID
router.get('/:id', authMiddleware, wrap(DroneController.getById));

// 4) Создать/обновить/удалить — только авторизованные
router.post('/', authMiddleware, wrap(DroneController.create));
router.put('/:id', authMiddleware, wrap(DroneController.update));
router.delete('/:id', authMiddleware, wrap(DroneController.remove));

export default router;
