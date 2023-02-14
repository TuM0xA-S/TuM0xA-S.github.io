// game settings
const startButton = document.querySelector("#setting-apply");
const cellSizeTextbox = document.querySelector("#setting-cell-size");
const cellCountVerticalTextbox = document.querySelector("#setting-count-vertical");
const cellCountHorizontalTextbox = document.querySelector("#setting-count-horizontal");
const clickCountTextBox = document.querySelector("#setting-click-count");
const simultaneuslyCountTextBox = document.querySelector("#setting-simultaneously-count");
const tableContainer = document.querySelector("#table-container");
// metrics
const metricsClickCountElem = document.querySelector("#metrics-click-count");
const metricsLastTimeElem = document.querySelector("#metrics-last-time");
const metricsAverageTimeElem = document.querySelector("#metrics-average-time");
const metricsTotalTimeElem = document.querySelector("#metrics-total-time");

function Cell(elem, table) {
    this.elem = elem;
    this.table = table;
    this.toggleMarked = () => this.elem.classList.toggle("marked");
    this.isMarked = () => this.elem.classList.contains("marked");
    this.elem.onmousedown = () => {
        if (!this.isMarked() || this.table.ended) return;

        this.toggleMarked();
        this.table.nextClick();
    }
}

function randIntN(n) {
    return Math.trunc(Math.random() * n);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = randIntN(i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}


function TableClicker(tableElem, simCount, count) {
    this.t = Array.from(tableElem.rows).map(row => Array.from(row.cells).map(e => new Cell(e, this)));
    this.elem = tableElem;
    this.clickTarget = count;
    this.simCount = simCount;
    this.startTime = undefined;
    this.lastClickTime = undefined;
    this.clickCount = 0;
    this.prevLastClickTime = 0;
    this.ended = false;

    this.markCells = (count) => {
        const unmarkedCells = this.t.flat().filter(c => !c.isMarked());
        shuffleArray(unmarkedCells).slice(0, count).forEach(c => c.toggleMarked());
        return unmarkedCells;
    };
    this.nextClick = () => {
        this.prevLastClickTime = this.lastClickTime;
        this.lastClickTime = Date.now();
        this.clickCount++;
        this.updateMetrics();
        if (this.clickCount >= this.clickTarget) {
            this.turnEndGame()
            if (this.onend != undefined) this.onend();
            return;
        }
        if (this.markedCount() + this.clickCount < this.clickTarget) {
            this.markCells(1);
        }
    };
    this.markedCount = () => this.t.flat().filter(c => c.isMarked()).length
    this.resetMetrics = () => {
        metricsClickCountElem.textContent = "0";
        metricsLastTimeElem.textContent = "0";
        metricsAverageTimeElem.textContent = "0";
        metricsTotalTimeElem.textContent = "0";
    };
    this.updateMetrics = () => {
        metricsClickCountElem.textContent = `${this.clickCount}/${this.clickTarget}`;
        metricsAverageTimeElem.textContent = ((Date.now() - this.startTime) / this.clickCount / 1000).toFixed(2);
        metricsLastTimeElem.textContent = ((this.lastClickTime - this.prevLastClickTime) / 1000).toFixed(2);
        metricsTotalTimeElem.textContent = ((Date.now() - this.startTime) / 1000).toFixed(2);
    };
    this.turnEndGame = () => {
        this.ended = true;
        this.elem.classList.add("table-endgame");
    }
    this.run = () => {
        this.elem.classList.remove("table-endgame");
        this.startTime = Date.now();
        this.lastClickTime = Date.now();
        this.resetMetrics();
        this.markCells(this.simCount)
    };
}

function isIntNumber(n) {
    return n == n && n > 0;
}

startButton.onclick = function () {
    const countH = +Math.trunc(cellCountHorizontalTextbox.value);
    const countV = +Math.trunc(cellCountVerticalTextbox.value);
    const size = +Math.trunc(cellSizeTextbox.value);
    const clickTarget = +Math.trunc(clickCountTextBox.value);
    const simultaneousCount = +Math.trunc(simultaneuslyCountTextBox.value)
    if (![countH, countV, size, clickTarget, simultaneousCount].every(isIntNumber)) {
        alert("all values should be natural numbers");
        return;
    }

    if (simultaneousCount > countH * countV) {
        alert("simultaneousCount bigger than table size")
        return;
    }

    const tableElem = document.createElement("table");
    for (let i = 0; i < countV; i++) {
        const row = document.createElement("tr");
        tableElem.append(row);
        for (let j = 0; j < countH; j++) {
            const cell = document.createElement("td");
            cell.style.width = cell.style.height = size + "px";
            row.append(cell);
        }
    }
    tableContainer.replaceChildren(tableElem)

    const clicker = new TableClicker(tableElem, simultaneousCount, clickTarget);
    setTimeout(clicker.run, 1000);
};