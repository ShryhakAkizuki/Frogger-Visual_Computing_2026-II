# Cómo probar un cambio

No hay framework de tests. Se carga el juego en Chromium sin interfaz con una página de prueba **fuera del repositorio** (p. ej. en el scratchpad del agente) que llama a los métodos de `game` y escribe los resultados en el DOM.

## Plantilla

Ajusta el `<base href>` a la ruta absoluta de `frogger/` y cambia solo el bloque de comprobaciones. `game` existe tras el `load` de la ventana, porque lo crea `setup()`.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <base href="file:///RUTA/AL/REPO/frogger/">
  <script src="libraries/p5.min.js"></script>
  <script src="constants.js"></script>
  <script src="entities.js"></script>
  <script src="frog.js"></script>
  <script src="lanes.js"></script>
  <script src="game.js"></script>
  <script src="frogger.js"></script>
</head>
<body>
<pre id="out"></pre>
<script>
  const log = (k, v) => out.textContent += `${k}: ${JSON.stringify(v)}\n`
  window.addEventListener('load', () => setTimeout(() => {
    try {
      // Comprobaciones
      game.handleInput(INPUT.UP)            // READY → PLAYING
      game.handleInput(INPUT.UP)            // salto
      for (let i = 0; i < 5; i++) game.update()
      log('estado', game.state)
      log('fila', game.frog.row())
      log('score', game.score)
    } catch (e) { log('ERROR', e.stack) }
  }, 200))
</script>
</body>
</html>
```

Si un script nuevo se añade a `index.html`, añádelo aquí en el mismo orden.

## Ejecutar

```
chromium --headless=new --no-sandbox --allow-file-access-from-files --virtual-time-budget=3000 --dump-dom prueba.html 2>/dev/null | grep -A20 '<pre'
```

## Ver el resultado

```
chromium --headless=new --no-sandbox --allow-file-access-from-files --virtual-time-budget=3000 --screenshot=<ruta.png> --window-size=730,840 frogger/index.html
```
