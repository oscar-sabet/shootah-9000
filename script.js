const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// Set canvas dimensions to match the viewport
function resizeCanvas () {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
resizeCanvas()
window.addEventListener('resize', resizeCanvas)

const playerShip = new Image()
playerShip.src = 'ship.png'
playerHit = false
playerHitTime = 0
playerSound = false
let bullets = []

ctx.font = '48px Arial'
ctx.fillStyle = 'black'
ctx.textAlign = 'left'
ctx.textBaseline = 'top'

let mouseX = 0
let mouseY = 0
let gameOver = false

let mouseText = "I'm a mouse!"

let score = 0
const hitPoints = 10
const penaltyHit = -10
const penaltyScroll = -25
const scoreText = 'Score: '

let numLives = 3
let livesText = 'Lives: '

function updateLives () {
  ctx.fillText(livesText + numLives, 50, 100)
}

function updateScore (type) {
  if (type === 'hit') {
    score += hitPoints
  } else if (type === 'scroll') {
    score += penaltyScroll
  } else if (type === 'penalty') {
    score += penaltyHit
  }
  ctx.fillText(scoreText + score, 50, 50)
}

// Load and loop background music
const backgroundMusic = new Audio(
  'sfx/Juhani Junkala [Retro Game Music Pack] Level 1.wav'
)
backgroundMusic.loop = true
backgroundMusic.volume = 0.2 // Set volume to 20%
backgroundMusic.play()

let isPlaying = false

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
  bullets.push({ x: mouseX, y: mouseY - 50, font: '24px Arial', speed: 5 })
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
  const bulletWidth = 10 // Approximate width of the bullet
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
  ctx.fillText(scoreText + score, 50, 50)

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
      ctx.font = '48px Arial'
      ctx.fillText(enemyDeathSprite, enemies[i].x, enemies[i].y)
    } else if (enemies[i].hit && Date.now() - enemies[i].hitTime < 230) {
      ctx.font = '64px Arial'
      ctx.fillText(enemyDeathSprite, enemies[i].x - 10, enemies[i].y - 10)
    } else if (enemies[i].hit && Date.now() - enemies[i].hitTime >= 230) {
      enemies[i].y = 0 - Math.random() * canvas.height
      enemies[i].x = Math.random() * canvas.width
      enemies[i].sound = false

      enemies[i].hit = false
      ctx.font = '48px Arial'
      ctx.fillText(enemies[i].text, enemies[i].x, enemies[i].y)
    } else {
      ctx.font = '48px Arial'
      ctx.fillText(enemies[i].text, enemies[i].x, enemies[i].y)
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

    ctx.font = '64px Arial'
    ctx.fillText(enemyDeathSprite, mouseX - 50, mouseY - 50)
  } else if (playerHit && Date.now() - playerHitTime < 200) {
    ctx.font = '96px Arial'
    ctx.fillText(enemyDeathSprite, mouseX - 50, mouseY - 50)
  } else if (playerHit && Date.now() - playerHitTime < 300) {
    ctx.font = '64px Arial'
    ctx.fillText(enemyDeathSprite, mouseX - 50, mouseY - 50)
  } else if (playerHit && Date.now() - playerHitTime < 400) {
    ctx.font = '96px Arial'
    ctx.fillText(enemyDeathSprite, mouseX - 50, mouseY - 50)
  } else if (playerHit && Date.now() - playerHitTime < 500) {
    ctx.font = '64px Arial'
    ctx.fillText(enemyDeathSprite, mouseX - 50, mouseY - 50)
  } else if (playerHit && Date.now() - playerHitTime >= 300) {
    numLives--

    playerSound = false

    playerHit = false
    ctx.font = '48px Arial'
    // ctx.fillText(enemies[i].text, enemies[i].x, enemies[i].y)
  } else {
    ctx.font = '48px Arial'
    ctx.drawImage(playerShip, mouseX - 25, mouseY - 50, 50, 100)

    // ctx.fillText(enemies[i].text, enemies[i].x, enemies[i].y)
  }

  for (let i = 0; i < bullets.length; i++) {
    ctx.font = '24px Arial'
    ctx.fillText('🧷', bullets[i].x, bullets[i].y)
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
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2)
        ctx.fillText(
          'Refresh to play again',
          canvas.width / 2,
          canvas.height / 2 + 50
        )
      }
      updateLives()
      break
      // return
    }
  }

  // ctx.drawImage(playerShip, mouseX - 25, mouseY - 50, 50, 100)
  if (!gameOver) {
    requestAnimationFrame(draw)
  }
}

