import db from "../config/database.js";

// Return string ids, like the React app's MockAPI.
const columns = "CAST(id AS CHAR) AS id, name, poster, rating, summary, trailer";

export async function findAll() {
  const [movies] = await db.query(`SELECT ${columns} FROM movies ORDER BY id DESC`);
  return movies;
}

export async function findById(id) {
  const [movies] = await db.execute(`SELECT ${columns} FROM movies WHERE id = ?`, [id]);
  return movies[0];
}

export async function create({ name, poster, rating, summary, trailer }) {
  const [result] = await db.execute(
    "INSERT INTO movies (name, poster, rating, summary, trailer) VALUES (?, ?, ?, ?, ?)",
    [name, poster, rating, summary, trailer],
  );
  return findById(result.insertId);
}

export async function update(id, { name, poster, rating, summary, trailer }) {
  await db.execute(
    "UPDATE movies SET name = ?, poster = ?, rating = ?, summary = ?, trailer = ? WHERE id = ?",
    [name, poster, rating, summary, trailer, id],
  );
  return findById(id);
}

export async function remove(id) {
  const [result] = await db.execute("DELETE FROM movies WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
