'use strict';
const newGameData = () => {
	return {
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
		victory_Status: null,
		Array_Probable_Moves_Wolves: [],
		matrix_With_Cordinates_For_Counting: [],
		matrix_With_Board_Cell_Classes: new Array(5).fill(0).map(() => new Array(5).fill(0).map(() => 'cell')),
	}
}

const setParticipants = data => x => {
	data.boardSize = x;
	data.matrix_With_Board_Cell_Classes = new Array(data.boardSize).fill(0).map(() => new Array(data.boardSize).fill(0).map(() => 'cell'));
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
	data.matrix_With_Cordinates_For_Counting = data.matrix_With_Cordinates_For_Counting.flat();
	data.wolvesPos = data.Array_Probable_Moves_Wolves.map(probable_Moves_Of_One_Wolf => {
		const probable_Moves = data.matrix_With_Cordinates_For_Counting.filter(coordinates => ifThereIsA(probable_Moves_Of_One_Wolf, coordinates));
		const min = Math.min(...probable_Moves.map(wolf => wolf.g));
		const coordinates_to_Next_Step_Wolf = probable_Moves.find(wolf => wolf.g === min);
		data.matrix_With_Cordinates_For_Counting.splice(data.matrix_With_Cordinates_For_Counting.indexOf(coordinates_to_Next_Step_Wolf), 1);
		return coordinates_to_Next_Step_Wolf;
	});
	return data;
};

const generateBoardData = data => {
	data.matrix_With_Board_Cell_Classes = [];
	data.matrix_With_Cordinates_For_Counting = [];
	for (let i = 0; i < data.boardSize; i++) {
		const cell_Classes = [];
		const cordinates_For_Counting = [];
		for (let j = 0; j < data.boardSize; j++) {
			const g = Math.pow(Math.abs(data.rabbitPos.x - i), 2) + Math.pow(Math.abs(data.rabbitPos.y - j), 2);
			const ifRabbit = ifThereIsA([data.rabbitPos], { x: i, y: j });
			const ifHouse = ifThereIsA([data.housePos], { x: i, y: j });
			const ifBarrier = ifThereIsA(data.barriersPos, { x: i, y: j });
			const ifWolf = ifThereIsA(data.wolvesPos, { x: i, y: j });
			if (ifWolf) {
				cell_Classes.push(data.wolf);
				cordinates_For_Counting.push({ g, x: i, y: j });
			} else if (ifRabbit) {
				cell_Classes.push(data.rabbit);
				cordinates_For_Counting.push({ g, x: i, y: j });
			} else if (ifBarrier) {
				cell_Classes.push(data.barrier);
			} else if (ifHouse) {
				cell_Classes.push(data.house);
			} else {
				cell_Classes.push(data.cell);
				cordinates_For_Counting.push({ g, x: i, y: j });
			}
		}
		data.matrix_With_Cordinates_For_Counting.push(cordinates_For_Counting);
		data.matrix_With_Board_Cell_Classes.push(cell_Classes);
	}
	return data;
};

const createProbableWolfМove = (data) => {
	data.Array_Probable_Moves_Wolves = [];
	data.wolvesPos.forEach(wolfPos => {
		const probable_Moves_Of_One_Wolf = [];
		let i = wolfPos.x;
		let j = wolfPos.y;
		if (i < data.boardSize - 1) { probable_Moves_Of_One_Wolf.push({ x: i + 1, y: j }) };
		if (i > 0) { probable_Moves_Of_One_Wolf.push({ x: i - 1, y: j }) };
		if (j > 0) { probable_Moves_Of_One_Wolf.push({ x: i, y: j - 1 }) };
		if (j < data.boardSize - 1) { probable_Moves_Of_One_Wolf.push({ x: i, y: j + 1 }) };
		data.Array_Probable_Moves_Wolves.push(probable_Moves_Of_One_Wolf);
	})
	return data;
}

const render = data => {
	const root = document.getElementById('root');
	const board = (root.lastElementChild).querySelector('#board');
	board.innerHTML = null;
	data.matrix_With_Board_Cell_Classes.forEach(classesArray => {
		const cell_Classes = document.createElement('div');
		classesArray.forEach(className => {
			const cell = document.createElement('div');
			cell.classList.add(className);
			cell_Classes.append(cell);
		});
		board.append(cell_Classes);
	});
	return data;
}

const checkVictory = data => {
	const rabbitWins = data.housePos.x === data.rabbitPos.x && data.housePos.y === data.rabbitPos.y;
	const wolfWins = data.wolvesPos.some(wolfPos => wolfPos.x === data.rabbitPos.x && wolfPos.y === data.rabbitPos.y);
	data.victory_Status = rabbitWins ? 'WIN' : (wolfWins ? 'LOSS' : null);
	const start = () => {
		renderOnRandomPositions(data);
		displayNone();
	};

	const change = (val) => {
		const changeboard = compose(render, setParticipants(data));
		changeboard(+val.target.value);
	};

	if (data.victory_Status) {
		const info = document.querySelector("#info");
		info.querySelector('.text-style').textContent = data.victory_Status;
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

const renderOnRandomPositions = compose(render, createProbableWolfМove, generateBoardData, filterRandomCoordinates, createRandomCoords);

const change = (val) => {
	const changeboard = compose(render, setParticipants(data));
	changeboard(val);
};

const moveParticipants = (val) => {
	const move = compose(render, checkVictory, createProbableWolfМove, generateBoardData, wolfStep, checkVictory, createProbableWolfМove, generateBoardData, checkRabbitPosition, rabbitStep(data));
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
		const move = compose(render, checkVictory, createProbableWolfМove, generateBoardData, wolfStep, checkVictory, createProbableWolfМove, generateBoardData, checkRabbitPosition, rabbitStep(data));
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