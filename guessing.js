var wordToGuess = "";
var guessCount = 0;

if (!document.getElementById('game-board').innerHTML.trim()) {
    for(var j = 0; j < 5; j++) {
        var row = document.createElement('div');
        row.className = 'row';
        for(var i = 0; i < 5; i++) {
            var tile = document.createElement('div');
            tile.className = 'tile';
            row.appendChild(tile);
        }
        document.getElementById('game-board').appendChild(row);
    }
    generateKeyboard();
}

fetch('wordList.txt')
    .then(response => response.text())
    .then(data => {
        var wordList = data.split('\n');
        wordList = wordList.filter(word => word.trim().length === 5);
        if (wordList.length === 0) {
            console.error("No words found from wordList.txt.");
            alert("Using default word 'apple'.");
            wordToGuess = "apple";
        } else {
            wordToGuess = wordList[Math.floor(Math.random() * wordList.length)].trim().toUpperCase();
        }
    })
    .catch(error => {
        console.error('Error fetching word list:', error);
        alert("Error fetching word list. Please try again later.");
    });

function makeGuess() {
    if (guessCount >= 6) {
        alert("You've reached the maximum number of guesses.");
        return;
    }
    var guess = document.getElementById("guess-input").value.toUpperCase();
    if (guess.length !== 5) {
        alert("Enter a 5 letter word.");
        return;
    }
    
    var wordToGuessUpper = wordToGuess.toUpperCase();
    
    var row = document.querySelector('#game-board .row:nth-child(' + (guessCount + 1) + ')');
    if (!row) {
        alert("GAMEBOARD ROW ERROR");
        return;
    }

    var tiles = row.querySelectorAll('.tile');
    for (var i = 0; i < 5; i++) {
        var letter = guess[i];
        if (wordToGuessUpper[i] === letter) {
            tiles[i].style.backgroundColor = 'green';
        } else if (wordToGuessUpper.includes(letter)) {
            tiles[i].style.backgroundColor = 'yellow';
        } else {
            tiles[i].style.backgroundColor = 'gray';
        }
        tiles[i].innerText = letter;
    }
    guessCount++;
    document.getElementById('guess-input').value = '';
}    

function insertLetter(letter) {
    document.getElementById('guess-input').value += letter;
}

function generateKeyboard() {
    var keyboard = document.getElementById('keyboard');
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

function createKey(letter) {
    var button = document.createElement('button');
    button.className = 'key';
    button.textContent = letter;
    button.addEventListener('click', function() {
        insertLetter(letter);
    });
    return button;
}

function insertLetter(letter) {
    var input = document.getElementById('guess-input');
    input.value += letter;
    input.focus();
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        makeGuess();
    }
}

// FOR ENTER KEY GUESS INPUT
document.getElementById("guess-input").addEventListener("keydown", handleKeyPress);

