import api from './auth';         

export interface DroneInput {
  brand: string;
  model: string;
  serial_number: string;
}

export interface DroneDto {
  id:            number;
  brand:         string;
  model:         string;
  serial_number: string;
  is_active:     boolean;
  pilot: {
    id:   number;
    name: string;
  };
}

/** GET /api/drones */
export const listDrones = () =>
  api.get('/drones').then(r => r.data);

/** POST /api/drones */
export const createDrone = (data: DroneInput) =>
  api.post('/drones', data).then(r => r.data);

/** DELETE /api/drones/:id */
export const deleteDrone = (id: number) =>
  api.delete(`/drones/${id}`).then(r => r.data);