draw()

// const canvas = document.getElementById('game')
// const ctx = canvas.getContext('2d')

// // Set canvas dimensions to match the viewport
// function resizeCanvas () {
//   canvas.width = window.innerWidth
//   canvas.height = window.innerHeight
// }
// resizeCanvas()
// window.addEventListener('resize', resizeCanvas)

// const playerShip = new Image()
// playerShip.src = 'ship.png'

// let bullets = []

// ctx.font = '48px Arial'
// ctx.fillStyle = 'black'
// ctx.textAlign = 'left'
// ctx.textBaseline = 'top'

// let mouseX = 0,
//   mouseY = 0
// let gameOver = false

// let mouseText = "I'm a mouse!"

// let score = 0
// const hitPoints = 10
// const penaltyHit = -10
// const penaltyScroll = -25
// const scoreText = 'Score: '

// let numLives = 3
// let livesText = 'Lives: '

// function updateLives () {
//   ctx.fillText(livesText + numLives, 50, 100)
// }
// function updateScore (type) {
//   'hit, scroll, penalty'

//   if (type === 'hit') {
//     score += hitPoints
//   } else if (type === 'scroll') {
//     score += penaltyScroll
//   } else if (type === 'penalty') {
//     score += penaltyHit
//   }
//   ctx.fillText(scoreText + score, 50, 50)
// }
// // Load and loop background music
// const backgroundMusic = new Audio(
//   'sfx/Juhani Junkala [Retro Game Music Pack] Level 1.wav'
// )
// backgroundMusic.loop = true
// backgroundMusic.volume = 0.2 // Set volume to 20%
// backgroundMusic.play()

// let isPlaying = false

// const playButton = document.getElementById('playButton')
// playButton.addEventListener('click', () => {
//   if (isPlaying) {
//     backgroundMusic.play()
//   } else {
//     backgroundMusic.pause()
//   }
//   isPlaying = !isPlaying
//   playButton.textContent = isPlaying ? '▶️' : '⏸️'
// })

// // Add event listener to the mute button
// const muteButton = document.getElementById('muteButton')
// let isMuted = false

// muteButton.addEventListener('click', () => {
//   isMuted = !isMuted
//   backgroundMusic.muted = isMuted
//   muteButton.textContent = isMuted ? 'Unmute' : 'Mute'
// })

// canvas.addEventListener('mousemove', e => {
//   const rect = canvas.getBoundingClientRect()
//   mouseX = e.clientX - rect.left
//   mouseY = e.clientY - rect.top
// })

// canvas.addEventListener('mousedown', e => {
//   bullets.push({ x: mouseX, y: mouseY - 50, font: '24px Arial', speed: 5 })
//   const shootSound = new Audio('sfx/laser2.mp3')
//   if (!isMuted) {
//     shootSound.play()
//   }
// })

// const numEnemies = 30
// const enemySprite = '🛸'
// const enemyDeathSprite = '💥'

// let enemies = []
// for (let i = 0; i < numEnemies; i++) {
//   enemies.push({
//     text: enemySprite,
//     x: Math.random() * canvas.width - 50,
//     y: 0 - Math.random() * canvas.height,
//     speedX: 2,
//     speedY: 1,
//     hit: false,
//     sound: false,
//     hitTime: 0
//   })
// }

// let stars = []
// for (let i = 0; i < 100; i++) {
//   stars.push({
//     x: Math.random() * canvas.width,
//     y: Math.random() * canvas.height,
//     radius: Math.random() * 2,
//     speed: Math.random() * 0.5 + 0.5 // Speed between 0.5 and 1
//   })
// }

