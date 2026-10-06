// Música y efectos con <audio> del navegador: p5.sound no viene en libraries/ y el proyecto
// no usa CDN. Igual que con los sprites, el juego pide cada sonido por su nombre de archivo.
const MUSIC_NAMES = ['HomeScreen', 'MainSoundtrack', 'GameOver']
const SOUND_NAMES = ['Hop', 'DieOnLand', 'Drown', 'Homed', 'TimeWarning']

const SOUNDS = {}
let currentMusic = null

function loadSounds() {
  for (const name of [...MUSIC_NAMES, ...SOUND_NAMES]) {
    SOUNDS[name] = new Audio(`../music/${name}.mp3`)
    SOUNDS[name].preload = 'auto'
  }
}

// El navegador rechaza play() hasta que el jugador pulsa una tecla; el rechazo se ignora y
// resumeMusic() la arranca en la primera pulsación.
function playAudio(audio) {
  audio.currentTime = 0
  audio.play().catch(() => {})
}

// Solo suena una pista de música a la vez. Pedir la que ya suena no la reinicia, así
// MainSoundtrack sigue de corrido entre una muerte y la siguiente vida.
function playMusic(name, loop = true) {
  const next = SOUNDS[name]
  if (next == currentMusic && !next.paused)
    return
  stopMusic()
  currentMusic = next
  currentMusic.loop = loop
  playAudio(currentMusic)
}

function stopMusic() {
  if (currentMusic != null)
    currentMusic.pause()
  currentMusic = null
}

function resumeMusic() {
  if (currentMusic != null && currentMusic.paused && currentMusic.loop)
    currentMusic.play().catch(() => {})
}

function playSound(name) {
  playAudio(SOUNDS[name])
}
