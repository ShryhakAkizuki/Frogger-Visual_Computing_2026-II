// Pantalla de título. No conoce la partida: al elegir JUGAR devuelve MENU_ACTION.PLAY y Game
// decide qué hacer, igual que con FROG_RESULT. Los submenús son páginas internas del menú.
const MENU_ACTION = { NONE: 'NONE', PLAY: 'PLAY' }

const DOCS_URL = 'https://github.com/ShryhakAkizuki/Frogger-Visual_Computing_2026-II'
const CREDITS = ['OSCAR RIVEROS PEREZ', 'CAMILO LONDOÑO MORENO', 'Omar Nicolás Guerrero','Oscar Ivan Ulises Gutiérrez Palacios']

// Disposición según FroggerTable.png, en coordenadas del canvas sobre la rejilla de 8 px del
// arcade. Como en el tablero, río arriba y carretera abajo.
const TITLE_WATER_H = 136
const TITLE_LOGO_Y = 48
const TITLE_FOOTER_Y = 224
const CURSOR_GAP = 24

const MENU_PAGES = {
  MAIN: {
    items: [
      { label: 'JUGAR', x: 72, y: 96, select: () => MENU_ACTION.PLAY },
      { label: 'CREDITOS', x: 72, y: 120, select: menu => menu.open(MENU_PAGES.CREDITS) },
      { label: 'DOCUMENTACION', x: 72, y: 144, select: () => { window.open(DOCS_URL, '_blank', 'noopener') } },
    ],
    drawContent() {},
  },
  CREDITS: {
    items: [
      { label: 'VOLVER', x: 88, y: 192, select: menu => menu.open(MENU_PAGES.MAIN) },
    ],
    drawContent() {
      drawTextCentered('-CREDITOS-', 88, FONT_COLORS.WHITE)
      CREDITS.forEach((name, i) => drawTextCentered(name, 112 + i * 16, FONT_COLORS.RED))
    },
  },
}

class Menu {
  constructor() {
    this.open(MENU_PAGES.MAIN)
  }

  open(page) {
    this.page = page
    this.cursor = 0
  }

  handleInput(input) {
    const items = this.page.items
    if (input == INPUT.UP)
      this.cursor = (this.cursor + items.length - 1) % items.length
    else if (input == INPUT.DOWN)
      this.cursor = (this.cursor + 1) % items.length
    else if (input == INPUT.SELECT)
      return items[this.cursor].select(this) ?? MENU_ACTION.NONE
    return MENU_ACTION.NONE
  }

  draw() {
    push()
    noStroke()
    background(COLORS.ROAD)
    fill(COLORS.WATER)
    rect(0, 0, CANVAS_W, TITLE_WATER_H)
    drawSprite('title_logo', (CANVAS_W - SPRITES.title_logo.width) / 2, TITLE_LOGO_Y)

    this.page.drawContent()
    this.page.items.forEach((item, i) => {
      drawText(item.label, item.x, item.y, FONT_COLORS.YELLOW)
      // La rana (16 px) queda centrada en vertical con el texto (8 px).
      if (i == this.cursor)
        drawSprite('frog_right', item.x - CURSOR_GAP, item.y - (CELL - FONT_SIZE) / 2)
    })

    drawTextCentered('UNAL  ©  2026', TITLE_FOOTER_Y, FONT_COLORS.WHITE)
    pop()
  }
}
