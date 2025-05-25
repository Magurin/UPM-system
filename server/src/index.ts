import "dotenv/config";
import http                   from "http";
import { Server as IO }       from "socket.io";
import app                    from "./app";
import { AppDataSource }      from "./config/data-source";
import { attachPgListener }   from "./pgNotify";
import { startDroneSimulation } from "./droneGenerator"; 
(async () => {
  // Инициализируем БД
  await AppDataSource.initialize();
  console.log("DB initialized");

  // HTTP + WebSocket
  const server = http.createServer(app);
  const io = new IO(server, { cors: { origin: "*" } });
  app.set("io", io);  

  io.on("connection", (socket) =>
    console.log("WS connected:", socket.id)
  );

  // Слушаем NOTIFY из Postgres
  await attachPgListener(io);

  // Запускаем симуляцию живых дронов
  startDroneSimulation(io);

  // Поднимаем сервер
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () =>
    console.log(`Listening on http://localhost:${PORT}`)
  );
})();
