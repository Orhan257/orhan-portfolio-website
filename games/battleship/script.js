document.addEventListener("DOMContentLoaded", () => {
  
  const introScreen = document.getElementById("intro-screen");
  const introStartButton = document.getElementById("intro-start-button");
  // --- DOM Elements ---
  const countrySelectionScreen = document.getElementById(
    "country-selection-screen"
  );
  const gameScreen = document.getElementById("game-screen");

  const playerFlagContainer = document.getElementById("player-flag-container");
  const enemyFlagContainer = document.getElementById("enemy-flag-container");
  const playerSelectedFlagText = document.getElementById(
    "playerSelectedFlagText"
  );
  const enemySelectedFlagText = document.getElementById(
    "enemySelectedFlagText"
  );
  const continueGameButton = document.getElementById("continue-game-button");
  const countrySelectionMessage = document.getElementById(
    "country-selection-message"
  );

  const playerBoardElement = document.getElementById("player-board");
  const computerBoardElement = document.getElementById("computer-board");
  const rotateButton = document.getElementById("rotate-ship");
  const startGameButton = document.getElementById("start-game-button");
  const messageDisplay = document.getElementById("message");

  const playerTitle = document.getElementById("player-title");
  const computerTitle = document.getElementById("computer-title");

  // --- Game Variables ---

  const boardRows = 10;
  const boardCols = 10;
  const boardSize = boardRows * boardCols;

  let playerShips = [];
  let computerShips = [];

  const shipLengths = [5, 4, 4, 3, 3];
  let currentShipIndex = 0;
  let isHorizontal = true;
  let gameStarted = false;
  let playerTurn = true;

  let botHitLastTurn = false;
  let botLastHitCell = -1;
  let botPossibleTargets = [];

  // --- Country Data  ---
  
  const countries = [
    { id: "us", name: "USA", flag: "usaflag.png" },
    { id: "russia", name: "Russia", flag: "russiaflag.png" },
    { id: "china", name: "China", flag: "chinaflag.png" },
    { id: "uk", name: "UK", flag: "ukflag.png" },
    {
      id: "france",
      name: "France",
      flag: "franceflag.png",
    },
    {
      id: "japan",
      name: "Japan",
      flag: "japanflag.png",
    },
    { id: "southkorea", name: "South Korea", flag: "southkoreaflag.png" },
    { id: "northkorea", name: "North Korea", flag: "northkoreaflag.png" },
    {
      id: "netherlands",
      name: "Netherlands",
      flag: "netherlandsflag.png",
    },
    { id: "turkey", name: "Turkey", flag: "turkeyflag.png" },
  ];

  let selectedPlayerCountry = null;
  let selectedEnemyCountry = null;

  // --- Utility Functions ---
  
  function showScreen(screenToShow) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active");
      screen.classList.add("hidden");
    });
    screenToShow.classList.remove("hidden");
    screenToShow.classList.add("active");
  }

  // --- Intro Screen Logic ---
  
  introStartButton.addEventListener("click", () => {
    showScreen(countrySelectionScreen);

    if (playerFlagContainer.children.length === 0) {

      renderFlags(playerFlagContainer, "player");
    }
    if (enemyFlagContainer.children.length === 0) {
      renderFlags(enemyFlagContainer, "enemy");
    }
    checkCountrySelectionsReady(); // Ensure initial message and button state are correct
  });

  // --- Country Selection Logic ---
  
  function renderFlags(containerElement, selectionType) {
    containerElement.innerHTML = "";
    countries.forEach((country) => {
      const flagDiv = document.createElement("div");
      flagDiv.classList.add("flag");
      flagDiv.dataset.countryId = country.id;

      const img = document.createElement("img");
      img.src = country.flag;
      img.alt = `${country.name} Flag`;

      flagDiv.appendChild(img);
      containerElement.appendChild(flagDiv);

      flagDiv.addEventListener("click", () => {
        selectFlag(country, selectionType);
      });
    });
  }

  function selectFlag(country, selectionType) {
    let currentSelection;
    let selectionTextElement;
    let containerElement;

    if (selectionType === "player") {
      currentSelection = selectedPlayerCountry;
      selectedPlayerCountry = country;
      selectionTextElement = playerSelectedFlagText;
      containerElement = playerFlagContainer;
    } else {
      currentSelection = selectedEnemyCountry;
      selectedEnemyCountry = country;
      selectionTextElement = enemySelectedFlagText;
      containerElement = enemyFlagContainer;
    }

    if (currentSelection) {
      const prevSelectedFlag = containerElement.querySelector(
        `.flag[data-country-id="${currentSelection.id}"]`
      );
      if (prevSelectedFlag) {
        prevSelectedFlag.classList.remove("selected");
      }
    }

    const newSelectedFlag = containerElement.querySelector(
      `.flag[data-country-id="${country.id}"]`
    );
    if (newSelectedFlag) {
      newSelectedFlag.classList.add("selected");
    }

    selectionTextElement.textContent = `Selected Flag: ${country.name}`;
    checkCountrySelectionsReady();
  }

  function checkCountrySelectionsReady() {
    if (selectedPlayerCountry && selectedEnemyCountry) {
      if (selectedPlayerCountry.id === selectedEnemyCountry.id) {
        countrySelectionMessage.textContent =
          "You cannot select the same country for both player and opponent!";
        continueGameButton.disabled = true;
      } else {
        countrySelectionMessage.textContent =
          'Countries selected. Click "Continue to Game" to proceed.';
        continueGameButton.disabled = false;
      }
    } else {
      countrySelectionMessage.textContent =
        "Please select a country for both yourself and your opponent.";
      continueGameButton.disabled = true;
    }
  }

  continueGameButton.addEventListener("click", () => {
    if (
      selectedPlayerCountry &&
      selectedEnemyCountry &&
      selectedPlayerCountry.id !== selectedEnemyCountry.id
    ) {

      playerTitle.innerHTML = `Your Board <img src="${selectedPlayerCountry.flag}" alt="${selectedPlayerCountry.name} Flag" class="flag-icon">`;

      computerTitle.innerHTML = `Opponent's Board <img src="${selectedEnemyCountry.flag}" alt="${selectedEnemyCountry.name} Flag" class="flag-icon">`;

      showScreen(gameScreen);
      initializeGame();
    }
  });

  // --- Game Initialization ---
  
  function createBoard(boardElement, isPlayerBoard) {
    boardElement.innerHTML = "";
    for (let i = 0; i < boardSize; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.id = i;
      cell.dataset.row = Math.floor(i / boardCols);
      cell.dataset.col = i % boardCols;

      if (isPlayerBoard) {
        cell.addEventListener("mouseover", handlePlayerShipPreview);
        cell.addEventListener("mouseout", clearPlayerShipPreview);
        cell.addEventListener("click", placePlayerShip);
      }
      boardElement.appendChild(cell);
    }
  }
  // --- Player Ship Placement Logic ---
  function handlePlayerShipPreview(e) {
    if (gameStarted || currentShipIndex >= shipLengths.length) return;

    const startId = parseInt(e.target.dataset.id);
    const currentRow = parseInt(e.target.dataset.row);
    const currentCol = parseInt(e.target.dataset.col);
    const currentShipLength = shipLengths[currentShipIndex];

    let cellsToHighlight = [];
    let isValidPlacement = true;

    playerBoardElement.querySelectorAll(".cell").forEach((cell) => {
      cell.classList.remove("ship-placement-active", "invalid-placement");
    });

    for (let i = 0; i < currentShipLength; i++) {
      let cellId;
      let targetRow, targetCol;

      if (isHorizontal) {
        cellId = startId + i;
        targetRow = currentRow;
        targetCol = currentCol + i;
        if (targetCol >= boardCols || targetRow !== currentRow) {
          isValidPlacement = false;
          break;
        }
      } else {
        cellId = startId + i * boardCols;
        targetRow = currentRow + i;
        targetCol = currentCol;
        if (targetRow >= boardRows || targetCol !== currentCol) {
          isValidPlacement = false;
          break;
        }
      }

      if (
        playerBoardElement.children[cellId] &&
        !playerBoardElement.children[cellId].classList.contains("occupied")
      ) {
        cellsToHighlight.push(playerBoardElement.children[cellId]);
      } else {
        isValidPlacement = false;
        break;
      }
    }

    if (isValidPlacement) {
      cellsToHighlight.forEach((cell) =>
        cell.classList.add("ship-placement-active")
      );
    } else {
      e.target.classList.add("invalid-placement");
    }
  }

  function clearPlayerShipPreview() {
    playerBoardElement.querySelectorAll(".cell").forEach((cell) => {
      cell.classList.remove("ship-placement-active", "invalid-placement");
    });
  }

  function placePlayerShip(e) {
    if (gameStarted || currentShipIndex >= shipLengths.length) return;

    const startId = parseInt(e.target.dataset.id);
    const currentRow = parseInt(e.target.dataset.row);
    const currentCol = parseInt(e.target.dataset.col);
    const currentShipLength = shipLengths[currentShipIndex];

    let newShipCells = [];
    let isValidPlacement = true;

    for (let i = 0; i < currentShipLength; i++) {
      let cellId;
      let targetRow, targetCol;

      if (isHorizontal) {
        cellId = startId + i;
        targetRow = currentRow;
        targetCol = currentCol + i;
        if (targetCol >= boardCols || targetRow !== currentRow) {
          isValidPlacement = false;
          break;
        }
      } else {
        cellId = startId + i * boardCols;
        targetRow = currentRow + i;
        targetCol = currentCol;
        if (targetRow >= boardRows || targetCol !== currentCol) {
          isValidPlacement = false;
          break;
        }
      }

      if (
        playerBoardElement.children[cellId] &&
        !playerBoardElement.children[cellId].classList.contains("occupied")
      ) {
        newShipCells.push(cellId);
      } else {
        isValidPlacement = false;
        break;
      }
    }

    if (isValidPlacement) {
      newShipCells.forEach((id) => {
        playerBoardElement.children[id].classList.add(
          "occupied",
          "player-ship"
        );
      });
      playerShips.push(newShipCells);
      currentShipIndex++;
      clearPlayerShipPreview();

      if (currentShipIndex < shipLengths.length) {
        messageDisplay.textContent = `Place your ${shipLengths[currentShipIndex]} length ship.`;
      } else {
        messageDisplay.textContent =
          'All your ships are placed. Click "Start Game" to begin!';
        startGameButton.disabled = false;
        rotateButton.disabled = true;
      }
    } else {
      messageDisplay.textContent =
        "Cannot place ship here. Try another spot or rotate.";
    }
  }

  rotateButton.addEventListener("click", () => {
    if (gameStarted || currentShipIndex >= shipLengths.length) return;
    isHorizontal = !isHorizontal;
    messageDisplay.textContent = `Ship orientation: ${
      isHorizontal ? "Horizontal" : "Vertical"
    }.`;
  });

  function placeComputerShips() {
    computerShips.length = 0;
    const allCells = [];
    for (let i = 0; i < boardSize; i++) {
      allCells.push(i);
    }

    for (const length of shipLengths) {
      let placed = false;
      while (!placed) {
        const isHorizontal = Math.random() < 0.5;
        let startPos;
        let validPlacement = true;

        if (isHorizontal) {
          startPos = Math.floor(Math.random() * boardSize);
          const startCol = startPos % boardCols;
          if (startCol + length > boardCols) {
            validPlacement = false;
          }
        } else {
          startPos = Math.floor(Math.random() * boardSize);
          const startRow = Math.floor(startPos / boardCols);
          if (startRow + length > boardRows) {
            validPlacement = false;
          }
        }

        const newShipCells = [];
        if (validPlacement) {
          for (let i = 0; i < length; i++) {
            const cellId = isHorizontal
              ? startPos + i
              : startPos + i * boardCols;
            if (
              computerShips.flat().includes(cellId) ||
              cellId < 0 ||
              cellId >= boardSize ||
              (isHorizontal &&
                Math.floor(cellId / boardCols) !==
                  Math.floor(startPos / boardCols))
            ) {
              validPlacement = false;
              break;
            }
            newShipCells.push(cellId);
          }
        }

        if (validPlacement) {
          computerShips.push(newShipCells);
          placed = true;
        }
      }
    }
  }

  startGameButton.addEventListener("click", () => {
    if (currentShipIndex < shipLengths.length) {
      messageDisplay.textContent =
        "Please place all your ships before starting the game!";
      return;
    }
    gameStarted = true;
    startGameButton.disabled = true;

    playerBoardElement.querySelectorAll(".cell").forEach((cell) => {
      cell.removeEventListener("mouseover", handlePlayerShipPreview);
      cell.removeEventListener("mouseout", clearPlayerShipPreview);
      cell.removeEventListener("click", placePlayerShip);
    });

    messageDisplay.textContent =
      "Game started! Click on the opponent's board to fire.";
  });

  computerBoardElement.addEventListener("click", handlePlayerShot);

  function handlePlayerShot(e) {
    if (!gameStarted || !playerTurn) return;

    const cell = e.target;
    const cellId = parseInt(cell.dataset.id);

    if (cell.classList.contains("hit") || cell.classList.contains("miss")) {
      messageDisplay.textContent = "You already fired at this spot!";
      return;
    }

    let isHit = false;
    let shipSunk = false;
    computerShips.forEach((ship) => {
      if (ship.includes(cellId)) {
        isHit = true;
        ship.splice(ship.indexOf(cellId), 1);
        if (ship.length === 0) {
          shipSunk = true;
        }
      }
    });

    if (isHit) {
      cell.classList.add("hit");
      messageDisplay.textContent = "It's a hit!";
      if (shipSunk) {
        messageDisplay.textContent += ` You sank a ${selectedEnemyCountry.name} ship!`;
      }
    } else {
      cell.classList.add("miss");
      messageDisplay.textContent = "You missed!";
    }

    if (checkWin(computerShips)) {
      messageDisplay.textContent = "Congratulations! You won the game!";
      gameStarted = false;
      computerBoardElement.removeEventListener("click", handlePlayerShot);
      return;
    }

    playerTurn = false;
    messageDisplay.textContent += " Opponent's turn...";
    setTimeout(computerTurn, 1500);
  }

  function computerTurn() {
    if (!gameStarted) return;

    let targetCellId;
    const availableCells = [];

    if (botHitLastTurn && botPossibleTargets.length > 0) {
      targetCellId = botPossibleTargets.shift();
      const targetCell = playerBoardElement.children[targetCellId];
      if (
        targetCell.classList.contains("hit") ||
        targetCell.classList.contains("miss")
      ) {
        computerTurn();
        return;
      }
    } else {
      for (let i = 0; i < boardSize; i++) {
        const cell = playerBoardElement.children[i];
        if (
          !cell.classList.contains("hit") &&
          !cell.classList.contains("miss")
        ) {
          availableCells.push(i);
        }
      }
      if (availableCells.length === 0) {
        return;
      }
      targetCellId =
        availableCells[Math.floor(Math.random() * availableCells.length)];
      botHitLastTurn = false;
      botPossibleTargets = [];
    }

    const cell = playerBoardElement.children[targetCellId];
    let isHit = false;
    let shipSunk = false;

    playerShips.forEach((ship) => {
      if (ship.includes(targetCellId)) {
        isHit = true;
        ship.splice(ship.indexOf(targetCellId), 1);
        if (ship.length === 0) {
          shipSunk = true;
        }
      }
    });

    if (isHit) {
      cell.classList.add("hit");
      messageDisplay.textContent = "Opponent hit your ship!";
      botHitLastTurn = true;
      botLastHitCell = targetCellId;

      if (shipSunk) {
        messageDisplay.textContent += ` Opponent sank your ${selectedPlayerCountry.name} ship!`;
        botHitLastTurn = false;
        botPossibleTargets = [];
      } else {
        const hitRow = Math.floor(targetCellId / boardCols);
        const hitCol = targetCellId % boardCols;

        const potentialTargets = [
          [hitRow - 1, hitCol], // Up
          [hitRow + 1, hitCol], // Down
          [hitRow, hitCol - 1], // Left
          [hitRow, hitCol + 1], // Right
        ];

        botPossibleTargets = [];
        potentialTargets.forEach(([r, c]) => {
          if (r >= 0 && r < boardRows && c >= 0 && c < boardCols) {
            const id = r * boardCols + c;
            const targetCell = playerBoardElement.children[id];
            if (
              targetCell &&
              !targetCell.classList.contains("hit") &&
              !targetCell.classList.contains("miss")
            ) {
              botPossibleTargets.push(id);
            }
          }
        });
      }
    } else {
      cell.classList.add("miss");
      messageDisplay.textContent = "Opponent missed!";
      botHitLastTurn = false;
      botPossibleTargets = [];
    }

    if (checkWin(playerShips)) {
      messageDisplay.textContent = `You lost! ${selectedEnemyCountry.name} won the game!`;
      gameStarted = false;
      return;
    }

    playerTurn = true;
    messageDisplay.textContent += " Your turn!";
  }

  function checkWin(shipsArray) {
    return shipsArray.every((ship) => ship.length === 0);
  }

  function initializeGame() {
    playerShips = [];
    computerShips = [];
    currentShipIndex = 0;
    isHorizontal = true;
    gameStarted = false;
    playerTurn = true;
    botHitLastTurn = false;
    botLastHitCell = -1;
    botPossibleTargets = [];

    createBoard(playerBoardElement, true);
    createBoard(computerBoardElement, false);
    placeComputerShips();

    messageDisplay.textContent = `Place your ${shipLengths[currentShipIndex]} length ship. Use "Rotate Ship" to change orientation.`;
    startGameButton.disabled = true;
    rotateButton.disabled = false;
  }

  // --- Initial Load ---

  showScreen(introScreen);
});