// function updateWords () {
//   for (let i = 0; i < enemies.length; i++) {
//     enemies[i].y += enemies[i].speedY
//     // enemies[i].x += enemies[i].speedX
//     if (enemies[i].y > canvas.height) {
//       enemies[i].y = 0 - Math.random() * canvas.height
//       enemies[i].x = Math.random() * canvas.width
//       updateScore('scroll')
//     }
//     // if (enemies[i].x > canvas.width - 75 || enemies[i].x < 0) {
//     // enemies[i].speedX = -enemies[i].speedX
//     // }
//   }
// }

// function updateStars () {
//   for (let i = 0; i < stars.length; i++) {
//     stars[i].y += stars[i].speed
//     if (stars[i].y > canvas.height) {
//       stars[i].y = 0
//       stars[i].x = Math.random() * canvas.width
//     }
//   }
// }

// function collision (bullet, word) {
//   const bulletWidth = 10 // Approximate width of the bullet
//   const bulletHeight = 10 // Approximate height of the bullet
//   const wordWidth = ctx.measureText(word.text).width
//   const wordHeight = 24 // Approximate height of the word (font size)

//   return (
//     bullet.x < word.x + wordWidth &&
//     bullet.x + bulletWidth > word.x &&
//     bullet.y < word.y + wordHeight &&
//     bullet.y + bulletHeight > word.y
//   )
// }

// function collisionWithShip (ship, word) {
//   const shipWidth = 50 // Approximate width of the ship
//   const shipHeight = 100 // Approximate height of the ship
//   const wordWidth = ctx.measureText(word.text).width
//   const wordHeight = 24 // Approximate height of the word (font size)

//   return (
//     ship.x < word.x + wordWidth &&
//     ship.x + shipWidth > word.x &&
//     ship.y < word.y + wordHeight &&
//     ship.y + shipHeight > word.y
//   )
// }

// const boomSound = new Audio('sfx/spaceTrash1.mp3')

// function draw () {
//   ctx.clearRect(0, 0, canvas.width, canvas.height)
//   updateWords()
//   updateStars()
//   updateLives()
//   console.log('draw function')
//   ctx.fillText(scoreText + score, 50, 50)

//   for (let i = 0; i < stars.length; i++) {
//     ctx.beginPath()
//     ctx.arc(stars[i].x, stars[i].y, stars[i].radius, 0, Math.PI * 2)
//     ctx.fillStyle = 'white'
//     ctx.fill()
//   }

//   for (let i = 0; i < enemies.length; i++) {
//     if (enemies[i].hit && Date.now() - enemies[i].hitTime < 500) {
//       if (!enemies[i].sound) {
//         updateScore('hit')

//         const boomSound = new Audio('sfx/boom.mp3')
//         boomSound.volume = 0.3
//         if (!isMuted) {
//           boomSound.play()
//         }

//         enemies[i].sound = true
//       }
//       ctx.fillText(enemyDeathSprite, enemies[i].x, enemies[i].y)
//     } else if (enemies[i].hit && Date.now() - enemies[i].hitTime >= 500) {
//       enemies[i].y = 0 - Math.random() * canvas.height
//       enemies[i].x = Math.random() * canvas.width
//       enemies[i].sound = false

//       enemies[i].hit = false
//       ctx.fillText(enemies[i].text, enemies[i].x, enemies[i].y)
//     } else {
//       ctx.fillText(enemies[i].text, enemies[i].x, enemies[i].y)
//     }
//   }

//   for (let i = 0; i < bullets.length; i++) {
//     ctx.fillText('*', bullets[i].x, bullets[i].y)
//     bullets[i].y -= bullets[i].speed
//   }
//   // let i = 0
//   for (let j = 0; j < enemies.length; j++) {
//     if (collisionWithShip({ x: mouseX - 25, y: mouseY - 50 }, enemies[j])) {
//       // Handle collision with the player ship (e.g., end game or reduce lives)
//       numLives--
//       if (numLives === 0) {
//         gameOver = true
//         ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2)
//         ctx.fillText(
//           'Refresh to play again',
//           canvas.width / 2,
//           canvas.height / 2 + 50
//         )
//       }
//       updateLives()
//       // gameOver = true
//       // alert('Game Over!')
//       return
//     }
//   }
//   // Check for collisions with falling words
//   let i = enemies.length

