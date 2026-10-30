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

-- Preserve existing movies if you run this file again.
INSERT INTO movies (id, name, poster, rating, summary, trailer) VALUES
(99, 'Vikram', 'https://upload.wikimedia.org/wikipedia/en/9/93/Vikram_2022_poster.jpg', 8.4, 'Members of a black ops team must track and eliminate a gang of masked murderers.', 'https://www.youtube.com/embed/OKBMCL-frPU'),
(100, 'RRR', 'https://upload.wikimedia.org/wikipedia/en/d/d7/RRR_Poster.jpg', 8.8, 'RRR is an upcoming Indian Telugu-language period action drama film directed by S. S. Rajamouli, and produced by D. V. V. Danayya of DVV Entertainments.', 'https://www.youtube.com/embed/f_vbAtFSEc0'),
(101, 'Iron man 2', 'https://m.media-amazon.com/images/M/MV5BMTM0MDgwNjMyMl5BMl5BanBnXkFtZTcwNTg3NzAzMw@@._V1_FMjpg_UX1000_.jpg', 7, 'With the world now aware that he is Iron Man, billionaire inventor Tony Stark (Robert Downey Jr.) faces pressure from all sides to share his technology with the military. He is reluctant to divulge the secrets of his armored suit, fearing the information will fall into the wrong hands. With Pepper Potts (Gwyneth Paltrow) and Rhodes (Don Cheadle) by his side, Tony must forge new alliances and confront a powerful new enemy.', 'https://www.youtube.com/embed/wKtcmiifycU'),
(102, 'No Country for Old Men', 'https://upload.wikimedia.org/wikipedia/en/8/8b/No_Country_for_Old_Men_poster.jpg', 8.1, 'A hunter''s life takes a drastic turn when he discovers two million dollars while strolling through the aftermath of a drug deal. He is then pursued by a psychopathic killer who wants the money.', 'https://www.youtube.com/embed/38A__WT3-o0'),
(103, 'Jai Bhim', 'https://m.media-amazon.com/images/M/MV5BY2Y5ZWMwZDgtZDQxYy00Mjk0LThhY2YtMmU1MTRmMjVhMjRiXkEyXkFqcGdeQXVyMTI1NDEyNTM5._V1_FMjpg_UX1000_.jpg', 8.8, 'A tribal woman and a righteous lawyer battle in court to unravel the mystery around the disappearance of her husband, who was picked up the police on a false case', 'https://www.youtube.com/embed/nnXpbTFrqXA'),
(104, 'The Avengers', 'https://terrigen-cdn-dev.marvel.com/content/prod/1x/avengersendgame_lob_crd_05.jpg', 8, 'Marvel''s The Avengers (classified under the name Marvel Avengers
 Assemble in the United Kingdom and Ireland), or simply The Avengers, is
 a 2012 American superhero film based on the Marvel Comics superhero team
 of the same name.', 'https://www.youtube.com/embed/eOrNdBpGMv8'),
(105, 'Interstellar', 'https://m.media-amazon.com/images/I/A1JVqNMI7UL._SL1500_.jpg', 8.6, 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA
 pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team
 of researchers, to find a new planet for humans.', 'https://www.youtube.com/embed/zSWdZVtXT7E'),
(106, 'Baahubali', 'https://flxt.tmsimg.com/assets/p11546593_p_v10_af.jpg', 8, 'In the kingdom of Mahishmati, Shivudu falls in love with a young warrior woman. While trying to woo her, he learns about the conflict-ridden past of his family and his true legacy.', 'https://www.youtube.com/embed/sOEg_YZQsTI'),
(107, 'Ratatouille', 'https://resizing.flixster.com/gL_JpWcD7sNHNYSwI1ff069Yyug=/ems.ZW1zLXByZC1hc3NldHMvbW92aWVzLzc4ZmJhZjZiLTEzNWMtNDIwOC1hYzU1LTgwZjE3ZjQzNTdiNy5qcGc=', 8, 'Remy, a rat, aspires to become a renowned French chef. However, he fails to realise that people despise rodents and will never enjoy a meal cooked by him.', 'https://www.youtube.com/embed/NgsQ8mVkN8w'),
(108, 'PS2', 'https://m.media-amazon.com/images/M/MV5BNjUxYzY3ZmEtY2FkYi00MTE5LTkyNzUtOWY5YTM1MDdiMzIyXkEyXkFqcGc@._V1_.jpg', 8, 'Ponniyin Selvan: I is an upcoming Indian Tamil-language epic period action film directed by Mani Ratnam, who co-wrote it with Elango Kumaravel and B. Jeyamohan', 'https://www.youtube.com/embed/KsH2LA8pCjo'),
(109, 'Thor: Ragnarok', 'https://m.media-amazon.com/images/M/MV5BMjMyNDkzMzI1OF5BMl5BanBnXkFtZTgwODcxODg5MjI@._V1_.jpg', 8.8, 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA\\n pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team\\n of researchers, to find a new planet for humans.', 'https://youtu.be/NgsQ8mVkN8w')
ON DUPLICATE KEY UPDATE id = movies.id;
