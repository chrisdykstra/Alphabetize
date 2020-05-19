
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('DataBank.db');

function createTable() {

    db.all("SELECT name FROM sqlite_master WHERE type='table'", (error, tables) => {

        if (error) {
            console.log(error);
        }

        console.log(tables);
        if (tables.length > 0) { return; }

        let query = 'CREATE TABLE movies (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, director TEXT, favorite BOOLEAN, runtime INTEGER, rating TEXT, ranking INTEGER, range INTEGER)';

        db.run(query, (error) => {
            if (error) {
                console.log(error);
            }
        });
    });
}

function insertNewMovieIntoDatabase(movie) {

    let query = "INSERT INTO movies (title, director, favorite, runtime, rating, ranking, range) VALUES ('" +
        movie.title + "','" +
        movie.director + "','" +
        movie.favorite + "','" +
        movie.runtime + "','" +
        movie.rating + "','" +
        movie.ranking + "','" +
        movie.range + "')";

    db.run(query, (error) => {

        if (error) {
            console.log(error);
        } else {
            getMoviesFromDatabase();
        }
    });
}

function getMoviesFromDatabase() {

    db.all("SELECT * FROM movies", (error, rows) => {

        if (error) {
            console.log(error);
        } else {
            console.log(rows);
        }
    });
}

function deleteRowFromDatabase(title) {

    db.run("DELETE FROM movies WHERE title = '" + title + "'", function (error) {

        if (error) {
            console.log(error);
        } else {
            getMoviesFromDatabase();
        }
    })
}

function createTableFromDatabase() {

    db.all("SELECT * FROM movies", (error, movies) => {

        if (error) {
            console.log(error);
        } else {
            createTableOfMovies(movies);
        }
    });
}
