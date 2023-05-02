'use strict';

class Game {
	constructor(x) {
		this.board = document.querySelector(`#${x}`);
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
		this.boardSize = 5;
		this.incrementCoefficient = 2;
		this.numberOfParticipants = 7;
		this.numberOfWolves = 3;
		this.numberOfBarriers = 2;
		this.wolfNeighborCell = [];
		this.matrix = [];
		this.boardElements = new Array(5).fill(0).map(() => new Array(5).fill(0).map(() => 'cell'));
	}

	setParticipants = x => {
		this.boardSize = x;
		this.boardElements = new Array(this.boardSize).fill(0).map(() => new Array(this.boardSize).fill(0).map(className => className = 'cell'));
		this.numberOfParticipants = this.boardSize + this.incrementCoefficient;
		this.numberOfWolves = Math.floor((this.numberOfParticipants - this.incrementCoefficient) * 60 / 100);
		this.numberOfBarriers = this.numberOfParticipants - this.incrementCoefficient - this.numberOfWolves;
		this.createRandomCoords();
	};

	createRandomCoords = () => {
		this.randomCoords = [];
		while (this.randomCoords.length < this.numberOfParticipants) {
			const randomXY = { x: Math.floor(Math.random() * this.boardSize), y: Math.floor(Math.random() * this.boardSize) };
			const isCoordsMatch = this.ifThereIsA(this.randomCoords, randomXY);
			if (!isCoordsMatch) {
				this.randomCoords.push(randomXY);
			}
		}
		this.filterRandomCoordinates();
	};

	filterRandomCoordinates = () => {
		this.wolvesPos = this.randomCoords.slice(0, this.numberOfWolves);
		this.barriersPos = this.randomCoords.slice(this.numberOfWolves, this.randomCoords.length - 2);
		this.rabbitPos = this.randomCoords[this.randomCoords.length - 2];
		this.housePos = this.randomCoords[this.randomCoords.length - 1];
	};

	ifThereIsA = (into, it) => {
		return into.some(e => (e.x === it.x) && (e.y === it.y));
	};

	rabbitStep = actionType => {
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
		this.checkRabbitPosition();
	};

	checkRabbitPosition = () => {
		this.rabbitPos.y = (this.rabbitPos.y + this.boardSize) % this.boardSize;
		this.rabbitPos.y = this.ifThereIsA(this.barriersPos, this.rabbitPos) ? (this.rabbitPos.y === 0 ? this.boardSize - 1 : 0) : this.rabbitPos.y;
		this.rabbitPos.x = (this.rabbitPos.x + this.boardSize) % this.boardSize;
		this.rabbitPos.x = this.ifThereIsA(this.barriersPos, this.rabbitPos) ? (this.rabbitPos.x === 0 ? this.boardSize - 1 : 0) : this.rabbitPos.x;
		this.createBoardElements();
	};

	wolfStep = () => {
		this.wolvesPos = this.wolfNeighborCell.map(elem => {
			const wolvesNeighbor = this.matrix.filter(matrixElem => this.ifThereIsA(elem, matrixElem));
			const min = Math.min(...wolvesNeighbor.map(wolf => wolf.g));
			const wolf = wolvesNeighbor.find(wolf => wolf.g === min);
			this.matrix.splice(this.matrix.indexOf(wolf), 1);
			return wolf;
		});
		this.createBoardElements();
	};

