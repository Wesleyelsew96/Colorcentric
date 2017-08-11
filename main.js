

$(document).ready(function (e) {
    e.stopPropagation;

    // Set the variables
    var timeoutId; // The id for setTimeouts in the code
    var timeoutIdArray = []; // The array of timeout IDs
    var createdTile;
    var gameOver = false;
    var colorArray = [];
    var tileArray = [[null, null, null, null],
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



    $(".restart-container").click(newGame);


    // Start a new game
    function newGame() {

        // Clear the board
        for (var row = 0; row <= 3; row++) {
            for (var column = 0; column <= 3; column++) {
                if (tileArray[row][column] != null) {
                    $(tileArray[row][column]).remove();
                    tileArray[row][column] = null;
                }
            }
        }

        // Reset the color array
        colorArray = [];
        colorArray.push("red");
        colorArray.push("blue");


        // Make a random "old" future tile and add a tile to the board of that color
        newFutureTile();
        newTile();

        // Make another random "old" future tile and add another tile to the board of that color
        newFutureTile();
        newTile();

        // Make the real future tile at the top
        newFutureTile();
    }

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
            $activeTile.hide().fadeIn("fast");

            // Make the new tile the same color as the old future tile
            $activeTile.css("background-color", document.getElementById("future-tile").style.backgroundColor);
        } else {
            gameOver = true;
        }
    };

    // The future tile
    function newFutureTile() {
        
        // Access the tile with jquery
        var $activeTile = $("#future-tile");
        $activeTile.hide().fadeIn("fast");

        // Pick a color for the future tile
        var futureColor = pickColor();
        document.getElementById("future-tile").style.backgroundColor = futureColor;

        newCenterTile(futureColor);
    }

    // The center tile
    function newCenterTile(color) {

        // Access the tile with jquery
        var $activeTile = $("#center-tile");
        $activeTile.hide().fadeIn("fast");

        // Assign the picked color to the center tile
        document.getElementById("center-tile").style.backgroundColor = color;
    }

    // Pick a random color from the available options
    function pickColor() {
        return colorArray[Math.floor(Math.random() * colorArray.length)]; //TODO disallow the center color to come again
    }

    // Make a move
    $(document).keydown(function (e) {

        // Prevent scrolling
        e.preventDefault();

        // Finish any old animations
        finishAnimations();

        // Clear the old timeoutIds
        removeTilesEarly();

        // Move tiles depending on which key is pressed
        if (e.keyCode == 40) {
            moveTilesDown();
            setTimeout(function () { newTile() }, 100); // Change this to toggle the cheap strat in 2048
        }
        if (e.keyCode == 38) {
            moveTilesUp();
            setTimeout(function () { newTile() }, 100); // Change this to toggle the cheap strat in 2048
        }
        if (e.keyCode == 39) {
            moveTilesRight();
            setTimeout(function () { newTile() }, 100); // Change this to toggle the cheap strat in 2048
        }
        if (e.keyCode == 37) {
            moveTilesLeft();
            setTimeout(function () { newTile() }, 100); // Change this to toggle the cheap strat in 2048
        }

        // Update the score
        document.getElementById("current-score").innerHTML = parseInt(document.getElementById("current-score").innerHTML) + timeoutIdArray.length;

        // Check to see if a new futureColor is needed
        if (timeoutIdArray.length > 0) {
            setTimeout(newFutureTile, 100);
        }

        // Erase the old array of removed tiles
        timeoutIdArray = [];

        // Add any new tile colors
        addTiles();
    });

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
        if (!isEdge(row + 1, column)) {
            if (tileArray[row][column] != null) {
                if (document.getElementById("center-tile").style.backgroundColor == tileArray[row][column].style.backgroundColor) {
                    return true;
                } else {
                    return false;
                }
            } else {
                // doesn't matter?
            }
        } else {
            return !tileArray[row + 1][column];
        }
    }

    // Make sure the tile space above is clear
    function checkAbove(row, column) {
        if (!isEdge(row - 1, column)) {
            if (tileArray[row][column] != null) {
                if (document.getElementById("center-tile").style.backgroundColor == tileArray[row][column].style.backgroundColor) {
                    return true;
                } else {
                    return false;
                }
            } else {
                // doesn't matter?
            }
        } else {
            return !tileArray[row - 1][column];
        }
    }

    // Make sure the tile space to the left is clear
    function checkLeft(row, column) {
        if (!isEdge(row, column - 1)) {
            if (tileArray[row][column] != null) {
                if (document.getElementById("center-tile").style.backgroundColor == tileArray[row][column].style.backgroundColor) {
                    return true;
                } else {
                    return false;
                }
            } else {
                // doesn't matter?
            }
        } else {
            return !tileArray[row][column - 1];
        }
    }

    // Make sure the tile space to the right is clear
    function checkRight(row, column) {
        if (!isEdge(row, column + 1)) {
            if (tileArray[row][column] != null) {
                if (document.getElementById("center-tile").style.backgroundColor == tileArray[row][column].style.backgroundColor) {
                    return true;
                } else {
                    return false;
                }
            } else {
                // doesn't matter?
            }
        } else {
            return !tileArray[row][column + 1];
        }
    }

    // Move A SINGLE tile downward
    function moveTileDown(row, column) {
        $(tileArray[row][column]).animate({ "top": "+=121.25px" }, 100);
        tileArray[row + 1][column] = tileArray[row][column];
        tileArray[row][column] = null;
        if (checkRemove(row + 1, column)) {
            timeoutId = setTimeout(function () {
                $(tileArray[row + 1][column]).remove();
                tileArray[row + 1][column] = null;
            }, 200);
            timeoutIdArray.push([timeoutId, row + 1, column]);
        } else {
            tileArray[row + 1][column].setAttribute("id", "tile-" + (parseInt(tileArray[row + 1][column].id.slice(5)) + 4));
        }
    }

    // Move A SINGLE tile upward
    function moveTileUp(row, column) {
        $(tileArray[row][column]).animate({ "top": "-=121.25px" }, 100);
        tileArray[row - 1][column] = tileArray[row][column];
        tileArray[row][column] = null;
        if (checkRemove(row - 1, column)) {
            timeoutId = setTimeout(function () {
                $(tileArray[row - 1][column]).remove();
                tileArray[row - 1][column] = null;
            }, 200);
            timeoutIdArray.push([timeoutId, row - 1, column]);
        } else {
            tileArray[row - 1][column].setAttribute("id", "tile-" + (parseInt(tileArray[row - 1][column].id.slice(5)) - 4));
        }
    }

    // Move A SINGLE tile left
    function moveTileLeft(row, column) {
        $(tileArray[row][column]).animate({ "left": "-=121.25px" }, 100);
        tileArray[row][column - 1] = tileArray[row][column];
        tileArray[row][column] = null;
        if (checkRemove(row, column - 1)) {
            timeoutId = setTimeout(function () {
                $(tileArray[row][column - 1]).remove();
                tileArray[row][column - 1] = null;
            }, 200);
            timeoutIdArray.push([timeoutId, row, column - 1]);
        } else {
            tileArray[row][column - 1].setAttribute("id", "tile-" + (parseInt(tileArray[row][column - 1].id.slice(5)) - 1));
        }
    }

    // Move A SINGLE tile right
    function moveTileRight(row, column) {
        $(tileArray[row][column]).animate({ "left": "+=121.25px" }, 100);
        tileArray[row][column + 1] = tileArray[row][column];
        tileArray[row][column] = null;
        if (checkRemove(row, column + 1)) {
            timeoutId = setTimeout(function () {
                $(tileArray[row][column + 1]).remove();
                tileArray[row][column + 1] = null;
            }, 200);
            timeoutIdArray.push([timeoutId, row, column + 1]);
        } else {
            tileArray[row][column + 1].setAttribute("id", "tile-" + (parseInt(tileArray[row][column + 1].id.slice(5)) + 1));
        }
    }

    // Check to see if a particular tile is removed from the board
    function checkRemove(row, column) {
        if (!isEdge(row, column)) {
            return true;
        } else {
            return false;
        }
    }

    // Finish the old animations
    function finishAnimations() {
        for (row = 0; row <= 3; row++) {
            for (column = 0; column <= 3; column++) {
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
    }

    // Remove all tiles that should be removed EARLY
    function removeTilesEarly() {
        for (var i = 0; i < timeoutIdArray.length; i++) {
            removeTileEarly(timeoutIdArray[i][0], timeoutIdArray[i][1], timeoutIdArray[i][2]);
        }
    }

    // Remove a tile from the board EARLY (This is the same code as what's in each setTimeout up above, but I have to hardcode it there for reasons).
    function removeTileEarly(id, row, column) {
        clearTimeout(id);
        $(tileArray[row][column]).remove();
        tileArray[row][column] = null;
    }

    function addTiles() {
        var currentScore = parseInt(document.getElementById("current-score").innerHTML);
        if (currentScore >= 10 && !yellowActivated) {
            yellowActivated = true;
            colorArray.push("yellow");
        }
        if (currentScore >= 20 && !greenActivated) {
            greenActivated = true;
            colorArray.push("green");
        }
        if (currentScore >= 50 && !purpleActivated) {
            purpleActivated = true;
            colorArray.push("purple");
        }
        if (currentScore >= 100 && !orangeActivated) {
            orangeActivated = true;
            colorArray.push("orange");
        }
        if (currentScore >= 200 && !pinkActivated) {
            pinkActivated = true;
            colorArray.push("pink");
        }
        if (currentScore >= 500 && !tealActivated) {
            tealActivated = true;
            colorArray.push("teal");
        }
        if (currentScore >= 1000 && !brownActivated) {
            brownActivated = true;
            colorArray.push("brown");
        }
        if (currentScore >= 2000 && !grayActivated) {
            grayActivated = true;
            colorArray.push("gray");
        }
        if (currentScore >= 5000 && !blackActivated) {
            blackActivated = true;
            colorArray.push("black");
        }
        if (currentScore >= 10000 && !whiteActivated) {
            whiteActivated = true;
            colorArray.push("white");
        }
    }




    ////////////////////// End of real code

    var $tile;
    var parentDiv;
    var $work;
    var $testTile;

    $(document).keydown(function (e) {
        if (e.keyCode == 70) {
            $tile = $("#grid-cell-1");
            $tile.fadeIn("slow");
            $tile.css("background-color", "blue");
            $tile.css("height", "100px");
            $tile.css("width", "100px");
        }
    });

    $(document).keydown(function (e) {
        if (e.keyCode == 69) {
            $testTile = document.createElement("div");
            $testTile.setAttribute("id", "testTile");
            parentDiv = document.getElementById("tile-container");
            parentDiv.insertBefore($testTile, null);

            $work = $("#testTile");
            $work.hide().fadeIn("slow");
            $work.css("background-color", "red");
            $work.css("height", "100px");
            $work.css("width", "100px");
            $work.css("display", "block");
        }
    });

    $(document).keydown(function (e) {
        if (e.keyCode == 68) {
            $testTile = document.createElement("div");
            $testTile.setAttribute("id", "testTile2");
            parentDiv = document.getElementById("tile-container");
            parentDiv.insertBefore($testTile, null);

            $work = $("#testTile2");
            $work.hide().fadeIn("slow");
            $work.css("background-color", "yellow");
            $work.css("height", "100px");
            $work.css("width", "100px");
            $work.css("display", "block");
        }
    });
});