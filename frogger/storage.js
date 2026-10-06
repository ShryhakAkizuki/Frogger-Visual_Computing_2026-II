// localStorage es el único almacenamiento del juego: solo guarda el récord.
const HIGH_SCORE_KEY = 'frogger_highscore'

// try/catch: el navegador puede bloquear el almacenamiento (modo privado, permisos).
function loadHighScore() {
  try {
    const value = parseInt(localStorage.getItem(HIGH_SCORE_KEY), 10)
    return Number.isFinite(value) && value > 0 ? value : 0
  } catch (e) {
    return 0
  }
}

function saveHighScore(score) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, score)
  } catch (e) {}
}
