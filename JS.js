const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const roomWidth = canvas.width;
const roomHeight = canvas.height;

// Create a grid of rooms (3x3 grid for this example)
const gridRows = 3;
const gridCols = 3;
const rooms = {};
for (let y = 0; y < gridRows; y++) {
  for (let x = 0; x < gridCols; x++) {
    rooms[`${x},${y}`] = { gridX: x, gridY: y };
  }
}

// Start in the center room (1,1)
let currentRoom = { gridX: 1, gridY: 1 };

function getRoomKey(room) {
  return `${room.gridX},${room.gridY}`;
}

function roomExists(x, y) {
  return rooms.hasOwnProperty(`${x},${y}`);
}

// Player object with position, speed, and dimensions for the image
const player = {
  // Adjust these values if needed for your image
  x: roomWidth / 2 - 32,  // Centered if using 64x64 dimensions
  y: roomHeight / 2 - 32,
  speed: 2,
  width: 64,
  height: 64
};

// Load your custom PNG image using the raw URL
const playerImage = new Image();
playerImage.src = 'https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/IMG_6406.PNG';

// Keep track of pressed keys for movement
const keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':    keys.up = true;    break;
    case 'ArrowDown':  keys.down = true;  break;
    case 'ArrowLeft':  keys.left = true;  break;
    case 'ArrowRight': keys.right = true; break;
  }
});

document.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'ArrowUp':    keys.up = false;    break;
    case 'ArrowDown':  keys.down = false;  break;
    case 'ArrowLeft':  keys.left = false;  break;
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
    if (roomExists(currentRoom.gridX - 1, currentRoom.gridY)) {
      if (player.y + player.height / 2 > (roomHeight - doorGap) / 2 &&
          player.y + player.height / 2 < (roomHeight + doorGap) / 2) {
        currentRoom.gridX -= 1;
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
    if (roomExists(currentRoom.gridX + 1, currentRoom.gridY)) {
      if (player.y + player.height / 2 > (roomHeight - doorGap) / 2 &&
          player.y + player.height / 2 < (roomHeight + doorGap) / 2) {
        currentRoom.gridX += 1;
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
    if (roomExists(currentRoom.gridX, currentRoom.gridY - 1)) {
      if (player.x + player.width / 2 > (roomWidth - doorGap) / 2 &&
          player.x + player.width / 2 < (roomWidth + doorGap) / 2) {
        currentRoom.gridY -= 1;
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
    if (roomExists(currentRoom.gridX, currentRoom.gridY + 1)) {
      if (player.x + player.width / 2 > (roomWidth - doorGap) / 2 &&
          player.x + player.width / 2 < (roomWidth + doorGap) / 2) {
        currentRoom.gridY += 1;
        player.y = 0; // Enter from top edge
      } else {
        player.y = roomHeight - player.height;
      }
    } else {
      player.y = roomHeight - player.height;
    }
  }
}

// Draw the current room with walls and door gaps where an adjacent room exists
function drawRoom() {
  // Draw room floor
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, roomWidth, roomHeight);

  ctx.strokeStyle = '#888';
  ctx.lineWidth = 8;

  // Top wall
  ctx.beginPath();
  let doorStartX = (roomWidth - doorGap) / 2;
  let doorEndX = doorStartX + doorGap;
  if (roomExists(currentRoom.gridX, currentRoom.gridY - 1)) {
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
  if (roomExists(currentRoom.gridX, currentRoom.gridY + 1)) {
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
  if (roomExists(currentRoom.gridX - 1, currentRoom.gridY)) {
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
  if (roomExists(currentRoom.gridX + 1, currentRoom.gridY)) {
    ctx.moveTo(roomWidth, 0);
    ctx.lineTo(roomWidth, doorStartY);
    ctx.moveTo(roomWidth, doorEndY);
    ctx.lineTo(roomWidth, roomHeight);
  } else {
    ctx.moveTo(roomWidth, 0);
    ctx.lineTo(roomWidth, roomHeight);
  }
  ctx.stroke();

  // (Optional) Display room coordinates for debugging
  ctx.fillStyle = '#fff';
  ctx.font = '16px Arial';
  ctx.fillText(`Room: ${getRoomKey(currentRoom)}`, 10, 20);
}

// Draw the player character using the PNG image (with a fallback)
function drawPlayer() {
  if (playerImage.complete) {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
  } else {
    // Fallback: Draw a simple green rectangle
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
