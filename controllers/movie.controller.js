import * as Movie from "../models/movie.model.js";

export async function getMovies(req, res) {
  res.json(await Movie.findAll());
}

export async function getMovie(req, res) {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).json({ message: "Movie not found." });
  res.json(movie);
}

export async function addMovie(req, res) {
  const movie = await Movie.create(req.body);
  res.status(201).json(movie);
}

export async function editMovie(req, res) {
  const movie = await Movie.update(req.params.id, req.body);
  if (!movie) return res.status(404).json({ message: "Movie not found." });
  res.json(movie);
}

export async function deleteMovie(req, res) {
  const deleted = await Movie.remove(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Movie not found." });
  res.status(204).end();
}
