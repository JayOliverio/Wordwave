var wordToGuess = "apple";
var guessCount = 0;

function makeGuess() {
    if(guessCount >= 6) {
        alert("You've reached the maximum number of guesses.");
        return;
    }
    var guess = document.getElementById("guess-input").value;
    if(guess.length !== 5) {
        alert("Enter a 5-letter word.");
        return;
    }
    var row = document.getElementsByClassName('row')[guessCount];
    var tiles = row.getElementsByClassName('tile');
    for(var i = 0; i < 5; i++) {
        if(wordToGuess[i] === guess[i]) {
            tiles[i].style.backgroundColor = 'green';
        } else if(wordToGuess.includes(guess[i])) {
            tiles[i].style.backgroundColor = 'yellow';
        } else {
            tiles[i].style.backgroundColor = 'gray';
        }
        tiles[i].innerText = guess[i];
    }
    guessCount++;
    document.getElementById('guess-input').value = '';
}

var gameBoard = document.getElementById('game-board');
for(var j = 0; j < 5; j++) {
    var row = document.createElement('div');
    row.className = 'row';
    for(var i = 0; i < 5; i++) {
        var tile = document.createElement('div');
        tile.className = 'tile';
        row.appendChild(tile);
    }
    gameBoard.appendChild(row);
}
