'use strict';

const game = {
	board: document.getElementById('board'),
	randomCoords: [],
	rabbitPos: { x: 0, y: 0 },
	housePos: { x: 4, y: 4 },
	wolvesPos: [{ x: 2, y: 2 }, { x: 3, y: 3 }, { x: 1, y: 4 }],
	barriersPos: [{ x: 4, y: 3 }, { x: 3, y: 2 }],
	rabbit: 'rabbit',
	house: 'home',
	barrier: 'barrier',
	wolf: 'wolf',
	cell: 'cell',
	boardSize: 5,
	incrementCoefficient: 2,
	numberOfParticipants: 7,
	numberOfWolves: 3,
	numberOfBarriers: 2,
	wolfNeighborCell: [],
	matrix: [],
	boardElements: new Array(5).fill(0).map(() => new Array(5).fill(0).map(className => className = 'cell')),
}

const setParticipants = (x) => {
	game.boardSize = x;
	game.boardElements = new Array(game.boardSize).fill(0).map(() => new Array(game.boardSize).fill(0).map(className => className = 'cell'));
	game.numberOfParticipants = game.boardSize + game.incrementCoefficient;
	game.numberOfWolves = Math.floor((game.numberOfParticipants - game.incrementCoefficient) * 60 / 100);
	game.numberOfBarriers = (game.numberOfParticipants - game.incrementCoefficient) - game.numberOfWolves;
	createRandomCoords();
};

const createRandomCoords = () => {
	game.randomCoords = [];
	while (game.randomCoords.length < game.numberOfParticipants) {
		const randomXY = { x: Math.floor(Math.random() * game.boardSize), y: Math.floor(Math.random() * game.boardSize) };
		const isCoordsMatch = ifThereIsA(game.randomCoords, randomXY);
		if (!isCoordsMatch) {
			game.randomCoords.push(randomXY);
		}
	}
	filterRandomCoordinates();
};

const filterRandomCoordinates = () => {
	game.wolvesPos = game.randomCoords.slice(0, game.numberOfWolves);
	game.barriersPos = game.randomCoords.slice(game.numberOfWolves, game.randomCoords.length - 2);
	game.rabbitPos = game.randomCoords[game.randomCoords.length - 2];
	game.housePos = game.randomCoords[game.randomCoords.length - 1];
};

const rabbitStep = (actionType) => {
	const tempY = game.rabbitPos.y;
	const tempX = game.rabbitPos.x;
	switch (actionType) {
		case "up":
			game.rabbitPos.y--;
			break;
		case "down":
			game.rabbitPos.y++;
			break;
		case "left":
			game.rabbitPos.x--;
			break;
		case "right":
			game.rabbitPos.x++
			break;
	}
	game.rabbitPos = ifThereIsA(game.barriersPos, game.rabbitPos) ? { x: tempX, y: tempY } : game.rabbitPos;
	checkRabbitPosition();
};

const checkRabbitPosition = () => {
	game.rabbitPos.y = (game.rabbitPos.y + game.boardSize) % game.boardSize;
	game.rabbitPos.y = ifThereIsA(game.barriersPos, game.rabbitPos) ? (game.rabbitPos.y === 0 ? game.boardSize - 1 : 0) : game.rabbitPos.y;
	game.rabbitPos.x = (game.rabbitPos.x + game.boardSize) % game.boardSize;
	game.rabbitPos.x = ifThereIsA(game.barriersPos, game.rabbitPos) ? (game.rabbitPos.x === 0 ? game.boardSize - 1 : 0) : game.rabbitPos.x;
	createBoardElements();
};

const wolfStep = () => {
	game.wolvesPos = game.wolfNeighborCell.map(elem => {
		const wolvesNeighbor = game.matrix.filter(matrixElem => ifThereIsA(elem, matrixElem));
		const min = Math.min(...wolvesNeighbor.map(wolf => wolf.g));
		const wolf = wolvesNeighbor.find(wolf => wolf.g === min);
		game.matrix.splice(game.matrix.indexOf(wolf), 1);
		return wolf;
	});
	createBoardElements();
};

const createBoardElements = () => {
	const ArrayOfColumns = [];
	const matrixForCount = [];
	const wolfNeighborCellArray = [];
	for (let i = 0; i < game.boardSize; i++) {
		const column = [];
		const inMatrixColl = [];
		for (let j = 0; j < game.boardSize; j++) {
			const g = Math.pow(Math.abs(game.rabbitPos.x - i), 2) + Math.pow(Math.abs(game.rabbitPos.y - j), 2);
			const ifRabbit = ifThereIsA([game.rabbitPos], { x: i, y: j });
			const ifHouse = ifThereIsA([game.housePos], { x: i, y: j });
			const ifBarrier = ifThereIsA(game.barriersPos, { x: i, y: j });
			const ifWolf = ifThereIsA(game.wolvesPos, { x: i, y: j });
			if (ifWolf) {
				column.push(game.wolf);
				inMatrixColl.push({ g, x: i, y: j });
				const newNeighborWolf = [];
				if (i < game.boardSize - 1) { newNeighborWolf.push({ x: i + 1, y: j }) };
				if (i > 0) { newNeighborWolf.push({ x: i - 1, y: j }) };
				if (j > 0) { newNeighborWolf.push({ x: i, y: j - 1 }) };
				if (j < game.boardSize - 1) { newNeighborWolf.push({ x: i, y: j + 1 }) };
				wolfNeighborCellArray.push(newNeighborWolf);
			} else if (ifRabbit) {
				column.push(game.rabbit);
				inMatrixColl.push({ g, x: i, y: j });
			} else if (ifBarrier) {
				column.push(game.barrier);
			} else if (ifHouse) {
				column.push(game.house);
			} else {
				column.push(game.cell);
				inMatrixColl.push({ g, x: i, y: j });
			}
		}
		matrixForCount.push(inMatrixColl);
		ArrayOfColumns.push(column);
	}
	game.wolfNeighborCell = wolfNeighborCellArray;
	game.matrix = matrixForCount.flat();
	game.boardElements = ArrayOfColumns;
};

const ifThereIsA = (into, it) => {
	return into.some(e => (e.x === it.x) && (e.y === it.y));
};

const render = () => {
	game.board.innerHTML = null;
	game.boardElements.forEach(classesArray => {
		const column = document.createElement('div');
		classesArray.forEach(className => {
			const cell = document.createElement('div');
			cell.classList.add(className);
			column.append(cell);
		});
		game.board.append(column);
	});
}

const checkVictory = () => {
	const rabbitWins = game.housePos.x === game.rabbitPos.x && game.housePos.y === game.rabbitPos.y;
	const wolfWins = game.wolvesPos.some(wolfPos => wolfPos.x === game.rabbitPos.x && wolfPos.y === game.rabbitPos.y);
	const victory = rabbitWins ? 'WIN' : (wolfWins ? 'LOSS' : null);
	if (victory) {
		const textInfo = document.getElementsByClassName('text-style')[0];
		textInfo.textContent = victory;
		info.classList.remove('display-none');
	}
};

const body = document.body;
const info = document.getElementById('info');

body.addEventListener('change', change);
function change(e) {
	setParticipants(+e.target.value);
	render();
	e.stopPropagation();
}

body.addEventListener('click', clickAction);
function clickAction(e) {
	switch (e.target.value) {
		case 'start':
			createRandomCoords();
			createBoardElements();
			render();
			info.classList.add('display-none');
			break;
		case 'up': case 'down': case 'left': case 'right':
			rabbitStep(e.target.value);
			wolfStep();
			render();
			checkVictory()
			break;
	}
	e.stopPropagation();
};

render();