'use strict';
const newGameData = () => {
	const root = document.getElementById('root');
	return {
		board: (root.lastElementChild).querySelector('#board'),
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
		countOfParticipants: 7,
		countOfWolves: 3,
		countOfBarriers: 2,
		wolfNeighborCell: [],
		matrix: [],
		boardElements: new Array(5).fill(0).map(() => new Array(5).fill(0).map(() => 'cell')),
	}
}

const setParticipants = data => x => {
	data.boardSize = x;
	data.boardElements = new Array(data.boardSize).fill(0).map(() => new Array(data.boardSize).fill(0).map(() => 'cell'));
	data.countOfParticipants = data.boardSize + data.incrementCoefficient;
	data.countOfWolves = Math.floor((data.countOfParticipants - data.incrementCoefficient) * 60 / 100);
	data.countOfBarriers = (data.countOfParticipants - data.incrementCoefficient) - data.countOfWolves;
	return data;
};

const createRandomCoords = data => {
	data.randomCoords = [];
	while (data.randomCoords.length < data.countOfParticipants) {
		const randomXY = { x: Math.floor(Math.random() * data.boardSize), y: Math.floor(Math.random() * data.boardSize) };
		const isCoordsMatch = ifThereIsA(data.randomCoords, randomXY);
		if (!isCoordsMatch) {
			data.randomCoords.push(randomXY);
		}
	}
	return data;
};

const filterRandomCoordinates = data => {
	data.wolvesPos = data.randomCoords.slice(0, data.countOfWolves);
	data.barriersPos = data.randomCoords.slice(data.countOfWolves, data.randomCoords.length - 2);
	data.rabbitPos = data.randomCoords[data.randomCoords.length - 2];
	data.housePos = data.randomCoords[data.randomCoords.length - 1];
	return data;
};

const ifThereIsA = (into, it) => {
	return into.some(e => (e.x === it.x) && (e.y === it.y));
};

const rabbitStep = data => actionType => {
	const tempY = data.rabbitPos.y;
	const tempX = data.rabbitPos.x;
	switch (actionType) {
		case "up":
			data.rabbitPos.y--;
			break;
		case "down":
			data.rabbitPos.y++;
			break;
		case "left":
			data.rabbitPos.x--;
			break;
		case "right":
			data.rabbitPos.x++;
			break;
	}
	data.rabbitPos = ifThereIsA(data.barriersPos, data.rabbitPos) ? { x: tempX, y: tempY } : data.rabbitPos;
	return data;
};

const checkRabbitPosition = data => {
	data.rabbitPos.y = (data.rabbitPos.y + data.boardSize) % data.boardSize;
	data.rabbitPos.y = ifThereIsA(data.barriersPos, data.rabbitPos) ? (data.rabbitPos.y === 0 ? data.boardSize - 1 : 0) : data.rabbitPos.y;
	data.rabbitPos.x = (data.rabbitPos.x + data.boardSize) % data.boardSize;
	data.rabbitPos.x = ifThereIsA(data.barriersPos, data.rabbitPos) ? (data.rabbitPos.x === 0 ? data.boardSize - 1 : 0) : data.rabbitPos.x;
	return data;
};

const wolfStep = data => {
	data.wolvesPos = data.wolfNeighborCell.map(elem => {
		const wolvesNeighbor = data.matrix.filter(matrixElem => ifThereIsA(elem, matrixElem));
		const min = Math.min(...wolvesNeighbor.map(wolf => wolf.g));
		const wolf = wolvesNeighbor.find(wolf => wolf.g === min);
		data.matrix.splice(data.matrix.indexOf(wolf), 1);
		return wolf;
	});
	return data;
};

