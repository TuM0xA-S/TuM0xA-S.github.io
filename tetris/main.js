"use strict";

class Grid {
    constructor(n, m) {
        this.n = n;
        this.m = m;
        const table = document.createElement("table");
        for (let i = 0; i < n; i++) {
            const row = document.createElement("tr");
            table.append(row);
            for (let j = 0; j < m; j++) {
                const cell = document.createElement("td");
                cell.append(document.createElement("div"));
                row.append(cell);
            }
        }
        this.grid = table;
    }
    getElement() {
        return this.grid;
    }
    set(row, col, tag) {
        const cell = this.grid.rows[row].cells[col].firstElementChild;
        if (!tag) {
            cell.className = "";
            return;
        }
        cell.className = "tagged " + tag;
    }
    setFrom(grid) {
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.m; j++) {
                this.set(i, j, null);
            }
        }
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[0].length; j++) {
                this.set(i, j, grid[i][j]);
            }
        }
    }
}

const TETRIS_GRID_ROWS = 20;
const TETRIS_GRID_COLS = 10;
const FIGURE_GRID_ROWS = 4;
const FIGURE_GRID_COLS = 4;
const TETRIS_LINES_PER_LEVEL = 20;
// tag used as css class for coloring
// через дроч размеров матрицы можно менять центр прокрутки
// типо заполнять нулями чтобы центр прокрутки в центре матрицы
// топ идея добавить интерфейс добавления фигур
// чтобы можно было открыть список поменять фигуры удалить добавить новые
// и дальше каждая игра как новая
const figures = [
    {
        tag: "cube",
        geom: [
            [1, 1],
            [1, 1],
        ]
    },
    {
        tag: "bar",
        geom: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
        ]
    },
    {
        tag: "rboot",
        geom: [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1],
        ]
    },
    {
        tag: "lboot",
        geom: [
            [0, 1, 0,],
            [0, 1, 0,],
            [1, 1, 0,],
        ]
    },
    {
        tag: "tform",
        geom: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ]
    },
    {
        tag: "lzed",
        geom: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ]
    },
    {
        tag: "rzed",
        geom: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ]
    },
];

class Figure {
    constructor(geom, tag, geomReady = false) {
        this.tag = tag;
        this.n = geom.length;
        this.m = geom[0].length;
        if (geomReady) {
            this.geom = geom;
            return;
        }
        this.geom = [];
        for (let line of geom) {
            this.geom.push(line.map(v => v ? tag : null));
        }
    }
    getGeom() {
        return this.geom;
    }
    rotate() {
        const rot = [];
        for (let i = 0; i < this.m; i++) {
            rot.push(new Array(this.n));
        }
        // transponing
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.m; j++) {
                rot[j][i] = this.geom[i][j];
            }
        }
        // чтобы крутить налево
        // rot.reverse();
        // rotate right
        for (let row of rot) {
            row.reverse();
        }

        return new Figure(rot, this.tag, true);
    }
}

