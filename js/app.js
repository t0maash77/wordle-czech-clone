// DATA
const maxWordLength = 5
const maxTries = 6

let resultsMap = new Map();
let dateStarted = null;

let word = ''
let tries = 1

let possibleSolutions = allWords.filter(x => x.charAt(0) !== x.charAt(0).toUpperCase());

let solution = possibleSolutions[possibleSolutions.length * Math.random() | 0].toLowerCase()
let noAccentSolution = noAccents(solution)
let noAccentWords = allPossibleWords.map(x => noAccents(x))
let noAccentSolutions = possibleSolutions.map(x => noAccents(x));

noAccentWords = noAccentWords.concat(noAccentSolutions);

let lettersInRow = {
	correct: [],
	present: [],
	wrong: []
}

// KEYBOARD
document.addEventListener('keydown', (event) => {
	if (event.key === 'Enter') {
		if (!document.querySelector('button#enter').hasAttribute('disabled')) {
			submitWord();
		}
	}
	else if (event.key === 'Backspace') {
		removeLetter()
	}
	else {
		addLetter(event.key)
	}
})

document.addEventListener('DOMContentLoaded', () => {
	const virtualKeyboardButtons = document.querySelectorAll('.keyboard button');
	for (const button of virtualKeyboardButtons) {
		button.addEventListener('click', ({target}) => {
			const key = target.getAttribute('id');
			if (key === 'enter') {
				if (!document.querySelector('button#enter').hasAttribute('disabled')) {
					submitWord();
				}
			} else if (key === 'delete') {
				removeLetter();
			} else{
				addLetter(key);
			}
		})
	}
	dateStarted = new Date();
	if (localStorage.getItem('resultsMap')) {
		resultsMap = new Map(JSON.parse(localStorage.getItem('resultsMap')));
	}
})

// SUBMIT
const submitWord = () => {
	if (word.length !== maxWordLength) return

	// is this a real word?
	if (!noAccentWords.includes(noAccents(word))) {
		animateRowShake(currentRow())
		return
	}

	document.querySelector('button#enter').setAttribute('disabled', 'true');

	findLettersInRow()
	highlightLetters(currentRow())
	animateTileReveal(currentRow())

	setTimeout(() => {
		judgeResult()
	}, 1500)
}

// ADD LETTER
const addLetter = (character) => {
	if (word.length >= maxWordLength) return

	// allow only letters
	if (/^\p{L}$/u.test(character)) {
		word = word + character
		word = word.toLowerCase()

		let tile = currentTile()
		tile.innerHTML = character

		animateTileBounce(tile)
	}
}

// REMOVE LETTER
const removeLetter = () => {
	if (word.length <= 0) return

	let tile = currentTile()
	tile.innerHTML = ''
	tile.className = 'tile'

	word = word.slice(0, -1)
}

// TILE TO UPDATE
const currentTile = () => {
	return currentRow().querySelector(':nth-child(' + word.length + ')')
}

// CURRENT ROW
const currentRow = () => {
	return document.querySelector('.row:nth-child(' + tries + ')')
}

// JUDGE RESULT
const judgeResult = () => {
	if (noAccents(word) === noAccentSolution) {
		setResultsToStorage();

		animateTileDance(currentRow());

		setTimeout(() => {
			getResultDialog();
		}, 2000)
	}
	else if (tries >= maxTries) {
		setResultsToStorage(false);

		youVeryMuchLose();

		setTimeout(() => {
			getResultDialog(false);
		}, 2000)
	}
	else {
		word = ''
		tries++
	}
	document.querySelector('button#enter').removeAttribute('disabled');
}

// FIND ALL LETTERS FOR CURRENT ROW
const findLettersInRow = () => {
	let present = [];
	let correct = [];
	let wrong = [];

	[...word].forEach((letter, index) => {
		letter = noAccents(letter)

		// letter in correct place
		if (noAccentSolution.charAt(index) === letter) {
			correct.push(letter)
		}
		// letter in wrong place
		else if (noAccentSolution.includes(letter)) {
			present.push(letter)
		}
		// wrong number
		else {
			wrong.push(letter)
		}
	})

	lettersInRow = {
		present,
		correct,
		wrong
	}
}

// REMOVE ACCENTS
function noAccents (str) {
	return str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function getResultDialog (win = true) {
	const message = win === true
		? '<p class="lead">Vyhrál/a jsi na ' + tries + ' pokusy/ů. Chceš pokračovat?</p>'
		: '<p class="lead">Řešení bylo: <b>' + solution.toUpperCase() + '</b></p>';

	const results = resultsMap.get('results');
	const resultsMessage = '<canvas id="resultsChart" width="400" height="400"></canvas>';

	const endDate = new Date();
	const seconds = ((endDate.getTime() - dateStarted.getTime()) / 1000).toFixed(0);
	const timeMessage = `<p>Zabralo ti to <mark>${seconds} sekund</mark></p>`;

	return bootbox.dialog({
		title: win === true ? 'Vítězství! 🎉' : 'Prohra 😕',
		message: message + timeMessage + resultsMessage + getChartScript(
			['`Nevyřešeno`', '`1 pokus`', '`2 pokusy`', '`3 pokusy`', '`4 pokusy`', '`5 pokusů`', '`6 pokusů`'],
			Object.values(results)),
		size: 'large',
		onEscape: true,
		backdrop: true,
		buttons: {
			no: {
				label: 'Zavřít aplikaci ❌',
				className: 'btn-secondary',
				callback: function(){
					window.close();
				}
			},
			yes: {
				label: 'Pokračovat v hraní ✅',
				className: 'btn-primary',
				callback: function(){
					window.location.reload();
				}
			},
		}
	});
}

function setResultsToStorage (won = true) {
	let currentResults = {0: 0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0};
	if (resultsMap.has('results')) {
		currentResults = resultsMap.get('results');
	}

	if (won) {
		currentResults[tries] = (isNaN(parseInt(currentResults[tries])) ? 0 : parseInt(currentResults[tries])) + 1;
	} else {
		currentResults[0] = (isNaN(parseInt(currentResults[0])) ? 0 : parseInt(currentResults[0])) + 1;
	}

	resultsMap.set('results', currentResults);

	localStorage.setItem('resultsMap', JSON.stringify([...resultsMap]));
}

function getChartScript (labels, data) {
	return `
	<script>
		const ctx = document.getElementById('resultsChart').getContext('2d');
		const myChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: [${labels}],
				datasets: [{
					label: 'Kolikrát: ',
					data: [${data}],
					backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(1, 255, 64, 0.2)',
						'rgba(54, 162, 235, 0.2)',
						'rgba(255, 206, 86, 0.2)',
						'rgba(75, 192, 192, 0.2)',
						'rgba(153, 102, 255, 0.2)',
						'rgba(255, 159, 64, 0.2)',
					],
					borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(1, 255, 64, 1)',
						'rgba(54, 162, 235, 1)',
						'rgba(255, 206, 86, 1)',
						'rgba(75, 192, 192, 1)',
						'rgba(153, 102, 255, 1)',
						'rgba(255, 159, 64, 1)',
					],
					borderWidth: 1
				}]
			},
			options: {
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});
	</script>
	`;
}