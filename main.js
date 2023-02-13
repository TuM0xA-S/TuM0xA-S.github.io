"use strict";

function Cell(i) {
    this.elem = document.querySelector("#c" + i);
    this.get = () => this.elem.textContent;
    this.set = (player) => this.elem.textContent = player;
    this.mark = (markType) => {
        this.elem.className = "";
        if (!markType) {
            return
        }
        if (markType == "win") {
            this.elem.classList.add("win")
            return
        }
        if (markType == "draw") {
            this.elem.classList.add("draw")
            return
        }
    }
    this.clear = () => {
        this.set('');
        this.mark(false);
    }
}

function TTT() {
    // --methods

    this.doMove = function (cell) {
        if (cell.get()) {
            return false;
        }
        cell.set(this.currentPlayer)
        return true;
    };
    this.nextPlayer = function () {
        this.currentPlayer = this.currentPlayer == "X" ? "O" : "X";
    };
    this.getStatus = function () {
        for (let c of this.combos) {
            if (this.checkCombination(...c)) {
                return c;
            }
        }
        if (this.cells.every(v => v.get())) {
            return [] // draw
        }
    };
    this.checkCombination = function (i, j, k) {
        return this.cells[i].get() &&
            this.cells[i].get() == this.cells[j].get() &&
            this.cells[j].get() == this.cells[k].get();
    };
    this.markCombination = function (c) {
        for (let i of c) {
            this.cells[i].mark("win")
        }
    }
    this.markFilled = function () {
        this.cells.forEach(v => v.mark("draw"))
    }

    // --init

    // 0 1 2
    // 3 4 5
    // 6 7 8
    this.combos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    this.cells = []
    for (let i = 0; i < 9; i++) {
        this.cells[i] = new Cell(i);
    }
    this.table = document.querySelector("table");

    this.restart = function () {
        this.currentPlayer = 'X';
        for (let c of this.cells) {
            c.clear();
        }
        this.endState = false;
    }
    this.restart()

    for (let c of this.cells) {
        c.elem.onclick = () => {
            if (this.getStatus()) {
                return;
            }
            if (this.doMove(c)) {
                this.nextPlayer()
            }
            let combo = this.getStatus();
            if (combo == undefined) {
                return
            } else if (combo.length) {
                this.markCombination(combo);
            } else {
                this.markFilled();
            }
        }
    }
    this.table.onclick = () => {
        if (this.endState) {
            this.restart()
        } else if (this.getStatus()) {
            this.endState = true;
        }
    }

}

// run game
new TTT();