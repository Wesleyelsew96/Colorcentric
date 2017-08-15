$(document).ready(function (e) {
    e.stopPropagation;

    // Set the variables
    var userBestScore = 0;
    var removals = 0;
    var createdTile;
    var centerBackground;
    var edgeNoCorners = 0;
    var edgeFull = false;
    var cornersFull = false;
    var gameOver = false;
    var freshStart = true;
    var createNewCenterTile = false;
    var swooshSound = document.getElementById("swooshSound");
    var removeSound = document.getElementById("removeSound");
    var gameOverSound = document.getElementById("gameOverSound");
    var soundOn = true;
    var shiftValue = "";
    if (window.matchMedia("(min-width: 520px)").matches) {
        shiftValue = "121.25px";
    } else {
        shiftValue = "72.8px";
    }

    // setTimeout IDs
    var removeRemovesId = 0;
    var newTileId = 0;
    var newFutureTileId = 0;
    var newCenterTileId = 0;
    var checkGameOverId = 0;

    // setTimeout trackers
    var newTileFinished = true;
    var newFutureTileFinished = true;
    var newCenterTileFinished = true;
    var checkGameOverFinished = true;

    var futureColor;
    var doubleColor;
    var doubleAchieved = false;
    var colorArray = [];
    var tileArray = [[null, null, null, null],
                     [null, null, null, null],
                     [null, null, null, null],
                     [null, null, null, null]];
    var removeArray = [[null, null, null, null],
                       [null, null, null, null],
                       [null, null, null, null],
                       [null, null, null, null]];

    // Set the colors
    var yellowActivated = false;
    var greenActivated = false;
    var purpleActivated = false;
    var orangeActivated = false;
    var pinkActivated = false;
    var tealActivated = false;
    var brownActivated = false;
    var grayActivated = false;
    var blackActivated = false;
    var whiteActivated = false;

    // Automatically start a game
    newGame();

    // Automatically update the bestScore from the local storage
    userBestScore = localStorage.getItem("userBestScore");
    if (userBestScore != null) { // If it's not the first time the player has loaded the page
        document.getElementById("best-score").innerHTML = userBestScore;
    }

    // Interactions with the screen
    $(".restart-button").click(newGame);
    $("#sound-toggle").click(soundToggle);


    // Start a new game
    function newGame() {

        freshStart = true;
        removals = 0;

        // Remove the gameover overlay
        document.getElementById("postgame-message").style.display = "none";

        // Clear the board
        for (var row = 0; row <= 3; row++) {
            for (var column = 0; column <= 3; column++) {
                if (tileArray[row][column] != null) {
                    $(tileArray[row][column]).remove();
                    tileArray[row][column] = null;
                }
            }
        }

        // Set the colors
        yellowActivated = false;
        greenActivated = false;
        purpleActivated = false;
        orangeActivated = false;
        pinkActivated = false;
        tealActivated = false;
        brownActivated = false;
        grayActivated = false;
        blackActivated = false;
        whiteActivated = false;
        

        // Reset the color array
        colorArray = [];
        colorArray.push("firebrick");
        colorArray.push("darkblue");

        // Reset scores
        document.getElementById("current-score").innerHTML = "0";
        document.getElementById("gameover-score").innerHTML = "0";

        // Make a random "old" future tile and add a tile to the board of that color
        //newFutureTile();
        futureColor = pickColor();
        newTile();

        // Make another random "old" future tile and add another tile to the board of that color
        //newFutureTile();
        futureColor = pickColor();
        newTile();

        // Re-enable the fadeIns for center and future tiles
        freshStart = false;

        // Make the first center tile
        newCenterTile();

        // Make the real future tile at the top
        newFutureTile();
    }

    function soundToggle() {
        if (soundOn == false) {
            soundOn = true;
            $("#sound-toggle").attr("src", "images/sounds-on.png");
            $("#sound-toggle").attr("alt", "Sound On");
        } else {
            soundOn = false;
            $("#sound-toggle").attr("src", "images/sounds-off.png");
            $("#sound-toggle").attr("alt", "Sound Off");
        }
    }

/* These events happen when you press a key */

    // Make a move
    $(document).keydown(function (e) {

        // Prevent scrolling
        e.stopPropagation();
        e.preventDefault();

        // Finish any old animations
        finishAnimations();

        // Reset the number of removals
        removals = 0;

        // Log the old tileArray
        var newTileArray = _.cloneDeep(tileArray);

        // Move tiles depending on which key is pressed
        if (e.keyCode == 40) {
            moveTilesDown();
        }
        if (e.keyCode == 38) {
            moveTilesUp();
        }
        if (e.keyCode == 39) {
            moveTilesRight();
        }
        if (e.keyCode == 37) {
            moveTilesLeft();
        }

        // Check for the "SUPER" removal, when a double is achieved
        checkDoubles();
        if (removals > 0 && soundOn) {
            removeSound.play();
        }

        // Remove the bonus removals
        removeRemovesId = setTimeout(function () {
            removeRemoves();
        }, 100);

        // Check to see if a new center tile is needed
        if (createNewCenterTile) {
            newCenterTileFinished = false;
            newCenterTileId = setTimeout(function () {
                newCenterTile();
                newCenterTileFinished = true;
            }, 100);
            createNewCenterTile = false;
        } else {
            newCenterTileFinished = true;
        }

        if (JSON.stringify(newTileArray) != JSON.stringify(tileArray)) {
            newTileFinished = false;
            // Play a swoosh sound
            if (soundOn) {
                swooshSound.play();
                //playSound();
            }

            newTileId = setTimeout(function () {
                newTile();
                newTileFinished = true;
            }, 100); // Change this to toggle the cheap strat in 2048
        } else {
            newTileFinished = true;
        }

        // Update the score
        document.getElementById("current-score").innerHTML = parseInt(document.getElementById("current-score").innerHTML) + removals;
        document.getElementById("gameover-score").innerHTML = parseInt(document.getElementById("gameover-score").innerHTML) + removals;

        // Update the best score
        if (parseInt(document.getElementById("best-score").innerHTML) < parseInt(document.getElementById("current-score").innerHTML)) {
            document.getElementById("best-score").innerHTML = parseInt(document.getElementById("current-score").innerHTML);
            userBestScore = parseInt(document.getElementById("current-score").innerHTML);
            localStorage.setItem("userBestScore", userBestScore);
        }

        // Create a new future tile color
        if (JSON.stringify(newTileArray) != JSON.stringify(tileArray)) {
            newFutureTileId = setTimeout(function () {
                newFutureTile();
                newFutureTileFinished = true;
            }, 100);
        } else {
            newFutureTileFinished = true;
        }

        // Add any new tile colors
        addColors();

        // Check for gameover
        checkGameOverId = setTimeout(function () {
            checkGameOver();
            checkGameOverFinished = true;
        }, 100);
    });

/* These events happen when you move a tile */

    // Check if the tile is on an edge
    function isEdge(row, column) {
        if (row == 0 || row == 3 || column == 0 || column == 3) {
            return true;
        } else {
            return false;
        }
    }

    // Move ALL tiles downward
    function moveTilesDown() {
        for (var column = 3; column >= 0; column--) {
            for (var row = 2; row >= 0; row--) {
                if (checkBelow(row, column) && tileArray[row][column] != null) {
                    moveTileDown(row, column);
                }
            }
        }
    }

    // Move ALL tiles upward
    function moveTilesUp() {
        for (var column = 3; column >= 0; column--) {
            for (var row = 1; row <= 3; row++) {
                if (checkAbove(row, column) && tileArray[row][column] != null) {
                    moveTileUp(row, column);
                }
            }
        }
    }

    // Move ALL tiles left
    function moveTilesLeft() {
        for (var column = 1; column <= 3; column++) {
            for (var row = 3; row >= 0; row--) {
                if (checkLeft(row, column) && tileArray[row][column] != null) {
                    moveTileLeft(row, column);
                }
            }
        }
    }

    // Move ALL tiles right
    function moveTilesRight() {
        for (var column = 2; column >= 0; column--) {
            for (var row = 3; row >= 0; row--) {
                if (checkRight(row, column) && tileArray[row][column] != null) {
                    moveTileRight(row, column);
                }
            }
        }
    }

    // Make sure the tile space below is clear
    function checkBelow(row, column) {
        if (!isEdge(row + 1, column) && tileArray[row][column] != null) {
            if (document.getElementById("center-tile").style.backgroundColor == tileArray[row][column].style.backgroundColor) {
                return true;
            } else {
                return false;
            }
        } else {
            return !tileArray[row + 1][column];
        }
    }

    // Make sure the tile space above is clear
    function checkAbove(row, column) {
        if (!isEdge(row - 1, column) && tileArray[row][column] != null) {
            if (document.getElementById("center-tile").style.backgroundColor == tileArray[row][column].style.backgroundColor) {
                return true;
            } else {
                return false;
            }
        } else {
            return !tileArray[row - 1][column];
        }
    }

    // Make sure the tile space to the left is clear
    function checkLeft(row, column) {
        if (!isEdge(row, column - 1) && tileArray[row][column] != null) {
            if (document.getElementById("center-tile").style.backgroundColor == tileArray[row][column].style.backgroundColor) {
                return true;
            } else {
                return false;
            }
        } else {
            return !tileArray[row][column - 1];
        }
    }

    // Make sure the tile space to the right is clear
    function checkRight(row, column) {
        if (!isEdge(row, column + 1) && tileArray[row][column] != null) {
            if (document.getElementById("center-tile").style.backgroundColor == tileArray[row][column].style.backgroundColor) {
                return true;
            } else {
                return false;
            }
        } else {
            return !tileArray[row][column + 1];
        }
    }

    // Move A SINGLE tile downward
    function moveTileDown(row, column) {

        //This happens as soon as the player makes a move
        if (checkRemove(row + 1, column)) {
            doubleColor = tileArray[row][column].style.backgroundColor;
            removals++;
            if (removals == 1) {
                // This will cause the creation of a new center tile, once all movements have been processed
                createNewCenterTile = true;
            }
        }

        // This is the animation
        $(tileArray[row][column]).animate({ "top": "+=" + shiftValue }, 80, "linear", function () {

            //This happens at the end of each tile's movement
            if (checkRemove(row + 1, column)) {
                $(tileArray[row + 1][column]).remove();
                tileArray[row + 1][column] = null;
            } else {
                tileArray[row + 1][column].setAttribute("id", "tile-" + (parseInt(tileArray[row + 1][column].id.slice(5)) + 4));
            }
        });
        tileArray[row + 1][column] = tileArray[row][column];
        tileArray[row][column] = null;
    }

    // Move A SINGLE tile upward
    function moveTileUp(row, column) {

        //This happens as soon as the player makes a move
        if (checkRemove(row - 1, column)) {
            doubleColor = tileArray[row][column].style.backgroundColor;
            removals++;
            if (removals == 1) {
                // This will cause the creation of a new center tile, once all movements have been processed
                createNewCenterTile = true;
            }
        }

        // This is the animation
        $(tileArray[row][column]).animate({ "top": "-=" +  shiftValue }, 80, "linear", function () {

            // This happens at the end of each tile's movement
            if (checkRemove(row - 1, column)) {
                $(tileArray[row - 1][column]).remove();
                tileArray[row - 1][column] = null;
            } else {
                tileArray[row - 1][column].setAttribute("id", "tile-" + (parseInt(tileArray[row - 1][column].id.slice(5)) - 4));
            }
        });
        tileArray[row - 1][column] = tileArray[row][column];
        tileArray[row][column] = null;
    }

    // Move A SINGLE tile left
    function moveTileLeft(row, column) {

        //This happens as soon as the player makes a move
        if (checkRemove(row, column - 1)) {
            doubleColor = tileArray[row][column].style.backgroundColor;
            removals++;
            if (removals == 1) {
                // This will cause the creation of a new center tile, once all movements have been processed
                createNewCenterTile = true;
            }
        }

        // This is the animation
        $(tileArray[row][column]).animate({ "left": "-=" + shiftValue }, 80, "linear", function () {

            // This happens at the end of each tile's movement
            if (checkRemove(row, column - 1)) {
                $(tileArray[row][column - 1]).remove();
                tileArray[row][column - 1] = null;
            } else {
                tileArray[row][column - 1].setAttribute("id", "tile-" + (parseInt(tileArray[row][column - 1].id.slice(5)) - 1));
            }            
        });
        tileArray[row][column - 1] = tileArray[row][column];
        tileArray[row][column] = null;
    }

    // Move A SINGLE tile right
    function moveTileRight(row, column) {

        //This happens as soon as the player makes a move
        if (checkRemove(row, column + 1)) {
            doubleColor = tileArray[row][column].style.backgroundColor;
            removals++;
            if (removals == 1) {
                // This will cause the creation of a new center tile, once all movements have been processed
                createNewCenterTile = true;
            }
        }

        // This is the animation
        $(tileArray[row][column]).animate({ "left": "+=" + shiftValue }, 80, "linear", function () {

            // This happens at the end of each tile's movement
            if (checkRemove(row, column + 1)) {
                $(tileArray[row][column + 1]).remove();
                tileArray[row][column + 1] = null;
            } else {
                tileArray[row][column + 1].setAttribute("id", "tile-" + (parseInt(tileArray[row][column + 1].id.slice(5)) + 1));
            }
        });
        tileArray[row][column + 1] = tileArray[row][column];
        tileArray[row][column] = null;
    }

    // Check to see if a particular tile should be removed from the board
    function checkRemove(row, column) {
        if (!isEdge(row, column)) {
            return true;
        } else {
            return false;
        }
    }

    // Finish the old animations
    function finishAnimations() {
        for (var row = 0; row <= 3; row++) {
            for (var column = 0; column <= 3; column++) {
                if (row + 1 <= 3 && column + 1 <= 3) {
                    if (tileArray[row + 1][column + 1] != null) {
                        $(tileArray[row + 1][column + 1]).finish();
                    }
                }
                if (row - 1 >= 0 && column + 1 <= 3) {
                    if (tileArray[row - 1][column + 1] != null) {
                        $(tileArray[row - 1][column + 1]).finish();
                    }
                }
                if (row + 1 <= 3 && column - 1 >= 0) {
                    if (tileArray[row + 1][column - 1] != null) {
                        $(tileArray[row + 1][column - 1]).finish();
                    }
                }
                if (row - 1 >= 0 && column - 1 >= 0) {
                    if (tileArray[row - 1][column - 1] != null) {
                        $(tileArray[row - 1][column - 1]).finish();
                    }
                }
            }
        }

        // Remove the "remove"-marked tiles
        clearTimeout(removeRemovesId);
        removeRemoves();

        // End the queue of the center tile
        //$("#center-tile").clearQueue();

        // Hurry the newCenterTile function if the player plays too quickly
        clearTimeout(newCenterTileId);
        if (newCenterTileFinished == false) {
            newCenterTile();
        }
        document.getElementById("center-tile").style.opacity = 1;
        document.getElementById("center-tile").style.display = "inline";

        // Hurry the newTile function if the player plays too quickly
        clearTimeout(newTileId);
        if (newTileFinished == false ) {
            newTile();
        }
        newTileFinished = false;

        // Hurry the newFutureTile function if the player plays too quickly
        clearTimeout(newFutureTileId);
        if (newFutureTileFinished == false) {
            newFutureTile();
        }
        newFutureTileFinished = false;

        // Hurry the checkGameOver function if the player plays too quickly
        clearTimeout(checkGameOverId);
        if (checkGameOverFinished == false) {
            checkGameOver();
        }
        checkGameOverFinished = false;

        // Finish the sounds
        swooshSound.pause();
        swooshSound.currentTime = 0;
        removeSound.pause();
        removeSound.currentTime = 0;
        gameOverSound.pause();
        gameOverSound.currentTime = 0;
    }

/* The operations of each turn */

    // Add a new tile
    function newTile() {

        // Create a new tile
        createdTile = document.createElement("div");

        createdTile.setAttribute("position", "absolute");
        createdTile.setAttribute("class", "tile");

        // Find the empty corners
        var emptyCorners = [];
        if (!tileArray[0][0]) {
            emptyCorners.push("tile-1");
        }
        if (!tileArray[0][3]) {
            emptyCorners.push("tile-4");
        }
        if (!tileArray[3][0]) {
            emptyCorners.push("tile-13");
        }
        if (!tileArray[3][3]) {
            emptyCorners.push("tile-16");
        }

        // Of the empty corners, pick a corner for the tile to go into
        var newTileCorner = Math.floor(Math.random() * emptyCorners.length);

        if (emptyCorners.length > 0) {
            // Pick a corner to put the tile in
            createdTile.setAttribute("id", emptyCorners[newTileCorner]);

            // Insert the tile into the corner
            $("#tile-container").append(createdTile);

            // Insert the tile into the array of tiles
            if (emptyCorners[newTileCorner] == "tile-1") {
                tileArray[0][0] = createdTile;
            } else if (emptyCorners[newTileCorner] == "tile-4") {
                tileArray[0][3] = createdTile;
            } else if (emptyCorners[newTileCorner] == "tile-13") {
                tileArray[3][0] = createdTile;
            } else if (emptyCorners[newTileCorner] == "tile-16") {
                tileArray[3][3] = createdTile;
            }

            // Access the tile with jquery
            var $activeTile = $("#" + createdTile.id);
            $activeTile.hide().fadeIn(100);

            // Make the new tile the same color as the old future tile
            createdTile.style.backgroundColor = futureColor;
        }
    };

    // Check to see if there are any doubles
    function checkDoubles() {
        if (removals == 2) {
            for (var row = 0; row <= 3; row++) {
                for (var column = 0; column <= 3; column++) {
                    if (tileArray[row][column] != null && ((row != 1 && row != 2) || (column != 1 & column != 2))) {
                        if (tileArray[row][column].style.backgroundColor == doubleColor) {
                            removeArray[row][column] = "remove";
                            removals++;
                            doubleAchieved = true;
                        }
                    }
                }
            }
        }
    }

    // Remove the "remove"-marked tiles
    function removeRemoves() {
        if (doubleAchieved == true) {
            for (var doubleRow = 0; doubleRow <= 3; doubleRow++) {
                for (var doubleColumn = 0; doubleColumn <= 3; doubleColumn++) {
                    if (removeArray[doubleRow][doubleColumn] == "remove") {
                        $(document.getElementById("tile-" + (4 * doubleRow + doubleColumn + 1).toString())).remove();
                        tileArray[doubleRow][doubleColumn] = null;
                        removeArray[doubleRow][doubleColumn] = null;
                    }
                }
            }
            doubleAchieved = false;
        }
    }

    // The future tile
    function newFutureTile() {

        // Access the tile with jquery
        var $futureTile = $("#future-tile");
        if (freshStart) {
            $futureTile.fadeIn(0);
        } else {
            $futureTile.hide().fadeIn(0);
        }

        // Pick a color for the future tile
        futureColor = pickColor();

        var success = false;
        for (var i = 0; i < colorArray.length; i++) {
            if (colorArray[i] == futureColor) {
                success = true;
            }
        }
        if (success == false) {
            var broke = true;
        }

        document.getElementById("future-tile").style.backgroundColor = futureColor;
    }

    // The center tile
    function newCenterTile() {

        // Access the tile with jquery
        var $centerTile = $("#center-tile");
        if (freshStart) {
            $centerTile.fadeIn(0);
        } else {
            $centerTile.hide().fadeIn(0);
        }
        document.getElementById("center-tile").style.display = "inline";

        // Assign the picked color to the center tile
        document.getElementById("center-tile").style.backgroundColor = futureColor;
    }

    // Pick a random color from the available options
    function pickColor() {
        if (colorArray.length > 1) {
            var oldColorIndex = colorArray.indexOf(document.getElementById("center-tile").style.backgroundColor);
            if (freshStart == true) {
                oldColorIndex = -1;
            }
            if (oldColorIndex > -1) {
                var oldColor = colorArray[oldColorIndex];
                colorArray.splice(oldColorIndex, 1);
            }
            var colorToReturn = colorArray[Math.floor(Math.random() * colorArray.length)];
            if (oldColorIndex > -1) {
                colorArray.push(oldColor);
            }
            return colorToReturn;
        } else {
            return colorArray[Math.floor(Math.random() * colorArray.length)];
        }
    }

    // Add new tile colors to the colorArray
    function addColors() {
        var currentScore = parseInt(document.getElementById("current-score").innerHTML);
        if (currentScore >= 10 && !yellowActivated) {
            yellowActivated = true;
            colorArray.push("gold");
        }
        if (currentScore >= 20 && !greenActivated) {
            greenActivated = true;
            colorArray.push("green");
        }
        if (currentScore >= 50 && !purpleActivated) {
            purpleActivated = true;
            colorArray.push("darkmagenta");
        }
        if (currentScore >= 100 && !orangeActivated) {
            orangeActivated = true;
            colorArray.push("darkorange");
        }
        if (currentScore >= 200 && !pinkActivated) {
            pinkActivated = true;
            colorArray.push("deeppink");
        }
        if (currentScore >= 500 && !tealActivated) {
            tealActivated = true;
            colorArray.push("#33ADD6");
        }
        if (currentScore >= 1000 && !brownActivated) {
            brownActivated = true;
            colorArray.push("saddlebrown");
        }
        if (currentScore >= 2000 && !grayActivated) {
            grayActivated = true;
            colorArray.push("dimgrey");
        }
        if (currentScore >= 5000 && !blackActivated) {
            blackActivated = true;
            colorArray.push("black");
        }
        if (currentScore >= 10000 && !whiteActivated) {
            whiteActivated = true;
            colorArray.push("ghostwhite");
        }
    }

    function checkGameOver() {

        edgeFull = false;
        cornersFull = false;
        gameOver = false;

        if (tileArray[0][1] != null) {
            edgeNoCorners++;
        }
        if (tileArray[0][2] != null) {
            edgeNoCorners++;
        }
        if (tileArray[1][0] != null) {
            edgeNoCorners++;
        }
        if (tileArray[1][3] != null) {
            edgeNoCorners++;
        }
        if (tileArray[2][0] != null) {
            edgeNoCorners++;
        }
        if (tileArray[2][3] != null) {
            edgeNoCorners++;
        }
        if (tileArray[3][1] != null) {
            edgeNoCorners++;
        }
        if (tileArray[3][2] != null) {
            edgeNoCorners++;
        }

        centerBackground = document.getElementById("center-tile").style.backgroundColor;

        if (edgeNoCorners == 8) {
            if (tileArray[0][1].style.backgroundColor != centerBackground && tileArray[0][2].style.backgroundColor != centerBackground &&
                tileArray[1][0].style.backgroundColor != centerBackground && tileArray[1][3].style.backgroundColor != centerBackground &&
                tileArray[2][0].style.backgroundColor != centerBackground && tileArray[2][3].style.backgroundColor != centerBackground &&
                tileArray[3][1].style.backgroundColor != centerBackground && tileArray[3][2].style.backgroundColor != centerBackground) {
                edgeFull = true;
            }
        }

        edgeNoCorners = 0;

        if (tileArray[0][0] != null && tileArray[0][3] != null && tileArray[3][0] != null && tileArray[3][3] != null) {
            cornersFull = true;
        }

        if (edgeFull && cornersFull) {
            gameOver = true;
        }

        if (gameOver) {
            document.getElementById("postgame-message").style.display = "inline";
            if (soundOn) {
                setTimeout(function () {
                    gameOverSound.play();
                }, 100);
            }
        }
    }
});