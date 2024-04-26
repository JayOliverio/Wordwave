/*
    File: guessing.js
    Author: Jacoby Oliverio

    Description: This JavaScript file impliments the core 
    functionalities of the word guessing game. Including
    random word selection, guessing handling, color changing
    functionality, and other core requirements.
*/

// Variable for the word to be guessed
var wordToGuess = "";
// Counts number of guesses from the user
var guessCount = 0;

var green_letters = "";
var yellow_letters = "";
var gray_letters = "";

// Tracks points
var points = 0;

// Tracks letters revealed by hint so buying new hint reveals new letter
var revealedHintIndices = [];

//Loads local saved data
loadPoints();

// Checks if gameboard is loaded, loads it if not
if (!document.getElementById('game-board').innerHTML.trim()) {
    // Generates gameboard
    for(var j = 0; j < 6; j++) {
        var row = document.createElement('div');
        row.className = 'row';
        for(var i = 0; i < 5; i++) {
            var tile = document.createElement('div');
            tile.className = 'tile';
            row.appendChild(tile);
        }
        document.getElementById('game-board').appendChild(row);
    }
    // Generates keyboard
    generateKeyboard();
}

// Fetches wordList.txt
fetch('wordList.txt')
    .then(response => response.text())
    .then(data => {
        // Parsing wordList.txt
        var wordList = data.split('\n');
        // Filters for words with the length 5
        wordList = wordList.filter(word => word.trim().length === 5);
        if (wordList.length === 0) {
            console.error("No words found from wordList.txt.");
            alert("Using default word 'apple'.");
            wordToGuess = "apple";
        } else {
            // Selects random word from wordList.txt 
            wordToGuess = wordList[Math.floor(Math.random() * wordList.length)].trim().toUpperCase();
        }
    // Catches error for file not found
    })
    .catch(error => {
        console.error('Error fetching word list:', error);
        alert("Error fetching word list. Please try again later.");
    });

/**
 * Function for user guessing functionality.
 * TO-DO Split color changing functionality from it into another function
 * @returns 
 */
function makeGuess() {
    // Checks if max guesses have been reached
    if (guessCount >= 6) {
        alert("You've reached the maximum number of guesses.");
        return;
    }
    // Holds guess-input value from user
    var guess = document.getElementById("guess-input").value.toUpperCase();
    // Checks if guess is the right length
    if (guess.length !== 5) {
        alert("Enter a 5 letter word.");
        return;
    }
    
    // To upper for compatibility with keyboard
    var wordToGuessUpper = wordToGuess.toUpperCase();
    // Selects row to display guess on gameboard
    var row = document.querySelector('#game-board .row:nth-child(' + (guessCount + 1) + ')');
    if (!row) {
        alert("GAMEBOARD ROW ERROR");
        return;
    }

    // Color changing functionality
    var tiles = row.querySelectorAll('.tile');
    var correctGuess = true;
    for (var i = 0; i < 5; i++) {
        var letter = guess[i];
        if (wordToGuessUpper[i] === letter) {
            if (!green_letters.includes(letter)) {
                green_letters += letter;
            }
            tiles[i].style.backgroundColor = 'rgb(0, 122, 0)';
        } else if (wordToGuessUpper.includes(letter)) {
            if (!yellow_letters.includes(letter)) {
                yellow_letters += letter;
            }
            tiles[i].style.backgroundColor = 'rgb(197, 197, 0)';
            correctGuess = false;
        } else {
            if (!gray_letters.includes(letter)) {
                gray_letters += letter;
            }
            tiles[i].style.backgroundColor = 'gray';
            correctGuess = false;
        }
        tiles[i].innerText = letter;
    }

    // If the guess was correct, award points
    if (correctGuess) {
        updatePoints(3);
    }

    generateKeyboard();

    guessCount++;
    document.getElementById('guess-input').value = '';
}    

/**
 * Function to generate the dynamic keyboard
 * TO-DO Color changing functionality
 */
function generateKeyboard() {
    var keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';
    var rows = ["QWERTYUIOP", "ASDFGHJKL","ZXCVBNM"];

    rows.forEach(rowString => {
        var rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        for (var i = 0; i < rowString.length; i++) {
            var letter = rowString[i];
            var button = createKey(letter);
            rowDiv.appendChild(button);
        }
        keyboard.appendChild(rowDiv);
    });
}

/**
 * Function to create each key for the keyboard
 * @param {*} letter 
 * @returns Button
 */
function createKey(letter) {
    var button = document.createElement('button');
    button.className = 'key';

    button.textContent = letter;
    // Adds click listener to each key
    button.addEventListener('click', function() {
        insertLetter(letter);
    });

    // colored keys
    if (green_letters.includes(letter)) {
        button.className = 'green-key';
    } else if (yellow_letters.includes(letter)) {
        button.className = 'yellow-key';
    } else if (gray_letters.includes(letter)) {
        button.className = 'gray-key'
    }

    return button;
}

/**
 * Function to insert each letter of the guess into gameboard, adds focus to input field
 * @param {*} letter 
 */
function insertLetter(letter) {
    var input = document.getElementById('guess-input');
    input.value += letter;
    input.focus();
}

/**
 * Function to read for enter input event to submit guess
 * @param {*} event 
 */
function handleKeyPress(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        makeGuess();
    }
}

/**
 * Function to update the points by an inputed amount
 * @param {*} score 
 */
function updatePoints(score) {
    points += score;
    // Save points to localStorage
    localStorage.setItem('points', points);
    displayPoints();
}

/**
 * Function to update the points display
 */
function displayPoints() {
    document.getElementById('points-display').innerText = "Points: " + points;
}

/**
 * Function to load the saved points
 */
function loadPoints() {
    var savedPoints = localStorage.getItem('points');
    if (savedPoints !== null) {
        points = parseInt(savedPoints);
    }
    displayPoints();
}

/**
 * Function to use hint button
 * @returns
 */
function buyHint() {
    // Check if the user has enough points to buy a hint
    if (points < 5) {
        alert("You don't have enough points to buy a hint.");
        return;
    }

    // Deduct 5 points for buying a hint
    updatePoints(-5);

    // Generate a random index that hasn't been revealed yet
    var randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * wordToGuess.length);
    } while (revealedHintIndices.includes(randomIndex));

    // Add the index to the revealed hint indices array
    revealedHintIndices.push(randomIndex);

    // Get the letter at the random index in the word
    var hintLetter = wordToGuess[randomIndex];

    // Highlight the tile corresponding to the hint letter
    var hintRow = document.querySelector('#game-board .row:nth-child(' + (guessCount + 1) + ')');
    var hintTile = hintRow.querySelectorAll('.tile')[randomIndex];
    hintTile.innerText = hintLetter;
    hintTile.style.backgroundColor = 'lightblue';
}

// event listener for enter key press for guess field
document.getElementById("guess-input").addEventListener("keydown", handleKeyPress);
