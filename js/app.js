// DATA
const maxWordLength = 5
const maxTries = 6

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
		submitWord()
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
				submitWord();
			} else if (key === 'delete') {
				removeLetter();
			} else{
				addLetter(key);
			}
		})
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
		animateTileDance(currentRow())
		setTimeout(() => {
			getResultDialog();
		}, 2000)
	}
	else if (tries >= maxTries) {
		youVeryMuchLose()

		setTimeout(() => {
			getResultDialog(false);
		}, 2000)
	}
	else {
		word = ''
		tries++
	}
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
	//TODO - stats!

	const message = win === true
		? '<p>Vyhrál/a jsi na ' + tries + ' pokusy/ů. Chceš pokračovat?</p>'
		: '<div class="text-center">Řešení bylo: ' + solution.toUpperCase() + '</div>';

	return bootbox.dialog({
		title: win === true ? 'Vítězství! 🎉' : 'Prohra 😕',
		message: message,
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