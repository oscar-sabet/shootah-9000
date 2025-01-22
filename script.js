const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// Player Variables
const playerShip = new Image()
playerShip.src = 'ship.png'
let playerHit = false
let playerHitTime = 0
let playerSound = false
let bullets = []

let mouseX = 0
let mouseY = 0

// Font Variables
ctx.font = '48px Montserrat'
ctx.fillStyle = 'black'
ctx.textAlign = 'left'
ctx.textBaseline = 'top'

let gameOver = false
const gameOverText = 'Game Over!'
const refreshText = 'Refresh to play again'

// Gameover variable
let toggle = true

// let mouseText = "I'm a mouse!"

// Score variables
const hitPoints = 10
const penaltyHit = -10
const penaltyScroll = -25

const scoreText = 'Score: '
let score = 0

const highScoreText = 'High Score: '
let highScore = 0

let livesText = 'Lives: '
let numLives = 3

// Load and loop background music
const backgroundMusic = new Audio('sfx/level-1-bg.wav')
backgroundMusic.loop = true
backgroundMusic.volume = 0.2 // Set volume to 20%
backgroundMusic.play()

// Used to pause and play the background music
let isPlaying = false

// Set canvas dimensions to match the viewport
function resizeCanvas () {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
resizeCanvas()
window.addEventListener('resize', resizeCanvas)

function updateLives () {
  ctx.font = '36px Montserrat'
  ctx.fillText(livesText + numLives, 50, 150)
  if (score > highScore) {
    highScore = score
  }
}

function updateScore (type = '') {
  if (type === 'hit') {
    score += hitPoints
  } else if (type === 'scroll') {
    score += penaltyScroll
  } else if (type === 'penalty') {
    score += penaltyHit
  }
  ctx.font = '36px Montserrat'
  ctx.fillText(scoreText + score, 50, 100)
  ctx.fillText(highScoreText + highScore, 50, 50)
}

function gameOverLoop () {
  function ranColor () {
    return Math.floor(Math.random() * 255)
  }
  score = 0
  ctx.fillStyle = `rgb(${ranColor()}, ${ranColor()}, ${ranColor()})`
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (toggle) {
    ctx.fillStyle = `rgb(${ranColor()}, ${ranColor()}, ${ranColor()})`
  } else if (!toggle) {
    ctx.fillStyle = `rgb(${ranColor()}, ${ranColor()}, ${ranColor()})`
  }
  toggle = !toggle
  ctx.font = '64px Montserrat'
  ctx.fillText(
    'Game Over!',
    canvas.width / 2 - ctx.measureText(gameOverText).width / 2,
    canvas.height / 2
  )
  ctx.font = '48px Montserrat'
  ctx.fillText(
    'Refresh to play again',
    canvas.width / 2 - ctx.measureText(refreshText).width / 2,
    canvas.height / 2 + 50
  )
  // ctx.fillStyle = 'black'
  setInterval(gameOverLoop, 400)
}

const playButton = document.getElementById('playButton')
playButton.addEventListener('click', () => {
  if (isPlaying) {
    backgroundMusic.play()
  } else {
    backgroundMusic.pause()
  }
  isPlaying = !isPlaying
  playButton.textContent = isPlaying ? '▶️' : '⏸️'
})

// Add event listener to the mute button
const muteButton = document.getElementById('muteButton')
let isMuted = false

muteButton.addEventListener('click', () => {
  isMuted = !isMuted
  backgroundMusic.muted = isMuted
  muteButton.textContent = isMuted ? 'Unmute' : 'Mute'
})

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect()
  mouseX = e.clientX - rect.left
  mouseY = e.clientY - rect.top
})

canvas.addEventListener('mousedown', e => {
  bullets.push({ x: mouseX, y: mouseY - 50, font: '24px Montserrat', speed: 5 })
  const shootSound = new Audio('sfx/laser2.mp3')
  if (!isMuted) {
    shootSound.play()
  }
})

const numEnemies = 30
const enemySprite = '🛸'
const enemyDeathSprite = '💥'

let enemies = []
for (let i = 0; i < numEnemies; i++) {
  enemies.push({
    text: enemySprite,
    x: Math.random() * canvas.width - 50,
    y: 0 - Math.random() * canvas.height,
    speedX: 2,
    speedY: 1,
    hit: false,
    sound: false,
    hitTime: 0
  })
}

let stars = []
for (let i = 0; i < 100; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2,
    speed: Math.random() * 0.5 + 0.5 // Speed between 0.5 and 1
  })
}

function updateWords () {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].y += enemies[i].speedY
    if (enemies[i].y > canvas.height) {
      enemies[i].y = 0 - Math.random() * canvas.height
      enemies[i].x = Math.random() * canvas.width
      updateScore('scroll')
    }
  }
}

function updateStars () {
  for (let i = 0; i < stars.length; i++) {
    stars[i].y += stars[i].speed
    if (stars[i].y > canvas.height) {
      stars[i].y = 0
      stars[i].x = Math.random() * canvas.width
    }
  }
}

function collision (bullet, word) {
  const bulletWidth = ctx.measureText(word.text).width
  // 10 // Approximate width of the bullet
  const bulletHeight = 10 // Approximate height of the bullet
  const wordWidth = ctx.measureText(word.text).width
  const wordHeight = 24 // Approximate height of the word (font size)

  return (
    bullet.x < word.x + wordWidth &&
    bullet.x + bulletWidth > word.x &&
    bullet.y < word.y + wordHeight &&
    bullet.y + bulletHeight > word.y
  )
}

