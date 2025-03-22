const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const roomWidth = canvas.width;
const roomHeight = canvas.height;

// Define background image URLs for each room (update these URLs to your desired PNGs)
const roomBackgroundURLs = {
  "0,0": "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/background1.png",
  "1,0": "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/background2.png",
  "2,0": "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/background3.png",
  "0,1": "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/background4.png",
  "1,1": "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/background5.png",
  "2,1": "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/background6.png",
  "0,2": "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/background7.png",
  "1,2": "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/background8.png",
  "2,2": "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/background9.png"
};

// Define custom room names for each room coordinate
const customRoomNames = {
  "0,0": "Dungeon",
  "1,0": "Forest",
  "2,0": "Castle",
  "0,1": "Village",
  "1,1": "Market",
  "2,1": "River",
  "0,2": "Mountain",
  "1,2": "Cave",
  "2,2": "Tower"
};

// Create a grid of rooms (3x3 grid for this example)
const gridRows = 3;
const gridCols = 3;
const rooms = {};
for (let y = 0; y < gridRows; y++) {
  for (let x = 0; x < gridCols; x++) {
    const key = `${x},${y}`;
    // Create a new Image object for the background if a URL is provided
    const bgImage = new Image();
    if (roomBackgroundURLs[key]) {
      bgImage.src = roomBackgroundURLs[key];
    }
    // Use the custom room name from the mapping (or fallback if not defined)
    const name = customRoomNames[key] || `Room ${key}`;
    rooms[key] = {
      gridX: x,
      gridY: y,
      name: name,
      background: bgImage
    };
  }
}

// Start in the center room (which is "Market" based on the above mapping for coordinate "1,1")
let currentRoom = rooms["1,1"];

// Player object with position, speed, and dimensions for the character image
const player = {
  x: roomWidth / 2 - 32,  // Centered if using 64x64 dimensions
  y: roomHeight / 2 - 32,
  speed: 2,
  width: 64,
  height: 64
};

// Load your character image (using little_girl.PNG)
const playerImage = new Image();
playerImage.src = 'https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/little_girl.PNG';

// Keep track of pressed keys for movement
const keys = { up: false, down: false, left: false, right: false };
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':    keys.up = true; break;
    case 'ArrowDown':  keys.down = true; break;
    case 'ArrowLeft':  keys.left = true; break;
    case 'ArrowRight': keys.right = true; break;
  }
});
document.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'ArrowUp':    keys.up = false; break;
    case 'ArrowDown':  keys.down = false; break;
    case 'ArrowLeft':  keys.left = false; break;
    case 'ArrowRight': keys.right = false; break;
  }
});

// Define the door gap size for walls with adjacent rooms
const doorGap = 80;

// Update player's position and handle room transitions
function update() {
  let dx = 0, dy = 0;
  if (keys.up)    dy -= player.speed;
  if (keys.down)  dy += player.speed;
  if (keys.left)  dx -= player.speed;
  if (keys.right) dx += player.speed;

  player.x += dx;
  player.y += dy;

  // Left boundary
  if (player.x < 0) {
    if (rooms.hasOwnProperty(`${currentRoom.gridX - 1},${currentRoom.gridY}`)) {
      if (player.y + player.height / 2 > (roomHeight - doorGap) / 2 &&
          player.y + player.height / 2 < (roomHeight + doorGap) / 2) {
        currentRoom = rooms[`${currentRoom.gridX - 1},${currentRoom.gridY}`];
        player.x = roomWidth - player.width; // Enter from right edge
      } else {
        player.x = 0;
      }
    } else {
      player.x = 0;
    }
  }

  // Right boundary
  if (player.x + player.width > roomWidth) {
    if (rooms.hasOwnProperty(`${currentRoom.gridX + 1},${currentRoom.gridY}`)) {
      if (player.y + player.height / 2 > (roomHeight - doorGap) / 2 &&
          player.y + player.height / 2 < (roomHeight + doorGap) / 2) {
        currentRoom = rooms[`${currentRoom.gridX + 1},${currentRoom.gridY}`];
        player.x = 0; // Enter from left edge
      } else {
        player.x = roomWidth - player.width;
      }
    } else {
      player.x = roomWidth - player.width;
    }
  }

  // Top boundary
  if (player.y < 0) {
    if (rooms.hasOwnProperty(`${currentRoom.gridX},${currentRoom.gridY - 1}`)) {
      if (player.x + player.width / 2 > (roomWidth - doorGap) / 2 &&
          player.x + player.width / 2 < (roomWidth + doorGap) / 2) {
        currentRoom = rooms[`${currentRoom.gridX},${currentRoom.gridY - 1}`];
        player.y = roomHeight - player.height; // Enter from bottom edge
      } else {
        player.y = 0;
      }
    } else {
      player.y = 0;
    }
  }

  // Bottom boundary
  if (player.y + player.height > roomHeight) {
    if (rooms.hasOwnProperty(`${currentRoom.gridX},${currentRoom.gridY + 1}`)) {
      if (player.x + player.width / 2 > (roomWidth - doorGap) / 2 &&
          player.x + player.width / 2 < (roomWidth + doorGap) / 2) {
        currentRoom = rooms[`${currentRoom.gridX},${currentRoom.gridY + 1}`];
        player.y = 0; // Enter from top edge
      } else {
        player.y = roomHeight - player.height;
      }
    } else {
      player.y = roomHeight - player.height;
    }
  }
}

