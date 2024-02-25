const inputsContainer = document.querySelector('.inputs_container');
const loadingSpan = document.querySelector('span');

const spanishWords = [
  "lucha", "cable", "boton", "lugar", "flor",
  "gente", "volar", "azul", "hoja", "viento",
  "dulce", "mesa", "risas", "luz", "agua",
  "fuego", "cielo", "salsa", "paz", "cafe",
  "muslo", "tiene", "silla", "horno", "pared",
  "papel", "arena", "piedra", "trigo", "salud",
  "miedo", "cigar", "fiesta", "lunes", "verde",
  "azote", "balon", "panza", "grano", "luzon",
  "farol", "puño", "pinar", "bazar", "rueda",
  "oroja", "guiso", "reina", "pato", "copas",
  "gorra", "dunas", "navio", "plaza", "ruina",
  "vapor", "caoba", "nariz", "cubos", "garza",
  "timon", "noble", "genio", "tinta", "lindo",
  "villa", "novia", "mundo", "huaco", "nubes",
  "fiord", "chico", "guapo", "paris", "mango",
  "pirca", "limon", "aguja", "rocas", "cable",
  "canta", "carne", "tarde", "huaca", "golfo",
  "barco", "delta", "pizar", "lente", "arroz",
  "pampa", "giras", "reino", "flota", "picas"
];
const isSpanishMode = true;

let wordGuessAttempt = '';
let word = '';
const MAX_LETTERS = 5;
const MAX_ROUNDS = 6;
let currentRowIndex = 0;
let isLoading = false;
let isGameWon = null;

const WORD_OF_THE_DAY_API_URL = 'https://words.dev-apis.com/word-of-the-day';
const VALIDATE_WORD_API_URL = 'https://words.dev-apis.com/validate-word';

/**
 * Sets the loading state of the game.
 * @param {boolean} loading - Indicates whether the game is currently loading.
 * If `true`, the loading spinner is displayed. If `false`, the loading spinner is hidden.
 */
function setLoadingState(loading) {
  if (loading) {
    loadingSpan.classList.remove('hidden');
  } else {
    loadingSpan.classList.add('hidden');
  }

  isLoading = loading;
}

/**
 * Retrieves the word of the day from the API and sets it as the current word for the game.
 * @returns {Promise<void>} A promise that resolves once the word of the day is fetched and set.
 */
async function getWordOfTheDay() {
  setLoadingState(true);
  if (!isSpanishMode) {
    const res = await fetch(WORD_OF_THE_DAY_API_URL);
    const data = await res.json();
    word = data.word.toUpperCase();
  } else {
    word = spanishWords[Math.floor(Math.random() * spanishWords.length)].toUpperCase();
  }
  setLoadingState(false);

  console.log(word);
}
// Inmediatley call the function to get the word of the day
getWordOfTheDay();

/**
 * Checks if a word is valid by making a request to the validate-word API.
 * @param {string} word - The word to be validated.
 * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the word is valid or not.
 */
async function isValidWord(word) {
  
  if (!isSpanishMode) {
    setLoadingState(true);
    const res = await fetch(VALIDATE_WORD_API_URL, {
      method: 'POST',
      body: JSON.stringify({ word }),
    });
    const data = await res.json();
    setLoadingState(false);
    return data.validWord;
  } else {
    return true;
  }
}

/**
 * Sets the final game state based on whether the game is won or lost.
 * If the game is won, displays a success message.
 * If the game is lost, displays a failure message.
 */
function setFinalGameState() {
  if (isGameWon === null) return;

  if (isGameWon) {
    loadingSpan.innerText = 'You won! 🎉';
  } else {
    loadingSpan.innerText = `You lost! 😢 The word was: ${word}`;
  }

  loadingSpan.style.animation = 'none';
  loadingSpan.classList.remove('hidden');
}

/**
 * Checks if a given character is a letter.
 * @param {string} key - The character to be checked.
 * @returns {boolean} Returns true if the character is a letter, otherwise returns false.
 */
function isLetter(key) {
  return /^[a-zA-Z]$/.test(key);
}

document.addEventListener('keydown', async (e) => {
  if (word === '' || isLoading || isGameWon != null) return;

  // Check is the key is a valid LETTER
  if (isLetter(e.key)) {
    // Tranfor to UPPERCASE all letters
    let letter = e.key.toUpperCase();

    // Replace last letter in case MAX_LETTERS is reached
    if (wordGuessAttempt.length === MAX_LETTERS) {
      wordGuessAttempt[MAX_LETTERS - 1] = letter;
    } else {
      wordGuessAttempt += letter;
    }

    // Assign letter to corresponding INPUT based on current row and word
    inputsContainer.children[wordGuessAttempt.length + (MAX_LETTERS * currentRowIndex) - 1].value = letter;
  } else if (e.key === 'Backspace') {
    // Remove last letter from wordGuessAttempt
    wordGuessAttempt = wordGuessAttempt.slice(0, -1);

    // Remove last letter from corresponding INPUT based on current row and word
    inputsContainer.children[wordGuessAttempt.length + (MAX_LETTERS * currentRowIndex)].value = '';
  } else if (e.key === 'Enter') /* Check WORD */ {
    const _isValidWord = await isValidWord(wordGuessAttempt);

    // Check if it is a valid word
    if (!_isValidWord) {
      // Set flashing animation to all inputs in the current row
      for (let i = 0; i < MAX_LETTERS; i++) {
        inputsContainer.children[i + (MAX_LETTERS * currentRowIndex)].classList.remove('input--invalid-word');

        setTimeout(() => {
          inputsContainer.children[i + (MAX_LETTERS * currentRowIndex)].classList.add('input--invalid-word');
        }, 10);
      }
    } else /* Valid word */ {
      let wordAux = word;

      // Check letter by letter and add corresponding classes to inputs
      for (let i = 0; i < MAX_LETTERS; i++) {
        // Correct letter in correct position
        if (wordGuessAttempt[i] === word[i]) {
          inputsContainer.children[i + (MAX_LETTERS * currentRowIndex)].classList.add('input--correct-letter');
        } else if (wordGuessAttempt[i] !== word[i]) /* Incorrect letter */ {
          // Correct letter in wrong position
          if (wordAux.split('').some((letter) => wordGuessAttempt[i] === letter)) {
            inputsContainer.children[i + (MAX_LETTERS * currentRowIndex)].classList.add('input--correct-letter-wrong-position');
          } else /* This letter is not in the word */ {
            inputsContainer.children[i + (MAX_LETTERS * currentRowIndex)].classList.add('input--wrong-letter');
          }
        }

        wordAux = wordAux.replace(wordGuessAttempt[i], '');
      }

      // Check if the word is correct or if the game is lost
      if (wordGuessAttempt === word) {
        isGameWon = true;
        alert('You won!');
      } else if (currentRowIndex === MAX_ROUNDS - 1) {
        isGameWon = false;
        alert('You lost!');
      }
      setFinalGameState();

      wordGuessAttempt = '';
      currentRowIndex++;
    }
  }
});