function collisionWithShip (ship, word) {
  const shipWidth = 50 // Approximate width of the ship
  const shipHeight = 100 // Approximate height of the ship
  const wordWidth = ctx.measureText(word.text).width
  const wordHeight = 24 // Approximate height of the word (font size)

  return (
    ship.x < word.x + wordWidth &&
    ship.x + shipWidth > word.x &&
    ship.y < word.y + wordHeight &&
    ship.y + shipHeight > word.y
  )
}

const boomSound = new Audio('sfx/spaceTrash1.mp3')

function draw () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  updateWords()
  updateStars()
  updateLives()
  updateScore()

  for (let i = 0; i < stars.length; i++) {
    ctx.beginPath()
    ctx.arc(stars[i].x, stars[i].y, stars[i].radius, 0, Math.PI * 2)
    ctx.fillStyle = 'white'
    ctx.fill()
  }

  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].hit && Date.now() - enemies[i].hitTime < 100) {
      if (!enemies[i].sound) {
        updateScore('hit')
        const boomSound = new Audio('sfx/boom.mp3')
        boomSound.volume = 0.3
        if (!isMuted) {
          boomSound.play()
        }
        enemies[i].sound = true
      }
      ctx.font = '48px Montserrat'
      ctx.fillText(enemyDeathSprite, enemies[i].x - 24, enemies[i].y)
    } else if (enemies[i].hit && Date.now() - enemies[i].hitTime < 230) {
      ctx.font = '64px Montserrat'
      ctx.fillText(enemyDeathSprite, enemies[i].x - 24 - 10, enemies[i].y - 0)
    } else if (enemies[i].hit && Date.now() - enemies[i].hitTime >= 230) {
      enemies[i].y = 0 - Math.random() * canvas.height
      enemies[i].x = Math.random() * canvas.width
      enemies[i].sound = false

      enemies[i].hit = false
      ctx.font = '48px Montserrat'
      ctx.fillText(enemies[i].text, enemies[i].x - 24, enemies[i].y)
    } else {
      ctx.font = '48px Montserrat'
      ctx.fillText(enemies[i].text, enemies[i].x - 24, enemies[i].y)
    }
  }

  if (playerHit && Date.now() - playerHitTime < 100) {
    if (!playerSound) {
      const boomSound = new Audio('sfx/boom.mp3')
      boomSound.volume = 0.3

      if (!isMuted) {
        boomSound.play()
      }
      playerSound = true
    }

    ctx.font = '64px Montserrat'
    ctx.fillText(enemyDeathSprite, mouseX - 32, mouseY + 32)
  } else if (playerHit && Date.now() - playerHitTime < 200) {
    ctx.font = '96px Montserrat'
    ctx.fillText(enemyDeathSprite, mouseX - 48, mouseY + 48)
  } else if (playerHit && Date.now() - playerHitTime < 300) {
    ctx.font = '64px Montserrat'
    ctx.fillText(enemyDeathSprite, mouseX - 32, mouseY + 32)
  } else if (playerHit && Date.now() - playerHitTime < 400) {
    ctx.font = '96px Montserrat'
    ctx.fillText(enemyDeathSprite, mouseX - 48, mouseY + 48)
  } else if (playerHit && Date.now() - playerHitTime < 500) {
    ctx.font = '64px Montserrat'
    ctx.fillText(enemyDeathSprite, mouseX - 32, mouseY + 32)
  } else if (playerHit && Date.now() - playerHitTime >= 500) {
    numLives--
    playerSound = false
    playerHit = false
    ctx.font = '48px Montserrat'
    // ctx.fillText(enemies[i].text, enemies[i].x, enemies[i].y)
  } else {
    ctx.font = '48px Montserrat'
    ctx.drawImage(playerShip, mouseX - 25, mouseY - 50, 50, 100)

    // ctx.fillText(enemies[i].text, enemies[i].x, enemies[i].y)
  }

  for (let i = 0; i < bullets.length; i++) {
    ctx.font = '24px Montserrat'
    ctx.fillText('|', bullets[i].x - 0, bullets[i].y)
    bullets[i].y -= bullets[i].speed

    // Check for collisions with enemies
    for (let j = 0; j < enemies.length; j++) {
      if (collision(bullets[i], enemies[j]) && !enemies[j].hit) {
        // Handle collision (e.g., change sprite and set hit time)
        enemies[j].hit = true
        enemies[j].hitTime = Date.now()
        bullets.splice(i, 1)
        i--
        break
      }
    }
  }

  // Check for collisions with the player ship
  for (let i = 0; i < enemies.length; i++) {
    if (
      collisionWithShip({ x: mouseX - 25, y: mouseY - 50 }, enemies[i]) &&
      !playerHit
    ) {
      // Handle collision with the player ship (e.g., end game or reduce lives)
      // numLives--
      playerHit = true
      playerHitTime = Date.now()
      if (numLives === 0) {
        gameOver = true
        // ctx.font = '48px Montserrat'
        // let l = ctx.measureText('Game Over!')
        // ctx.fillText(
        //   'Game Over!',
        //   canvas.width / 2 - l.width,
        //   canvas.height / 2
        // )
        // l = ctx.measureText('Refresh to play again')
        // console.log(l.width)
        // ctx.fillText(
        //   'Refresh to play again',
        //   canvas.width / 2 - l.width,
        //   canvas.height / 2 + 50
        // )
      }
      updateLives()
      break
      // return
    }
  }

  // ctx.drawImage(playerShip, mouseX - 25, mouseY - 50, 50, 100)
  if (!gameOver) {
    requestAnimationFrame(draw)
  } else {
    gameOverLoop()
  }
}

draw()
