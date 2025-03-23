const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const roomWidth = canvas.width;
const roomHeight = canvas.height;

let gameOver = false;
let gameWon = false; // New global variable for win state

// Define background image URLs for each room (update these URLs as needed)
const roomBackgroundURLs = {
  "0,0": "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/background1.png",
  "1,0": "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/background2.png",
  "2,0": "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/background1.png",
  "0,1": "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/background1.png",
  "1,1": "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/background2.png",
  "2,1": "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/background6.png"
};

// Define custom room names for each room coordinate
const customRoomNames = {
  "0,0": "Spawn Point",
  "1,0": "Forest",
  "2,0": "Castle",
  "0,1": "Village",
  "1,1": "Market",
  "2,1": "River"
};

// Create a grid of rooms (2 rows x 3 columns)
const gridRows = 2;
const gridCols = 3;
const rooms = {};
for (let y = 0; y < gridRows; y++) {
  for (let x = 0; x < gridCols; x++) {
    const key = `${x},${y}`;
    const bgImage = new Image();
    if (roomBackgroundURLs[key]) {
      bgImage.src = roomBackgroundURLs[key];
    }
    const name = customRoomNames[key] || `Room ${key}`;
    rooms[key] = {
      gridX: x,
      gridY: y,
      name: name,
      background: bgImage
    };
  }
}

// Add 3 enemies to room (1,0)
if (rooms["1,0"]) {
  rooms["1,0"].enemies = [];
  for (let i = 0; i < 3; i++) {
    const enemy = {
      x: Math.random() * (roomWidth - 32),
      y: Math.random() * (roomHeight - 32),
      width: 32,
      height: 32,
      speed: 1,
      dx: 0,
      dy: 0
    };
    rooms["1,0"].enemies.push(enemy);
  }
}

// Add 3 enemies to room (1,1)
if (rooms["1,1"]) {
  rooms["1,1"].enemies = [];
  for (let i = 0; i < 3; i++) {
    const enemy = {
      x: Math.random() * (roomWidth - 32),
      y: Math.random() * (roomHeight - 32),
      width: 32,
      height: 32,
      speed: 1,
      dx: 0,
      dy: 0
    };
    rooms["1,1"].enemies.push(enemy);
  }
}

// In room (2,0), add three health pickups.
// The first and second remain as before; the third is now bigger (64x64).
if (rooms["2,0"]) {
  rooms["2,0"].healthPickups = [];
  const positions = [
    { x: roomWidth * 0.25 - 24, y: roomHeight * 0.25 - 24 },
    { x: roomWidth * 0.5 - 28,  y: roomHeight * 0.5 - 28 },
    { x: roomWidth * 0.75 - 32, y: roomHeight * 0.75 - 32 }
  ];
  const pickupImage1 = new Image();
  pickupImage1.src = "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/health_pickup.png";
  const pickupImage2 = new Image();
  pickupImage2.src = "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/health_pickup2.png";
  const pickupImage3 = new Image();
  pickupImage3.src = "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/health_pickup3.png";
  
  rooms["2,0"].healthPickups.push({
    x: positions[0].x,
    y: positions[0].y,
    width: 48,
    height: 48,
    image: pickupImage1,
    collected: false
  });
  rooms["2,0"].healthPickups.push({
    x: positions[1].x,
    y: positions[1].y,
    width: 56,
    height: 56,
    image: pickupImage2,
    collected: false
  });
  rooms["2,0"].healthPickups.push({
    x: positions[2].x,
    y: positions[2].y,
    width: 64,
    height: 64,
    image: pickupImage3,
    collected: false
  });
}

// In room (0,1), add an appearance pickup.
// When the girl touches this pickup, her appearance changes.
if (rooms["0,1"]) {
  rooms["0,1"].appearancePickup = {
    x: roomWidth / 2 - 32,
    y: roomHeight / 2 - 32,
    width: 64,
    height: 64,
    image: (function() {
      const img = new Image();
      img.src = "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/appearance_pickup.png";
      return img;
    })(),
    collected: false
  };
}

