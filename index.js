import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const options = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
};
const database = process.env.DB_NAME || "synechron_movies_node";
const db = mysql.createPool({ ...options, database });
const app = express();
app.use(cors());
app.use(express.json());

// Match the React app's movie fields and string ids.
const columns = "CAST(id AS CHAR) AS id, name, poster, rating, summary, trailer";
async function findMovie(id) {
  const [movies] = await db.execute(`SELECT ${columns} FROM movies WHERE id = ?`, [id]);
  return movies[0];
}

function movieValues(body) {
  const { name, poster, rating, summary, trailer = "" } = body || {};
  if ([name, poster, summary].some((value) => typeof value !== "string" || !value.trim())
    || name.trim().length > 255 || typeof trailer !== "string"
    || !["number", "string"].includes(typeof rating) || String(rating).trim() === ""
    || !Number.isFinite(Number(rating)) || Number(rating) < 0 || Number(rating) > 10) {
    const error = new Error("Provide name (1-255 characters), poster, summary, and rating (0-10). Trailer is optional.");
    error.status = 400;
    throw error;
  }
  return [name.trim(), poster.trim(), Number(rating), summary.trim(), trailer.trim()];
}

app.param("id", (req, res, next, id) => {
  if (!/^[1-9]\d*$/.test(id) || Number(id) > 4294967295) {
    return res.status(400).json({ message: "Movie id must be a positive integer up to 4294967295." });
  }
  next();
});

app.get("/", (req, res) => res.send("<h1>🙋‍♂️, 🌏 🎊✨🤩 Synechron</h1>"));

// READ all movies.
app.get("/api/movies", async (req, res) => {
  const [movies] = await db.query(`SELECT ${columns} FROM movies ORDER BY id DESC`);
  res.json(movies);
});

// READ one movie.
app.get("/api/movies/:id", async (req, res) => {
  //   Match the right movieaa
  const movie = await findMovie(req.params.id);
  if (!movie) return res.status(404).json({ message: "Movie not found." });
  res.json(movie);
});

// CREATE a movie. MySQL generates its id.
app.post("/api/movies", async (req, res) => {
  const [result] = await db.execute(
    "INSERT INTO movies (name, poster, rating, summary, trailer) VALUES (?, ?, ?, ?, ?)",
    movieValues(req.body),
  );
  res.status(201).json(await findMovie(result.insertId));
});

// UPDATE a movie. Send the same fields as POST.
app.put("/api/movies/:id", async (req, res) => {
  await db.execute(
    "UPDATE movies SET name = ?, poster = ?, rating = ?, summary = ?, trailer = ? WHERE id = ?",
    [...movieValues(req.body), req.params.id],
  );
  const movie = await findMovie(req.params.id);
  if (!movie) return res.status(404).json({ message: "Movie not found." });
  res.json(movie);
});

// DELETE a movie.
app.delete("/api/movies/:id", async (req, res) => {
  const [result] = await db.execute("DELETE FROM movies WHERE id = ?", [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: "Movie not found." });
  res.status(204).end();
});

app.use((req, res) => res.status(404).json({ message: "Route not found." }));
// Express 5 forwards errors from async routes to this handler.
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
