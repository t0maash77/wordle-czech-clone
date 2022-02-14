// BOUNCE WHEN YOU ADD NEW LETTER
const animateTileBounce = (tile) => {
	tile.classList.add('is-filled', 'animate__animated', 'animate__bounceIn')
}

// ROTATE TILE, WHEN YOU SUBMIT AN EXISTING WORD
const animateTileReveal = (row) => {
	row.querySelectorAll('.tile').forEach((tile, index) => {
		tile.classList.remove('animate__bounceIn', 'animate__flipInY')

		setTimeout(() => {
			tile.style.visibility = 'visible'
			tile.classList.add('animate__flipInY', `animate__delay-${index}s`)
		}, 0)
	})
}

// DANCE WHEN YOU WIN!!!
const animateTileDance = (row) => {
	row.querySelectorAll('.tile').forEach((tile, index) => {
		tile.innerHTML = solution.charAt(index)

		tile.classList.remove('animate__bounceIn', 'animate__flipInY', 'animate__bounce')

		setTimeout(() => {
			tile.classList.add('animate__bounce', `animate__delay-${index}s`)
		}, 0)
	})
}

// SHAKE WHOLE ROW, WHEN YOU SUBMIT A NON-EXISTENT WORD
const animateRowShake = (row) => {
	row.classList.remove('animate__shakeX')

	setTimeout(() => {
		row.classList.add('animate__animated', 'animate__shakeX')
	}, 0)
}

// GAME OVER
const youVeryMuchLose = () => {
	let board = document.querySelector('.board')
	board.classList.add('animate__animated', 'animate__hinge')
}

// HIGHLIGHT LETTERS
const highlightLetters = (row) => {
	const lettersCount = countLettersInWord(noAccentSolution);
	const lettersToCheck = noAccentSolution.split('')

	row.querySelectorAll('.tile').forEach((tile, index) => {
		tile.style.visibility = 'hidden'

		let letter = noAccents(word.charAt(index))
		let colorClass = 'wrong'

		// the correct letter is in correct the place
		if (lettersToCheck[index] === letter) {

			//Remove 1 from count of the letter in the word (so there is no duplicate present classes)
			const currentLetterValue = lettersCount[letter];
			lettersCount[letter] = currentLetterValue - 1;

			//This might actually happen when first letters of a word are just 'present' but also later are 'correct' and shouldn't be marked as 'present' before
			// Need to go back to them and set them as 'wrong' as they are correct on couple of places later but actually wrong at this point
			//
			// example: SOLUTION: 'dinar' | guessedWord: 'radar'
			// last 2 should be green, and 'd' in radar should be orange
			// without this check it would do 'rad' orange('present') and 'ar' green('correct') (which is not correct)
			if (lettersCount[letter] < 0) {
				row.querySelectorAll('.tile').forEach((tile, index) => {
					if (lettersCount[letter] >= 0) {
						return;
					}

					if (tile.innerHTML === letter) {
						tile.classList.remove('present');
						tile.classList.add('wrong');
						lettersCount[letter] = lettersCount[letter] + 1;
					}
				});
			}

			colorClass = 'correct';
		}
		// this letter is present in the solution, but at a different place
		else if (lettersToCheck.indexOf(letter) >= 0) {
			//If the letter is in the solution at least once
			if (lettersCount[letter] > 0) {
				//Remove 1 from count of the letter in the word (so there is no duplicate present classes)
				const currentLetterValue = lettersCount[letter];
				lettersCount[letter] = currentLetterValue - 1;

				colorClass = 'present';
			}
		}

		tile.classList.add(colorClass)
	})

	// keyboard buttons
	document.querySelectorAll('.keyboard button').forEach(button => {
		let colorClass = ''

		if (lettersInRow.wrong.includes(button.id)) colorClass = 'wrong'
		if (lettersInRow.present.includes(button.id)) colorClass = 'present'
		if (lettersInRow.correct.includes(button.id)) colorClass = 'correct'

		if (colorClass) button.classList.add(colorClass)
	})
}

const countLettersInWord = (searchedWord) => {
	let letters = {}
	for(let chr of searchedWord) {
		letters[chr] = letters.hasOwnProperty(chr) ? letters[chr] + 1: 1;
	}

	return letters;
}