// Draw the current room with its specific background image and name
function drawRoom() {
  const bgImage = currentRoom.background;
  if (bgImage && bgImage.complete && bgImage.naturalWidth) {
    ctx.drawImage(bgImage, 0, 0, roomWidth, roomHeight);
  } else {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, roomWidth, roomHeight);
  }

  ctx.strokeStyle = '#888';
  ctx.lineWidth = 8;

  // Top wall
  ctx.beginPath();
  let doorStartX = (roomWidth - doorGap) / 2;
  let doorEndX = doorStartX + doorGap;
  if (rooms.hasOwnProperty(`${currentRoom.gridX},${currentRoom.gridY - 1}`)) {
    ctx.moveTo(0, 0);
    ctx.lineTo(doorStartX, 0);
    ctx.moveTo(doorEndX, 0);
    ctx.lineTo(roomWidth, 0);
  } else {
    ctx.moveTo(0, 0);
    ctx.lineTo(roomWidth, 0);
  }
  ctx.stroke();

  // Bottom wall
  ctx.beginPath();
  doorStartX = (roomWidth - doorGap) / 2;
  doorEndX = doorStartX + doorGap;
  if (rooms.hasOwnProperty(`${currentRoom.gridX},${currentRoom.gridY + 1}`)) {
    ctx.moveTo(0, roomHeight);
    ctx.lineTo(doorStartX, roomHeight);
    ctx.moveTo(doorEndX, roomHeight);
    ctx.lineTo(roomWidth, roomHeight);
  } else {
    ctx.moveTo(0, roomHeight);
    ctx.lineTo(roomWidth, roomHeight);
  }
  ctx.stroke();

  // Left wall
  ctx.beginPath();
  let doorStartY = (roomHeight - doorGap) / 2;
  let doorEndY = doorStartY + doorGap;
  if (rooms.hasOwnProperty(`${currentRoom.gridX - 1},${currentRoom.gridY}`)) {
    ctx.moveTo(0, 0);
    ctx.lineTo(0, doorStartY);
    ctx.moveTo(0, doorEndY);
    ctx.lineTo(0, roomHeight);
  } else {
    ctx.moveTo(0, 0);
    ctx.lineTo(0, roomHeight);
  }
  ctx.stroke();

  // Right wall
  ctx.beginPath();
  doorStartY = (roomHeight - doorGap) / 2;
  doorEndY = doorStartY + doorGap;
  if (rooms.hasOwnProperty(`${currentRoom.gridX + 1},${currentRoom.gridY}`)) {
    ctx.moveTo(roomWidth, 0);
    ctx.lineTo(roomWidth, doorStartY);
    ctx.moveTo(roomWidth, doorEndY);
    ctx.lineTo(roomWidth, roomHeight);
  } else {
    ctx.moveTo(roomWidth, 0);
    ctx.lineTo(roomWidth, roomHeight);
  }
  ctx.stroke();

  // Display the current room's custom name
  ctx.fillStyle = '#fff';
  ctx.font = '20px Arial';
  ctx.fillText(currentRoom.name, 10, 30);
}

// Draw the player character using the PNG image (with a fallback)
function drawPlayer() {
  if (playerImage.complete) {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
  } else {
    ctx.fillStyle = '#0f0';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
}

function gameLoop() {
  update();
  drawRoom();
  drawPlayer();
  requestAnimationFrame(gameLoop);
}

gameLoop();