const createBoardElements = data => {
	const ArrayOfColumns = [];
	const matrixForCount = [];
	const wolfNeighborCellArray = [];
	for (let i = 0; i < data.boardSize; i++) {
		const column = [];
		const inMatrixColl = [];
		for (let j = 0; j < data.boardSize; j++) {
			const g = Math.pow(Math.abs(data.rabbitPos.x - i), 2) + Math.pow(Math.abs(data.rabbitPos.y - j), 2);
			const ifRabbit = ifThereIsA([data.rabbitPos], { x: i, y: j });
			const ifHouse = ifThereIsA([data.housePos], { x: i, y: j });
			const ifBarrier = ifThereIsA(data.barriersPos, { x: i, y: j });
			const ifWolf = ifThereIsA(data.wolvesPos, { x: i, y: j });
			if (ifWolf) {
				column.push(data.wolf);
				inMatrixColl.push({ g, x: i, y: j });
				const newNeighborWolf = [];
				if (i < data.boardSize - 1) { newNeighborWolf.push({ x: i + 1, y: j }) };
				if (i > 0) { newNeighborWolf.push({ x: i - 1, y: j }) };
				if (j > 0) { newNeighborWolf.push({ x: i, y: j - 1 }) };
				if (j < data.boardSize - 1) { newNeighborWolf.push({ x: i, y: j + 1 }) };
				wolfNeighborCellArray.push(newNeighborWolf);
			} else if (ifRabbit) {
				column.push(data.rabbit);
				inMatrixColl.push({ g, x: i, y: j });
			} else if (ifBarrier) {
				column.push(data.barrier);
			} else if (ifHouse) {
				column.push(data.house);
			} else {
				column.push(data.cell);
				inMatrixColl.push({ g, x: i, y: j });
			}
		}
		matrixForCount.push(inMatrixColl);
		ArrayOfColumns.push(column);
	}
	data.wolfNeighborCell = wolfNeighborCellArray;
	data.matrix = matrixForCount.flat();
	data.boardElements = ArrayOfColumns;
	return data;
};

const render = data => {
	data.board.innerHTML = null;
	data.boardElements.forEach(classesArray => {
		const column = document.createElement('div');
		classesArray.forEach(className => {
			const cell = document.createElement('div');
			cell.classList.add(className);
			column.append(cell);
		});
		data.board.append(column);
	});
	return data;
}

const checkVictory = data => {
	const rabbitWins = data.housePos.x === data.rabbitPos.x && data.housePos.y === data.rabbitPos.y;
	const wolfWins = data.wolvesPos.some(wolfPos => wolfPos.x === data.rabbitPos.x && wolfPos.y === data.rabbitPos.y);
	const victory = rabbitWins ? 'WIN' : (wolfWins ? 'LOSS' : null);
	const start = () => {
		renderOnRandomPositions(data);
		displayNone();
	};

	const change = (val) => {
		const changeboard = compose(render, setParticipants(data));
		changeboard(+val.target.value);
	};

	if (victory) {
		const info = document.querySelector("#info");
		info.querySelector('.text-style').textContent = victory;
		info.classList.remove('display-none');
		info.querySelector('.start').onclick = start;
		info.querySelector('.select').onchange = change;
	}

	return data;
};

const compose = (...fns) => (...args) => fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];

const root = document.getElementById('root');
const game = root.querySelector('.game');
const data = newGameData();

const renderOnRandomPositions = compose(render, createBoardElements, filterRandomCoordinates, createRandomCoords);

const change = (val) => {
	const changeboard = compose(render, setParticipants(data));
	changeboard(val);
};

const moveParticipants = (val) => {
	const move = compose(render, checkVictory, createBoardElements, wolfStep, checkVictory, createBoardElements, checkRabbitPosition, rabbitStep(data));
	move(val);
};

const start = () => {
	renderOnRandomPositions(data);
};

const displayNone = () => info.classList.add('display-none');

const createCopy = () => {
	const clone = game.cloneNode(true);

	root.appendChild(clone);
	const data = newGameData();

	const start = () => {
		renderOnRandomPositions(data);
	};

	const moveParticipants = (val) => {
		const move = compose(render, checkVictory, createBoardElements, wolfStep, checkVictory, createBoardElements, checkRabbitPosition, rabbitStep(data));
		move(val.target.value);
	};

	const change = (val) => {
		const changeboard = compose(render, setParticipants(data));
		changeboard(+val.target.value);
	};

	clone.querySelector('.start').onclick = start;
	clone.querySelectorAll('.button').forEach(button => button.onclick = moveParticipants);
	clone.querySelector('.select').onchange = change;
	render(data);
};

render(data);