	createBoardElements = () => {
		const ArrayOfColumns = [];
		const matrixForCount = [];
		const wolfNeighborCellArray = [];
		for (let i = 0; i < this.boardSize; i++) {
			const column = [];
			const inMatrixColl = [];
			for (let j = 0; j < this.boardSize; j++) {
				const g = Math.pow(Math.abs(this.rabbitPos.x - i), 2) + Math.pow(Math.abs(this.rabbitPos.y - j), 2);
				const ifRabbit = this.ifThereIsA([this.rabbitPos], { x: i, y: j });
				const ifHouse = this.ifThereIsA([this.housePos], { x: i, y: j });
				const ifBarrier = this.ifThereIsA(this.barriersPos, { x: i, y: j });
				const ifWolf = this.ifThereIsA(this.wolvesPos, { x: i, y: j });
				if (ifWolf) {
					column.push(this.wolf);
					inMatrixColl.push({ g, x: i, y: j });
					const newNeighborWolf = [];
					if (i < this.boardSize - 1) { newNeighborWolf.push({ x: i + 1, y: j }) };
					if (i > 0) { newNeighborWolf.push({ x: i - 1, y: j }) };
					if (j > 0) { newNeighborWolf.push({ x: i, y: j - 1 }) };
					if (j < this.boardSize - 1) { newNeighborWolf.push({ x: i, y: j + 1 }) };
					wolfNeighborCellArray.push(newNeighborWolf);
				} else if (ifRabbit) {
					column.push(this.rabbit);
					inMatrixColl.push({ g, x: i, y: j });
				} else if (ifBarrier) {
					column.push(this.barrier);
				} else if (ifHouse) {
					column.push(this.house);
				} else {
					column.push(this.cell);
					inMatrixColl.push({ g, x: i, y: j });
				}
			}
			matrixForCount.push(inMatrixColl);
			ArrayOfColumns.push(column);
		}
		this.wolfNeighborCell = wolfNeighborCellArray;
		this.matrix = matrixForCount.flat();
		this.boardElements = ArrayOfColumns;
	};

	render = () => {
		this.board.innerHTML = null;
		this.boardElements.forEach(classesArray => {
			const column = document.createElement('div');
			classesArray.forEach(className => {
				const cell = document.createElement('div');
				cell.classList.add(className);
				column.append(cell);
			});
			this.board.append(column);
		});
	}

	checkVictory = () => {
		const rabbitWins = this.housePos.x === this.rabbitPos.x && this.housePos.y === this.rabbitPos.y;
		const wolfWins = this.wolvesPos.some(wolfPos => wolfPos.x === this.rabbitPos.x && wolfPos.y === this.rabbitPos.y);
		const victory = rabbitWins ? 'WIN' : (wolfWins ? 'LOSS' : null);
		if (victory) {
			const textInfo = document.getElementsByClassName('text-style')[0];
			textInfo.textContent = victory;
			info.classList.remove('display-none');
		}
	};

	static of = x => {
		return new Game(x);
	}
}

const addButton = document.getElementById('addButton');
const root = document.getElementById('root');
const info = document.querySelector('.info');
const game = document.querySelector('.game');

const initialGame = Game.of('gameBoard');
initialGame.render();

game.addEventListener('change', change);
function change(e) {
	initialGame.setParticipants(+e.target.value);
	initialGame.render();
	e.stopPropagation();
}

game.addEventListener('click', clickAction);
function clickAction(e) {
	switch (e.target.value) {
		case '':
			break;
		case 'start':
			initialGame.createRandomCoords();
			initialGame.createBoardElements();
			initialGame.render();
			info.classList.add('display-none');
			break;
		case 'up': case 'down': case 'left': case 'right':
			initialGame.rabbitStep(e.target.value);
			initialGame.checkVictory();
			initialGame.wolfStep();
			initialGame.checkVictory();
			initialGame.render();
			break;
	}
	e.stopPropagation();
};

let count = 0;
addButton.addEventListener('click', (e) => {
	count++;
	const newItem = document.createElement('div');
	newItem.classList.add('game');
	newItem.innerHTML = game.innerHTML;
	root.appendChild(newItem);

	const newId = newItem.querySelector('.board').id = document.querySelector('.board').id + count;
	const newGame = Game.of(newId);

	newItem.addEventListener('change', (e) => {
		newGame.setParticipants(+e.target.value);
		newGame.render();
		e.stopPropagation();
	});

	newItem.addEventListener('click', (e) => {
		switch (e.target.value) {
			case 'start':
				newGame.createRandomCoords();
				newGame.createBoardElements();
				newGame.render();
				break;
			case 'up': case 'down': case 'left': case 'right':
				newGame.rabbitStep(e.target.value);
				newGame.checkVictory();
				newGame.wolfStep();
				newGame.checkVictory();
				newGame.render();
				break;
		}
		e.stopPropagation();
	});

	newGame.render();
	e.stopPropagation();
});