// In room (2,1), add three bounce pads.
// BouncePad1: Outer pad with radius 90.
// BouncePad2: Inner pad with radius 70.
// BouncePad3: Small pad with radius 50.
if (rooms["2,1"]) {
  rooms["2,1"].bouncePad = {
    radius: 90,
    collected: false
  };
  rooms["2,1"].bouncePad2 = {
    radius: 70,
    collected: false
  };
  rooms["2,1"].bouncePad3 = {
    radius: 50,
    collected: false
  };
  
  // Also add a win item at the center of room (2,1).
  // This image will not disappear and winning the game is triggered when touched.
  rooms["2,1"].winItem = {
    x: roomWidth / 2 - 25, // assuming win item is 50x50
    y: roomHeight / 2 - 25,
    width: 50,
    height: 50,
    image: (function() {
      const img = new Image();
      img.src = "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/win_item.png"; // Replace with your desired PNG URL
      return img;
    })()
  };
}

// Load enemy images for each room
const enemyImage1 = new Image();
enemyImage1.src = "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/small_enemy1.png";
const enemyImage2 = new Image();
enemyImage2.src = "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/small_enemy.png";

// Start in room (0,0)
let currentRoom = rooms["0,0"];

// Global variable to store previous room key
let prevRoomKey = `${currentRoom.gridX},${currentRoom.gridY}`;

// Bounce configuration
const bounceDuration = 60; // frames for bounce animation
const bounceDistance = 96; // total bounce distance

// Player object with additional properties for bounce animation and appearance change.
const player = {
  x: roomWidth / 2 - 32,
  y: roomHeight / 2 - 32,
  speed: 2,
  width: 64,
  height: 64,
  lifebar: 10,
  collisionCooldown: 0,
  bounceCooldown: 0, // frames remaining during bounce animation
  bounceVector: { dx: 0, dy: 0 }, // per-frame bounce displacement
  appearanceChanged: false // false until the appearance pickup is collected
};

// Load the player's character image
const playerImage = new Image();
playerImage.src = 'https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/little_girl.png';

// Simple AABB collision detection
function isColliding(rect1, rect2) {
  return !(
    rect1.x > rect2.x + rect2.width ||
    rect1.x + rect1.width < rect2.x ||
    rect1.y > rect2.y + rect2.height ||
    rect1.y + rect1.height < rect2.y
  );
}

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

// Define door gap size and wall thickness
const doorGap = 80;
const wallThickness = 8;

