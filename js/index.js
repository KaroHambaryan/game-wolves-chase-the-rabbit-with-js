'use strict';

function Game() {
	this.board = document.getElementById('board');
	this.randomCoords = [];
	this.rabbitPos = { x: 0, y: 0 };
	this.housePos = { x: 4, y: 4 };
	this.wolvesPos = [{ x: 2, y: 2 }, { x: 3, y: 3 }, { x: 1, y: 4 }];
	this.barriersPos = [{ x: 4, y: 3 }, { x: 3, y: 2 }];
	this.rabbit = 'rabbit';
	this.house = 'home';
	this.barrier = 'barrier';
	this.wolf = 'wolf';
	this.cell = 'cell';
	this.bpardSize = 5;
	this.numberOfParticipants = 7;
	this.numberOfWolves = 3;
	this.numberOfBarriers = 2;
	this.wolfNeighborCell = [];
	this.matrix = [];
}

Game.prototype.setParticipants = function (x) {
	this.bpardSize = x;
	this.numberOfParticipants = this.bpardSize + 2;
	this.numberOfWolves = this.bpardSize === 5 ? 3 : this.bpardSize === 7 ? 4 : this.bpardSize === 10 ? 5 : this.bpardSize === 15 ? 8 : this.bpardSize === 20 ? 10 : 0;
	this.numberOfBarriers = this.numberOfParticipants - this.numberOfWolves;
	this.createRandomCoords();
};

Game.prototype.createRandomCoords = function () {
	this.randomCoords = [];
	while (this.randomCoords.length < this.numberOfParticipants) {
		const randomXY = { x: Math.floor(Math.random() * this.bpardSize), y: Math.floor(Math.random() * this.bpardSize) };
		const isCoordsMatch = this.ifThereIsA(this.randomCoords, randomXY);
		if (!isCoordsMatch) {
			this.randomCoords.push(randomXY);
		}
	}
	this.filterRandomCoordinates();
};

Game.prototype.filterRandomCoordinates = function () {
	this.wolvesPos = this.randomCoords.slice(0, this.numberOfWolves);
	this.barriersPos = this.randomCoords.slice(this.numberOfWolves, this.randomCoords.length - 2);
	this.rabbitPos = this.randomCoords[this.randomCoords.length - 2];
	this.housePos = this.randomCoords[this.randomCoords.length - 1];
};

Game.prototype.ifThereIsA = function (into, it) {
	return into.some(e => e.x === it.x && e.y === it.y);
};

Game.prototype.renderBoard = function (ifRender = false) {
	this.board.innerHTML = null;
	this.matrix = [];
	this.wolfNeighborCell = [];
	for (let i = 0; i < this.bpardSize; i++) {
		const div = document.createElement('div');
		const inMatrixColl = [];
		for (let j = 0; j < this.bpardSize; j++) {
			const cell = document.createElement('div');
			const ifWolf = this.ifThereIsA(this.wolvesPos, { x: i, y: j });
			const ifBarrier = this.ifThereIsA(this.barriersPos, { x: i, y: j });
			let g = Math.pow(Math.abs(this.rabbitPos.x - i), 2) + Math.pow(Math.abs(this.rabbitPos.y - j), 2);
			if (ifRender && (this.rabbitPos.x === i && this.rabbitPos.y === j)) {
				cell.classList.add(this.rabbit);
				inMatrixColl.push({ g, x: i, y: j });
			} else if (ifRender && ifWolf) {
				cell.classList.add(this.wolf);
				inMatrixColl.push({ g, x: i, y: j });
				let newNeighborWolf = [];
				(i < this.bpardSize - 1) && newNeighborWolf.push({ x: i + 1, y: j });
				(i > 0) && newNeighborWolf.push({ x: i - 1, y: j });
				(j > 0) && newNeighborWolf.push({ x: i, y: j - 1 });
				(j < this.bpardSize - 1) && newNeighborWolf.push({ x: i, y: j + 1 });
				this.wolfNeighborCell.push(newNeighborWolf);
			} else if (ifRender && (this.housePos.x === i && this.housePos.y === j)) {
				cell.classList.add(this.house);
			} else if (ifRender && ifBarrier) {
				cell.classList.add(this.barrier);
			} else {
				cell.classList.add(this.cell);
				inMatrixColl.push({ g, x: i, y: j });
			}
			div.append(cell);
		}
		this.board.append(div);
		this.matrix.push(inMatrixColl);
	}
	this.matrix = this.matrix.flat();
};

Game.prototype.wolfStep = function () {
	this.wolvesPos = this.wolfNeighborCell.map((elem) => {
		const wolvesNeighbor = this.matrix.filter(matrixElem => this.ifThereIsA(elem, matrixElem));
		const min = Math.min(...wolvesNeighbor.map(wolf => wolf.g));
		const wolf = wolvesNeighbor.find(wolf => wolf.g === min);
		this.matrix.splice(this.matrix.indexOf(wolf), 1);
		return wolf;
	});
};

Game.prototype.rabbitStep = function (actionType) {
	const tempY = this.rabbitPos.y;
	const tempX = this.rabbitPos.x;
	switch (actionType) {
		case "up":
			this.rabbitPos.y--;
			break;
		case "down":
			this.rabbitPos.y++;
			break;
		case "left":
			this.rabbitPos.x--;
			break;
		case "right":
			this.rabbitPos.x++
			break;
	}
	this.rabbitPos = this.ifThereIsA(this.barriersPos, this.rabbitPos) ? { x: tempX, y: tempY } : this.rabbitPos;
	this.ifBorder();
};

Game.prototype.ifBorder = function () {
	this.rabbitPos.y = (this.rabbitPos.y + this.bpardSize) % this.bpardSize;
	this.rabbitPos.y = this.ifThereIsA(this.barriersPos, this.rabbitPos) ? (this.rabbitPos.y === 0 ? this.bpardSize - 1 : 0) : this.rabbitPos.y;
	this.rabbitPos.x = (this.rabbitPos.x + this.bpardSize) % this.bpardSize;
	this.rabbitPos.x = this.ifThereIsA(this.barriersPos, this.rabbitPos) ? (this.rabbitPos.x === 0 ? this.bpardSize - 1 : 0) : this.rabbitPos.x;
};

Game.prototype.checkVictory = function () {
	const rabbitWins = this.housePos.x === this.rabbitPos.x && this.housePos.y === this.rabbitPos.y;
	const wolfWins = this.wolvesPos.some(wolfPos => wolfPos.x === this.rabbitPos.x && wolfPos.y === this.rabbitPos.y);
	const victory = rabbitWins ? 'WIN' : (wolfWins ? 'LOSS' : null);
	if (victory) {
		const textInfo = document.getElementsByClassName('text-style')[0];
		textInfo.textContent = victory;
		info.classList.remove('display-none');
	}
};

let a = new Game();
a.renderBoard();

const body = document.body;
const info = document.getElementById('info');

body.addEventListener('change', change);
function change(e) {
	a.setParticipants(+e.target.value);
	a.renderBoard();
	e.stopPropagation();
}

body.addEventListener('click', clickAction);
function clickAction(e) {
	switch (e.target.value) {
		case 'start':
			a.createRandomCoords();
			a.renderBoard(true);
			info.classList.add('display-none');
			break;
		case 'up': case 'down': case 'left': case 'right':
			a.rabbitStep(e.target.value);
			a.renderBoard(true);
			a.checkVictory()
			a.wolfStep();
			a.renderBoard(true);
			a.checkVictory();
			break;
	}
	e.stopPropagation();
};