//   // for (let j = 0; j < enemies.length; j++) {
//   // let i = enemies.length

//   // if (collision(playerShip, enemies[j])) {
//   // enemies[j].y = 0 - Math.random() * canvas.height
//   // enemies[j].x = Math.random() * canvas.width
//   // numLives--
//   // updateLives()
//   // if (numLives === 0) {
//   // gameOver = true
//   // ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2)
//   // ctx.fillText(
//   // 'Refresh to play again',
//   // canvas.width / 2,
//   // canvas.height / 2 + 50
//   // )
//   // }
//   // }
//   for (let j = 0; j < bullets.length; j++) {
//     if (collision(bullets[i], enemies[j]) && !enemies[j].hit) {
//       // Handle collision (e.g., change sprite and set hit time)
//       enemies[j].hit = true
//       enemies[j].hitTime = Date.now()
//       bullets.splice(i, 1)
//       i--
//       // break
//     }
//   }

//   ctx.drawImage(playerShip, mouseX - 25, mouseY - 50, 50, 100)
//   if (!gameOver) {
//     requestAnimationFrame(draw)
//   }
// }
// draw()

// const canvas = document.getElementById('game')
// const ctx = canvas.getContext('2d')

// // Set canvas dimensions to match the viewport
// function resizeCanvas () {
//   canvas.width = window.innerWidth
//   canvas.height = window.innerHeight
// }
// resizeCanvas()
// window.addEventListener('resize', resizeCanvas)

// const playerShip = new Image()
// playerShip.src = 'ship.png'

// let bullets = []

// ctx.font = '24px Arial'
// ctx.fillStyle = 'black'
// ctx.textAlign = 'left'
// ctx.textBaseline = 'top'

// let mouseX = 0,
//   mouseY = 0
// let gameOver = false

// let mouseText = "I'm a mouse!"

// let score = 0
// const hitPoints = 10
// const penaltyHit = 10
// const penaltyScroll = 5
// const scoreText = 'Score: '

// function updateScore (type) {
//   if (type === 'hit') {
//     score += hitPoints
//   } else if (type === 'scroll') {
//     score -= penaltyScroll
//   } else if (type === 'penalty') {
//     score -= penaltyHit
//   }
//   ctx.fillText(scoreText + score, 50, 50)
// }

// // Load and loop background music
// const backgroundMusic = new Audio(
//   'sfx/Juhani Junkala [Retro Game Music Pack] Level 1.wav'
// )
// backgroundMusic.loop = true
// backgroundMusic.volume = 0.2 // Set volume to 20%
// backgroundMusic.play()

// // Add event listener to the mute button
// const muteButton = document.getElementById('muteButton')
// let isMuted = false

// muteButton.addEventListener('click', () => {
//   isMuted = !isMuted
//   backgroundMusic.muted = isMuted
//   muteButton.textContent = isMuted ? 'Unmute' : 'Mute'
// })

// canvas.addEventListener('mousemove', e => {
//   const rect = canvas.getBoundingClientRect()
//   mouseX = e.clientX - rect.left
//   mouseY = e.clientY - rect.top
// })

// canvas.addEventListener('mousedown', e => {
//   bullets.push({ x: mouseX, y: mouseY - 50, font: '24px Arial', speed: 5 })
//   const shootSound = new Audio('sfx/laser2.mp3')
//   shootSound.play()
// })

// const numEnimies = 50
// const enemySprite = '🛸'
// const enemyDeathSprite = '💥'

// let enemies = []
// for (let i = 0; i < numEnimies; i++) {
//   enemies.push({
//     text: enemySprite,
//     x: Math.random() * canvas.width,
//     y: 0 - Math.random() * canvas.height,
//     speedX: 2,
//     speedY: 1,
//     hit: false,
//     sound: false,
//     hitTime: 0
//   })
// }

// let stars = []
// for (let i = 0; i < 100; i++) {
//   stars.push({
//     x: Math.random() * canvas.width,
//     y: Math.random() * canvas.height,
//     radius: Math.random() * 2,
//     speed: Math.random() * 0.5 + 0.5 // Speed between 0.5 and 1
//   })
// }

