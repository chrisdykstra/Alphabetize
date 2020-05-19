
const fs = require('fs');
const path = require('path');
const request = require('request');

// ---------------------------------------------------------------------------------

const absolutePathToRootFolderOfProject = require('electron').remote.app.getAppPath();
const dataFileName = 'data.json';
const absolutePathToDataFile = path.join(absolutePathToRootFolderOfProject, 'data', dataFileName);

// ---------------------------------------------------------------------------------

let title;
let list;
let errorMessageElement;
let tableElement;
let titleHasValidLength;
let isTitleDuplicate;

// Step 0 *****
let columns = [
    'Delete',
    'Title',
    'Director',
    'Favorite',
    'Run Time',
    'Rating',
    '1 - 5 Rank',
    'Range'
];

// Step 1 *****
let director;
let favorite;
let runtime;
let rating;
let ranking;
let range;

// ---------------------------------------------------------------------------------

function saveTitle() {

    clearSuggestionsList();
    retrieveTitle();
    retrieveCustomElements();
    retrieveCustomValues();
    evaluateTitleLength();
    readTitlesFile();
}

// ---------------------------------------------------------------------------------

function retrieveTitle() {

    let titleElement = document.getElementById('title');
    title = titleElement.value;
}

// ---------------------------------------------------------------------------------

function retrieveCustomElements() {
    errorMessageElement = document.getElementById('error-message');
}

// ---------------------------------------------------------------------------------

function retrieveCustomValues() {

    // Step 2 *****

    let directorElement = document.getElementById('director');
    director = directorElement.value;

    let favoriteElement = document.getElementById('favorite');
    favorite = favoriteElement.checked;

    let runtimeElement = document.getElementById('runtime');
    runtime = runtimeElement.value;

    let ratingElement = document.getElementById('rating');
    rating = ratingElement.value;

    let rankingElement = document.getElementById('ranking');
    ranking = rankingElement.options[rankingElement.selectedIndex].value;

    let rangeElement = document.getElementById('range');
    range = rangeElement.value;
}

// ---------------------------------------------------------------------------------

function evaluateTitleLength() {

    if (title.length == 0) {

        errorMessageElement.innerHTML = "ERROR: Title should include 1 or more characters.";
        titleHasValidLength = false;

    } else {

        errorMessageElement.innerHTML = "";
        titleHasValidLength = true;
    }
}

// ---------------------------------------------------------------------------------

function readTitlesFile() {

    if (titleHasValidLength != true) {
        return;
    }

    retrieveListOfTitlesFromFile();
    evaluateTitleDuplication();
    sortListWithNewTitle();
}

// ---------------------------------------------------------------------------------

function retrieveListOfTitlesFromFile() {

    let isFileExisting = fs.existsSync(absolutePathToDataFile);

    if (isFileExisting == true) {

        let rawList = fs.readFileSync(absolutePathToDataFile);
        list = JSON.parse(rawList);
        evaluateMissingKeys();

    } else {

        list = [];
    }
}

// ---------------------------------------------------------------------------------

function evaluateMissingKeys() {

    // Step 3 *****

    for (let i = 0; i < list.length; i++) {

        let movie = list[i];

        if (movie.hasOwnProperty('director') == false) {
            movie.director = "";
        }

        if (movie.hasOwnProperty('favorite') == false) {
            movie.favorite = false;
        }

        if (movie.hasOwnProperty('runtime') == false) {
            movie.runtime = "0";
        }

        if (movie.hasOwnProperty('rating') == false) {
            movie.rating = "N/A";
        }

        if (movie.hasOwnProperty('ranking') == false) {
            movie.ranking = "0";
        }

        if (movie.hasOwnProperty('range') == false) {
            movie.range = "*";
        }
    }
}

// ---------------------------------------------------------------------------------

function evaluateTitleDuplication() {

    isTitleDuplicate = false;

    for (let i = 0; i < list.length; i++) {

        let movie = list[i];

        if (movie.title == title) {

            isTitleDuplicate = true;
            errorMessageElement.innerHTML = "ERROR: Title already exists in the list.";

            break;
        }
    }

    if (isTitleDuplicate == false) {

        errorMessageElement.innerHTML = "";
    }
}

// ---------------------------------------------------------------------------------

function sortListWithNewTitle() {

    if (isTitleDuplicate == true) {
        return;
    }

    let newMovie = getNewMovie();
    let addToEndOfList = true;

    for (let i = 0; i < list.length; i++) {

        let movie = list[i];

        if (movie.title > title) {

            list.splice(i, 0, newMovie);
            addToEndOfList = false;
            break;
        }
    }

    if (list.length == 0 || addToEndOfList == true) {
        list.push(newMovie);
    }

    insertNewMovieIntoDatabase(newMovie);
    displayList();
    writeListToFile();
}

