const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "moviesData.db");
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (error) {
    console.log("DB Error: ${error.message}");
    process.exit(1);
  }
};

initializeDBAndServer();

//API-1 (Returns a list of all movie names in the movie table)

app.get("/movies", async (request, response) => {
  const getMoviesQuery = `
    SELECT * FROM movie 
    ORDER BY movie_id;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//API-2 (Creates a new movie in the movie table.)
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
  INSERT INTO 
  movie(director_id,movie_name,lead_actor)
  VALUES(
    '${directorId}',
    '${movieName}',
    '${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastId;
  response.send("Movie Successfully Added");
});

//API-3 (Returns a movie based on the movie ID)

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
  SELECT * FROM movie WHERE movie_id=${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send({
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  });
});

//API-4(Updates the details of a movie in the movie table based on the movie ID)

app.put("/movies/:movieId/", async (request, response) => {
  const movieDetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieDetails = `
  UPDATE movie 
  SET 
    director_id='${directorId}',
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE 
        movie_id=${movieId};`;
  await db.run(updateMovieDetails);
  response.send("Movie Details Updated");
});

//API-5 DELETE (Deletes a movie from the movie table based on the movie ID)

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieDetails = `
  DELETE FROM movie
  WHERE movie_id=${movieId};`;
  await db.get(deleteMovieDetails);
  response.send("Movie Removed");
});

//API-6 (Returns a list of all directors in the director table)

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM director 
    ORDER BY director_id;`;
  const directorArray = await db.all(getDirectorsQuery);
  response.send(
    directorArray.map((eachDirector) => ({
      directorId: eachDirector.director_id,
      directorName: eachDirector.director_name,
    }))
  );
});

//API-7 (Returns a list of all movie names directed by a specific director)

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId, movieId } = request.params;
  const getDirectorAndMovie = `
  SELECT * FROM  movie 
  WHERE director_id=${directorId};
  `;
  const directorsList = await db.all(getDirectorAndMovie);
  response.send(
    directorsList.map((eachDirector) => ({
      movieName: eachDirector.movie_name,
    }))
  );
});

module.exports = app;