class Tetris {
    constructor() {
        this.n = TETRIS_GRID_ROWS;
        this.m = TETRIS_GRID_COLS;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.grid = [];
        this.lose = false;
        for (let i = 0; i < this.n; i++) {
            this.grid.push(new Array(this.m).fill(null));
        }
        this.coords = {
            row: 0,
            col: 0,
        };
        this.curFig = null;
        this.nextFig = null;
        this.newNextFigure();
        this.spawnFigure();
        this.newNextFigure();
    }
    getScore() {
        return this.score;
    }
    getLines() {
        return this.lines;
    }
    getLevel() {
        return this.level;
    }
    isPlaying() {
        return !this.lose;
    }
    getGrid() {
        const grid = [];
        for (let row of this.grid) {
            grid.push(row.slice());
        }

        this.freezeFigure(grid)
        return grid;
    }
    getNextFigure() {
        return this.nextFig.geom;
    }
    update() {
        if (this.lose || !this.fall()) {
            return;
        }
        this.freezeFigure();
        this.processLines();
        this.spawnFigure();
        this.newNextFigure();
        if (this.checkCollision()) {
            this.lose = true;
        }
    }
    processLines() {
        let filledLines = this.grid.map(r => r.every(c => c));
        if (!filledLines.includes(true)) {
            return;
        }
        let linesCount = 0;
        let i = filledLines.length - 1;
        for (; i >= 0 && filledLines[i]; i--) {
            linesCount++;
        }
        this.score += linesCount ** 2;

        for (; i >= 0; i--) {
            if (filledLines[i]) {
                linesCount++;
                this.score++;
            }
        }

        this.lines += linesCount;

        let grid = [];
        for (let i = 0; i < linesCount; i++) {
            grid[i] = new Array(this.m).fill(null);
        }

        this.grid = grid.concat(this.grid.filter((v, i) => !filledLines[i]));

        if (this.lines % TETRIS_LINES_PER_LEVEL == 0) {
            this.level++;
        }
    }
    freezeFigure(grid) {
        if (!grid) {
            grid = this.grid;
        }
        for (let i = 0; i < this.curFig.n; i++) {
            for (let j = 0; j < this.curFig.m; j++) {
                if (this.curFig.geom[i][j]) {
                    grid[this.coords.row + i][this.coords.col + j] = this.curFig.geom[i][j];
                }
            }
        }
    }
    getResult() {

    }
    newNextFigure() {
        const fig = figures[randIntN(figures.length)];
        this.nextFig = new Figure(fig.geom, fig.tag);
    }
    spawnFigure() {
        this.curFig = this.nextFig;
        this.coords.row = 0;
        this.coords.col = randIntN(TETRIS_GRID_COLS - this.curFig.m + 1);
    }
    fall() {
        if (this.checkCollision(this.curFig, { row: this.coords.row + 1 })) {
            return true;
        }
        this.coords.row++;

        return false;
    }
    checkCollision(fig, { col = null, row = null } = {}) {
        col = col ?? this.coords.col;
        row = row ?? this.coords.row;
        fig = fig ?? this.curFig;

        // fallen on other figures
        for (let i = 0; i < fig.n; i++) {
            for (let j = 0; j < fig.m; j++) {
                if (!fig.geom[i][j]) {
                    continue;
                }
                let ci = row + i;
                let cj = col + j;
                if (ci >= this.n || cj >= this.m ||
                    ci < 0 || cj < 0 ||
                    this.grid[row + i][col + j]
                ) {
                    return true;
                }
            }
        }
        return false;
    }
    moveDown() {
        this.update();
    }
    rotate() {
        const rotFig = this.curFig.rotate();
        if (!this.checkCollision(rotFig, this.coords)) {
            this.curFig = rotFig;
        }
    }
    moveLeft() {
        if (!this.checkCollision(this.curFig, { col: this.coords.col - 1 })) {
            this.coords.col--;
        }
    }
    moveRight() {
        if (!this.checkCollision(this.curFig, { col: this.coords.col + 1 })) {
            this.coords.col++;
        }
    }
}

function randIntN(n) {
    return Math.trunc(Math.random() * n);
}

const gameMetrics = {
    level: document.querySelector("#metric-level"),
    score: document.querySelector("#metric-score"),
    lines: document.querySelector("#metric-lines"),
    setScore(v) {
        this.score.textContent = v;
        return this;
    },
    setLevel(v) {
        this.level.textContent = v;
        return this;
    },
    setLines(v) {
        this.lines.textContent = v;
        return this;
    },
}

const gameGrid = new Grid(TETRIS_GRID_ROWS, TETRIS_GRID_COLS);
document.querySelector(".game-grid").append(gameGrid.getElement());

const maxSide = figures.reduce((max, { geom }) => Math.max(max, geom.length, geom[0].length), 0)

const nextFigureGrid = new Grid(maxSide, maxSide);
document.querySelector(".next-figure-grid").append(nextFigureGrid.getElement());



const tetris = new Tetris();

document.body.onkeydown = function (e) {
    if (e.code == "ArrowLeft") {
        tetris.moveLeft();
    }
    if (e.code == "ArrowRight") {
        tetris.moveRight();
    }
    if (e.code == "ArrowUp") {
        tetris.rotate();
    }
    if (e.code == "ArrowDown") {
        tetris.moveDown();
    }
    draw();
};

// document.body.focus();

function draw() {
    gameGrid.setFrom(tetris.getGrid());
    nextFigureGrid.setFrom(tetris.getNextFigure());
    gameMetrics.
        setScore(tetris.getScore()).
        setLines(tetris.getLines()).
        setLevel(tetris.getLevel());
}

draw();

let timerId = setInterval(() => {
    draw();
    tetris.update();
    if (!tetris.isPlaying()) {
        clearInterval(timerId)
    }
}, 200)