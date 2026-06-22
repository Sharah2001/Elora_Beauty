import { promises as fs } from "node:fs";
import path from "node:path";

export type Database = Record<string, any>;

const databasePath = path.join(process.cwd(), "db-store.json");
let writeQueue = Promise.resolve();

export async function readDatabase(): Promise<Database> {
  const contents = await fs.readFile(databasePath, "utf8");
  return JSON.parse(contents) as Database;
}

export async function writeDatabase(database: Database): Promise<void> {
  await fs.writeFile(databasePath, JSON.stringify(database, null, 2), "utf8");
}

export async function mutateDatabase<T>(
  mutation: (database: Database) => T | Promise<T>,
): Promise<T> {
  let result!: T;

  const operation = writeQueue.then(async () => {
    const database = await readDatabase();
    result = await mutation(database);
    await writeDatabase(database);
  });

  writeQueue = operation.catch(() => undefined);
  await operation;
  return result;
}
