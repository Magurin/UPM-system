import { Client } from "pg";
import { Server as IO } from "socket.io";

export async function attachPgListener(io: IO) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query("LISTEN zone_alert");

  client.on("notification", (msg) => {
    if (msg.channel !== "zone_alert") return;
    io.of("/live").emit("alert", JSON.parse(msg.payload!));
  });

  console.log("LISTEN zone_alert → /live/alert подключен");
}