// function updateWords () {
//   for (let i = 0; i < enemies.length; i++) {
//     enemies[i].y += enemies[i].speedY
//     enemies[i].x += enemies[i].speedX
//     if (enemies[i].y > canvas.height) {
//       enemies[i].y = 0 - Math.random() * canvas.height
//       enemies[i].x = Math.random() * canvas.width
//     }
//     if (enemies[i].x > canvas.width - 75 || enemies[i].x < 0) {
//       enemies[i].speedX = -enemies[i].speedX
//     }
//   }
// }

// function updateStars () {
//   for (let i = 0; i < stars.length; i++) {
//     stars[i].y += stars[i].speed
//     if (stars[i].y > canvas.height) {
//       stars[i].y = 0
//       stars[i].x = Math.random() * canvas.width
//     }
//   }
// }

// function collision (bullet, word) {
//   const bulletWidth = 10 // Approximate width of the bullet
//   const bulletHeight = 10 // Approximate height of the bullet
//   const wordWidth = ctx.measureText(word.text).width
//   const wordHeight = 24 // Approximate height of the word (font size)

//   return (
//     bullet.x < word.x + wordWidth &&
//     bullet.x + bulletWidth > word.x &&
//     bullet.y < word.y + wordHeight &&
//     bullet.y + bulletHeight > word.y
//   )
// }

// function collisionWithShip (ship, word) {
//   const shipWidth = 50 // Approximate width of the ship
//   const shipHeight = 100 // Approximate height of the ship
//   const wordWidth = ctx.measureText(word.text).width
//   const wordHeight = 24 // Approximate height of the word (font size)

//   return (
//     ship.x < word.x + wordWidth &&
//     ship.x + shipWidth > word.x &&
//     ship.y < word.y + wordHeight &&
//     ship.y + shipHeight > word.y
//   )
// }

// function draw () {
//   ctx.clearRect(0, 0, canvas.width, canvas.height)
//   updateWords()
//   updateStars()

//   for (let i = 0; i < stars.length; i++) {
//     ctx.beginPath()
//     ctx.arc(stars[i].x, stars[i].y, stars[i].radius, 0, Math.PI * 2)
//     ctx.fillStyle = 'white'
//     ctx.fill()
//   }

//   for (let i = 0; i < enemies.length; i++) {
//     if (enemies[i].hit && Date.now() - enemies[i].hitTime < 500) {
//       if (!enemies[i].sound) {
//         const boomSound = new Audio('sfx/boom.mp3')
//         boomSound.volume = 0.3 // Set the volume to 30%
//         boomSound.play()
//         enemies[i].sound = true
//       }
//       ctx.fillText(enemyDeathSprite, enemies[i].x, enemies[i].y)
//     } else {
//       enemies[i].hit = false
//       ctx.fillText(enemies[i].text, enemies[i].x, enemies[i].y)
//     }
//   }

//   for (let i = 0; i < bullets.length; i++) {
//     ctx.fillText('🚀', bullets[i].x, bullets[i].y)
//     bullets[i].y -= bullets[i].speed

//     // Check for collisions with falling words
//     for (let j = 0; j < enemies.length; j++) {
//       if (collision(bullets[i], enemies[j])) {
//         // Handle collision (e.g., change sprite and set hit time)
//         enemies[j].hit = true
//         enemies[j].hitTime = Date.now()
//         bullets.splice(i, 1)
//         i--
//         break
//       }
//     }
//   }

//   // Check for collisions with the player ship
//   for (let i = 0; i < enemies.length; i++) {
//     if (
//       collisionWithShip({ x: mouseX - 25, y: mouseY - 50 }, enemies[i])
//     ) {
//       // Handle collision with the player ship (e.g., end game or reduce lives)
//       gameOver = true
//       alert('Game Over!')
//       return
//     }
//   }

//   ctx.drawImage(playerShip, mouseX - 25, mouseY - 50, 50, 100)
//   if (!gameOver) {
//     requestAnimationFrame(draw)
//   }
// }

// draw()
