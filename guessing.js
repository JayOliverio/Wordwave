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

// array of valid words
var validWords = [];

//Loads local saved data
loadPoints();

// load streak data
var streak = 0;
loadStreak();

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
        validWords = wordList.map(word => word.trim().toUpperCase()).filter(word => word.length === 5);
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
        // Reset the streak and hide the streak display
        streak = 0;
        displayStreak();
        return;
    }

    // Holds guess-input value from user
    var guess = document.getElementById("guess-input").value.toUpperCase();
    // Checks if guess is the right length
    if (guess.length !== 5) {
        alert("Enter a 5 letter word.");
        return;
    }

    // check for illegal characters
    if (!guess.match(/^[a-z]+$/i)) {
        alert("Word contains illegal characters");
        return;
    }

    if (!validWords.includes(guess)) {
        alert("Word not valid.");
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
            tiles[i].style.backgroundColor = 'rgb(255, 215, 0)';
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
        // Checks if guesses in 3 or less
        if (guessCount <= 3) {
            // double points if so
        updatePoints(6);
        } else {
            // 3 points for 4 or more guesses
            updatePoints(3);
        }
        // add to streak
        updateStreak();
        alert("Congratulations on guessing the word!");
    }

    generateKeyboard();
    
    guessCount++;
    if (guessCount >= 6 && !correctGuess) {
        // reset the streak
        resetStreak();
        console.log("reseting streak");
    }

    document.getElementById('guess-input').value = '';
}

/**
 * Function to generate the dynamic keyboard
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
        alert("You don't have enough points to buy a hint. Correctly guess the word to obtain points.");
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

/**
 * Loads the streak from storage.
 */
function loadStreak() {
    var saved_streak = localStorage.getItem('streak');
    if (saved_streak !== null) {
        streak = parseInt(saved_streak);
    }
    displayStreak();
}

/**
 * Update the streak count
 */
function updateStreak() {
    streak += 1;
    // save to localstorage
    localStorage.setItem('streak', streak);
    displayStreak();
}

/**
 * Display the streak on screen
 */
function displayStreak() {
    var streakDisplay = document.getElementById('streak-display');
    if (streak > 0) {
        streakDisplay.style.display = 'block';
        streakDisplay.innerText = "Streak: " + streak;
    } else {
        streakDisplay.style.display = 'none';
    }
}

/**
 * Game lost, reset the streak
 */
function resetStreak() {
    console.log("resetStreak() called");
    streak = 0;
    localStorage.setItem('streak', streak);
    displayStreak();
}

/**
 * get.answer() console command for testing
 * @returns wordToGuess
 */
const get = {
    answer() {
        console.log(wordToGuess);
    },
    streak() {
        console.log(streak);
    },
};

// Add an event listener to the dark mode toggle switch
document.getElementById("dark-mode-toggle").addEventListener("change", function() {
    var darkModeEnabled = this.checked;
    toggleDarkMode(darkModeEnabled);
});

// Function to toggle dark mode
function toggleDarkMode(darkModeEnabled) {
    if (darkModeEnabled) {
        document.body.style.backgroundColor = "rgb(47, 47, 47)"; 
        document.getElementById("dark-mode-label").style.color = "#fff"; 
        document.getElementById("points-display").style.color = "#fff";

    } else {
        document.body.style.backgroundColor = "#fff";
        document.getElementById("dark-mode-label").style.color = "#333";
        document.getElementById("points-display").style.color = "#333"
    }
}


// event listener for enter key press for guess field
document.getElementById("guess-input").addEventListener("keydown", handleKeyPress);
