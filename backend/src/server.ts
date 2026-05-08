import app from "./app";
import { env } from "./config/env";
import { mongoDatabase } from "./infrastructure/database/MongoDatabase";

async function startServer() {
  await mongoDatabase.connect();

  app.listen(env.port, () => {
    console.log(`API server running on http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start API server.", error);
  process.exit(1);
});
