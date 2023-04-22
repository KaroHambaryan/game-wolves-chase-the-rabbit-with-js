'use strict';
// Определение констант
const body = document.body;
function Game() {
	this.board = document.getElementById('board');
	this.rabbitPos = { x: 0, y: 0 };
	this.housePos = { x: 4, y: 4 };
	this.wolvesPos = [{ x: 2, y: 2 }, { x: 3, y: 3 }, { x: 1, y: 4 }];
	this.wolfNeighborCell = [];
	this.barriersPos = [{ x: 4, y: 3 }, { x: 3, y: 2 }];
	this.rabbit = 'rabbit';
	this.house = 'home';
	this.wolf = 'wolf';
	this.barrier = 'barrier';
	this.cell = 'cell';
	this.size = 5;
	this.numberOfParticipants = 7;
	this.numberOfWolves = 3;
	this.numberOfBarriers = 2;
	this.randomCoords = [];
	this.matrix = [];
}

Game.prototype.setParticipants = function (x) {
	this.size = x;
	this.numberOfParticipants = this.size + 2;
	this.numberOfWolves = this.size === 5 ? 3 : this.size === 7 ? 4 : this.size === 10 ? 5 : this.size === 15 ? 8 : this.size === 20 ? 10 : 0;
	this.numberOfBarriers = this.size - this.numberOfWolves;
	this.createRandomCoords();
};

Game.prototype.createRandomCoords = function () {
	this.randomCoords = [];
	while (this.randomCoords.length < this.numberOfParticipants) {
		const rc = { x: Math.floor(Math.random() * this.size), y: Math.floor(Math.random() * this.size) };
		const isCoordsMatch = this.randomCoords.some(data => data.x === rc.x && data.y === rc.y);
		if (!isCoordsMatch) {
			this.randomCoords.push(rc);
		}
	}
	this.filterRandomCoordinates();
};

Game.prototype.filterRandomCoordinates = function () {
	this.wolvesPos = this.randomCoords.slice(0, this.numberOfWolves);
	this.barriersPos = this.randomCoords.slice(this.numberOfWolves, this.numberOfWolves + this.numberOfBarriers);
	this.rabbitPos = this.randomCoords[this.randomCoords.length - 2];
	this.housePos = this.randomCoords[this.randomCoords.length - 1];
};

Game.prototype.renderBoard = function (ifRender = false) {
	this.board.innerHTML = null;
	this.matrix = [];
	for (let i = 0; i < this.size; i++) {
		const row = document.createElement('div');
		const newArray = [];
		for (let j = 0; j < this.size; j++) {
			
			let cell = document.createElement('div');
			const ifWolf = this.wolvesPos.some(elem => elem.x === i && elem.y === j);
			const ifBarrier = this.barriersPos.some(elem => elem.x === i && elem.y === j);
			let g = Math.pow(Math.abs(this.rabbitPos.x - i), 2) + Math.pow(Math.abs(this.rabbitPos.y - j), 2);
			
			if (ifRender && (this.rabbitPos.x === i && this.rabbitPos.y === j)) {
				cell.classList.add(this.rabbit);
				newArray.push({ g, x: i, y: j });
			} else if (ifRender && ifWolf) {
				cell.classList.add(this.wolf);
				this.wolfNeighborCell = [];
				(i < this.size - 1) && this.wolfNeighborCell.push({ x: i + 1, y: j});
				(i > 0) && this.wolfNeighborCell.push({ x: i - 1, y: j});
				(j > 0) && this.wolfNeighborCell.push({ x: i, y: j - 1 });
				(j < this.size - 1) && this.wolfNeighborCell.push({ x: i, y: j + 1 });
				newArray.push({ g, x: i, y: j });
				console.log(this.wolfNeighborCell.length);
			} else if (ifRender && (this.housePos.x === i && this.housePos.y === j)) {
				cell.classList.add(this.house);
			} else if (ifRender && ifBarrier) {
				cell.classList.add(this.barrier);
			} else {
				cell.classList.add(this.cell);
				newArray.push({ g, x: i, y: j });
			}
			
			row.append(cell);
		}
		this.board.append(row);
		this.matrix.push(newArray);
	}
};

Game.returnMatches



Game.prototype.rabbitStep = function (actionType) {
	switch (actionType) {
		case "up":
			this.rabbitPos.y--;
			this.ifBarrier() && this.rabbitPos.y++;
			break;
		case "down":
			this.rabbitPos.y++;
			this.ifBarrier() && this.rabbitPos.y--;
			break;
		case "left":
			this.rabbitPos.x--;
			this.ifBarrier() && this.rabbitPos.x++;
			break;
		case "right":
			this.rabbitPos.x++
			this.ifBarrier() && this.rabbitPos.x--;
			break;
		default:
			this.rabbitPos;
	}
	this.ifBorder();
};

Game.prototype.ifBarrier = function () {
	return this.barriersPos.some(e => e.x === this.rabbitPos.x && e.y === this.rabbitPos.y);
};

Game.prototype.ifBorder = function () {
	this.rabbitPos.y = (this.rabbitPos.y + this.size) % this.size;
	this.rabbitPos.y = this.ifBarrier() ? 0 : this.rabbitPos.y;
	this.rabbitPos.y = this.ifBarrier() ? this.size - 1 : this.rabbitPos.y;
	this.rabbitPos.x = (this.rabbitPos.x + this.size) % this.size;
	this.rabbitPos.x = this.ifBarrier() ? 0 : this.rabbitPos.x;
	this.rabbitPos.x = this.ifBarrier() ? this.size - 1 : this.rabbitPos.x;
};

Game.prototype.wolfStep = function () {
	let n = [];
	for (let i = 0; i < this.wolvesPos.length; i++) {
		if (this.wolvesPos[i].y > 0) {
			n.push({})
		} else if (this.wolvesPos[i].y < this.size - 1) {

		} else if (this.wolvesPos[i].x < this.size - 1) {

		} else if (this.wolvesPos[i].x > 0) {

		}
	}
}

let a = new Game();
a.renderBoard();
console.log(a);

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
			break;
		case 'up': case 'down': case 'left': case 'right':
			a.rabbitStep(e.target.value);
			a.renderBoard(true);
			// a.wolfStep();
			console.log(a);
			break;
		default:
			e;
			break;
	}
	e.stopPropagation();
};







// compose :: ((y -> z), (x -> y),  ..., (a -> b)) -> a -> z
function compose(...fns) { return (...args) => fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0]; }



// Получение элементов DOM