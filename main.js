"use strict";

const ttt = new function () {
    this.restart = function () {
        this.cells = new Array(9);
        this.currentPlayer = 'X';
    }
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
    this.doMove = function (cellIndex) {
        if (this.cells[cellIndex]) {
            return false;
        }
        this.cells[cellIndex] = this.currentPlayer
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
    };
    this.checkCombination = function (a, b, c) {
        return this.cells[a] != undefined && this.cells[a] == this.cells[b] && this.cells[b] == this.cells[c];
    };
    this.setupHandlers = function () {
        function toggleCombination(c) {
            for (let i of c) {
                cells[i].classList.toggle("marked")
            }
        }
        const cells = [];
        for (let i = 0; i < 9; i++) {
            cells[i] = document.querySelector("#c" + i);
        }
        for (let i = 0; i < 9; i++) {
            cells[i].onclick = () => {
                if (this.getStatus()) {
                    return;
                }
                if (this.doMove(i)) {
                    cells[i].textContent = this.currentPlayer;
                    this.nextPlayer()
                }
                let combo = this.getStatus();
                if (combo) {
                    toggleCombination(combo);
                }
            }
        }
        let winState = false;
        const table = document.querySelector("table");
        table.onclick = () => {
            if (winState) {
                toggleCombination(this.getStatus())
                for (let c of cells) {
                    c.textContent = ""
                }
                this.restart()
                winState = false;
                return;
            }
            if (this.getStatus()) {
                winState = true;
                return;
            }
        }
    };

    this.restart();
}

ttt.setupHandlers()