// ---------------------------------------------------------------------------------

function getNewMovie() {

    let star = '*';

    // Step 4 *****
    let newMovie = {
        title: title,
        director: director,
        favorite: favorite,
        runtime: runtime,
        rating: rating,
        ranking: ranking,
        range: star.repeat(range)
    };

    if (newMovie.runtime.length == 0) {
        newMovie.runtime = "0";
    }

    if (newMovie.rating.length == 0) {
        newMovie.rating = "N/A";
    }

    return newMovie;
}

// ---------------------------------------------------------------------------------

function displayList() {

    let sortElement = document.getElementById('za-sort');
    let isReverseSortSelected = sortElement.checked;

    if (isReverseSortSelected == true) {
        list.reverse();
    }

    tableElement = document.getElementById('table');
    clearExistingVisibleList();
    // createTableOfMovies(list);
    createTableFromDatabase();
}

// ---------------------------------------------------------------------------------

function clearExistingVisibleList() {

    while (tableElement.firstChild) {

        let firstChildElement = tableElement.firstChild;
        tableElement.removeChild(firstChildElement);
    }

    let tableRowElement = document.createElement('tr');

    for (let i = 0; i < columns.length; i++) {

        let tableDataElement = document.createElement('th');
        tableDataElement.innerHTML = columns[i];
        tableRowElement.appendChild(tableDataElement);
    }

    tableElement.appendChild(tableRowElement);
}

// ---------------------------------------------------------------------------------

function createTableOfMovies(movies) {

    for (let i = 0; i < movies.length; i++) {

        let movie = movies[i];
        let tableRowElement = document.createElement('tr');

        let deleteDataElement = document.createElement('button');
        deleteDataElement.innerHTML = 'Delete';
        deleteDataElement.setAttribute('onclick', 'deleteMovie(' + i + ')');
        deleteDataElement.setAttribute('class', 'btn btn-secondary');

        let deleteButtonCellElement = document.createElement('td');
        deleteButtonCellElement.appendChild(deleteDataElement);

        tableRowElement.appendChild(deleteButtonCellElement);

        for (let key in movie) {

            let tableDataElement = document.createElement('td');
            tableDataElement.innerHTML = movie[key];

            if (key == 'title' || key == 'rating') {
                tableDataElement.setAttribute('class', 'left-align-text');
            }

            if (key == 'director') {
                tableDataElement.setAttribute('class', 'red-text');
            }

            if (key == 'rating') {

                let currentClass = tableDataElement.getAttribute('class');
                currentClass = currentClass + ' red-text';
                tableDataElement.setAttribute('class', currentClass);
            }

            tableRowElement.appendChild(tableDataElement);
        }

        tableElement.appendChild(tableRowElement);
    }
}

function deleteMovie(movieIndex) {

    let title = list[movieIndex].title;
    deleteRowFromDatabase(title);

    list.splice(movieIndex, 1);
    displayList();
    writeListToFile();
}

// ---------------------------------------------------------------------------------

function writeListToFile() {

    let rawList = JSON.stringify(list);
    fs.writeFileSync(absolutePathToDataFile, rawList);
}

// ---------------------------------------------------------------------------------

function sortListByUser() {

    getMoviesFromDatabase();
    retrieveListOfTitlesFromFile();
    displayList();
}

// ---------------------------------------------------------------------------------

// function getSuggestions() {

//     retrieveTitle();

//     if (title.length == 0) {
//         return;
//     }

//     const firstLetter = title.slice(0, 1).toLowerCase();
//     const phrase = title.toLowerCase().replace(/ /g, '_');
//     const url = 'https://v2.sg.media-imdb.com/suggestion/' + firstLetter + '/' + phrase + '.json';

//     request(url, function (error, response, body) {

//         const data = JSON.parse(body);
//         clearSuggestionsList();
//         createSuggestionsList(data);
//     });
// }

function getSuggestions() {

    db.all('SELECT city FROM cities', (error, rows) => {

        let lines = body.split('\n');
    });
}

function clearSuggestionsList() {

    const suggestionsList = document.getElementById('suggestions');

    while (suggestionsList.firstChild) {

        let firstChildElement = suggestionsList.firstChild;
        suggestionsList.removeChild(firstChildElement);
    }
}

function createSuggestionsList(data) {

    const suggestionsList = document.getElementById('suggestions');

    for (let movie of data.d) {

        let listItem = document.createElement('li');
        listItem.innerHTML = movie.l;
        suggestionsList.appendChild(listItem);
    }
}
