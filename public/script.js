document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector("#minesweeper");
    const mineCounter = document.querySelector("#mines-left");
    const restartButton = document.querySelector("#restart-button");
    const timerElement = document.querySelector("#timer");
    const playerNameInput = document.querySelector("#player-name");
    const submitNameButton = document.querySelector("#submit-name");
    const recordTable = document.querySelector("#record-table");
    const width = 10;
    const mineCount = 20;
    let minesLeft = mineCount;
    let cells = [];
    let isGameOver = false;
    let timer;
    let seconds = 0;
    let playerName = "";

    function fetchRecords() {
        fetch('/records')
            .then(response => response.json())
            .then(data => {
                recordTable.innerHTML = '';
                data.forEach(record => {
                    addRecordToTable(record.name, record.time);
                });
            });
    }

    function createBoard() {
        // Clear previous game data
        clearInterval(timer);
        seconds = 0;
        timerElement.textContent = seconds;
        grid.innerHTML = ''; // Clear the grid
        cells = [];
        isGameOver = false;
        minesLeft = mineCount;
        mineCounter.textContent = minesLeft;

        // Generate mines and empty cells
        const minesArray = Array(mineCount).fill("mine");
        const emptyArray = Array(width * width - mineCount).fill("empty");
        const gameArray = emptyArray.concat(minesArray).sort(() => Math.random() - 0.5);

        for (let i = 0; i < width * width; i++) {
            const cell = document.createElement("div");
            cell.setAttribute("id", i);
            cell.classList.add("cell", "hidden");
            cell.setAttribute("data-type", gameArray[i]); // Use data-type to store mine information
            grid.appendChild(cell);
            cells.push(cell);

            // Normal click
            cell.addEventListener("click", function (e) {
                if (!isGameOver && seconds === 0) {
                    startTimer();
                }
                click(cell);
            });

            // Right click
            cell.oncontextmenu = function (e) {
                e.preventDefault();
                if (!isGameOver && seconds === 0) {
                    startTimer();
                }
                addFlag(cell);
            };
        }

        // Add numbers
        for (let i = 0; i < cells.length; i++) {
            let total = 0;
            const isLeftEdge = (i % width === 0);
            const isRightEdge = (i % width === width - 1);

            if (cells[i].getAttribute("data-type") === "empty") {
                // Check surrounding cells
                if (i > 0 && !isLeftEdge && cells[i - 1].getAttribute("data-type") === "mine") total++;
                if (i > 9 && !isRightEdge && cells[i + 1 - width].getAttribute("data-type") === "mine") total++;
                if (i > 10 && cells[i - width].getAttribute("data-type") === "mine") total++;
                if (i > 11 && !isLeftEdge && cells[i - 1 - width].getAttribute("data-type") === "mine") total++;
                if (i < 98 && !isRightEdge && cells[i + 1].getAttribute("data-type") === "mine") total++;
                if (i < 90 && !isLeftEdge && cells[i - 1 + width].getAttribute("data-type") === "mine") total++;
                if (i < 88 && !isRightEdge && cells[i + 1 + width].getAttribute("data-type") === "mine") total++;
                if (i < 89 && cells[i + width].getAttribute("data-type") === "mine") total++;
                cells[i].setAttribute("data", total);
            }
        }

        // Hide restart button
        restartButton.style.display = 'none';
    }

    // Start the timer
    function startTimer() {
        timer = setInterval(() => {
            seconds++;
            timerElement.textContent = seconds;
        }, 1000);
    }

    // Handle cell click
    function click(cell) {
        if (isGameOver) return;
        if (cell.classList.contains("flag")) return;
        if (cell.getAttribute("data-type") === "mine") {
            gameOver(cell);
        } else {
            let total = cell.getAttribute("data");
            if (total != 0) {
                cell.classList.remove("hidden");
                cell.classList.add("number");
                cell.innerHTML = total;
                return;
            }
            cell.classList.remove("hidden");
            checkCell(cell.id);
        }
        checkForWin();
    }

    // Check neighboring cells recursively
    function checkCell(cellId) {
        const isLeftEdge = (cellId % width === 0);
        const isRightEdge = (cellId % width === width - 1);

        setTimeout(() => {
            if (cellId > 0 && !isLeftEdge) {
                const newId = cells[parseInt(cellId) - 1].id;
                const newCell = document.getElementById(newId);
                click(newCell);
            }
            if (cellId > 9 && !isRightEdge) {
                const newId = cells[parseInt(cellId) + 1 - width].id;
                const newCell = document.getElementById(newId);
                click(newCell);
            }
            if (cellId > 10) {
                const newId = cells[parseInt(cellId - width)].id;
                const newCell = document.getElementById(newId);
                click(newCell);
            }
            if (cellId > 11 && !isLeftEdge) {
                const newId = cells[parseInt(cellId) - 1 - width].id;
                const newCell = document.getElementById(newId);
                click(newCell);
            }
            if (cellId < 98 && !isRightEdge) {
                const newId = cells[parseInt(cellId) + 1].id;
                const newCell = document.getElementById(newId);
                click(newCell);
            }
            if (cellId < 90 && !isLeftEdge) {
                const newId = cells[parseInt(cellId) - 1 + width].id;
                const newCell = document.getElementById(newId);
                click(newCell);
            }
            if (cellId < 88 && !isRightEdge) {
                const newId = cells[parseInt(cellId) + 1 + width].id;
                const newCell = document.getElementById(newId);
                click(newCell);
            }
            if (cellId < 89) {
                const newId = cells[parseInt(cellId) + width].id;
                const newCell = document.getElementById(newId);
                click(newCell);
            }
        }, 10);
    }

    // Add flag on right-click
    function addFlag(cell) {
        if (isGameOver) return;
        if (!cell.classList.contains("hidden")) return;
        if (!cell.classList.contains("flag")) {
            cell.classList.add("flag");
            cell.innerHTML = "🚩";
            minesLeft--;
        } else {
            cell.classList.remove("flag");
            cell.innerHTML = "";
            minesLeft++;
        }
        mineCounter.textContent = minesLeft;
        checkForWin();
    }

    // Check for win condition
    function checkForWin() {
        let matches = 0;
        cells.forEach(cell => {
            if (cell.classList.contains("flag") && cell.getAttribute("data-type") === "mine") {
                matches++;
            }
        });
        if (matches === mineCount) {
            isGameOver = true;
            clearInterval(timer);
            addRecord(playerName, seconds);
            restartButton.style.display = 'block';
        }
    }

    // Game over
    function gameOver(cell) {
        isGameOver = true;
        clearInterval(timer);
        cells.forEach(cell => {
            if (cell.getAttribute("data-type") === "mine") {
                cell.classList.remove("hidden");
                cell.classList.add("mine");
                cell.innerHTML = "💣";
            }
        });
        cell.innerHTML = "💥";
        addRecord(playerName, seconds);
        restartButton.style.display = 'block';
    }

    // Add a record to the table
    function addRecord(name, time) {
        if (!name) return;
        fetch('/records', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, time })
        }).then(fetchRecords);
    }

    function addRecordToTable(name, time) {
        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        const timeCell = document.createElement("td");
        nameCell.textContent = name;
        timeCell.textContent = time;
        row.appendChild(nameCell);
        row.appendChild(timeCell);
        recordTable.appendChild(row);
    }

    // Handle name submission
    submitNameButton.addEventListener("click", () => {
        playerName = playerNameInput.value;
    });

    // Restart the game
    restartButton.addEventListener('click', createBoard);

    createBoard();
    fetchRecords(); // Fetch records when the page loads
});
