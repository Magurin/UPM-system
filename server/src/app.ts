import express from 'express';
import cors from 'cors';

import authRouter          from './routes/auth.route';
import pilotRouter         from './routes/pilot.route';
import droneRouter         from './routes/drone.route';
import zoneRouter          from './routes/zone.route';
import flightRequestRouter from './routes/flight-request.route';
import posRouter from "./routes/pos.route";
import { errorHandler }    from './middleware/error-handler';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173', 
    credentials: true,               
  })
);

app.use(express.json());


app.use('/api/auth',            authRouter);
app.use('/api/pilots',          pilotRouter);
app.use('/api/drones',          droneRouter);
app.use('/api/zones',           zoneRouter);
app.use('/api/flight-requests', flightRequestRouter);
app.use("/api", posRouter);

app.use(errorHandler);

export default app;
