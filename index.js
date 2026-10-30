import express from "express";
import cors from "cors";
import db from "./config/database.js";
import movieRoutes from "./routes/movie.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => res.send("<h1>🙋‍♂️, 🌏 🎊✨🤩 Synechron</h1>"));
app.use("/api/movies", movieRoutes);
app.use((req, res) => res.status(404).json({ message: "Route not found." }));

// Express 5 forwards async route errors here.
app.use((error, req, res, next) => {
  const status = error.status || 500;
  if (status === 500) console.error(error.code || error.message);
  res.status(status).json({ message: status === 500 ? "Database request failed." : error.message });
});

try {
  // Run database.sql once before starting the server.
  await db.query("SELECT id FROM movies LIMIT 1");
  const port = Number(process.env.PORT || 4000);
  const server = app.listen(port, () => console.log(`Movie API: http://localhost:${port}/api/movies`));
  server.on("error", async (error) => {
    console.error(error.code || error.message);
    await db.end();
    process.exitCode = 1;
  });
  const stop = () => server.close(() => db.end());
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
} catch (error) {
  console.error("Startup failed. Check .env and run database.sql:", error.code || error.message);
  await db.end();
  process.exitCode = 1;
}
