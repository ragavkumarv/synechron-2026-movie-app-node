-- Run this file once using the MySQL CLI or MySQL Workbench.
CREATE DATABASE IF NOT EXISTS synechron_movies_node
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE synechron_movies_node;

CREATE TABLE IF NOT EXISTS movies (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  poster TEXT NOT NULL,
  rating DOUBLE NOT NULL,
  summary TEXT NOT NULL,
  trailer TEXT NOT NULL,
  CHECK (rating >= 0 AND rating <= 10)
);