// Update function: processes movement, transitions, pickups, enemy behavior, bounce pads, and win item.
function update() {
  if (gameOver || gameWon) return;
  
  // If player is bouncing, ignore key input and apply bounce vector.
  if (player.bounceCooldown > 0) {
    player.x += player.bounceVector.dx;
    player.y += player.bounceVector.dy;
    player.bounceCooldown--;
  } else {
    let dx = 0, dy = 0;
    if (keys.up)    dy -= player.speed;
    if (keys.down)  dy += player.speed;
    if (keys.left)  dx -= player.speed;
    if (keys.right) dx += player.speed;
    player.x += dx;
    player.y += dy;
  }
  
  if (player.collisionCooldown > 0) {
    player.collisionCooldown--;
  }
  
  // Process room transitions
  if (player.x < 0) {
    const newKey = `${currentRoom.gridX - 1},${currentRoom.gridY}`;
    if (rooms.hasOwnProperty(newKey)) {
      if (player.y + player.height / 2 > (roomHeight - doorGap) / 2 &&
          player.y + player.height / 2 < (roomHeight + doorGap) / 2) {
        currentRoom = rooms[newKey];
        player.x = roomWidth - player.width;
      } else {
        player.x = 0;
      }
    } else {
      player.x = 0;
    }
  }
  if (player.x + player.width > roomWidth) {
    const newKey = `${currentRoom.gridX + 1},${currentRoom.gridY}`;
    if (rooms.hasOwnProperty(newKey)) {
      if (player.y + player.height / 2 > (roomHeight - doorGap) / 2 &&
          player.y + player.height / 2 < (roomHeight + doorGap) / 2) {
        currentRoom = rooms[newKey];
        player.x = 0;
      } else {
        player.x = roomWidth - player.width;
      }
    } else {
      player.x = roomWidth - player.width;
    }
  }
  if (player.y < 0) {
    const newKey = `${currentRoom.gridX},${currentRoom.gridY - 1}`;
    if (rooms.hasOwnProperty(newKey)) {
      if (player.x + player.width / 2 > (roomWidth - doorGap) / 2 &&
          player.x + player.width / 2 < (roomWidth + doorGap) / 2) {
        currentRoom = rooms[newKey];
        player.y = roomHeight - player.height;
      } else {
        player.y = 0;
      }
    } else {
      player.y = 0;
    }
  }
  if (player.y + player.height > roomHeight) {
    const newKey = `${currentRoom.gridX},${currentRoom.gridY + 1}`;
    if (rooms.hasOwnProperty(newKey)) {
      if (player.x + player.width / 2 > (roomWidth - doorGap) / 2 &&
          player.x + player.width / 2 < (roomWidth + doorGap) / 2) {
        currentRoom = rooms[newKey];
        player.y = 0;
      } else {
        player.y = roomHeight - player.height;
      }
    } else {
      player.y = roomHeight - player.height;
    }
  }
  
  // Reset enemy positions on room change.
  const newRoomKey = `${currentRoom.gridX},${currentRoom.gridY}`;
  if (newRoomKey !== prevRoomKey && currentRoom.enemies) {
    currentRoom.enemies.forEach(enemy => {
      enemy.x = Math.random() * (roomWidth - enemy.width);
      enemy.y = Math.random() * (roomHeight - enemy.height);
    });
  }
  prevRoomKey = newRoomKey;
  
  // Enemies chase player.
  if ((newRoomKey === "1,0" || newRoomKey === "1,1") && currentRoom.enemies) {
    currentRoom.enemies.forEach(enemy => {
      const enemyCenterX = enemy.x + enemy.width / 2;
      const enemyCenterY = enemy.y + enemy.height / 2;
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;
      const diffX = playerCenterX - enemyCenterX;
      const diffY = playerCenterY - enemyCenterY;
      const distance = Math.sqrt(diffX * diffX + diffY * diffY);
      if (distance > 0) {
        const normX = diffX / distance;
        const normY = diffY / distance;
        enemy.x += normX * enemy.speed;
        enemy.y += normY * enemy.speed;
      }
      enemy.x = Math.max(0, Math.min(enemy.x, roomWidth - enemy.width));
      enemy.y = Math.max(0, Math.min(enemy.y, roomHeight - enemy.height));
      
      if (player.collisionCooldown <= 0 && isColliding(player, enemy)) {
        player.lifebar--;
        player.collisionCooldown = 60;
        if (player.lifebar <= 0) {
          gameOver = true;
        }
      }
    });
  }
  
  // Process health pickups in room (2,0).
  if (newRoomKey === "2,0" && currentRoom.healthPickups) {
    currentRoom.healthPickups.forEach(pickup => {
      if (!pickup.collected && isColliding(player, pickup)) {
        player.lifebar += 5;
        pickup.collected = true;
      }
    });
  }
  
  // Process appearance pickup in room (0,1).
  if (newRoomKey === "0,1" && currentRoom.appearancePickup) {
    const pickup = currentRoom.appearancePickup;
    if (!pickup.collected && isColliding(player, pickup)) {
      playerImage.src = "https://raw.githubusercontent.com/JimmyWooHoo/GenAI/main/new_appearance.png";
      pickup.collected = true;
      player.appearanceChanged = true;
    }
  }
  
  // Process bounce pads in room (2,1).
  // Bounce Pad 1 (big outer circle)
  if (newRoomKey === "2,1" && currentRoom.bouncePad && !currentRoom.bouncePad.collected) {
    const pad = currentRoom.bouncePad;
    const padCenterX = roomWidth / 2;
    const padCenterY = roomHeight / 2;
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const diffX = playerCenterX - padCenterX;
    const diffY = playerCenterY - padCenterY;
    const dist = Math.sqrt(diffX * diffX + diffY * diffY);
    if (dist < pad.radius + Math.max(player.width, player.height) / 2) {
      const normX = diffX / dist;
      const normY = diffY / dist;
      player.bounceVector.dx = normX * (bounceDistance / bounceDuration);
      player.bounceVector.dy = normY * (bounceDistance / bounceDuration);
      player.bounceCooldown = bounceDuration;
      if (player.appearanceChanged) {
        pad.collected = true;
      }
    }
  }
  
  // Bounce Pad 2 (inner circle)
  if (newRoomKey === "2,1" && currentRoom.bouncePad2 && !currentRoom.bouncePad2.collected && player.bounceCooldown === 0) {
    const pad = currentRoom.bouncePad2;
    const padCenterX = roomWidth / 2;
    const padCenterY = roomHeight / 2;
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const diffX = playerCenterX - padCenterX;
    const diffY = playerCenterY - padCenterY;
    const dist = Math.sqrt(diffX * diffX + diffY * diffY);
    if (dist < pad.radius + Math.max(player.width, player.height) / 2) {
      const normX = diffX / dist;
      const normY = diffY / dist;
      player.bounceVector.dx = normX * (bounceDistance / bounceDuration);
      player.bounceVector.dy = normY * (bounceDistance / bounceDuration);
      player.bounceCooldown = bounceDuration;
      if (player.appearanceChanged) {
        pad.collected = true;
      }
    }
  }
  
  // Bounce Pad 3 (small inner circle)
  if (newRoomKey === "2,1" && currentRoom.bouncePad3 && !currentRoom.bouncePad3.collected && player.bounceCooldown === 0) {
    const pad = currentRoom.bouncePad3;
    const padCenterX = roomWidth / 2;
    const padCenterY = roomHeight / 2;
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const diffX = playerCenterX - padCenterX;
    const diffY = playerCenterY - padCenterY;
    const dist = Math.sqrt(diffX * diffX + diffY * diffY);
    if (dist < pad.radius + Math.max(player.width, player.height) / 2) {
      const normX = diffX / dist;
      const normY = diffY / dist;
      player.bounceVector.dx = normX * (bounceDistance / bounceDuration);
      player.bounceVector.dy = normY * (bounceDistance / bounceDuration);
      player.bounceCooldown = bounceDuration;
      if (player.appearanceChanged) {
        pad.collected = true;
      }
    }
  }
  
  // In room (2,1), process win item.
  if (newRoomKey === "2,1" && currentRoom.winItem && !gameWon) {
    if (isColliding(player, currentRoom.winItem)) {
      gameWon = true;
    }
  }
}

