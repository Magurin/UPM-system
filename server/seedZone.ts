// scripts/seedZone.ts
import { AppDataSource } from "./src/config/data-source";
import { Zone }          from "./src/entities/Zone";

async function seed() {
  const dataSource = await AppDataSource.initialize();
  const repo = dataSource.getRepository(Zone);

  await repo
    .createQueryBuilder()
    .insert()
    .into(Zone)
    .values({
      name: "Astana 10km circle",
      // здесь geom — raw SQL-выражение, TypeORM обернёт его в нужный INSERT
      geom: () => `
        ST_Buffer(
          ST_SetSRID(ST_MakePoint(71.45, 51.16), 4326)::geography,
          10000
        )::geometry
      `,
    })
    .execute();

  console.log("✔️ Зона добавлена через QueryBuilder");
  await dataSource.destroy();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
