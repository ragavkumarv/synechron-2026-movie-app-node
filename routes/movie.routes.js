import { Router } from "express";
import { getMovies, getMovie, addMovie, editMovie, deleteMovie } from "../controllers/movie.controller.js";

const router = Router();

// Only basic checks: required text, rating 0-10, and a positive integer id.
function validateMovie(req, res, next) {
  const { name, poster, rating, summary, trailer = "" } = req.body || {};
  const missingText = [name, poster, summary].some((value) => typeof value !== "string" || !value.trim());
  const score = Number(rating); // React form fields send strings.
  if (missingText || name.trim().length > 255 || typeof trailer !== "string"
    || !["number", "string"].includes(typeof rating) || String(rating).trim() === ""
    || !Number.isFinite(score) || score < 0 || score > 10) {
    return res.status(400).json({ message: "Provide name (1-255 characters), poster, summary, and rating (0-10). Trailer is optional." });
  }
  req.body = { name: name.trim(), poster: poster.trim(), rating: score, summary: summary.trim(), trailer: trailer.trim() };
  next();
}

router.param("id", (req, res, next, id) => {
  if (!/^[1-9]\d*$/.test(id) || Number(id) > 4294967295) {
    return res.status(400).json({ message: "Movie id must be a positive integer up to 4294967295." });
  }
  next();
});

router.get("/", getMovies);
router.get("/:id", getMovie);
router.post("/", validateMovie, addMovie);
router.put("/:id", validateMovie, editMovie);
router.delete("/:id", deleteMovie);

export default router;