// Draw room background, walls, door gaps, room name, pickups, bounce pads, win item, and enemies.
function drawRoom() {
  const bgImage = currentRoom.background;
  if (bgImage && bgImage.complete && bgImage.naturalWidth) {
    ctx.drawImage(bgImage, 0, 0, roomWidth, roomHeight);
  } else {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, roomWidth, roomHeight);
  }
  
  // Draw walls in gray.
  ctx.strokeStyle = '#888';
  ctx.lineWidth = wallThickness;
  
  // Top wall.
  ctx.beginPath();
  let doorStartX = (roomWidth - doorGap) / 2;
  let doorEndX = doorStartX + doorGap;
  if (rooms.hasOwnProperty(`${currentRoom.gridX},${currentRoom.gridY - 1}`)) {
    ctx.moveTo(0, wallThickness / 2);
    ctx.lineTo(doorStartX, wallThickness / 2);
    ctx.moveTo(doorEndX, wallThickness / 2);
    ctx.lineTo(roomWidth, wallThickness / 2);
  } else {
    ctx.moveTo(0, wallThickness / 2);
    ctx.lineTo(roomWidth, wallThickness / 2);
  }
  ctx.stroke();
  
  // Bottom wall.
  ctx.beginPath();
  doorStartX = (roomWidth - doorGap) / 2;
  doorEndX = doorStartX + doorGap;
  if (rooms.hasOwnProperty(`${currentRoom.gridX},${currentRoom.gridY + 1}`)) {
    ctx.moveTo(0, roomHeight - wallThickness / 2);
    ctx.lineTo(doorStartX, roomHeight - wallThickness / 2);
    ctx.moveTo(doorEndX, roomHeight - wallThickness / 2);
    ctx.lineTo(roomWidth, roomHeight - wallThickness / 2);
  } else {
    ctx.moveTo(0, roomHeight - wallThickness / 2);
    ctx.lineTo(roomWidth, roomHeight - wallThickness / 2);
  }
  ctx.stroke();
  
  // Left wall.
  ctx.beginPath();
  let doorStartY = (roomHeight - doorGap) / 2;
  let doorEndY = doorStartY + doorGap;
  if (rooms.hasOwnProperty(`${currentRoom.gridX - 1},${currentRoom.gridY}`)) {
    ctx.moveTo(wallThickness / 2, 0);
    ctx.lineTo(wallThickness / 2, doorStartY);
    ctx.moveTo(wallThickness / 2, doorEndY);
    ctx.lineTo(wallThickness / 2, roomHeight);
  } else {
    ctx.moveTo(wallThickness / 2, 0);
    ctx.lineTo(wallThickness / 2, roomHeight);
  }
  ctx.stroke();
  
  // Right wall.
  ctx.beginPath();
  doorStartY = (roomHeight - doorGap) / 2;
  doorEndY = doorStartY + doorGap;
  if (rooms.hasOwnProperty(`${currentRoom.gridX + 1},${currentRoom.gridY}`)) {
    ctx.moveTo(roomWidth - wallThickness / 2, 0);
    ctx.lineTo(roomWidth - wallThickness / 2, doorStartY);
    ctx.moveTo(roomWidth - wallThickness / 2, doorEndY);
    ctx.lineTo(roomWidth, roomHeight);
  } else {
    ctx.moveTo(roomWidth - wallThickness / 2, 0);
    ctx.lineTo(roomWidth - wallThickness / 2, roomHeight);
  }
  ctx.stroke();
  
  // Draw door gaps with custom colors.
  const currentKey = `${currentRoom.gridX},${currentRoom.gridY}`;
  
  // Top door gap.
  if (rooms.hasOwnProperty(`${currentRoom.gridX},${currentRoom.gridY - 1}`)) {
    ctx.fillStyle = (currentKey === "2,1" || currentKey === "0,1") ? 'darkgreen' : 'red';
    ctx.fillRect(doorStartX, 0, doorGap, wallThickness);
  }
  
  // Bottom door gap.
  if (rooms.hasOwnProperty(`${currentRoom.gridX},${currentRoom.gridY + 1}`)) {
    ctx.fillStyle = (currentKey === "0,0") ? 'darkgreen' : 'red';
    ctx.fillRect(doorStartX, roomHeight - wallThickness, doorGap, wallThickness);
  }
  
  // Left door gap.
  if (rooms.hasOwnProperty(`${currentRoom.gridX - 1},${currentRoom.gridY}`)) {
    ctx.fillStyle = (currentKey === "1,0" || currentKey === "1,1") ? 'darkgreen' : 'red';
    ctx.fillRect(0, doorStartY, wallThickness, doorGap);
  }
  
  // Right door gap.
  if (rooms.hasOwnProperty(`${currentRoom.gridX + 1},${currentRoom.gridY}`)) {
    ctx.fillStyle = (currentKey === "1,0") ? 'darkgreen' : 'red';
    ctx.fillRect(roomWidth - wallThickness, doorStartY, wallThickness, doorGap);
  }
  
  // Display current room's custom name in bold, large, black text.
  ctx.fillStyle = 'black';
  ctx.font = 'bold 30px Arial';
  ctx.fillText(currentRoom.name, 10, 40);
  
  // Draw health pickups in room (2,0) if not collected.
  if (currentKey === "2,0" && currentRoom.healthPickups) {
    currentRoom.healthPickups.forEach(pickup => {
      if (!pickup.collected) {
        if (pickup.image.complete) {
          ctx.drawImage(pickup.image, pickup.x, pickup.y, pickup.width, pickup.height);
        } else {
          ctx.fillStyle = 'green';
          ctx.fillRect(pickup.x, pickup.y, pickup.width, pickup.height);
        }
      }
    });
  }
  
  // Draw appearance pickup in room (0,1) if not collected.
  if (currentKey === "0,1" && currentRoom.appearancePickup && !currentRoom.appearancePickup.collected) {
    const ap = currentRoom.appearancePickup;
    if (ap.image.complete) {
      ctx.drawImage(ap.image, ap.x, ap.y, ap.width, ap.height);
    } else {
      ctx.fillStyle = 'blue';
      ctx.fillRect(ap.x, ap.y, ap.width, ap.height);
    }
  }
  
  // Draw bounce pad 1 (big outer circle) in room (2,1) if not collected.
  if (currentKey === "2,1" && currentRoom.bouncePad && !currentRoom.bouncePad.collected) {
    const pad = currentRoom.bouncePad;
    const padCenterX = roomWidth / 2;
    const padCenterY = roomHeight / 2;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(padCenterX, padCenterY, pad.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Draw bounce pad 2 (inner circle) in room (2,1) if not collected.
  if (currentKey === "2,1" && currentRoom.bouncePad2 && !currentRoom.bouncePad2.collected) {
    const pad = currentRoom.bouncePad2;
    const padCenterX = roomWidth / 2;
    const padCenterY = roomHeight / 2;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(padCenterX, padCenterY, pad.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Draw bounce pad 3 (small inner circle) in room (2,1) if not collected.
  if (currentKey === "2,1" && currentRoom.bouncePad3 && !currentRoom.bouncePad3.collected) {
    const pad = currentRoom.bouncePad3;
    const padCenterX = roomWidth / 2;
    const padCenterY = roomHeight / 2;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(padCenterX, padCenterY, pad.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Draw win item in room (2,1) (this one never disappears).
  if (currentKey === "2,1" && currentRoom.winItem) {
    const win = currentRoom.winItem;
    if (win.image.complete) {
      ctx.drawImage(win.image, win.x, win.y, win.width, win.height);
    } else {
      ctx.fillStyle = 'purple';
      ctx.fillRect(win.x, win.y, win.width, win.height);
    }
  }
  
  // Draw enemies in room (1,0) or (1,1).
  if ((currentKey === "1,0" || currentKey === "1,1") && currentRoom.enemies) {
    currentRoom.enemies.forEach(enemy => {
      if (currentKey === "1,0") {
        if (enemyImage1.complete) {
          ctx.drawImage(enemyImage1, enemy.x, enemy.y, enemy.width, enemy.height);
        } else {
          ctx.fillStyle = 'red';
          ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
      } else if (currentKey === "1,1") {
        if (enemyImage2.complete) {
          ctx.drawImage(enemyImage2, enemy.x, enemy.y, enemy.width, enemy.height);
        } else {
          ctx.fillStyle = 'red';
          ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
      }
    });
  }
}

// Draw player and lifebar with bold, large, black text.
function drawPlayer() {
  if (playerImage.complete) {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
  } else {
    ctx.fillStyle = '#0f0';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
  ctx.fillStyle = 'black';
  ctx.font = 'bold 30px Arial';
  ctx.fillText(`HP: ${player.lifebar}`, roomWidth - 120, 40);
}

// Main game loop.
function gameLoop() {
  update();
  drawRoom();
  drawPlayer();
  
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, roomWidth, roomHeight);
    ctx.fillStyle = 'red';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("Game Over", roomWidth / 2, roomHeight / 2);
    return;
  }
  
  if (gameWon) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, roomWidth, roomHeight);
    ctx.fillStyle = 'green';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("You Win!", roomWidth / 2, roomHeight / 2);
    return;
  }
  
  requestAnimationFrame(gameLoop);
}

gameLoop();
